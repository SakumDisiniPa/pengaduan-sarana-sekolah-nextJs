"use server";

import { generateSecret, generateURI, verify } from "otplib";
// @ts-expect-error - missing types
import qrcode from "qrcode";

/**
 * 1. GENERATE MFA SETUP
 * Membuat secret baru dan QR Code untuk discan siswa.
 */
export async function generateMfaSetup(email: string) {
  // generateSecret() secara default menghasilkan Base32 yang disukai Google Authenticator
  const secret = generateSecret();
  const service = "PengaduanSaranaSekolah";
  
  const otpauth = generateURI({
    issuer: service,
    label: email,
    secret: secret
  });
  
  const qrCodeUrl = await qrcode.toDataURL(otpauth);
  return { secret, qrCodeUrl };
}

/**
 * 2. SAVE MFA TO DB
 * Menyimpan secret ke PocketBase via Admin API agar bisa mengisi field 'hidden'.
 */
export async function saveMfaToDb(userId: string, secret: string) {
  try {
    const { default: PocketBase } = await import("pocketbase");
    const pbAdmin = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://127.0.0.1:8090");
    
    // Login Admin
    await pbAdmin.admins.authWithPassword(
      process.env.PB_ADMIN_EMAIL!, 
      process.env.PB_ADMIN_PASSWORD!
    );

    // Update Field (Menyimpan secret dan mereset lastTimeStep ke 0)
    await pbAdmin.collection("users").update(userId, {
      mfaSecret: secret, 
      mfaEnabled: true,
      lastTimeStep: 0 // <--- Penting: Reset saat aktivasi/ganti MFA
    });

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Save MFA to DB Error:", message);
    return { success: false, error: message };
  }
}

/**
 * 3. VERIFY MFA CODE (SETUP PHASE)
 * Verifikasi awal saat pertama kali scan QR. Belum ada 'lastTimeStep' di sini.
 */
export async function verifyMfaCode(secret: string, token: string) {
  try {
    if (!secret) return false;
    
    // Gunakan standar [30, 0] agar sinkron dengan login
    const result = await verify({ 
      secret, 
      token,
      epochTolerance: [30, 0], 
    });

    console.log("MFA Setup Verify result:", result);
    return !!(typeof result === "boolean" ? result : result.valid);
  } catch (err: unknown) {
    console.error("MFA Setup Verify Error:", err);
    return false;
  }
}

/**
 * 4. VERIFY MFA CODE BY USER ID (LOGIN PHASE)
 * Menggunakan Kunci Master Admin untuk tembus field hidden mfaSecret.
 */
export async function verifyMfaCodeByUserId(userId: string, token: string) {
  try {
    const { default: PocketBase } = await import("pocketbase");
    const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://127.0.0.1:8090");
    
    // GANTI INI: Pakai koleksi "_superusers" karena PocketBase kamu versi terbaru
    await pb.collection("_superusers").authWithPassword(
      process.env.PB_ADMIN_EMAIL!, 
      process.env.PB_ADMIN_PASSWORD!
    );
    
    // Sekarang kamu punya akses "Dewa" buat ambil mfaSecret yang di-hidden
    const user = await pb.collection("users").getOne(userId);
    const secret = user.mfaSecret;

    if (!secret) return false;

    // Verifikasi MFA
    const result = await verify({ 
      secret, 
      token,
      epochTolerance: [30, 0],
      afterTimeStep: user.lastTimeStep || 0
    });

    const mfaStatus = result as { valid: boolean; timeStep: number };

    if (mfaStatus.valid) {
      // Update lastTimeStep biar aman dari Replay Attack
      await pb.collection("users").update(userId, {
        lastTimeStep: mfaStatus.timeStep
      });
      return true;
    }
    return false;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("MFA Superuser Mode Error:", message);
    return false;
  }
}
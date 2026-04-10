import {
  generateMfaSetup,
  verifyMfaCode,
  saveMfaToDb,
} from "@/app/actions/mfa";
import { pb } from "@/lib/pocketbase";

export interface MfaSetupResult {
  secret: string;
  qrCodeUrl: string;
}

export const initiateMfaSetup = async (email: string): Promise<MfaSetupResult> => {
  try {
    const { secret, qrCodeUrl } = await generateMfaSetup(email);
    return { secret, qrCodeUrl };
  } catch (err: unknown) {
    console.error("Error initiating MFA setup:", err);
    throw new Error("Gagal menginisialisasi MFA");
  }
};

export const verifyMfaToken = async (
  secret: string,
  token: string
): Promise<boolean> => {
  try {
    return await verifyMfaCode(secret, token);
  } catch (err: unknown) {
    console.error("Error verifying MFA code:", err);
    throw new Error("Gagal memverifikasi kode MFA");
  }
};

export const enableMfa = async (
  userId: string,
  secret: string
): Promise<void> => {
  try {
    const res = await saveMfaToDb(userId, secret);

    if (!res.success) {
      throw new Error(res.error || "Gagal menyimpan MFA ke database");
    }
  } catch (err: unknown) {
    console.error("Error enabling MFA:", err);
    throw new Error((err as Error).message || "Gagal mengaktifkan MFA");
  }
};

export const disableMfaInDb = async (userId: string): Promise<void> => {
  try {
    await pb.collection("users").update(userId, {
      mfaEnabled: false,
      mfaSecret: "",
    });
  } catch (err: unknown) {
    console.error("Error disabling MFA:", err);
    throw new Error((err as Error).message || "Gagal menonaktifkan MFA");
  }
};

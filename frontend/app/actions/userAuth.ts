"use server";
import PocketBase from "pocketbase";
import { cookies } from "next/headers"; // Penting: Bawaan Next.js

export async function adminUpdatePassword(userId: string, newPassword: string) {
  const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);
  const cookieStore = await cookies();

  try {
    // 1. Login Admin buat Bypass
    await pb.admins.authWithPassword(
      process.env.PB_ADMIN_EMAIL!, 
      process.env.PB_ADMIN_PASSWORD!
    );
    
    // 2. Update Password User
    await pb.collection("users").update(userId, {
      password: newPassword,
      passwordConfirm: newPassword,
    });

    // --- BAGIAN PENTING: LOGIN-KAN USER ---
    // 3. Setelah password di-set, kita login-kan user tersebut secara programatik
    const userData = await pb.collection("users").getOne(userId);
    await pb.collection("users").authWithPassword(userData.email, newPassword);

    // 4. Export Auth Store ke Cookie Browser
    const cookie = pb.authStore.exportToCookie({ httpOnly: false });
    // Kita set cookie manual ke browser via Next.js Headers
    cookieStore.set("pb_auth", pb.authStore.token, { 
      path: "/", 
      secure: true,
      httpOnly: false // Agar bisa dibaca JS di client jika perlu
    });

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
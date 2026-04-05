import { adminUpdatePassword } from "@/app/actions/userAuth";

export const changePassword = async (
  userId: string,
  newPassword: string,
  confirmPassword: string
): Promise<void> => {
  if (newPassword !== confirmPassword) {
    throw new Error("Konfirmasi password tidak cocok");
  }

  if (newPassword.length < 8) {
    throw new Error("Password minimal 8 karakter");
  }

  try {
    const res = await adminUpdatePassword(userId, newPassword);

    if (!res.success) {
      throw new Error(res.error || "Gagal mengubah password");
    }
  } catch (err: any) {
    console.error("Error changing password:", err);
    throw new Error(err.message || "Gagal mengubah password");
  }
};

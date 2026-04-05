import { pb } from "@/lib/pocketbase";
import { ProfileUser } from "../types";

/**
 * Mengupdate data profil user di PocketBase.
 * Menggunakan FormData untuk mendukung pengiriman file (avatar).
 */
export const updateProfile = async (
  userId: string,
  name: string,
  avatar?: File
): Promise<ProfileUser> => {
  try {
    const formData = new FormData();
    
    // Append nama baru
    formData.append("name", name);
    
    // Append file avatar jika user memilih file baru
    if (avatar) {
      formData.append("avatar", avatar);
    }

    // 1. Kirim data ke koleksi 'users' di PocketBase
    const updatedUser = await pb.collection("users").update(userId, formData);

    // 2. SINKRONISASI SESSION (PENTING!)
    // Baris ini mengupdate data user yang tersimpan di browser (AuthStore) 
    // agar komponen lain seperti Header langsung menampilkan nama/foto terbaru.
    pb.authStore.save(pb.authStore.token, updatedUser);

    // 3. Kembalikan data sesuai dengan interface ProfileUser
    return {
      id: updatedUser.id,
      collectionId: updatedUser.collectionId,
      collectionName: updatedUser.collectionName,
      email: updatedUser.email,
      name: updatedUser.name,
      avatar: updatedUser.avatar,
      mfaEnabled: updatedUser.mfaEnabled,
    };
  } catch (err: any) {
    // Log error untuk mempermudah debugging di console browser
    console.error("Error updating profile:", err);
    
    // Lempar pesan error yang user-friendly
    throw new Error(err.message || "Gagal memperbarui profil. Silakan coba lagi.");
  }
};
import { pb } from "@/lib/pocketbase";
import { ProfileUser } from "../types";

export const updateProfile = async (
  userId: string,
  name: string,
  avatar?: File
): Promise<ProfileUser> => {
  try {
    const formData = new FormData();
    formData.append("name", name);
    if (avatar) {
      formData.append("avatar", avatar);
    }

    const updatedUser = await pb.collection("users").update(userId, formData);

    // Sinkronisasi session agar Header langsung update
    pb.authStore.save(pb.authStore.token, updatedUser);

    return {
      id: updatedUser.id,
      collectionId: updatedUser.collectionId,
      collectionName: updatedUser.collectionName,
      email: updatedUser.email,
      name: updatedUser.name,
      avatar: updatedUser.avatar,
      mfaEnabled: updatedUser.mfaEnabled,
    };
  } catch (err: unknown) {
    console.error("Error updating profile:", err);
    throw new Error((err as Error).message || "Gagal memperbarui profil");
  }
};

export const getAvatarUrl = (user: { id: string; collectionId: string; collectionName: string; avatar?: string; photo?: string } | null): string | null => {
  if (!user || (!user.avatar && !user.photo)) return null;
  const fileName = user.avatar || user.photo;
  if (!fileName) return null;
  return pb.files.getURL(user as unknown as { [key: string]: unknown; id: string; collectionId: string; collectionName: string }, fileName);
};

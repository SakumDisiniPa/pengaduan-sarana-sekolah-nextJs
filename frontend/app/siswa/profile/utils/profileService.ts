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
  } catch (err: any) {
    console.error("Error updating profile:", err);
    throw new Error(err.message || "Gagal memperbarui profil");
  }
};

export const getAvatarUrl = (user: ProfileUser): string | null => {
  if (!user.avatar) return null;
  return pb.files.getURL(
    { id: user.id, collectionId: user.collectionId, collectionName: user.collectionName } as any,
    user.avatar
  );
};

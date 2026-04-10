import { pb } from "@/lib/pocketbase";
import { ProfileUser } from "../types";

export const handleAvatarFileChange = (
  e: React.ChangeEvent<HTMLInputElement>
): { file: File; preview: string } | null => {
  if (e.target.files && e.target.files[0]) {
    const file = e.target.files[0];
    const preview = URL.createObjectURL(file);
    return { file, preview };
  }
  return null;
};

export const getAvatarUrl = (user: ProfileUser): string | null => {
  if (!user.avatar) return null;
  return pb.files.getURL(
    { id: user.id, collectionId: user.collectionId, collectionName: user.collectionName } as unknown as { [key: string]: unknown; id: string; collectionId: string; collectionName: string },
    user.avatar
  );
};

export const getInitialLetter = (name?: string): string => {
  return name?.charAt(0).toUpperCase() || "U";
};

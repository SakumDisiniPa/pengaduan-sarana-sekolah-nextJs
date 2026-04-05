import { useEffect, useState } from "react";
import { pb } from "@/lib/pocketbase";
import { ProfileUser } from "../types";
import { updateProfile, getAvatarUrl } from "../utils";

interface UseProfileResult {
  user: ProfileUser | null;
  avatarUrl: string | null;
  loading: boolean;
  saveProfile: (name: string, avatar?: File) => Promise<void>;
  isSaving: boolean;
}

export const useProfile = (): UseProfileResult => {
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = pb.authStore.model;
    if (currentUser) {
      setUser({
        id: currentUser.id,
        collectionId: currentUser.collectionId,
        collectionName: currentUser.collectionName,
        email: currentUser.email,
        name: currentUser.name,
        avatar: currentUser.avatar,
        mfaEnabled: currentUser.mfaEnabled,
      });
    }
    setLoading(false);
  }, []);

  const avatarUrl = user ? getAvatarUrl(user) : null;

  const saveProfile = async (name: string, avatar?: File): Promise<void> => {
    if (!user) throw new Error("User data not available");

    setIsSaving(true);
    try {
      const updated = await updateProfile(user.id, name, avatar);
      setUser(updated);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    user,
    avatarUrl,
    loading,
    saveProfile,
    isSaving,
  };
};

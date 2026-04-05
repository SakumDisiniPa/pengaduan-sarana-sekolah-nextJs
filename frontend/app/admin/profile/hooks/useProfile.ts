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
    // Fungsi untuk mengambil data terbaru dari AuthStore PocketBase
    const fetchUserData = () => {
      const model = pb.authStore.model;
      if (model) {
        setUser({
          id: model.id,
          collectionId: model.collectionId,
          collectionName: model.collectionName,
          email: model.email,
          name: model.name,
          avatar: model.avatar,
          mfaEnabled: model.mfaEnabled,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    // Jalankan sekali saat mount
    fetchUserData();

    // SAKTI: Berlangganan perubahan di AuthStore (OnChange)
    // Jika ada updateProfile atau logout di komponen lain, hook ini akan tahu otomatis
    const unsubscribe = pb.authStore.onChange(() => {
      fetchUserData();
    });

    return () => {
      unsubscribe(); // Bersihkan listener saat komponen tidak dipakai
    };
  }, []);

  // avatarUrl akan otomatis terhitung ulang setiap kali state 'user' berubah
  const avatarUrl = user ? getAvatarUrl(user) : null;

  const saveProfile = async (name: string, avatar?: File): Promise<void> => {
    if (!user) throw new Error("User data not available");

    setIsSaving(true);
    try {
      // Panggil service update (yang didalamnya sudah ada pb.authStore.save)
      const updated = await updateProfile(user.id, name, avatar);
      
      // Update state lokal agar UI langsung berubah
      setUser(updated);
    } catch (err: any) {
      throw err; // Lempar error agar bisa ditangkap oleh ProfilePage untuk ditampilkan di Alert
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
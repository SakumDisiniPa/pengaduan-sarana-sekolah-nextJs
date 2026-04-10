"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { pb } from "@/lib/pocketbase";
import Link from "next/link";
import { useProfile, useMfa, useMessage } from "./hooks";
import { changePassword, handleAvatarFileChange } from "./utils";
import {
  MessageAlert,
  ProfileSection,
  SecuritySection,
  MfaSection,
} from "./components";

export default function ProfilePage() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  // Hooks Utama
  const { 
    user, 
    avatarUrl, 
    loading: profileLoading, 
    saveProfile, 
    isSaving 
  } = useProfile();
  
  const { message, showMessage } = useMessage();
  const mfa = useMfa(user?.mfaEnabled || false);

  // Local state untuk Input & Preview
  const [name, setName] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | undefined>();
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  
  // Local state Keamanan
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  // 1. Proteksi Halaman (Cek Login & Admin)
  useEffect(() => {
    setIsClient(true);
    if (pb.authStore.isValid && !pb.authStore.model?.isAdmin) {
      router.push("/admin/login");
    }
  }, [router]);

  // 2. Sinkronisasi Data dari Hook ke Form Lokal
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      // Kita set preview awal dari URL database
      setAvatarPreviewUrl(avatarUrl);
      mfa.setMfaEnabled(user.mfaEnabled || false);
    }
  }, [user, avatarUrl, mfa]);

  // 3. Handler Ganti Foto (Preview)
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const result = handleAvatarFileChange(e);
    if (result) {
      setAvatarFile(result.file);        // Simpan file asli untuk dikirim ke server
      setAvatarPreviewUrl(result.preview); // Tampilkan preview (blob url) ke UI
    }
  };

  // 4. Handler Simpan Profil
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await saveProfile(name, avatarFile);
      setAvatarFile(undefined); // Reset file input setelah sukses
      showMessage("Profil berhasil diperbarui", "success");
    } catch (err: unknown) {
      showMessage(err instanceof Error ? err.message : "Gagal memperbarui profil", "error");
    }
  };

  // 5. Handler Ganti Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSavingPassword(true);
    try {
      await changePassword(user.id, newPassword, confirmPassword);
      showMessage("Password berhasil diperbarui", "success");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      showMessage(err instanceof Error ? err.message : "Gagal mengubah password", "error");
    } finally {
      setSavingPassword(false);
    }
  };

  // 6. MFA Handlers
  const handleStartMfaSetup = async () => {
    if (!user) return;
    try {
      await mfa.startSetup(user.email);
    } catch (err: unknown) {
      showMessage(err instanceof Error ? err.message : "Gagal menginisialisasi MFA", "error");
    }
  };

  const handleConfirmMfaSetup = async () => {
    if (!user) return;
    try {
      await mfa.confirmSetup(user.id, mfa.mfaToken);
      showMessage("MFA berhasil diaktifkan", "success");
    } catch (err: unknown) {
      showMessage(err instanceof Error ? err.message : "Gagal mengaktifkan MFA", "error");
    }
  };

  const handleDisableMfa = async () => {
    if (!user) return;
    if (!window.confirm("Apakah anda yakin ingin menonaktifkan MFA? (Sangat tidak disarankan)"))
      return;

    try {
      await mfa.disableMfa(user.id);
      showMessage("MFA telah dinonaktifkan", "success");
    } catch (err: unknown) {
      showMessage(err instanceof Error ? err.message : "Gagal menonaktifkan MFA", "error");
    }
  };

  // Cegah render sebelum client-side siap atau user belum ada
  if (!isClient || profileLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500/30 border-t-purple-500" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white selection:bg-purple-500/30">
      {/* Background Glow Effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] animate-pulse" />
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              Pengaturan <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Profil Admin</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">Kelola informasi publik dan keamanan akun Anda</p>
          </div>
          <Link
            href="/admin"
            className="w-fit px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-sm text-slate-300 flex items-center gap-2"
          >
            ← Kembali
          </Link>
        </div>

        {/* Notifikasi Alert */}
        <MessageAlert message={message} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
          {/* Sisi Kiri: Profil & Avatar */}
          <div className="h-full">
            <ProfileSection
              name={name}
              onNameChange={setName}
              email={user.email}
              avatarUrl={avatarPreviewUrl}
              onAvatarChange={handleAvatarChange}
              onSubmit={handleSaveProfile}
              isSaving={isSaving}
            />
          </div>

          {/* Sisi Kanan: Keamanan & MFA */}
          <div className="flex flex-col gap-8">
            <SecuritySection
              newPassword={newPassword}
              onNewPasswordChange={setNewPassword}
              confirmPassword={confirmPassword}
              onConfirmPasswordChange={setConfirmPassword}
              onSubmit={handleChangePassword}
              isSaving={savingPassword}
            />

            <MfaSection
              mfaEnabled={mfa.mfaEnabled}
              setupQr={mfa.setupQr}
              mfaToken={mfa.mfaToken}
              onMfaTokenChange={mfa.setMfaToken}
              loading={mfa.loading}
              onStartSetup={handleStartMfaSetup}
              onConfirmSetup={handleConfirmMfaSetup}
              onResetSetup={mfa.resetSetup}
              onDisableMfa={handleDisableMfa}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
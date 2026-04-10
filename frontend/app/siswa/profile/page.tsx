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

  // Hooks
  const { user, avatarUrl, saveProfile, isSaving } = useProfile();
  const { message, showMessage } = useMessage();
  const mfa = useMfa(user?.mfaEnabled || false);

  // Local state
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<File | undefined>();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (!pb.authStore.isValid || !pb.authStore.model) {
      router.push("/siswa/login");
      return;
    }
  }, [router]);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setAvatarPreview(avatarUrl);
      mfa.setMfaEnabled(user.mfaEnabled || false);
    }
  }, [user, avatarUrl, mfa]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const result = handleAvatarFileChange(e);
    if (result) {
      setAvatar(result.file);
      setAvatarPreview(result.preview);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await saveProfile(name, avatar);
      setAvatar(undefined);
      showMessage("Profil berhasil diperbarui", "success");
    } catch (err: unknown) {
      showMessage((err as Error).message || "Gagal memperbarui profil", "error");
    }
  };

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
      showMessage((err as Error).message || "Gagal mengubah password", "error");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleStartMfaSetup = async () => {
    if (!user) return;
    try {
      await mfa.startSetup(user.email);
    } catch (err: unknown) {
      showMessage((err as Error).message || "Gagal menginisialisasi MFA", "error");
    }
  };

  const handleConfirmMfaSetup = async () => {
    if (!user) return;
    try {
      await mfa.confirmSetup(user.id, mfa.mfaToken);
      showMessage("MFA berhasil diaktifkan", "success");
    } catch (err: unknown) {
      showMessage((err as Error).message || "Gagal mengaktifkan MFA", "error");
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
      showMessage((err as Error).message || "Gagal menonaktifkan MFA", "error");
    }
  };

  if (!isClient || !user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white selection:bg-purple-500/30">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
            Pengaturan <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Profil</span>
          </h1>
          <Link
            href="/siswa/dashboard"
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition text-sm text-slate-300"
          >
            ← Kembali ke Dashboard
          </Link>
        </div>

        <MessageAlert message={message} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Section 1: Data Profil */}
          <ProfileSection
            name={name}
            onNameChange={setName}
            email={user.email}
            avatarPreview={avatarPreview}
            onAvatarChange={handleAvatarChange}
            onSubmit={handleSaveProfile}
            isSaving={isSaving}
          />

          {/* Section 2: Keamanan (Password & MFA) */}
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

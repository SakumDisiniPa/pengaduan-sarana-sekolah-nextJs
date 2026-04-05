import React, { useRef } from "react";
import { getInitialLetter } from "../utils";
import { User } from "lucide-react";

interface ProfileSectionProps {
  name: string;
  onNameChange: (name: string) => void;
  email: string;
  avatarUrl: string | null;
  onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSaving: boolean;
}

export function ProfileSection({
  name,
  onNameChange,
  email,
  avatarUrl,
  onAvatarChange,
  onSubmit,
  isSaving,
}: ProfileSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl shadow-xl backdrop-blur-md p-6 sm:p-8 flex flex-col h-full overflow-hidden">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <User className="w-5 h-5" /> Data Profil
      </h2>

      <form onSubmit={onSubmit} className="flex-1 flex flex-col">
        {/* Avatar Section */}
        <div className="mb-8 flex flex-col items-center">
          <div
            className="relative group cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
            title="Klik untuk ubah foto"
          >
            {/* Foto Profile */}
            <div className="w-24 h-24 rounded-full border-2 border-purple-500/50 shadow-lg overflow-hidden bg-slate-800 flex items-center justify-center group-hover:border-purple-400 transition-all">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
                  // Menangani jika link gambar rusak
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <span className="text-3xl font-bold text-slate-400">
                  {getInitialLetter(name)}
                </span>
              )}
            </div>

            {/* Overlay Ubah Foto */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-full">
              <span className="text-white text-[10px] font-bold uppercase tracking-wider">
                Ubah
              </span>
            </div>
          </div>

          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={onAvatarChange}
          />
          <p className="mt-3 text-[11px] text-slate-400 font-medium">
            Klik foto untuk mengganti
          </p>
        </div>

        {/* Form Fields */}
        <div className="space-y-5 flex-1">
          <div className="group">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
              Email Sekolah
            </label>
            <input
              type="text"
              value={email}
              disabled
              className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-slate-500 cursor-not-allowed italic"
            />
          </div>

          <div className="group">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 ml-1">
              Nama Lengkap
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              required
              placeholder="Masukkan nama lengkap..."
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all placeholder:text-slate-600"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8 pt-6 border-t border-white/5">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-slate-700 disabled:to-slate-800 disabled:cursor-not-allowed rounded-xl shadow-lg font-bold text-sm transition-all flex justify-center items-center gap-2 group active:scale-[0.98]"
          >
            {isSaving ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                Simpan Profil
                <span className="group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
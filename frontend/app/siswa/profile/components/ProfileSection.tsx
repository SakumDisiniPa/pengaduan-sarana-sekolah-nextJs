import React, { useRef, useState } from "react";
import { getInitialLetter } from "../utils";
import { User, Pencil, X } from "lucide-react";

interface ProfileSectionProps {
  name: string;
  onNameChange: (name: string) => void;
  email: string;
  avatarPreview: string | null;
  onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSaving: boolean;
}

export function ProfileSection({
  name,
  onNameChange,
  email,
  avatarPreview,
  onAvatarChange,
  onSubmit,
  isSaving,
}: ProfileSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl shadow-xl backdrop-blur-md p-6 sm:p-8 flex flex-col h-full">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <User className="w-5 h-5" /> Data Profil
      </h2>

      <form onSubmit={onSubmit} className="flex-1 flex flex-col">
        {/* Avatar Display */}
        <div className="mb-8 flex flex-col items-center">
          <div
            className="relative group cursor-pointer"
            onClick={() => setIsModalOpen(true)}
          >
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Profile"
                className="w-24 h-24 rounded-full border-2 border-purple-500/50 shadow-lg object-cover group-hover:opacity-75 transition-opacity"
              />
            ) : (
              <div className="w-24 h-24 rounded-full border-2 border-slate-600 bg-slate-800 flex items-center justify-center shadow-lg group-hover:bg-slate-700 transition">
                <span className="text-3xl text-slate-400">
                  {getInitialLetter(name)}
                </span>
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white drop-shadow-md pb-1 font-medium bg-black/50 rounded-full px-2 text-xs">
                Lihat Foto
              </span>
            </div>
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={(e) => {
              onAvatarChange(e);
              setIsModalOpen(false); // Close modal after selection
            }}
          />
          <p className="mt-2 text-xs text-slate-400">
            Klik foto untuk melihat detail
          </p>
        </div>

        {/* Modal Preview */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
            <button 
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition text-white"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="relative w-full max-w-sm aspect-[3/4] bg-slate-900 rounded-2xl overflow-hidden border border-white/10 shadow-2xl animate-in zoom-in-95 duration-300">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Full Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800">
                   <User className="w-32 h-32 text-slate-600 mb-4" />
                   <p className="text-slate-400">Belum ada foto profil</p>
                </div>
              )}

              {/* Floating Edit Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-6 right-6 w-14 h-14 bg-purple-600 hover:bg-purple-500 rounded-full flex items-center justify-center shadow-xl transition-transform active:scale-95 group/btn"
                title="Ganti Foto"
              >
                <Pencil className="w-6 h-6 text-white group-hover/btn:rotate-12 transition-transform" />
              </button>
            </div>

            {/* Click outside to close */}
            <div 
              className="absolute inset-0 -z-10" 
              onClick={() => setIsModalOpen(false)}
            />
          </div>
        )}

        <div className="space-y-4 flex-1">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Email Sekolah
            </label>
            <input
              type="text"
              value={email}
              disabled
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-slate-400 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Nama Lengkap
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              required
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
            />
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl shadow-lg font-bold transition flex justify-center items-center gap-2 group"
          >
            {isSaving ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/50 border-t-white" />
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


import React from "react";

interface SecuritySectionProps {
  newPassword: string;
  onNewPasswordChange: (password: string) => void;
  confirmPassword: string;
  onConfirmPasswordChange: (password: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSaving: boolean;
}

export function SecuritySection({
  newPassword,
  onNewPasswordChange,
  confirmPassword,
  onConfirmPasswordChange,
  onSubmit,
  isSaving,
}: SecuritySectionProps) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl shadow-xl backdrop-blur-md p-6 sm:p-8">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <span>🔐</span> Keamanan
      </h2>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Password Saat Ini
          </label>
          <input
            type="password"
            value="********"
            disabled
            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-slate-500 cursor-not-allowed"
            placeholder="********"
          />
          <p className="text-xs text-slate-500 mt-1">
            Anda tidak perlu memasukkan sandi lama.
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Password Baru
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => onNewPasswordChange(e.target.value)}
            required
            minLength={8}
            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
            placeholder="Minimal 8 karakter"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Konfirmasi Password Baru
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => onConfirmPasswordChange(e.target.value)}
            required
            minLength={8}
            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
            placeholder="Ketik ulang password"
          />
        </div>

        <p className="text-xs text-yellow-400 py-1 bg-yellow-400/10 border border-yellow-400/20 px-3 rounded-lg flex items-center gap-2">
          <span className="text-sm">⚠</span> Syarat agar bisa mengaktifkan MFA
          adalah mengatur password terlebih dahulu.
        </p>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-2.5 mt-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl font-medium transition flex justify-center items-center gap-2"
        >
          {isSaving ? "Menyimpan..." : "Simpan Password Baru"}
        </button>
      </form>
    </div>
  );
}

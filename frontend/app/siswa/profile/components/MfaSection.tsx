import React from "react";
import Image from "next/image";

interface MfaSectionProps {
  mfaEnabled: boolean;
  setupQr: string | null;
  mfaToken: string;
  onMfaTokenChange: (token: string) => void;
  loading: boolean;
  onStartSetup: () => void;
  onConfirmSetup: () => void;
  onResetSetup: () => void;
  onDisableMfa: () => void;
}

export function MfaSection({
  mfaEnabled,
  setupQr,
  mfaToken,
  onMfaTokenChange,
  loading,
  onStartSetup,
  onConfirmSetup,
  onResetSetup,
  onDisableMfa,
}: MfaSectionProps) {
  return (
    <div
      className={`bg-white/5 border rounded-2xl shadow-xl backdrop-blur-md p-6 sm:p-8 ${
        mfaEnabled ? "border-green-500/30" : "border-white/10"
      }`}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span>🛡️</span> Autentikasi 2 Langkah (MFA)
        </h2>
        <div
          className={`px-3 py-1 rounded-full text-xs font-bold border ${
            mfaEnabled
              ? "bg-green-500/10 border-green-500/30 text-green-400"
              : "bg-slate-500/10 border-slate-500/30 text-slate-400"
          }`}
        >
          {mfaEnabled ? "AKTIF" : "TIDAK AKTIF"}
        </div>
      </div>

      {!mfaEnabled && !setupQr ? (
        <>
          <p className="text-slate-300 text-sm mb-6">
            MFA menambahkan lapisan keamanan ekstra ke akun Anda. Setelah
            diaktifkan, Anda akan memerlukan NIS/Email, password, dan kode acak
            dari Google Authenticator untuk masuk.
          </p>
          <button
            onClick={onStartSetup}
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg font-bold transition"
          >
            {loading ? "Memproses..." : "Aktifkan MFA sekarang"}
          </button>
        </>
      ) : !mfaEnabled && setupQr ? (
        <div className="animate-fade-in-up">
          <h3 className="font-semibold text-white mb-2 text-sm">
            Langkah 1: Scan QR Code
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Gunakan aplikasi seperti Google Authenticator, Authy, atau Microsoft
            Authenticator untuk memindai kode QR berikut.
          </p>

          <div className="bg-white p-4 rounded-xl inline-block mb-6 shadow-inner mx-auto w-full flex justify-center">
            {setupQr && (
              <Image 
                src={setupQr} 
                alt="MFA QR Code" 
                width={192} 
                height={192} 
                className="w-48 h-48" 
                unoptimized // Since QR codes are dynamic data URLs usually
              />
            )}
          </div>

          <h3 className="font-semibold text-white mb-2 text-sm">
            Langkah 2: Masukkan Kode
          </h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={mfaToken}
              onChange={(e) => onMfaTokenChange(e.target.value)}
              placeholder="Contoh: 123456"
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 text-center tracking-widest text-lg"
              maxLength={6}
            />
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={onResetSetup}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-medium transition"
            >
              Batal
            </button>
            <button
              onClick={onConfirmSetup}
              disabled={mfaToken.length < 6 || loading}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Verifikasi..." : "Verifikasi"}
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="text-slate-300 text-sm mb-6">
            Aplikasi Authenticator telah dikonfigurasi. Akun Anda saat ini
            terlindungi.
          </p>
          <button
            onClick={onDisableMfa}
            disabled={loading}
            className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl shadow-lg font-bold transition"
          >
            Nonaktifkan MFA
          </button>
        </>
      )}
    </div>
  );
}

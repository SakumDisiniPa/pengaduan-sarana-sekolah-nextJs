"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { pb } from "@/lib/pocketbase";
import { motion, AnimatePresence } from "framer-motion";

function SiswaLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");
  const mfaParam = searchParams.get("mfa");
  const tokenParam = searchParams.get("token");

  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(
    errorParam ? { text: errorParam, type: "error" } : null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mfaToken, setMfaToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  const mfaStep = mfaParam === "true" && !!tokenParam;

  useEffect(() => {
    setMounted(true);
  }, []);

  const showMessage = (text: string, type: "success" | "error") => {
    setMessage({ text, type });
    if (type === "error") {
      setTimeout(() => setMessage(null), 5000); // Only auto-hide errors, successes usually indicate a prompt redirect
    }
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setMessage(null);

    pb.collection("users")
      .authWithOAuth2({ provider: "google" })
      .then((authData) => {
        const record = authData.record;
        if (record.isBanned && record.bannedUntil && new Date(record.bannedUntil) > new Date()) {
          router.push("/blocked");
          return;
        }

        const userEmail = record?.email || "";
        if (!userEmail.endsWith("@smkn1padaherang.sch.id")) {
          pb.authStore.clear();
          showMessage("Hanya email @smkn1padaherang.sch.id yang diizinkan.", "error");
          setIsLoading(false);
          return;
        }
        showMessage("Login berhasil! Mengalihkan...", "success");
        setTimeout(() => router.push("/siswa/dashboard"), 800);
      })
      .catch((err) => {
        const error = err as { message?: string };
        showMessage(error?.message || "Gagal login dengan Google", "error");
        setIsLoading(false);
      });
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    let identifier = email.trim();
    if (!identifier.includes("@") && identifier.length > 0) {
      identifier = `${identifier}@smkn1padaherang.sch.id`;
    }

    if (
      identifier.includes("@") &&
      !identifier.endsWith("@smkn1padaherang.sch.id")
    ) {
      showMessage("Hanya NIS atau email @smkn1padaherang.sch.id yang diizinkan.", "error");
      setLoading(false);
      return;
    }

    try {
      const { default: PocketBase } = await import("pocketbase");
      const tempPb = new PocketBase("https://pengaduansaranasekolah.sakum.my.id/");
      const authRes = await tempPb
        .collection("users")
        .authWithPassword(identifier, password);

      const record = authRes.record;

      if (record.isBanned && record.bannedUntil && new Date(record.bannedUntil) > new Date()) {
        showMessage("Akun Anda diblokir. Mengalihkan ke halaman info...", "error");
        setTimeout(() => {
          router.push("/blocked");
        }, 1500);
        return;
      }

      if (record.isAdmin) {
        showMessage("Akun ini adalah admin. Silakan login pada form Admin.", "error");
        setLoading(false);
        return;
      }

      if (!record.mfaEnabled) {
        showMessage("Data ditemukan, namun Anda belum mengaktifkan MFA. Silakan gunakan 'Masuk dengan Google' untuk login pertama kali.", "error");
        setLoading(false);
        return;
      }

      showMessage("Kredensial valid. Memuat verifikasi MFA...", "success");
      setTimeout(() => {
        router.push(`/siswa/login?token=${tempPb.authStore.token}&mfa=true`);
        setLoading(false);
      }, 600);
    } catch {
      showMessage("Email/NIS tidak terdaftar atau password salah.", "error");
      setLoading(false);
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenParam || mfaToken.length < 6) return;
    setLoading(true);
    setMessage(null);

    let userId = "";
    try {
      const payload = JSON.parse(atob(tokenParam.split(".")[1]));
      userId = payload.id;
    } catch {
      showMessage("Sesi tidak valid. Silakan login kembali.", "error");
      setLoading(false);
      return;
    }

    try {
      const { verifyMfaCodeByUserId } = await import("@/app/actions/mfa");
      const isValid = await verifyMfaCodeByUserId(userId, mfaToken);

      if (isValid) {
        pb.authStore.save(tokenParam, null);
        try {
          await pb.collection("users").authRefresh();
        } catch {
          showMessage("Sesi telah kadaluarsa. Silakan login kembali.", "error");
          setLoading(false);
          return;
        }

        document.cookie = pb.authStore.exportToCookie({
          httpOnly: false,
          path: "/",
        });

        // Double check ban status after refresh
        if (pb.authStore.model?.isBanned && pb.authStore.model?.bannedUntil && new Date(pb.authStore.model.bannedUntil) > new Date()) {
          router.push("/blocked");
          return;
        }

        showMessage("Verifikasi berhasil! Mengalihkan ke dashboard...", "success");
        setTimeout(() => router.push("/siswa/dashboard"), 800);
      } else {
        showMessage("Kode MFA salah atau kadaluarsa.", "error");
        setLoading(false);
      }
    } catch {
      showMessage("Gagal memverifikasi MFA.", "error");
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } },
  } as const;

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 h-full w-full bg-gradient-to-r from-blue-200/20 to-purple-200/20 dark:from-blue-900/10 dark:to-purple-900/10 rounded-full blur-3xl animate-slow-spin" />
        <div className="absolute -bottom-1/2 -right-1/2 h-full w-full bg-gradient-to-l from-indigo-200/20 to-pink-200/20 dark:from-indigo-900/10 dark:to-pink-900/10 rounded-full blur-3xl animate-slow-spin-reverse" />
      </div>

      {/* Main content - full screen native feel */}
      <div className="relative z-10 flex min-h-screen w-full items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-[480px]">
          <AnimatePresence mode="wait">
            {!mfaStep ? (
              <motion.div
                key="login"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="w-full"
              >
                {/* Logo/Brand area */}
                <motion.div variants={itemVariants} className="mb-8 text-center">
                  <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Selamat Datang
                  </h1>
                  <p className="mt-2 text-slate-500 dark:text-slate-400">
                    Masuk ke akun siswa Anda
                  </p>
                </motion.div>

                {/* Error/Success message */}
                <AnimatePresence>
                  {message && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, y: -10, height: 0 }}
                      className="mb-4 overflow-hidden"
                    >
                      <div className={`rounded-xl p-4 text-sm ring-1 backdrop-blur-sm ${message.type === 'error' ? 'bg-red-50/80 text-red-700 ring-red-200 dark:bg-red-950/30 dark:text-red-300 dark:ring-red-800/50' : 'bg-emerald-50/80 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:ring-emerald-800/50'}`}>
                        <div className="flex items-start gap-2">
                          {message.type === 'error' ? (
                            <svg className="mt-0.5 h-4 w-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="mt-0.5 h-4 w-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                            </svg>
                          )}
                          {message.text}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Login form */}
                <motion.div variants={itemVariants} className="space-y-6">
                  {/* Google Login - Top */}
                  <button
                    onClick={handleGoogleLogin}
                    disabled={isLoading || loading}
                    className="group relative flex w-full items-center justify-center gap-3 rounded-xl bg-white px-6 py-3.5 text-base font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition-all duration-300 hover:shadow-md hover:ring-blue-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700 dark:hover:ring-blue-600"
                  >
                    {isLoading ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
                    ) : (
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                    )}
                    <span>{isLoading ? "Memproses..." : "Masuk dengan Google"}</span>
                  </button>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200 dark:border-slate-700" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-3 text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                        atau dengan NIS & Password
                      </span>
                    </div>
                  </div>

                  {/* Password Login Form */}
                  <form onSubmit={handlePasswordLogin} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        NIS atau Email
                      </label>
                      <input
                        type="text"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 block w-full rounded-xl border-0 bg-slate-100/50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500 dark:bg-slate-800/50 dark:text-white dark:focus:bg-slate-800"
                        placeholder="Contoh: 123456 atau email@..."
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                          Password
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
                        >
                          {showPassword ? "Sembunyikan" : "Tampilkan"}
                        </button>
                      </div>
                      <div className="relative mt-1">
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="block w-full rounded-xl border-0 bg-slate-100/50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500 dark:bg-slate-800/50 dark:text-white dark:focus:bg-slate-800"
                          placeholder="••••••••"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || isLoading}
                      className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 font-semibold text-white shadow-md transition-all hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>Memproses...</span>
                        </div>
                      ) : (
                        "Masuk"
                      )}
                    </button>
                  </form>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="mfa"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="w-full"
              >
                <motion.div variants={itemVariants} className="mb-8 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg">
                    <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Verifikasi 2 Langkah
                  </h2>
                  <p className="mt-2 text-slate-500 dark:text-slate-400">
                    Masukkan kode dari aplikasi authenticator Anda
                  </p>
                </motion.div>

                <AnimatePresence>
                  {message && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, y: -10, height: 0 }}
                      className="mb-4 overflow-hidden"
                    >
                      <div className={`rounded-xl p-4 text-sm ring-1 backdrop-blur-sm ${message.type === 'error' ? 'bg-red-50/80 text-red-700 ring-red-200 dark:bg-red-950/30 dark:text-red-300' : 'bg-emerald-50/80 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300'}`}>
                        <div className="flex gap-2">
                          {message.type === 'error' ? (
                            <svg className="mt-0.5 h-4 w-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="mt-0.5 h-4 w-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                            </svg>
                          )}
                          {message.text}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.form variants={itemVariants} onSubmit={handleMfaSubmit} className="space-y-6">
                  <div>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={mfaToken}
                      onChange={(e) => setMfaToken(e.target.value.replace(/[^0-9]/g, ""))}
                      className="w-full text-center text-4xl font-mono tracking-[0.5em] rounded-xl border-2 border-slate-200 bg-white px-4 py-6 text-indigo-600 placeholder:text-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-indigo-400"
                      placeholder="123456"
                      disabled={loading}
                      autoFocus
                    />
                    <p className="mt-2 text-center text-xs text-slate-500">
                      Kode 6 digit dari Google Authenticator atau aplikasi sejenis
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        router.push("/siswa/login");
                        setMfaToken("");
                      }}
                      className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={loading || mfaToken.length < 6}
                      className="flex-1 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 font-semibold text-white shadow-md transition-all hover:shadow-lg disabled:opacity-70"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>Verifikasi...</span>
                        </div>
                      ) : (
                        "Verifikasi"
                      )}
                    </button>
                  </div>
                </motion.form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <style jsx global>{`
        @keyframes slow-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes slow-spin-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }
        .animate-slow-spin {
          animation: slow-spin 25s linear infinite;
        }
        .animate-slow-spin-reverse {
          animation: slow-spin-reverse 20s linear infinite;
        }
      `}</style>
    </div>
  );
}

export default function SiswaLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      }
    >
      <SiswaLoginContent />
    </Suspense>
  );
}
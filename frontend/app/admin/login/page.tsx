"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { pb } from "@/lib/pocketbase";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Login Admin dengan email/password
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const authRes = await pb.collection("users").authWithPassword(email, password);
      const record = authRes.record;

      // Check if banned
      if (record.isBanned && record.bannedUntil && new Date(record.bannedUntil) > new Date()) {
        router.push("/blocked");
        return;
      }

      if (record.isAdmin) {
        router.push("/admin");
      } else {
        pb.authStore.clear();
        setError("Akun ini bukan admin.");
      }
    } catch (err) {
      const error = err as { message?: string };
      setError(error?.message || "Email atau password salah.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 -z-10 overflow-hidden bg-gray-900">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gray-800 opacity-50 blur-3xl filter" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gray-700 opacity-50 blur-3xl filter" />
      </div>

      <div className="relative flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="animate-fade-in-up w-full max-w-md space-y-6 rounded-2xl bg-gray-800/80 backdrop-blur-md p-8 shadow-2xl ring-1 ring-white/10" style={{ animationFillMode: "both" }}>
          <div className="flex flex-col items-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-700 to-gray-900 shadow-lg">
              <span className="text-3xl">🔐</span>
            </div>
            <h2 className="text-center text-3xl font-bold tracking-tight text-white">
              Login Admin
            </h2>
          </div>

          {error && (
            <div className="rounded-lg bg-red-500/10 p-4 text-sm text-red-400 ring-1 ring-red-500/20 flex items-start gap-2">
              <svg className="h-5 w-5 flex-shrink-0 text-red-500 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label htmlFor="admin-email" className="block text-sm font-medium text-gray-300">
                Email Admin
              </label>
              <input
                id="admin-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-600 bg-gray-900/50 px-4 py-3 text-white placeholder-gray-500 shadow-sm transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                placeholder="admin@example.com"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="admin-password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-600 bg-gray-900/50 px-4 py-3 text-white placeholder-gray-500 shadow-sm transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 disabled:cursor-not-allowed disabled:opacity-70 mt-4"
            >
              <span className="relative">
                {loading ? "Memproses..." : "Masuk sebagai Admin"}
              </span>
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

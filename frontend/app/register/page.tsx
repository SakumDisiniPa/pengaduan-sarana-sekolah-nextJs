"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { pb } from "../../lib/pocketbase";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await pb.collection("_pb_users_auth_").create({
        email,
        password,
        passwordConfirm: password,
        name,
        mailVisibility: true,
      });
      await pb.collection("_pb_users_auth_").authWithPassword(email, password);
      router.push("/chat");
    } catch (err) {
      const error = err as { message?: string };
      setError(error?.message || "Failed to register");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Elemen dekoratif latar */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-purple-300 opacity-30 blur-3xl filter dark:bg-purple-800" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-blue-300 opacity-30 blur-3xl filter dark:bg-blue-800" />
        <div className="absolute top-1/2 left-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-300 opacity-20 blur-3xl filter dark:bg-pink-800" />
      </div>

      <div className="relative flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div
          className="animate-fade-in-up w-full max-w-md space-y-8 rounded-2xl bg-white/70 backdrop-blur-md p-8 shadow-2xl ring-1 ring-white/20"
          style={{ animationFillMode: "both" }}
        >
          {/* Judul */}
          <div>
            <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
              Daftar Akun
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Atau{" "}
              <Link
                href="/login"
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                masuk ke akun yang sudah ada
              </Link>
            </p>
          </div>

          {/* Form */}
          <form className="mt-8 space-y-6" onSubmit={submit}>
            {error && (
              <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-200">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nama Lengkap
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 bg-white/50 px-4 py-3 text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 bg-white/50 px-4 py-3 text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 bg-white/50 px-4 py-3 text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative flex w-full justify-center rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span className="absolute inset-0 -translate-x-full skew-x-12 rounded-lg bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <span className="relative">
                  {isLoading ? "Memproses..." : "Daftar"}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Animasi */}
      <style jsx>{`
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
      `}</style>
    </>
  );
}
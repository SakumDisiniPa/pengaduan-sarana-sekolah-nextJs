"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { pb } from "@/lib/pocketbase";
import Link from "next/link";

export default function AdminKategoriCreatePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsClient(true), 0);
    if (pb.authStore.isValid && !pb.authStore.model?.isAdmin) {
      router.push("/admin/login");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    setSubmitting(true);
    setError(null);

    try {
      await pb.collection("categories").create({ name: trimmed });
      router.push("/admin/kategori");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      const errorData = (err as { data?: { data?: { name?: { code?: string } } } }).data;

      if (message.includes("unique") || errorData?.data?.name?.code === "validation_not_unique") {
        setError(`Kategori "${trimmed}" sudah ada. Gunakan nama lain.`);
      } else {
        setError(message);
      }
      setSubmitting(false);
    }
  };

  if (!isClient || !pb.authStore.model?.isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />
      </div>

      <div className="relative z-10 max-w-xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Back Link */}
        <Link href="/admin/kategori" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition mb-8 group text-sm">
          <span className="transform group-hover:-translate-x-1 transition">←</span> Kembali ke Daftar Kategori
        </Link>

        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
          ➕ Tambah <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Kategori</span>
        </h1>
        <p className="text-slate-400 mb-8 text-sm">Buat kategori baru untuk laporan pengaduan siswa</p>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl text-sm font-medium">
            ❌ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-slate-900/40 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
          <div className="p-6 sm:p-8">
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Nama Kategori <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Misal: Proyektor Rusak"
              required
              autoFocus
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition placeholder-slate-600"
            />
          </div>

          {/* Actions */}
          <div className="px-6 sm:px-8 py-4 bg-white/5 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
            <Link
              href="/admin/kategori"
              className="px-5 py-2.5 text-sm font-medium text-slate-300 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition text-center"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={submitting || !name.trim()}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl shadow-lg font-semibold text-sm transition-all disabled:opacity-50 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/50 border-t-white" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Kategori"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

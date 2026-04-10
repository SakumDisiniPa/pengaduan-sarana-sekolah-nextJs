"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { pb } from "@/lib/pocketbase";
import Link from "next/link";
import { Suspense } from "react";

function EditKategoriForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("id");

  const [name, setName] = useState("");
  const [originalName, setOriginalName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsMounted(true), 0);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    if (!pb.authStore.isValid || !pb.authStore.model?.isAdmin) {
      router.push("/admin/login");
      return;
    }

    if (!categoryId) {
      router.push("/admin/kategori");
      return;
    }

    // Fetch existing category data dengan timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    pb.collection("categories")
      .getOne(categoryId, { signal: controller.signal })
      .then((record) => {
        setName(record.name);
        setOriginalName(record.name);
        setError(null);
        setLoadingData(false);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError("Kategori tidak ditemukan");
        }
        setLoadingData(false);
      })
      .finally(() => clearTimeout(timeoutId));

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [categoryId, router, isMounted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || !categoryId) return;

    setSubmitting(true);
    setError(null);

    try {
      await pb.collection("categories").update(categoryId, { name: trimmed });
      // Tampilkan success message dulu sebelum redirect
      setSuccess(true);
      setSubmitting(false);
      // Redirect setelah 1.5 detik agar user bisa lihat success message
      setTimeout(() => {
        router.push("/admin/kategori");
      }, 1500);
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

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
      </div>
    );
  }

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
          ✏️ Edit <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Kategori</span>
        </h1>
        <p className="text-slate-400 mb-8 text-sm">
          Ubah nama kategori <span className="text-slate-300 font-medium">&quot;{originalName}&quot;</span>
        </p>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl text-sm font-medium">
            ❌ {error}
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="mb-6 px-4 py-3 bg-green-500/10 border border-green-500/20 text-green-300 rounded-xl text-sm font-medium flex items-center gap-2">
            ✅ Kategori berhasil diperbarui! Mengalihkan...
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
              placeholder="Nama kategori"
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
              disabled={submitting || !name.trim() || name.trim() === originalName || success}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl shadow-lg font-semibold text-sm transition-all disabled:opacity-50 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/50 border-t-white" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Perubahan"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminKategoriEditPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
      </div>
    }>
      <EditKategoriForm />
    </Suspense>
  );
}

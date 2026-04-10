"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { pb } from "@/lib/pocketbase";
import { useCategories } from "@/lib/categories";
import Link from "next/link";
import { Tag, List, CheckCircle2, AlertCircle, Edit2, Trash2, Inbox } from "lucide-react";

type Category = {
  id: string;
  name: string;
};

export default function AdminKategoriPage() {
  const router = useRouter();
  const user = pb.authStore.model;
  const { categories, loading, refetch } = useCategories();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (!pb.authStore.isValid || !pb.authStore.model?.isAdmin) {
      router.push("/admin/login");
    }
  }, [router]);

  const handleDelete = async (cat: Category) => {
    // 1. Check if category is used in active reports (status: diproses)
    try {
      const activeComplaints = await pb.collection("complaints").getList(1, 1, {
        filter: `categories = "${cat.id}" && status = "diproses"`,
        requestKey: null,
      });

      if (activeComplaints.totalItems > 0) {
        alert(`Kategori "${cat.name}" tidak dapat dihapus karena sedang digunakan dalam ${activeComplaints.totalItems} laporan yang sedang DIPROSES.`);
        return;
      }
    } catch (checkErr) {
      console.warn("Gagal mengecek ketergantungan kategori:", checkErr);
    }

    if (!window.confirm(`Yakin ingin menghapus kategori "${cat.name}"? Kategori yang sudah digunakan oleh laporan tidak akan terhapus dari laporan tersebut.`)) return;

    setDeleting(cat.id);
    try {
      await pb.collection("categories").delete(cat.id);
      setMessage({ text: `Kategori "${cat.name}" berhasil dihapus`, type: "success" });
      refetch();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal menghapus kategori";
      setMessage({ text: message, type: "error" });
    } finally {
      setDeleting(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  if (!isClient || !user?.isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <Link href="/admin" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition mb-3 group text-sm">
              <span className="transform group-hover:-translate-x-1 transition">←</span> Dashboard
            </Link>
            <h1 className="text-3xl sm:text-4xl font-bold text-white flex items-center gap-2">
              <Tag className="w-8 h-8" /> Kelola <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Kategori</span>
            </h1>
            <p className="text-slate-400 mt-1 text-sm sm:text-base">Tambah, edit, atau hapus kategori laporan pengaduan</p>
          </div>
          <Link
            href="/admin/kategori/create"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold text-sm whitespace-nowrap hover:scale-105 active:scale-95"
          >
            <span className="text-lg">+</span> Tambah Kategori
          </Link>
        </div>

        {/* Message Alert */}
        {message && (
          <div
            className={`mb-6 px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
              message.type === "success"
                ? "bg-green-500/10 border border-green-500/20 text-green-300"
                : "bg-red-500/10 border border-red-500/20 text-red-300"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            {message.text}
          </div>
        )}

        {/* Table Container */}
        <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/10">
          {/* Table Header */}
          <div className="bg-white/5 px-4 sm:px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <List className="w-5 h-5" /> Daftar Kategori
            </h2>
            <span className="text-xs text-slate-400 bg-white/5 px-3 py-1 rounded-full">
              {categories.length} kategori
            </span>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-16 px-4">
              <Inbox className="w-16 h-16 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-400 text-lg mb-2">Belum ada kategori</p>
              <p className="text-slate-500 text-sm">Klik tombol &quot;Tambah Kategori&quot; untuk mulai menambahkan.</p>
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider w-16">No</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Nama Kategori</th>
                      <th className="px-4 sm:px-6 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider w-40">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {categories.map((cat, idx) => (
                      <tr
                        key={cat.id}
                        className="group hover:bg-white/5 transition-colors"
                      >
                        <td className="px-4 sm:px-6 py-3.5">
                          <span className="text-sm text-slate-500 font-medium">{idx + 1}</span>
                        </td>
                        <td className="px-4 sm:px-6 py-3.5">
                          <span className="text-sm sm:text-base text-white font-medium">{cat.name}</span>
                        </td>
                        <td className="px-4 sm:px-6 py-3.5">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin/kategori/edit?id=${cat.id}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-300 bg-blue-500/10 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 hover:text-blue-200 transition-all hover:scale-105 active:scale-95"
                            ><Edit2 className="w-3.5 h-3.5" /> Edit
                            </Link>
                            <button
                              onClick={() => handleDelete(cat)}
                              disabled={deleting === cat.id}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 hover:text-red-200 transition-all disabled:opacity-50 hover:scale-105 active:scale-95"
                            >
                              {deleting === cat.id ? (
                                <div className="h-3 w-3 animate-spin rounded-full border-2 border-red-300/50 border-t-red-300" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="px-4 sm:px-6 py-3 bg-white/5 border-t border-white/10">
                <p className="text-xs text-slate-500">
                  Total <span className="text-slate-300 font-medium">{categories.length}</span> kategori terdaftar
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

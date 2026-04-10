"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { pb } from "@/lib/pocketbase";
import { useCategories } from "@/lib/categories";
import { notifyAdminsOfNewComplaint } from "@/app/admin/complaints/hooks/useNotifications";
import type { Complaint, User } from "@/app/admin/complaints/types";
import Link from "next/link";
import Image from "next/image";

export default function UserComplaintCreate() {
  const router = useRouter();
  const user = pb.authStore.model;
  const { categories: categoryList, loading: categoriesLoading } = useCategories();
  const [isClient, setIsClient] = useState(false);

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [location, setLocation] = useState("");
  const [categories, setCategories] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTimeout(() => setIsClient(true), 0);
    if (!user) {
      router.push("/siswa/login");
    }
  }, [user, router]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      setPhotoPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!title.trim() || !desc.trim() || !location.trim() || !categories.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", desc.trim());
      formData.append("location", location.trim());
      formData.append("categories", categories);
      formData.append("creator", user.id);
      formData.append("status", "menunggu");
      if (photoFile) {
        formData.append("photo", photoFile);
      }

      // Create complaint
      const newComplaint = await pb.collection("complaints").create<Complaint>(formData);

      // Send notification to admins (non-blocking)
      try {
        const admins = await pb.collection("users").getFullList({
          filter: 'isAdmin = true',
          fields: 'id,email,name,isAdmin'
        });
        
        if (admins.length > 0) {
          await notifyAdminsOfNewComplaint(newComplaint as unknown as Complaint, user as unknown as User, admins as unknown as User[]);
          console.log(`Notifikasi terkirim ke ${admins.length} admin`);
        }
      } catch (notifErr: unknown) {
        // Don't block redirect if notification fails
        console.warn("Notifikasi error (non-blocking):", notifErr);
      }

      router.push("/siswa/dashboard?success=true");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal membuat laporan";
      setError(message);
      setSubmitting(false);
    }
  };

  if (!isClient) return null;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white selection:bg-purple-500/30 font-sans pb-20">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] animate-pulse" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 relative z-10">
        <Link href={`/siswa/dashboard`} className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition mb-8 group">
          <span className="transform group-hover:-translate-x-1 transition">←</span> Kembali ke Dashboard
        </Link>

        <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4">✍️ Buat Laporan Baru</h1>
        <p className="text-purple-200 mb-10">Ceritakan masalah yang Anda temui agar segera ditindaklanjuti.</p>

        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 bg-white/5 border border-white/10 p-6 sm:p-8 rounded-2xl shadow-xl backdrop-blur-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Judul Laporan <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Misal: AC Kelas Bocor"
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition placeholder-slate-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Kategori Masalah <span className="text-red-400">*</span></label>
                <select
                  value={categories}
                  onChange={(e) => setCategories(e.target.value)}
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                >
                  <option value="" disabled className="bg-slate-900">{categoriesLoading ? "Memuat..." : "Pilih Kategori"}</option>
                  {categoryList.map((cat) => (
                    <option key={cat.id} value={cat.id} className="bg-slate-900">{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Lokasi Detail <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Misal: Lab Komputer 1"
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition placeholder-slate-600"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Deskripsi Lengkap <span className="text-red-400">*</span></label>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Ceritakan detail kerusakan yang Anda temui..."
                  required
                  rows={5}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition resize-none placeholder-slate-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Unggah Foto / Bukti (Opsional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-purple-500/20 file:text-purple-300 hover:file:bg-purple-500/30 transition cursor-pointer"
                />
                {photoPreview && (
                  <div className="mt-4 rounded-xl overflow-hidden border border-white/10 aspect-video relative bg-black/40">
                    <Image
                      src={photoPreview}
                      alt="Preview"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-10 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white rounded-xl transition font-bold disabled:opacity-50"
            >
              {submitting ? "Mengirim Laporan..." : "Kirim Laporan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

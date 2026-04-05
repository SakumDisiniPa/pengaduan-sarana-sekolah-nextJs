"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { pb } from "@/lib/pocketbase";
import Link from "next/link";

const categories = [
  "AC Rusak",
  "Lantai Retak",
  "Atap Bocor",
  "Pintu Rusak",
  "Jendela Rusak",
  "Meja Rusak",
  "Kursi Rusak",
  "Pencahayaan Rusak",
  "Kamar Mandi Rusak",
  "Taman Tidak Terawat",
  "Lainnya"
];

export default function UserComplaintEdit() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const user = pb.authStore.model;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  const isFetched = useRef(false);

  useEffect(() => {
    if (!user) {
      router.push("/siswa/login");
      return;
    }

    const fetchDetail = async () => {
      try {
        const record = await pb.collection("complaints").getOne(id, { requestKey: null });
        
        // Cek status
        if (record.status !== "menunggu") {
          setError("Pengaduan ini sudah diproses atau selesai sehingga tidak dapat diubah lagi.");
          setLoading(false);
          return;
        }

        // Cek kepemilikan
        if (record.creator !== user.id) {
          setError("Anda tidak memiliki akses ke pengaduan ini.");
          setLoading(false);
          return;
        }

        setTitle(record.title);
        setDesc(record.description);
        setLocation(record.location);
        setCategory(record.category);
        if (record.photo) {
          setPhotoPreview(pb.files.getURL(record, Array.isArray(record.photo) ? record.photo[0] : record.photo));
        }

        isFetched.current = true;
      } catch (err: any) {
        if (!err.isAbort) {
          setError("Gagal memuat detail pengaduan. Halaman mungkin tidak ditemukan.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (!isFetched.current) {
      fetchDetail();
    }

    // --- REALTIME SUBSCRIPTION FOR EDITING PAGE ---
    pb.collection("complaints").subscribe(id, (e) => {
      if (e.action === "update") {
        if (e.record.status !== "menunggu") {
          alert("Admin baru saja mengubah status laporan ini. Anda sudah tidak bisa mengeditnya.");
          router.push(`/siswa/complaints/detail/${id}`);
        } else {
          // If title/desc are updated by someone else, we just warn them, but typically edit pages are locked to one user
        }
      } else if (e.action === "delete") {
        alert("Laporan ini baru saja dihapus.");
        router.push("/siswa/dashboard");
      }
    });

    return () => {
      pb.collection("complaints").unsubscribe(id);
    };
  }, [id, router, user]);

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
    if (!title.trim() || !desc.trim() || !location.trim() || !category.trim()) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", desc.trim());
      formData.append("location", location.trim());
      formData.append("category", category);
      if (photoFile) {
        formData.append("photo", photoFile);
      }

      await pb.collection("complaints").update(id, formData);
      router.push(`/siswa/complaints/detail/${id}`);
    } catch (err: any) {
      alert("Gagal menyimpan perubahan: " + err.message);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        <p className="text-slate-400">Memuat data pengaduan...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-white">
        <div className="text-red-500 text-6xl mb-6">⚠️</div>
        <h1 className="text-2xl font-bold mb-2">Tidak dapat Mengedit</h1>
        <p className="text-slate-400 mb-8 max-w-md">{error}</p>
        <Link href="/siswa/dashboard" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl transition font-medium">
          Kembali ke Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-white selection:bg-blue-500/30 font-sans pb-20">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 relative z-10">
        <Link href={`/siswa/dashboard`} className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition mb-8 group">
          <span className="transform group-hover:-translate-x-1 transition">←</span> Kembali ke Daftar
        </Link>

        <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4">Edit Laporan</h1>
        <p className="text-blue-200 mb-10">Kamu dapat memperbarui detail laporan selama laporan ini belum diproses.</p>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Judul Laporan</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Kategori</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                >
                  <option value="" disabled className="bg-slate-900">Pilih Kategori</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat} className="bg-slate-900">{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Lokasi Detail</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Deskripsi Lengkap</label>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  required
                  rows={6}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Foto / Bukti (Ganti Baru Opsional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500/20 file:text-blue-300 hover:file:bg-blue-500/30 transition cursor-pointer"
                />
                {photoPreview && (
                  <div className="mt-4 rounded-xl overflow-hidden border border-white/10 aspect-video relative bg-black/40">
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex justify-end gap-4">
            <Link 
              href={`/siswa/dashboard`}
              className="px-6 py-3 rounded-xl font-medium bg-white/5 hover:bg-white/10 transition text-slate-300"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition font-bold disabled:opacity-50"
            >
              {submitting ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { pb } from "@/lib/pocketbase";
import Link from "next/link";
import Image from "next/image";

type Complaint = {
  id: string;
  title: string;
  description: string;
  status: string;
  categories: string;
  priority: string;
  created: string;
  location: string;
  expand?: {
    categories?: {
      name: string;
    };
  };
  photo?: string;
  rating?: number;
  feedback_message?: string;
  admin_reply?: string;
};

const statusColors: Record<string, string> = {
  menunggu: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  diproses: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  selesai: "bg-green-500/20 text-green-300 border-green-500/30",
};

export default function UserComplaintDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const user = pb.authStore.model;

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Feedback Form State
  const [rating, setRating] = useState<number>(10);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const isFetched = useRef(false);

  useEffect(() => {
    if (!user) {
      router.push("/siswa/login");
      return;
    }

    const fetchDetail = async () => {
      try {
        const record = await pb.collection("complaints").getOne(id, { 
          expand: "categories",
          requestKey: null 
        });
        const data: Complaint = {
          id: record.id,
          title: record.title,
          description: record.description,
          status: record.status || "menunggu",
          categories: record.categories,
          expand: record.expand,
          priority: record.priority,
          created: record.created,
          location: record.location,
          photo: record.photo ? pb.files.getURL(record, Array.isArray(record.photo) ? record.photo[0] : record.photo) : undefined,
          rating: record.rating,
          feedback_message: record.feedback_message,
          admin_reply: record.admin_reply,
        };
        setComplaint(data);
        if (data.rating) setRating(data.rating);
        
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

    // --- REALTIME SUBSCRIPTION ---
    pb.collection("complaints").subscribe(id, (e) => {
      if (e.action === "update") {
        setComplaint((prev) => {
          if (!prev) return prev;
          const updated = {
            ...prev,
            title: e.record.title,
            description: e.record.description,
            status: e.record.status || "menunggu",
            categories: e.record.categories,
            priority: e.record.priority,
            location: e.record.location,
            rating: e.record.rating,
            feedback_message: e.record.feedback_message,
            admin_reply: e.record.admin_reply,
          };
          
          if (e.record.photo) {
            updated.photo = pb.files.getURL(e.record, Array.isArray(e.record.photo) ? e.record.photo[0] : e.record.photo);
          }
          
          if (updated.rating) setRating(updated.rating);
          
          return updated;
        });
      } else if (e.action === "delete") {
        alert("Laporan ini telah dihapus oleh Admin.");
        router.push("/siswa/dashboard");
      }
    });

    return () => {
      pb.collection("complaints").unsubscribe(id);
    };
  }, [id, router, user]);

  const submitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmittingFeedback(true);
    try {
      const updated = await pb.collection("complaints").update(id, {
        rating: rating,
        feedback_message: feedbackMsg,
      });
      setComplaint((prev) => prev ? { ...prev, rating: updated.rating, feedback_message: updated.feedback_message } : null);
      alert("✅ Feedback berhasil dikirim. Terima kasih!");
    } catch (err: any) {
      alert("❌ Gagal mengirim feedback: " + err.message);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
        <p className="text-slate-400">Memuat detail pengaduan...</p>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-white">
        <div className="text-red-500 text-6xl mb-6">⚠️</div>
        <h1 className="text-2xl font-bold mb-2">Oops! Ada yang salah</h1>
        <p className="text-slate-400 mb-8 max-w-md">{error}</p>
        <Link href="/siswa/dashboard" className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl transition font-medium">
          Kembali ke Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white selection:bg-purple-500/30 font-sans pb-20">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 relative z-10">
        <Link href="/siswa/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition mb-8 group">
          <span className="transform group-hover:-translate-x-1 transition">←</span> Kembali
        </Link>

        {/* Status Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <h1 className="text-3xl sm:text-5xl font-bold text-white capitalize leading-tight">
            {complaint.title}
          </h1>
          <span className={`px-5 py-2 rounded-full border font-bold text-sm text-center sm:text-left ${statusColors[complaint.status] || statusColors.menunggu}`}>
            Status: {complaint.status.toUpperCase()}
          </span>
        </div>

        {/* Content Section WITHOUT Outer Card bounds to feel "native" */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* Left Column: Image & Details */}
          <div className="space-y-8">
            {complaint.photo ? (
              <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black/40 aspect-video relative">
                <img 
                  src={complaint.photo} 
                  alt={complaint.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="rounded-3xl border border-white/5 border-dashed bg-white/5 aspect-video flex flex-col items-center justify-center text-slate-500">
                <span className="text-4xl mb-3">📷</span>
                <p>Tidak ada foto lampiran</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-slate-400 text-xs uppercase mb-1">Kategori</p>
                <p className="font-semibold text-purple-300">{complaint.expand?.categories?.name || complaint.categories || "-"}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-slate-400 text-xs uppercase mb-1">Prioritas</p>
                <p className="font-semibold text-blue-300 capitalize">{complaint.priority || "Medium"}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 col-span-2">
                <p className="text-slate-400 text-xs uppercase mb-1">Lokasi Detail</p>
                <p className="font-semibold text-white">{complaint.location}</p>
              </div>
            </div>
            
            <div className="p-1">
              <p className="text-slate-400 text-xs uppercase mb-2">Tanggal Pelaporan</p>
              <p className="font-medium text-slate-300">{formatDate(complaint.created)}</p>
            </div>
          </div>

          {/* Right Column: Description & Feedback */}
          <div className="space-y-10">
            <div>
              <h3 className="text-lg font-bold text-white mb-4 border-b border-white/10 pb-2">Deskripsi Keluhan</h3>
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                {complaint.description}
              </p>
            </div>

            {/* Editing actions only when waiting */}
            {complaint.status === "menunggu" && (
              <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                <p className="text-blue-200 mb-4 text-sm">
                  Pengaduan Anda masih dalam antrean (menunggu). Laporan masih dapat diubah.
                </p>
                <Link 
                  href={`/siswa/complaints/edit/${complaint.id}`}
                  className="w-full inline-flex justify-center items-center py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition font-medium"
                >
                  Edit Laporan Ini
                </Link>
              </div>
            )}

            {/* Feedback Section ONLY if Selesai */}
            {complaint.status === "selesai" && (
              <div className="pt-6 border-t border-white/10">
                <h3 className="text-lg font-bold text-white mb-6">Umpan Balik (Feedback) Laporan</h3>
                
                {complaint.rating ? (
                  // Sudah di-rating
                  <div className="space-y-6">
                    <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-slate-400">Rating kamu:</span>
                        <span className="text-2xl font-bold text-yellow-400">⭐ {complaint.rating}/10</span>
                      </div>
                      <p className="text-white italic">&quot;{complaint.feedback_message || "Tanpa komentar"}&quot;</p>
                    </div>

                    {complaint.admin_reply && (
                      <div className="p-6 bg-purple-500/10 rounded-2xl border border-purple-500/20 relative">
                        <div className="absolute -top-3 left-6 px-2 bg-slate-900 text-xs text-purple-300 font-bold uppercase tracking-wider">
                          Balasan Admin
                        </div>
                        <p className="text-purple-100 mt-2">{complaint.admin_reply}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  // Belum di-rating
                  <form onSubmit={submitFeedback} className="p-6 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-sm text-slate-300 mb-6">
                      Laporan ini telah selesai dikerjakan. Seberapa puas Anda dengan penanganannya?
                    </p>
                    
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-slate-400 mb-3">
                        Rating (1 - 10)
                      </label>
                      <input 
                        type="range" 
                        min="1" 
                        max="10" 
                        value={rating} 
                        onChange={(e) => setRating(Number(e.target.value))}
                        className="w-full accent-purple-500 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-slate-500 mt-2 font-bold">
                        <span>1 (Kecewa)</span>
                        <span className="text-yellow-400 text-lg">⭐ {rating}</span>
                        <span>10 (Sangat Puas)</span>
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-slate-400 mb-2">
                        Komentar Tambahan (Opsional)
                      </label>
                      <textarea 
                        value={feedbackMsg}
                        onChange={(e) => setFeedbackMsg(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition resize-none h-24"
                        placeholder="Contoh: Pekerjaan cepat, tapi agak berantakan..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingFeedback}
                      className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 rounded-xl transition text-white font-bold disabled:opacity-50"
                    >
                      {isSubmittingFeedback ? "Mengirim..." : "Kirim Feedback"}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

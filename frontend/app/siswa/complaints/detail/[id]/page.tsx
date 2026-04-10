"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { pb } from "@/lib/pocketbase";
import Link from "next/link";
import { ArrowLeft, Camera, CheckCircle2, MapPin, Activity, Star, Frown, Smile } from "lucide-react";
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
  completion_proof?: string;
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
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const user = pb.authStore.model;

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [rating, setRating] = useState<number>(10);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const isFetched = useRef(false);

  const fetchDetail = useCallback(async () => {
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
        expand: record.expand as Complaint["expand"],
        priority: record.priority,
        created: record.created,
        location: record.location,
        photo: record.photo ? pb.files.getURL(record, record.photo) : undefined,
        completion_proof: record.completion_proof ? pb.files.getURL(record, record.completion_proof) : undefined,
        rating: record.rating,
        feedback_message: record.feedback_message,
        admin_reply: record.admin_reply,
      };
      
      setComplaint(data);
      if (data.rating) setRating(data.rating);
    } catch (err: unknown) {
      if (!(err as { isAbort?: boolean }).isAbort) {
        setError("Gagal memuat detail pengaduan.");
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!user) {
      router.push("/siswa/login");
      return;
    }

    if (!isFetched.current) {
      fetchDetail();
      isFetched.current = true;
    }

    // Realtime Sync
    pb.collection("complaints").subscribe(id, async (e) => {
      if (e.action === "update") {
        await fetchDetail(); 
      } else if (e.action === "delete") {
        alert("Laporan ini telah dihapus oleh Admin.");
        router.push("/siswa/dashboard");
      }
    });

    return () => {
      pb.collection("complaints").unsubscribe(id);
    };
  }, [id, router, user, fetchDetail]);

  const submitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmittingFeedback(true);
    try {
      await pb.collection("complaints").update(id, {
        rating: rating,
        feedback_message: feedbackMsg,
      });
      alert("✅ Feedback berhasil dikirim!");
      await fetchDetail();
    } catch {
      alert("❌ Gagal mengirim feedback.");
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

  if (loading) return <LoadingSpinner />;
  if (error || !complaint) return <ErrorState message={error || "Laporan tidak ditemukan"} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white pb-20 font-sans relative">
      <BackgroundGlow />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 relative z-10">
        <Link href="/siswa/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition mb-8 group">
          <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition" /> Kembali
        </Link>

        {/* Status Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <h1 className="text-3xl sm:text-5xl font-bold text-white capitalize leading-tight">
            {complaint.title}
          </h1>
          <span className={`px-5 py-2 rounded-full border font-bold text-sm text-center ${statusColors[complaint.status] || statusColors.menunggu}`}>
            Status: {complaint.status.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Left: Media & Meta */}
          <div className="space-y-8">
            <MediaView src={complaint.photo} label="Foto Pengajuan" icon={<Camera className="w-8 h-8" />} />
            
            <div className="grid grid-cols-2 gap-4">
              <InfoCard label="Kategori" value={complaint.expand?.categories?.name || complaint.categories || "-"} icon={<Activity className="w-4 h-4 text-purple-400" />} color="text-purple-300" />
              <InfoCard label="Prioritas" value={complaint.priority || "Medium"} icon={<Star className="w-4 h-4 text-blue-400" />} color="text-blue-300" />
              <InfoCard label="Lokasi Detail" value={complaint.location} icon={<MapPin className="w-4 h-4 text-slate-400" />} fullWidth />
              <div className="col-span-2 p-1">
                <p className="text-slate-400 text-xs uppercase mb-2">Tanggal Pelaporan</p>
                <p className="font-medium text-slate-300">{formatDate(complaint.created)}</p>
              </div>
            </div>
          </div>

          {/* Right: Description & Interaction */}
          <div className="space-y-10">
            <div>
              <h3 className="text-lg font-bold text-white mb-4 border-b border-white/10 pb-2">Deskripsi Keluhan</h3>
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{complaint.description}</p>
            </div>

            <ProofView proof={complaint.completion_proof} status={complaint.status} />

            {complaint.status === "menunggu" && (
              <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                <p className="text-blue-200 mb-4 text-sm">Masih dalam antrean. Anda dapat mengubah laporan ini.</p>
                <Link href={`/siswa/complaints/edit/${complaint.id}`} className="w-full inline-flex justify-center items-center py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition font-medium">
                  Edit Laporan
                </Link>
              </div>
            )}

            {complaint.status === "selesai" && (
              <InteractionSection 
                rating={complaint.rating} 
                feedback={complaint.feedback_message}
                adminReply={complaint.admin_reply}
                currentRating={rating}
                setRating={setRating}
                feedbackMsg={feedbackMsg}
                setFeedbackMsg={setFeedbackMsg}
                onSubmit={submitFeedback}
                isSubmitting={isSubmittingFeedback}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Sub-components ---

function BackgroundGlow() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />
    </div>
  );
}

function InfoCard({ label, value, color, icon, fullWidth }: {
  label: string;
  value: string;
  color?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <div className={`p-4 bg-white/5 rounded-2xl border border-white/5 ${fullWidth ? "col-span-2" : ""}`}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <p className="text-slate-400 text-xs uppercase">{label}</p>
      </div>
      <p className={`font-semibold ${color || "text-white"}`}>{value}</p>
    </div>
  );
}

function MediaView({ src, label, icon }: { src?: string; label: string; icon: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-slate-400 text-xs uppercase pl-1">{label}</p>
      {src ? (
        <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black/40 aspect-video relative">
          <Image src={src} alt="Media" fill className="object-cover" unoptimized />
        </div>
      ) : (
        <div className="rounded-3xl border border-white/5 border-dashed bg-white/5 aspect-video flex flex-col items-center justify-center text-slate-500">
          <span className="mb-3">{icon}</span>
          <p>Tidak ada foto</p>
        </div>
      )}
    </div>
  );
}

function ProofView({ proof, status }: { proof?: string; status: string }) {
  if (status !== "selesai" || !proof) return null;
  const isVideo = proof.match(/\.(mp4|webm|ogg|mov)$|^blob:.*type=video/i);

  return (
    <div className="space-y-4 pt-4">
      <h3 className="text-xl font-bold text-green-400 flex items-center gap-3">
        <CheckCircle2 className="w-6 h-6" /> Bukti Perbaikan (Hasil Kerja)
      </h3>
      <div className="rounded-3xl overflow-hidden border border-green-500/20 shadow-purple-500/10 shadow-2xl bg-black/60 aspect-video relative">
        {isVideo ? (
          <video src={proof} controls className="w-full h-full object-contain" />
        ) : (
          <Image src={proof} alt="Proof" fill className="object-cover" unoptimized />
        )}
      </div>
      <p className="text-slate-400 text-xs italic">* Admin telah mengunggah bukti penyelesaian di atas.</p>
    </div>
  );
}

function InteractionSection({ 
  rating, 
  feedback, 
  adminReply, 
  currentRating, 
  setRating, 
  feedbackMsg, 
  setFeedbackMsg, 
  onSubmit, 
  isSubmitting 
}: {
  rating?: number;
  feedback?: string;
  adminReply?: string;
  currentRating: number;
  setRating: (v: number) => void;
  feedbackMsg: string;
  setFeedbackMsg: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}) {
  return (
    <div className="pt-6 border-t border-white/10">
      <h3 className="text-lg font-bold text-white mb-6">Umpan Balik Laporan</h3>
      
      {rating ? (
        <div className="space-y-6">
          <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400">Rating Anda:</span>
              <span className="text-2xl font-bold text-yellow-400 flex items-center gap-2">
                <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" /> {rating}/10
              </span>
            </div>
            <p className="text-white italic">&quot;{feedback || "Tanpa komentar"}&quot;</p>
          </div>
          {adminReply && (
            <div className="p-6 bg-purple-500/10 rounded-2xl border border-purple-500/20 relative">
              <div className="absolute -top-3 left-6 px-2 bg-slate-900 text-xs text-purple-300 font-bold uppercase">Balasan Admin</div>
              <p className="text-purple-100 mt-2">{adminReply}</p>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={onSubmit} className="p-6 bg-white/5 rounded-2xl border border-white/10">
          <p className="text-sm text-slate-300 mb-6 font-medium">Laporan telah selesai. Berikan penilaian Anda:</p>
          <div className="mb-8">
            <input type="range" min="1" max="10" value={currentRating} onChange={(e) => setRating(Number(e.target.value))} className="w-full accent-purple-500 h-2 bg-slate-800 rounded-lg cursor-pointer" />
            <div className="flex justify-between text-xs text-slate-500 mt-3 font-bold">
              <span className="flex items-center gap-1"><Frown className="w-4 h-4" /> Kecewa</span>
              <span className="text-yellow-400 text-lg flex items-center gap-2">
                <Star className="w-5 h-5 fill-yellow-400" /> {currentRating}
              </span>
              <span className="flex items-center gap-1">Sangat Puas <Smile className="w-4 h-4" /></span>
            </div>
          </div>
          <textarea value={feedbackMsg} onChange={(e) => setFeedbackMsg(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:ring-2 focus:ring-purple-500 transition resize-none h-24 mb-6 shadow-inner" placeholder="Komentar Anda..." />
          <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl transition text-white font-bold disabled:opacity-50 shadow-lg shadow-purple-500/20">
            {isSubmitting ? "Mengirim..." : "Kirim Feedback"}
          </button>
        </form>
      )}
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-white">
      <h1 className="text-2xl font-bold mb-4">Error</h1>
      <p className="text-slate-400 mb-8">{message}</p>
      <Link href="/siswa/dashboard" className="px-6 py-3 bg-purple-600 rounded-xl">Kembali</Link>
    </div>
  );
}

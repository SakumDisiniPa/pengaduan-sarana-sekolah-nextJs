"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { pb } from "@/lib/pocketbase";
import Link from "next/link";
import { ArrowLeft, Camera, Star, User, Calendar } from "lucide-react";
import Image from "next/image";
import { useComplaintDetail } from "../../hooks/useComplaintDetail";
import { sendAdminReply, updateComplaintStatus } from "../../utils";
import { notifyComplaintStatusChange, notifyStudentOfAdminReply } from "../../hooks/useNotifications";
import StatusControl from "./components/StatusControl";
import ProofSection from "./components/ProofSection";

export default function AdminComplaintDetail() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const user = pb.authStore.model;
  
  const { complaint, loading, error } = useComplaintDetail(id);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [adminReply, setAdminReply] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    if (!user || !user.isAdmin) {
      router.push("/admin");
    }
  }, [user, router]);

  useEffect(() => {
    if (complaint?.admin_reply) {
      setAdminReply(complaint.admin_reply);
    }
  }, [complaint]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!complaint) return;
    setIsUpdatingStatus(true);
    try {
      await updateComplaintStatus(id, newStatus);
      
      // Trigger Notification (non-blocking)
      try {
        const creatorId = typeof complaint.creator === "string" 
          ? complaint.creator 
          : (complaint.expand?.creator as { id: string })?.id;

        if (creatorId) {
          await notifyComplaintStatusChange(complaint, creatorId, newStatus);
        }
      } catch (notifErr) {
        console.warn("Notification error:", notifErr);
      }
    } catch {
      alert("Gagal memperbarui status.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSendReply = async () => {
    if (!complaint || !adminReply.trim()) return;
    setIsSubmittingReply(true);
    try {
      await sendAdminReply(id, adminReply);
      
      // Notify Student (non-blocking)
      try {
        const creatorId = typeof complaint.creator === "string" 
          ? complaint.creator 
          : (complaint.expand?.creator as { id: string })?.id;

        if (creatorId) {
          await notifyStudentOfAdminReply(complaint, creatorId, adminReply);
        }
      } catch (notifErr) {
        console.warn("Notification error:", notifErr);
      }

      alert("Balasan berhasil disimpan!");
    } catch {
      alert("Gagal menyimpan balasan.");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  if (loading) return <LoadingState />;
  if (error || !complaint) return <ErrorState error={error} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white pb-20 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
          <Link href="/admin/complaints" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition group">
            <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition" /> Kembali ke Dashboard
          </Link>
          
          <StatusControl 
            id={id} 
            currentStatus={complaint.status || "menunggu"} 
            isUpdating={isUpdatingStatus} 
            onUpdate={handleStatusUpdate} 
          />
        </div>

        <div className="border-b border-white/10 pb-8 mb-10">
          <h1 className="text-3xl sm:text-5xl font-bold text-white capitalize leading-tight mb-4">
            {complaint.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm">
            <div className="flex items-center gap-2 font-semibold text-white px-3 py-1 bg-white/10 rounded-full">
              <User className="w-3.5 h-3.5 text-blue-400" />
              {((complaint.expand?.creator as { name?: string; email?: string })?.name || 
                (complaint.expand?.creator as { name?: string; email?: string })?.email) || "Unknown User"}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{new Date(complaint.created).toLocaleString("id-ID")}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Media & Details */}
          <div className="space-y-8">
            <MediaPreview label="Foto Laporan" src={complaint.photo} icon={<Camera className="w-8 h-8" />} />
            
            <div className="grid grid-cols-2 gap-4">
              <DetailCard label="Kategori" value={(complaint.expand?.categories as { name?: string })?.name || "-"} color="text-blue-300" />
              <DetailCard label="Prioritas" value={complaint.priority || "Medium"} color="text-red-300" />
              <DetailCard label="Lokasi Kejadian" value={complaint.location || "-"} fullWidth />
            </div>
          </div>

          {/* Descriptions & Feedbacks */}
          <div className="space-y-10">
            <div>
              <h3 className="text-lg font-bold text-white mb-4 border-b border-white/10 pb-2">Deskripsi Laporan</h3>
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{complaint.description}</p>
            </div>

            <ProofSection proofFile={complaint.completion_proof || null} status={complaint.status || "selesai"} />

            {complaint.status === "selesai" ? (
              <FeedbackSection 
                rating={complaint.rating} 
                feedback={complaint.feedback_message}
                adminReply={adminReply}
                setAdminReply={setAdminReply}
                onSendReply={handleSendReply}
                isSubmitting={isSubmittingReply}
              />
            ) : (
              <div className="p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl">
                <p className="text-yellow-200 text-sm">
                  Laporan masih berstatus <strong>{complaint.status}</strong>. Siswa hanya dapat memberikan umpan balik apabila laporan telah <strong>Selesai</strong>.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Sub-components ---

function DetailCard({ label, value, color, fullWidth }: { 
  label: string; 
  value: string; 
  color?: string; 
  fullWidth?: boolean; 
}) {
  return (
    <div className={`p-4 bg-white/5 rounded-2xl border border-white/5 ${fullWidth ? "col-span-2" : ""}`}>
      <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">{label}</p>
      <p className={`font-semibold capitalize ${color || "text-white"}`}>{value}</p>
    </div>
  );
}

function MediaPreview({ label, src, icon }: { label: string; src?: string; icon: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-slate-400 text-xs uppercase tracking-wider pl-1">{label}</p>
      {src ? (
        <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black/40 aspect-video relative">
          <Image src={src} fill className="object-cover" alt={label} unoptimized />
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 aspect-video flex flex-col items-center justify-center text-slate-500">
          <span className="mb-3">{icon}</span>
          <p>Tidak ada lampiran</p>
        </div>
      )}
    </div>
  );
}

function FeedbackSection({ rating, feedback, adminReply, setAdminReply, onSendReply, isSubmitting }: {
  rating?: number;
  feedback?: string;
  adminReply: string;
  setAdminReply: (val: string) => void;
  onSendReply: () => void;
  isSubmitting: boolean;
}) {
  return (
    <div className="pt-6 border-t border-white/10">
      <h3 className="text-lg font-bold text-white mb-6">Umpan Balik Siswa</h3>
      {rating ? (
        <div className="space-y-6 mt-6">
          <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
            <label className="block text-sm font-medium text-blue-200 mb-3">Balasan Anda (Admin)</label>
            <textarea
              value={adminReply}
              onChange={(e) => setAdminReply(e.target.value)}
              placeholder="Tulis balasan..."
              className="w-full bg-slate-900/50 border border-blue-500/30 rounded-xl p-4 text-white focus:ring-2 focus:ring-blue-500 transition resize-none h-24 mb-4 shadow-inner"
            />
            <div className="flex justify-end">
              <button
                onClick={onSendReply}
                disabled={isSubmitting || !adminReply.trim()}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition font-medium disabled:opacity-50"
              >
                {isSubmitting ? "Menyimpan..." : "Simpan Balasan"}
              </button>
            </div>
          </div>

          <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400">Rating Kinerja:</span>
              <span className="text-2xl font-bold text-yellow-400 flex items-center gap-2">
                <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" /> {rating}/10
              </span>
            </div>
            <p className="text-white italic">&quot;{feedback || "Siswa tidak meninggalkan komentar."}&quot;</p>
          </div>
        </div>
      ) : (
        <div className="p-6 bg-white/5 rounded-2xl border border-white/10 text-center text-slate-400 italic py-10">
          Siswa belum memberikan rating.
        </div>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-4">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      <p className="text-slate-400 italic">Memuat detail pengaduan...</p>
    </div>
  );
}

function ErrorState({ error }: { error: string | null }) {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center text-white">
      <h1 className="text-2xl font-bold mb-2">Oops! Ada yang salah</h1>
      <p className="text-slate-400 mb-8 max-w-md">{error}</p>
      <Link href="/admin/complaints" className="px-6 py-3 bg-blue-600 rounded-xl hover:bg-blue-500 transition">Kembali</Link>
    </div>
  );
}

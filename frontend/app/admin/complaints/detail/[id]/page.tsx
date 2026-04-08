"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { pb } from "../../../../../lib/pocketbase";
import Link from "next/link";
import { useComplaintDetail } from "../../hooks/useComplaintDetail";
import { useCategories } from "@/lib/categories";
import {
  COMPLAINT_STATUSES,
  getStatusConfig,
  formatDetailDate,
  updateComplaintStatus,
  updateComplaintCategory,
  sendAdminReply,
} from "../../utils";
import { notifyComplaintStatusChange } from "../../hooks/useNotifications";


export default function AdminComplaintDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const user = pb.authStore.model;

  // States for actions
  const [currentStatus, setCurrentStatus] = useState<string>("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [adminReply, setAdminReply] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Fetch regions/categories
  const { complaint, loading, error } = useComplaintDetail(id);
  const { categories: categoryList } = useCategories();

  useEffect(() => {
    if (!user || !user.isAdmin) {
      router.push("/admin");
      return;
    }
  }, [user, router]);

  useEffect(() => {
    if (complaint) {
      setCurrentStatus(complaint.status || "menunggu");
      if (complaint.admin_reply) {
        setAdminReply(complaint.admin_reply);
      }
    }
  }, [complaint]);

  // Handle delete redirect
  useEffect(() => {
    if (error === "Laporan ini baru saja dihapus.") {
      alert("Laporan ini baru saja dihapus.");
      router.push("/admin/complaints");
    }
  }, [error, router]);

  const handleUpdateStatus = async (newStatus: string) => {
    if (!complaint) return;
    setIsUpdatingStatus(true);
    try {
      await updateComplaintStatus(id, newStatus);
      setCurrentStatus(newStatus);

      // Trigger Notification (non-blocking)
      try {
        const creatorId = typeof complaint.creator === "string" 
          ? complaint.creator 
          : complaint.expand?.creator?.id;

        if (creatorId) {
          await notifyComplaintStatusChange(
            complaint as any, 
            creatorId, 
            newStatus
          );
          console.log(`Notification sent to student for status: ${newStatus}`);
        }
      } catch (notifErr) {
        console.warn("Notification error (non-blocking):", notifErr);
      }
    } catch (err) {

      // Error already handled in service
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSendReply = async () => {
    if (!complaint || !adminReply.trim()) return;
    setIsSubmittingReply(true);
    try {
      await sendAdminReply(id, adminReply);
      alert("Balasan berhasil disimpan!");
    } catch (err) {
      // Error already handled in service
    } finally {
      setIsSubmittingReply(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        <p className="text-slate-400">Memuat detail pengaduan...</p>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center text-white">
        <div className="text-red-500 text-6xl mb-6">⚠️</div>
        <h1 className="text-2xl font-bold mb-2">Oops! Ada yang salah</h1>
        <p className="text-slate-400 mb-8 max-w-md">{error}</p>
        <Link href="/admin/complaints" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl transition font-medium">
          Kembali ke Daftar Laporan
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white selection:bg-blue-500/30 font-sans pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 relative z-10">
        
        {/* Nav & Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
          <Link href="/admin/complaints" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition group">
            <span className="transform group-hover:-translate-x-1 transition">←</span> Kembali ke Dashboard
          </Link>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400">Ubah Status Laporan:</span>
            <select
              value={currentStatus}
              onChange={(e) => handleUpdateStatus(e.target.value)}
              disabled={isUpdatingStatus}
              className={`px-4 py-2 rounded-xl font-bold text-sm bg-slate-800 border ${
                getStatusConfig(currentStatus).color
              } appearance-none cursor-pointer hover:opacity-80 transition disabled:opacity-50`}
            >
              {COMPLAINT_STATUSES.map((s) => (
                <option key={s.value} value={s.value} className="bg-slate-800 text-white">
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="border-b border-white/10 pb-8 mb-10">
          <h1 className="text-3xl sm:text-5xl font-bold text-white capitalize leading-tight mb-4">
            {complaint.title}
          </h1>
          <div className="flex items-center gap-3 text-slate-400 text-sm">
            <span className="font-semibold text-white px-3 py-1 bg-white/10 rounded-full">
              {complaint.expand?.creator?.name || complaint.expand?.creator?.email || "Unknown User"}
            </span>
            <span>•</span>
            <span>{formatDetailDate(complaint.created)}</span>
          </div>
        </div>

        {/* Content Section Native Background */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* Left Column: Media & Details */}
          <div className="space-y-8">
            {complaint.photo ? (
              <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black/40 aspect-video relative group">
                <img 
                  src={complaint.photo} 
                  alt={complaint.title}
                  className="w-full h-full object-cover transition duration-700 hover:scale-105"
                />
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 aspect-video flex flex-col items-center justify-center text-slate-500">
                <span className="text-4xl mb-3">📷</span>
                <p>Tidak ada lampiran foto</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Kategori</p>
                <p className="font-semibold text-blue-300">{complaint.expand?.categories?.name || "-"}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Prioritas</p>
                <p className="font-semibold text-red-300 capitalize">{complaint.priority || "Medium"}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 col-span-2">
                <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Lokasi Kejadian</p>
                <p className="font-semibold text-white">{complaint.location}</p>
              </div>
            </div>
          </div>

          {/* Right Column: Descriptions & Feedbacks */}
          <div className="space-y-10">
            <div>
              <h3 className="text-lg font-bold text-white mb-4 border-b border-white/10 pb-2">Deskripsi Laporan</h3>
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                {complaint.description}
              </p>
            </div>

            {/* Feedback & Actions */}
            {complaint.status === "selesai" ? (
              <div className="pt-6 border-t border-white/10">
                <h3 className="text-lg font-bold text-white mb-6">Umpan Balik Siswa</h3>
                
                {complaint.rating ? (
                  <div className="space-y-6">
                    <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-slate-400">Rating Kinerja:</span>
                        <span className="text-2xl font-bold text-yellow-400">⭐ {complaint.rating}/10</span>
                      </div>
                      <p className="text-white italic">&quot;{complaint.feedback_message || "Siswa tidak meninggalkan komentar."}&quot;</p>
                    </div>

                    <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                      <label className="block text-sm font-medium text-blue-200 mb-3">
                        Balasan Anda (Admin)
                      </label>
                      <textarea
                        value={adminReply}
                        onChange={(e) => setAdminReply(e.target.value)}
                        placeholder="Ketik pesan konfirmasi atau ucapan terima kasih kepada siswa..."
                        className="w-full bg-slate-900/50 border border-blue-500/30 rounded-xl p-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none h-24 mb-4"
                      />
                      <div className="flex justify-end">
                        <button
                          onClick={handleSendReply}
                          disabled={isSubmittingReply || !adminReply.trim()}
                          className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition font-medium disabled:opacity-50"
                        >
                          {isSubmittingReply ? "Menyimpan..." : "Simpan Balasan"}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 bg-white/5 rounded-2xl border border-white/10 text-center">
                    <p className="text-slate-400">
                      Laporan ini telah selesai, namun siswa belum memberikan rating / umpan balik.
                    </p>
                  </div>
                )}
              </div>
            ) : (
               <div className="p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl">
                <p className="text-yellow-200 text-sm">
                  Laporan masih berstatus <strong>{complaint.status}</strong>. Siswa hanya dapat memberikan umpan balik apabila Anda merubah status menjadi <strong>Selesai</strong>.
                </p>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}

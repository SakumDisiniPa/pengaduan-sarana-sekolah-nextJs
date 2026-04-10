"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { pb } from "@/lib/pocketbase";
import { Ban, Calendar, AlertCircle, ChevronLeft, ShieldAlert, Loader2 } from "lucide-react";
import Link from "next/link";
import { updateUserStatusAdmin } from "@/app/actions/admin";
import Image from "next/image";

interface UserToBan {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export default function ConfirmBanPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const [userToBan, setUserToBan] = useState<UserToBan | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Form states
  const [days, setDays] = useState<string>("7");
  const [reason, setReason] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
    
    const admin = pb.authStore.model;
    if (!admin || !admin.isAdmin) {
      router.push("/admin/login");
      return;
    }

    const fetchUser = async () => {
      try {
        setLoading(true);
        // Use requestKey: null to avoid auto-cancellation Error 0
        const record = await pb.collection("users").getOne(id, { requestKey: null });
        setUserToBan(record as unknown as UserToBan);
        setLoading(false);
      } catch (err: unknown) {
        const error = err as { isAbort?: boolean; code?: number; name?: string; status?: number };
        // Ignore auto-cancellation errors (code 0 or isAbort)
        if (error.isAbort || error.code === 0 || (error.name === 'ClientResponseError' && error.status === 0)) {
          return;
        }
        console.error("Fetch user error:", err);
        setError("User tidak ditemukan atau ID tidak valid.");
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Alasan banned wajib diisi.");
      return;
    }

    const dayNum = parseInt(days);
    if (isNaN(dayNum) || dayNum <= 0) {
      setError("Jumlah hari harus berupa angka positif.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Calculate date
      const bannedUntil = new Date();
      bannedUntil.setDate(bannedUntil.getDate() + dayNum);

      const result = await updateUserStatusAdmin(id, {
        isBanned: true,
        bannedUntil: bannedUntil.toISOString(),
        banReason: reason.trim()
      });

      if (result.success) {
        router.push("/admin/users?success=banned");
      } else {
        throw new Error(result.error);
      }
    } catch (err: unknown) {
      console.error("Ban update error:", err);
      const message = err instanceof Error ? err.message : "Gagal memproses banned.";
      setError(message);
      setSubmitting(false);
    }
  };

  // 1. Initial hydration and loading state
  if (!isMounted || loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-6 space-y-6">
        <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Menyiapkan Penindakan...</p>
      </div>
    );
  }

  // 2. Error or Not Found state (Only after loading is false)
  if (!userToBan) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6">
        <div className="bg-slate-900 border border-white/10 p-8 rounded-3xl text-center max-w-md shadow-2xl">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Terjadi Kesalahan</h2>
          <p className="text-slate-400 mb-6">{error || "User tidak ditemukan atau sesi berakhir."}</p>
          <Link href="/admin/users" className="inline-block w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all">
            Kembali ke Daftar User
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-xl">
        <Link 
          href="/admin/users" 
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors group"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold text-sm uppercase tracking-widest">Batal & Kembali</span>
        </Link>

        <div className="bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          <div className="bg-gradient-to-r from-red-600 to-orange-600 p-8 text-white relative">
            <div className="relative z-10 flex items-center gap-6">
              <div className="w-20 h-20 rounded-full border-4 border-white/20 overflow-hidden bg-white/10 shadow-xl relative">
                <Image 
                  src={userToBan.avatar ? `https://pengaduansaranasekolah.sakum.my.id/api/files/users/${userToBan.id}/${userToBan.avatar}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(userToBan.name)}&background=random`} 
                  alt={userToBan.name} 
                  fill
                  sizes="80px"
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-1">Konfirmasi Banned</h1>
                <p className="text-red-100 opacity-80 text-sm font-medium">User: {userToBan.name} ({userToBan.email})</p>
              </div>
            </div>
            <ShieldAlert className="absolute top-1/2 right-8 -translate-y-1/2 w-24 h-24 text-white/10" />
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm font-bold flex items-center gap-3">
                <AlertCircle className="w-5 h-5" /> {error}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-3 px-1">Durasi Banned (Hari)</label>
                <div className="relative group">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-red-400 transition-colors" />
                  <input
                    type="number"
                    min="1"
                    required
                    value={days}
                    onChange={(e) => setDays(e.target.value)}
                    placeholder="Contoh: 19"
                    className="w-full rounded-2xl border border-white/10 bg-slate-800/50 px-4 py-4 pl-12 transition-all focus:ring-4 focus:ring-red-500/20 focus:border-red-500/50 text-white font-bold outline-none"
                  />
                </div>
                <p className="mt-2 text-[10px] text-slate-500 italic pl-1">
                  Akses user akan dipulihkan secara otomatis setelah durasi berakhir.
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-3 px-1">Alasan Penindakan</label>
                <textarea
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  placeholder="Berikan alasan yang jelas mengapa user ini diblokir..."
                  className="w-full rounded-2xl border border-white/10 bg-slate-800/50 px-4 py-4 transition-all focus:ring-4 focus:ring-red-500/20 focus:border-red-500/50 text-white text-sm outline-none resize-none placeholder:text-slate-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-2xl font-bold tracking-widest uppercase transition-all shadow-xl shadow-red-500/20 disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {submitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <Ban className="w-5 h-5" /> Blokir Sekarang
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

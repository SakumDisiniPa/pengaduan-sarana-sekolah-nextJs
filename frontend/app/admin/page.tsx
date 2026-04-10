"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { pb } from "@/lib/pocketbase";
import { BarChart3, Users, Clock, Hourglass, CheckCircle2, FileText, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import Link from "next/link";
import useSyncEngine from "@/hooks/useSyncEngine";
import SyncOverlay from "@/components/admin/SyncOverlay";
import { db } from "@/lib/db";
import { decryptData } from "@/lib/crypto";

type Complaint = {
  id: string;
  title: string;
  status?: string;
  created: string;
  expand?: {
    creator?: {
      email?: string;
      name?: string;
    };
  };
};

function AdminDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const user = pb.authStore.model;

  // 1. Initialize Sync Engine
  const { isSyncing, progress, isReady, error: syncError } = useSyncEngine();

  const [usersCount, setUsersCount] = useState<number>(0);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Stats States
  const [statsData, setStatsData] = useState({
    total: 0,
    menunggu: 0,
    diproses: 0,
    selesai: 0
  });

  // Pagination States
  const urlPage = Number(searchParams.get("page")) || 1;
  const urlPerPage = Number(searchParams.get("perPage")) || 5;
  const [page, setPage] = useState(urlPage);
  const [perPage, setPerPage] = useState(urlPerPage);
  const [totalPages, setTotalPages] = useState(1);

  // Sync state with URL
  useEffect(() => {
    setPage(urlPage);
    setPerPage(urlPerPage);
  }, [urlPage, urlPerPage]);

  const updatePage = useCallback((newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  }, [router, pathname, searchParams]);

  const updateLimit = useCallback((newLimit: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("perPage", newLimit.toString());
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }, [router, pathname, searchParams]);

  // 2. Local Data Fetcher (Reads from IndexedDB)
  const fetchLocalData = useCallback(async () => {
    if (!isReady || !user?.id) return;

    try {
      setLoading(true);

      // Fetch ALL from decrypting local DB
      // Note: Ideally we'd filter in the DB, but since everything is encrypted, 
      // we pull and decrypt. For very large datasets, we can use IndexedDB indexes on metadata.
      const rawUsers = await db.users.toArray();
      const rawComplaints = await db.complaints.toArray();

      const decryptedComplaints = rawComplaints.map(item => {
        const decrypted = decryptData(item.data, user.id);
        return decrypted;
      }).sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());

      // Stats
      const stats = {
        total: decryptedComplaints.length,
        menunggu: decryptedComplaints.filter(c => c.status === "menunggu").length,
        diproses: decryptedComplaints.filter(c => c.status === "diproses").length,
        selesai: decryptedComplaints.filter(c => c.status === "selesai").length
      };

      setUsersCount(rawUsers.length);
      setStatsData(stats);

      // Pagination
      const start = (page - 1) * perPage;
      const end = start + perPage;
      setComplaints(decryptedComplaints.slice(start, end));
      setTotalPages(Math.ceil(stats.total / perPage));

    } catch (err) {
      console.error("Local fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [isReady, user?.id, page, perPage]);

  // Effect: Auth Check
  useEffect(() => {
    if (!user || !user.isAdmin) {
      router.push("/admin/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.isAdmin, router]);

  // Effect: Sync Readiness & Local Data
  useEffect(() => {
    if (isReady) {
      fetchLocalData();
    }
  }, [isReady, fetchLocalData]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return `Hari ini, ${date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`;
    if (days === 1) return `Kemarin, ${date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`;
    if (days < 7) return `${days} hari yang lalu`;
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <SyncOverlay 
        isSyncing={isSyncing} 
        progress={progress} 
        isReady={isReady} 
        error={syncError} 
      />
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 right-0 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "4s" }} />
      </div>

      <div className="relative w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2 flex items-center gap-3">
              <BarChart3 className="w-10 h-10" /> Dashboard Admin
            </h1>
            <p className="text-blue-100 text-lg">
              Pantau dan kelola semua aktivitas pengaduan sekolah
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
            <StatCard 
              label="Total Siswa" 
              value={usersCount}
              icon={<Users className="w-8 h-8" />}
              color="from-blue-600 to-blue-700"
              href="/admin/users"
            />
            <StatCard 
              label="Menunggu" 
              value={statsData.menunggu}
              icon={<Clock className="w-8 h-8" />}
              color="from-yellow-600 to-yellow-700"
            />
            <StatCard 
              label="Diproses" 
              value={statsData.diproses}
              icon={<Hourglass className="w-8 h-8" />}
              color="from-blue-600 to-blue-700"
            />
            <StatCard 
              label="Selesai" 
              value={statsData.selesai}
              icon={<CheckCircle2 className="w-8 h-8" />}
              color="from-green-600 to-green-700"
            />
          </div>

          {/* Table Section */}
          <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/10">
          {/* Table Section Header */}
          <div className="bg-white/5 px-6 sm:px-8 py-6 border-b border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <FileText className="w-6 h-6" /> Daftar Pengaduan
              </h2>
              <Link 
                href="/admin/users" 
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/10 transition-all font-bold text-sm"
              >
                <Users className="w-4 h-4" /> Kelola User & Banned
              </Link>
            </div>
          </div>

          {/* Table Body */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-slate-300 uppercase tracking-wider w-12 text-center">No</th>
                  <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-slate-300 uppercase tracking-wider">Nama Siswa</th>
                  <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-slate-300 uppercase tracking-wider hidden sm:table-cell">Laporan</th>
                  <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-slate-300 uppercase tracking-wider">Status</th>
                  <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-slate-300 uppercase tracking-wider hidden lg:table-cell">Tanggal</th>
                  <th className="px-4 sm:px-6 py-4 text-center text-xs sm:text-sm font-semibold text-slate-300 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {complaints.map((c, idx) => (
                  <tr 
                    key={c.id} 
                    className="hover:bg-white/5 transition-colors border-b border-white/5 group"
                  >
                    <td className="px-4 sm:px-6 py-4">
                      <div className="w-7 h-7 mx-auto rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-slate-400 group-hover:text-blue-400 group-hover:border-blue-400/50 font-bold text-xs transition-all shadow-lg">
                        {(page - 1) * perPage + idx + 1}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="text-sm sm:text-base font-semibold text-white truncate max-w-[120px] sm:max-w-none">
                        {c.expand?.creator?.name || c.expand?.creator?.email || "Anonim"}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                      <div className="text-sm sm:text-base font-medium text-slate-300 truncate max-w-xs">
                        {c.title}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm sm:text-base font-medium text-slate-400 hidden lg:table-cell whitespace-nowrap">
                      {formatDate(c.created)}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-center">
                      <Link 
                        href={`/admin/complaints/detail/${c.id}`}
                        className="inline-flex items-center justify-center p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-all shadow-inner border border-blue-500/20"
                        title="Detail"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="px-6 sm:px-8 py-6 bg-white/5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-slate-400 text-center sm:text-left">
              <p>
                Menampilkan <span className="font-bold text-white">{complaints.length}</span> laporan dari total <span className="font-bold text-white">{statsData.total}</span>
              </p>

              <div className="flex items-center gap-2 border-l border-white/10 pl-4">
                <span>Tampilkan:</span>
                <select 
                  value={perPage}
                  onChange={(e) => updateLimit(Number(e.target.value))}
                  className="bg-transparent font-bold text-blue-400 outline-none cursor-pointer focus:ring-0"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
                <span>per halaman</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => updatePage(Math.max(1, page - 1))}
                disabled={page === 1 || loading}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition disabled:opacity-20 disabled:cursor-not-allowed border border-white/10"
                title="Halaman Sebelumnya"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex items-center px-5 py-2 bg-white/5 border border-white/10 rounded-xl min-w-[8rem] justify-center">
                <span className="text-sm font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Halaman {page} / {totalPages || 1}
                </span>
              </div>

              <button
                onClick={() => updatePage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages || loading}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition disabled:opacity-20 disabled:cursor-not-allowed border border-white/10"
                title="Halaman Berikutnya"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}

// Sub-components untuk kerapihan kode
function StatCard({ label, value, icon, color, href }: { label: string; value: number; icon: React.ReactNode; color: string; href?: string }) {
  const content = (
    <div className={`h-full bg-gradient-to-br ${color} rounded-2xl p-6 sm:p-8 text-white shadow-lg hover:shadow-2xl transition-all hover:scale-105 backdrop-blur-sm border border-white/20`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm sm:text-base font-semibold opacity-90">{label}</h3>
        {icon}
      </div>
      <p className="text-4xl sm:text-5xl font-bold">{value}</p>
      <div className="mt-4 h-1 w-12 bg-white/40 rounded-full" />
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block cursor-pointer">
        {content}
      </Link>
    );
  }

  return content;
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    }>
      <AdminDashboardContent />
    </Suspense>
  );
}

function StatusBadge({ status }: { status?: string }) {
  const styles: Record<string, string> = {
    menunggu: "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-700 dark:text-yellow-400 border border-yellow-400/50",
    diproses: "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-700 dark:text-blue-400 border border-blue-400/50",
    selesai: "bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-700 dark:text-green-400 border border-green-400/50",
  };

  const icons: Record<string, React.ReactNode> = {
    menunggu: <Clock className="w-3.5 h-3.5" />,
    diproses: <Hourglass className="w-3.5 h-3.5" />,
    selesai: <CheckCircle2 className="w-3.5 h-3.5" />,
  };

  const label: Record<string, string> = {
    menunggu: "Menunggu",
    diproses: "Diproses",
    selesai: "Selesai",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs sm:text-sm font-semibold transition-all ${styles[status as string] || styles.menunggu}`}>
      {icons[status as string] || icons.menunggu}
      {label[status as string] || label.menunggu}
    </span>
  );
}
"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { pb } from "@/lib/pocketbase";
import Link from "next/link";
import { PlusCircle, Eye, Edit2, Trash2, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { getComplaints, ComplaintFilters } from "@/lib/complaintsQueries";

// Types
type Complaint = {
  id: string;
  title: string;
  description: string;
  status?: string;
  categories?: string;
  priority?: string;
  created: string;
  location?: string;
  photo?: string;
  rating?: number;
  feedback_message?: string;
  admin_reply?: string;
  expand?: {
    categories?: {
      name: string;
    };
    [key: string]: unknown;
  };
};

const statuses = [
  { value: "all", label: "Semua Laporan" },
  { value: "menunggu", label: "Menunggu" },
  { value: "diproses", label: "Diproses" },
  { value: "selesai", label: "Selesai" },
];

const statusStyles: Record<string, string> = {
  menunggu: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  diproses: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  selesai: "bg-green-500/20 text-green-300 border-green-500/30",
};

export default function UserComplaintsDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // URL success cleanup
  useEffect(() => {
    if (searchParams.get("success") === "true") {
      alert("✅ Laporan berhasil dibuat!");
      router.replace(pathname);
    }
  }, [searchParams, pathname, router]);

  const user = pb.authStore.model;
  const [isClient, setIsClient] = useState(false);

  // Filter States
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [localSearchText, setLocalSearchText] = useState("");

  // Data States
  const [list, setList] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  
  // Pagination States
  const urlPage = Number(searchParams.get("page")) || 1;
  const [page, setPage] = useState(urlPage);
  const [perPage, setPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  // Sync state with URL
  useEffect(() => {
    setPage(urlPage);
  }, [urlPage]);

  const updatePage = useCallback((newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  }, [router, pathname, searchParams]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchText(localSearchText);
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearchText]);

  // Build effective filters
  const effectiveFilters = useMemo<ComplaintFilters>(() => {
    const base: ComplaintFilters = {};
    if (user?.id) base.creator = user.id;
    if (statusFilter !== "all") base.status = statusFilter;
    if (searchText) base.searchText = searchText;
    return base;
  }, [user?.id, statusFilter, searchText]);

  // Reset page ke 1 jika filter atau perPage berubah
  useEffect(() => {
    if (page !== 1) updatePage(1);
  }, [effectiveFilters, perPage]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch Complaints List
  const fetchList = useCallback(async (isMounted = true) => {
    try {
      setLoading(true);

      const result = await getComplaints(effectiveFilters, {
        page: page,
        perPage: perPage,
        sort: "-created",
      });

      if (!isMounted) return;

      setList(
        (result.items as unknown[] as Complaint[]).map((r) => ({
          ...r,
          status: r.status || "menunggu",
          photo: r.photo ? pb.files.getURL(r, Array.isArray(r.photo) ? r.photo[0] : r.photo) : undefined,
        }))
      );
      
      setTotalPages(result.totalPages);
      setLoading(false);
      setInitialLoading(false);
    } catch (err: unknown) {
      if (isMounted && (err as { isAbort?: boolean })?.isAbort !== true) {
        console.error("Load error:", err);
        setLoading(false);
        setInitialLoading(false);
      }
    }
  }, [effectiveFilters, page, perPage]);

  useEffect(() => {
    setIsClient(true);
    if (!user) {
      router.push("/siswa/login");
      return;
    }

    fetchList();

    // Subscribe to ALL complaints to handle realtime updates/deletes/creations
    pb.collection("complaints").subscribe("*", () => {
      // Refresh list on ANY change to ensure pagination integrity
      fetchList();
    });

    return () => {
      pb.collection("complaints").unsubscribe("*");
    };
  }, [user, router, fetchList]);

  const deleteComplaint = async (id: string) => {
    if (!window.confirm("Apakah anda yakin ingin menghapus laporan ini?")) return;
    try {
      await pb.collection("complaints").delete(id);
      setList((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Error deleting complaint:", err);
      alert("Gagal menghapus laporan.");
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (!isClient) return null;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white selection:bg-purple-500/30">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Welcome Header */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-2">
            Selamat datang, <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{user.name || "Siswa"}</span>
          </h1>
          <p className="text-slate-400 text-lg">Pantau dan kelola riwayat laporan sarana sekolah kamu di sini.</p>
        </div>

        {/* Action Bar (Search, Filter & Create Button) */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-center bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md shadow-lg mb-8">
          
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <svg className="w-5 h-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </span>
              <input
                type="text"
                placeholder="Cari laporan..."
                value={localSearchText}
                onChange={(e) => setLocalSearchText(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-48 bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition appearance-none cursor-pointer"
            >
              {statuses.map((s) => (
                <option key={s.value} value={s.value} className="bg-slate-900">
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <Link
            href="/siswa/complaints/create"
            className="w-full lg:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg border border-blue-500/50 hover:shadow-blue-500/20 font-bold transition flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-5 h-5" /> Buat Pengaduan
          </Link>
        </div>

        {/* Table Container */}
        <div className="bg-white/5 border border-white/10 rounded-2xl shadow-xl backdrop-blur-md overflow-hidden relative min-h-[400px]">
          {/* Top Loading Indicator for Background Refreshing */}
          {loading && !initialLoading && (
            <div className="absolute top-0 left-0 w-full h-1 bg-purple-500/20 overflow-hidden">
              <div className="h-full bg-purple-500 w-1/3 animate-[slide_1s_ease-in-out_infinite]" />
            </div>
          )}

          {initialLoading ? (
             <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-950/50 backdrop-blur-sm z-20">
               <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
               <p className="text-slate-400 font-medium">Memuat riwayat...</p>
             </div>
          ) : list.length === 0 ? (
            <div className="p-16 text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-20 text-slate-400" />
              <h3 className="text-xl font-bold text-white mb-2">Riwayat Kosong</h3>
              <p className="text-slate-400 mb-6">Kamu belum memiliki pengaduan dengan filter tersebut.</p>
              <Link href="/siswa/complaints/create" className="text-blue-400 hover:text-blue-300 font-medium underline">
                Coba buat laporan sekarang
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap lg:whitespace-normal">
                <thead>
                  <tr className="bg-black/40 border-b border-white/10 text-slate-300 text-sm tracking-wider">
                    <th className="py-4 px-6 font-semibold w-16">#</th>
                    <th className="py-4 px-6 font-semibold">Keterangan Laporan</th>
                    <th className="py-4 px-6 font-semibold w-40 text-center">Status</th>
                    <th className="py-4 px-6 font-semibold w-64 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {list.map((complaint, index) => (
                    <tr key={complaint.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-5 px-6 font-medium text-slate-500 group-hover:text-slate-300 transition-colors text-center">
                        {(page - 1) * perPage + index + 1}
                      </td>
                      
                      <td className="py-5 px-6">
                        <div className="flex flex-col gap-1 max-w-xl">
                          <span className="font-bold text-white text-base">
                            {complaint.title}
                          </span>
                          <span className="text-xs text-slate-400">
                            {formatDate(complaint.created)}
                          </span>
                          <span className="text-sm text-slate-300 mt-1 flex gap-2 items-center flex-wrap">
                            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-xs text-blue-300">
                              Kategori: {complaint.expand?.categories?.name || complaint.categories || '-'}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-xs">
                              Lokasi: {complaint.location || '-'}
                            </span>
                            {complaint.status === "selesai" && complaint.rating && (
                              <span className="px-2 py-0.5 rounded bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-xs font-medium">
                                Feedback: {complaint.rating}/10
                              </span>
                            )}
                          </span>
                        </div>
                      </td>

                      <td className="py-5 px-6 text-center">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full border ${statusStyles[complaint.status || "menunggu"] || statusStyles.menunggu}`}>
                          {(complaint.status || "menunggu").toUpperCase()}
                        </span>
                      </td>

                      <td className="py-5 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/siswa/complaints/detail/${complaint.id}`}
                            className="bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 p-2 rounded-lg transition-all group/btn shadow-inner"
                            title="Lihat Detail"
                          >
                            <Eye className="w-5 h-5" />
                          </Link>
                          
                          {complaint.status === "menunggu" && (
                            <Link
                              href={`/siswa/complaints/edit/${complaint.id}`}
                              className="bg-slate-500/10 hover:bg-slate-500/20 border border-slate-500/20 text-slate-300 p-2 rounded-lg transition-all shadow-inner"
                              title="Edit Laporan"
                            >
                              <Edit2 className="w-5 h-5" />
                            </Link>
                          )}

                          <button
                            onClick={() => deleteComplaint(complaint.id)}
                            className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 p-2 rounded-lg transition-all shadow-inner"
                            title="Hapus Laporan"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {!initialLoading && list.length > 0 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/5 border border-white/10 p-4 rounded-xl backdrop-blur-md shadow-lg">
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-400">Tampilkan:</span>
              <select
                value={perPage}
                onChange={(e) => setPerPage(Number(e.target.value))}
                className="bg-black/30 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition appearance-none cursor-pointer"
              >
                <option value={5} className="bg-slate-900">5</option>
                <option value={10} className="bg-slate-900">10</option>
                <option value={20} className="bg-slate-900">20</option>
                <option value={50} className="bg-slate-900">50</option>
              </select>
              <span className="text-sm text-slate-400">data per halaman</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => updatePage(Math.max(1, page - 1))}
                disabled={page === 1 || loading}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition disabled:opacity-20 disabled:cursor-not-allowed border border-white/10"
                title="Halaman Sebelumnya"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex items-center px-4 py-2 bg-white/5 border border-white/10 rounded-xl min-w-[7rem] justify-center">
                <span className="text-sm font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Hal {page} / {totalPages || 1}
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
        )}
      </div>
{/* Style inject for loading horizontal slide bar */}
<style dangerouslySetInnerHTML={{__html: `
@keyframes slide {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(300%); }
}
`}} />
    </div>
  );
}
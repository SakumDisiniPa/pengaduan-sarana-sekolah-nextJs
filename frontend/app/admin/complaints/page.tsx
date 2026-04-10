"use client";

import { Suspense, useEffect, useState, useMemo, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { pb } from "@/lib/pocketbase";
import { ComplaintFilters } from "@/lib/complaintsQueries";
import FilterControls from "./components/FilterControls";
import ComplaintsList from "./components/ComplaintsList";
import { useAdminComplaints } from "./hooks/useAdminComplaints";
import { buildEffectiveFilters } from "./utils/filterUtils";
import { deleteComplaint } from "./utils/complaintService";
import { formatDate } from "./utils/dateFormatter";
import { FilterMode } from "./types";
import { FileText, ChevronLeft, ChevronRight } from "lucide-react";

import useSyncEngine from "@/hooks/useSyncEngine";
import SyncOverlay from "@/components/admin/SyncOverlay";

function AdminComplaintsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const admin = pb.authStore.model;

  // 1. Sync Engine
  const { isSyncing, progress, isReady, error: syncError } = useSyncEngine();

  // URL-based page state
  const urlPage = Number(searchParams.get("page")) || 1;
  const urlPerPage = Number(searchParams.get("perPage")) || 10;

  // Filter states
  const [filters, setFilters] = useState<ComplaintFilters>({
    status: 'all'
  });
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [month, setMonth] = useState<number | null>(null);
  const [year, setYear] = useState<number | null>(null);
  const [searchText, setSearchText] = useState<string>("");
  const [filterMode, setFilterMode] = useState<FilterMode>("status");

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

  // Auth check
  useEffect(() => {
    if (!admin || !admin.isAdmin) {
      router.push("/admin/login");
    }
  }, [admin, router]);

  // Build effective filters
  const effectiveFilters = useMemo<ComplaintFilters>(() => {
    return buildEffectiveFilters(
      filters,
      filterMode,
      dateFrom,
      dateTo,
      month,
      year,
      searchText
    );
  }, [filters, filterMode, dateFrom, dateTo, month, year, searchText]);

  // Load complaints data from local IndexedDB via hook
  const { complaints, loading, initialLoading, totalPages, users } = useAdminComplaints({
    page: urlPage,
    perPage: urlPerPage,
    filters: effectiveFilters,
    isReady: isReady,
  });

  const handleDeleteComplaint = async (id: string) => {
    try {
      if (confirm("Apakah Anda yakin ingin menghapus laporan ini?")) {
        await deleteComplaint(id);
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleReset = () => {
    setFilters({ status: 'all' });
    setDateFrom("");
    setDateTo("");
    setMonth(null);
    setYear(null);
    setSearchText("");
    updatePage(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 selection:bg-blue-500/30">
      <SyncOverlay 
        isSyncing={isSyncing} 
        progress={progress} 
        isReady={isReady} 
        error={syncError} 
      />
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      <div className="relative mx-auto max-w-full px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-900/40 backdrop-blur-xl shadow-2xl border border-white/10 overflow-hidden">
          {/* Header Section */}
          <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-6 sm:px-8 py-10 sm:py-14">
            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3 flex items-center gap-4">
                  <FileText className="w-10 h-10" /> Manajemen Laporan
                </h1>
                <p className="text-blue-100 text-lg max-w-2xl">
                  Pusat kendali laporan sarana dan prasarana sekolah. Kelola, tanggapi, dan pantau penyelesaian setiap keluhan siswa.
                </p>
              </div>
              
              {loading && !initialLoading && (
                <div className="flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg animate-fade-in">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span className="text-sm font-bold text-white whitespace-nowrap">Sinkronisasi Live...</span>
                </div>
              )}
            </div>
          </div>

          <FilterControls
            filters={filters}
            onFilterChange={setFilters}
            dateFrom={dateFrom}
            onDateFromChange={setDateFrom}
            dateTo={dateTo}
            onDateToChange={setDateTo}
            month={month}
            onMonthChange={setMonth}
            year={year}
            onYearChange={setYear}
            searchText={searchText}
            onSearchChange={setSearchText}
            filterMode={filterMode}
            onFilterModeChange={setFilterMode}
            users={users}
            onReset={handleReset}
          />

          <ComplaintsList
            list={complaints}
            onDelete={handleDeleteComplaint}
            formatDate={formatDate}
          />

          {/* New Modern Pagination */}
          <div className="px-6 py-6 bg-white/5 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-slate-400">
              <p>
                Menampilkan halaman <span className="font-bold text-blue-400">{urlPage}</span> dari total <span className="font-bold text-blue-400">{totalPages}</span>
              </p>
              
              <div className="flex items-center gap-2 border-l border-white/10 pl-4">
                <span>Tampilkan:</span>
                <select 
                  value={urlPerPage}
                  onChange={(e) => updateLimit(Number(e.target.value))}
                  className="bg-transparent font-bold text-blue-400 outline-none cursor-pointer focus:ring-0"
                >
                  <option value="5" className="bg-slate-900">5</option>
                  <option value="10" className="bg-slate-900">10</option>
                  <option value="20" className="bg-slate-900">20</option>
                  <option value="50" className="bg-slate-900">50</option>
                  <option value="100" className="bg-slate-900">100</option>
                </select>
                <span>per halaman</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={urlPage === 1 || loading}
                onClick={() => updatePage(Math.max(1, urlPage - 1))}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition disabled:opacity-30 disabled:cursor-not-allowed border border-white/10"
                title="Halaman Sebelumnya"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex items-center px-4 py-2 bg-white/5 border border-white/10 rounded-xl min-w-[6rem] justify-center">
                <span className="text-sm font-bold text-blue-400">
                  {urlPage} / {totalPages || 1}
                </span>
              </div>

              <button
                disabled={urlPage >= totalPages || loading}
                onClick={() => updatePage(Math.min(totalPages, urlPage + 1))}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition disabled:opacity-30 disabled:cursor-not-allowed border border-white/10"
                title="Halaman Berikutnya"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminComplaintsPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-slate-400 font-medium">Memuat data pengaduan...</p>
        </div>
      </div>
    }>
      <AdminComplaintsContent />
    </Suspense>
  );
}

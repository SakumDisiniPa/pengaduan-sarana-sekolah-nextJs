"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { pb } from "@/lib/pocketbase";
import { ComplaintFilters } from "@/lib/complaintsQueries";
import FilterControls from "./components/FilterControls";
import ComplaintsList from "./components/ComplaintsList";
import { useAdminComplaints } from "./hooks/useAdminComplaints";
import { buildEffectiveFilters } from "./utils/filterUtils";
import { deleteComplaint } from "./utils/complaintService";
import { formatDate } from "./utils/dateFormatter";
import { FilterMode } from "./types";
import { FileText } from "lucide-react";

export default function AdminComplaintsPage() {
  const router = useRouter();
  const user = pb.authStore.model;

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
  const [page, setPage] = useState(1);

  // Auth check
  useEffect(() => {
    if (!user) {
      router.push("/admin/login");
      return;
    }
    if (!user.isAdmin) {
      router.push("/");
      return;
    }
  }, [user, router]);

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

  // Load complaints data
  const { complaints, loading, initialLoading, totalPages, users } = useAdminComplaints({
    page,
    filters: effectiveFilters,
    enabled: !!user?.isAdmin,
  });

  const handleDeleteComplaint = async (id: string) => {
    try {
      await deleteComplaint(id);
    } catch (err) {
      // Error already handled in deleteComplaint utility
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
    setPage(1);
  };

  if (initialLoading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-gray-500 font-medium">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-white/95 backdrop-blur-xl shadow-2xl dark:bg-slate-800/95 border border-white/20 overflow-hidden">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 px-6 sm:px-8 py-8 sm:py-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <FileText className="w-8 h-8" /> Manajemen Pengaduan
            </h1>
            <p className="text-blue-100 text-sm sm:text-base">
              Kelola dan pantau semua pengaduan siswa dengan mudah
            </p>
            {/* Loading Indicator Halus (Background Refetch) */}
            {loading && !initialLoading && (
              <div className="absolute top-8 right-8 flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full shadow-sm border border-white/20">
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span className="text-xs font-semibold text-white">Sinkronisasi...</span>
              </div>
            )}
          </div>

          {/* Filter Controls */}
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

          {/* List */}
          <ComplaintsList
            list={complaints}
            onDelete={handleDeleteComplaint}
            formatDate={formatDate}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 p-6 border-t border-white/20 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition font-medium w-full sm:w-auto"
              >
                ← Sebelumnya
              </button>
              <span className="text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300">
                Halaman <span className="text-blue-600 dark:text-blue-400">{page}</span> dari <span className="text-blue-600 dark:text-blue-400">{totalPages}</span>
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition font-medium w-full sm:w-auto"
              >
                Selanjutnya →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

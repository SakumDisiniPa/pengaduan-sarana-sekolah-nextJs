"use client";

import { useEffect, useState } from "react";
import { ComplaintFilters } from "../../../../lib/complaintsQueries";
import { useCategories } from "@/lib/categories";

interface FilterControlsProps {
  filters: ComplaintFilters;
  onFilterChange: (filters: ComplaintFilters) => void;
  dateFrom: string;
  onDateFromChange: (date: string) => void;
  dateTo: string;
  onDateToChange: (date: string) => void;
  month: number | null;
  onMonthChange: (month: number | null) => void;
  year: number | null;
  onYearChange: (year: number | null) => void;
  searchText: string;
  onSearchChange: (text: string) => void;
  filterMode: "status" | "date" | "month" | "custom";
  onFilterModeChange: (mode: "status" | "date" | "month" | "custom") => void;
  users: Array<{ id: string; email: string; name?: string }>;
  onReset: () => void;
}

export default function FilterControls({
  filters,
  onFilterChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  month,
  onMonthChange,
  year,
  onYearChange,
  searchText,
  onSearchChange,
  filterMode,
  onFilterModeChange,
  users,
  onReset,
}: FilterControlsProps) {
  const [localSearchText, setLocalSearchText] = useState(searchText);
  const { categories: categoryList } = useCategories();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearchText);
    }, 500);

    return () => clearTimeout(timer);
  }, [localSearchText, onSearchChange]);
  return (
    <div className="border-b border-white/20 p-4 sm:p-6 space-y-6 bg-gradient-to-b from-white/50 to-transparent dark:from-slate-800/50 dark:to-transparent">
      {/* Status Filter Dropdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
            Status Pengaduan
          </label>
          <select
            value={filters.status || "all"}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                status: e.target.value === "all" ? undefined : e.target.value,
              })
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 dark:bg-slate-700 dark:border-slate-600 transition focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white text-sm sm:text-base"
          >
            <option value="all">Semua Status</option>
            <option value="menunggu">Menunggu</option>
            <option value="diproses">Diproses</option>
            <option value="selesai">Selesai</option>
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
            Kategori
          </label>
          <select
            value={filters.category || ""}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                category: e.target.value || undefined,
              })
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 dark:bg-slate-700 dark:border-slate-600 transition focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white text-sm sm:text-base"
          >
            <option value="">Semua Kategori</option>
            {categoryList.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Creator/Student Filter */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
            Pembuat (Siswa)
          </label>
          <select
            value={filters.creator || ""}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                creator: e.target.value || undefined,
              })
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 dark:bg-slate-700 dark:border-slate-600 transition focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white text-sm sm:text-base"
          >
            <option value="">Semua Siswa</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name || u.email}
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="sm:col-span-2 lg:col-span-1">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
            Cari
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Cari judul atau deskripsi..."
              value={localSearchText}
              onChange={(e) => setLocalSearchText(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 dark:bg-slate-700 dark:border-slate-600 transition focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white text-sm sm:text-base"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs">
              🔍
            </span>
          </div>
        </div>
      </div>

      {/* Filter Mode Selector */}
      <div className="flex flex-wrap gap-2 pt-4 border-t border-white/20">
        <button
          onClick={() => onFilterModeChange("status")}
          className={`px-4 py-2 rounded-lg transition font-medium text-sm sm:text-base ${
            filterMode === "status"
              ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
              : "bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600"
          }`}
        >
          Status
        </button>
        <button
          onClick={() => onFilterModeChange("date")}
          className={`px-4 py-2 rounded-lg transition font-medium text-sm sm:text-base ${
            filterMode === "date"
              ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg"
              : "bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600"
          }`}
        >
          Tanggal
        </button>
        <button
          onClick={() => onFilterModeChange("month")}
          className={`px-4 py-2 rounded-lg transition font-medium text-sm sm:text-base ${
            filterMode === "month"
              ? "bg-gradient-to-r from-pink-600 to-pink-700 text-white shadow-lg"
              : "bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600"
          }`}
        >
          Bulan
        </button>
      </div>

      {/* Date Range Filters */}
      {filterMode === "date" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Dari Tanggal
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => onDateFromChange(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 dark:bg-slate-700 dark:border-slate-600 transition focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Sampai Tanggal
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => onDateToChange(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 dark:bg-slate-700 dark:border-slate-600 transition focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white"
            />
          </div>
        </div>
      )}

      {/* Month Filter */}
      {filterMode === "month" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Bulan
            </label>
            <select
              value={month || ""}
              onChange={(e) => onMonthChange(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 dark:bg-slate-700 dark:border-slate-600 transition focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white"
            >
              <option value="">Pilih Bulan</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {new Date(2024, m - 1).toLocaleDateString("id-ID", { month: "long" })}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Tahun
            </label>
            <select
              value={year || ""}
              onChange={(e) => onYearChange(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 dark:bg-slate-700 dark:border-slate-600 transition focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white"
            >
              <option value="">Pilih Tahun</option>
              {Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Reset Button */}
      <button
        onClick={onReset}
        className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:shadow-lg transition font-medium"
      >
        🔄 Reset Filters
      </button>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { ComplaintFilters } from "../../../../lib/complaintsQueries";
import { useCategories } from "@/lib/categories";
import { Search, Filter, Calendar, ListFilter, RotateCcw } from "lucide-react";

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

  const inputClasses = "w-full rounded-xl border border-white/10 bg-slate-800/50 px-4 py-3 transition-all focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-white text-sm outline-none placeholder:text-slate-500";
  const labelClasses = "block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 px-1";

  return (
    <div className="p-6 sm:p-8 space-y-8 bg-white/5 border-b border-white/10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Search */}
        <div className="lg:col-span-1">
          <label className={labelClasses}>Pencarian Kilat</label>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
            <input
              type="text"
              placeholder="Cari judul/laporan..."
              value={localSearchText}
              onChange={(e) => setLocalSearchText(e.target.value)}
              className={`${inputClasses} pl-11`}
            />
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label className={labelClasses}>Status Laporan</label>
          <div className="relative">
            <ListFilter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <select
              value={filters.status || "all"}
              onChange={(e) =>
                onFilterChange({
                  ...filters,
                  status: e.target.value === "all" ? undefined : e.target.value,
                })
              }
              className={`${inputClasses} pl-11 appearance-none cursor-pointer`}
            >
              <option value="all" className="bg-slate-900">Semua Status</option>
              <option value="menunggu" className="bg-slate-900 underline">Menunggu</option>
              <option value="diproses" className="bg-slate-900">Diproses</option>
              <option value="selesai" className="bg-slate-900">Selesai</option>
            </select>
          </div>
        </div>

        {/* Category Filter */}
        <div>
          <label className={labelClasses}>Kategori Sarana</label>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <select
              value={filters.category || ""}
              onChange={(e) =>
                onFilterChange({
                  ...filters,
                  category: e.target.value || undefined,
                })
              }
              className={`${inputClasses} pl-11 appearance-none cursor-pointer`}
            >
              <option value="" className="bg-slate-900">Semua Kategori</option>
              {categoryList.map((cat) => (
                <option key={cat.id} value={cat.id} className="bg-slate-900">
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Creator/Student Filter */}
        <div>
          <label className={labelClasses}>Filter Siswa</label>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <select
              value={filters.creator || ""}
              onChange={(e) =>
                onFilterChange({
                  ...filters,
                  creator: e.target.value || undefined,
                })
              }
              className={`${inputClasses} pl-11 appearance-none cursor-pointer`}
            >
              <option value="" className="bg-slate-900">Semua Siswa</option>
              {users.map((u) => (
                <option key={u.id} value={u.id} className="bg-slate-900">
                  {u.name || u.email}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Filter Mode Selector */}
      <div className="flex flex-wrap items-center justify-between gap-6 pt-6 border-t border-white/5">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => onFilterModeChange("status")}
            className={`px-5 py-2.5 rounded-xl transition-all font-bold text-xs uppercase tracking-widest flex items-center gap-2 border ${
              filterMode === "status"
                ? "bg-blue-600 border-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200"
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" /> Kontrol Status
          </button>
          <button
            onClick={() => onFilterModeChange("date")}
            className={`px-5 py-2.5 rounded-xl transition-all font-bold text-xs uppercase tracking-widest flex items-center gap-2 border ${
              filterMode === "date"
                ? "bg-purple-600 border-purple-500 text-white shadow-[0_0_20px_rgba(147,51,234,0.3)]"
                : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" /> Rentang Waktu
          </button>
          <button
            onClick={() => onFilterModeChange("month")}
            className={`px-5 py-2.5 rounded-xl transition-all font-bold text-xs uppercase tracking-widest flex items-center gap-2 border ${
              filterMode === "month"
                ? "bg-pink-600 border-pink-500 text-white shadow-[0_0_20px_rgba(219,39,119,0.3)]"
                : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" /> Periode Bulan
          </button>
        </div>

        <button
          onClick={onReset}
          className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white border border-white/10 rounded-xl transition-all font-bold text-xs uppercase tracking-widest flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" /> Reset Semua
        </button>
      </div>

      {/* Conditional Panels */}
      {filterMode === "date" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 bg-purple-600/5 rounded-2xl border border-purple-500/20 animate-fade-in">
          <div>
            <label className={labelClasses}>Dari Tanggal</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => onDateFromChange(e.target.value)}
              className={inputClasses}
            />
          </div>
          <div>
            <label className={labelClasses}>Sampai Tanggal</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => onDateToChange(e.target.value)}
              className={inputClasses}
            />
          </div>
        </div>
      )}

      {filterMode === "month" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 bg-pink-600/5 rounded-2xl border border-pink-500/20 animate-fade-in">
          <div>
            <label className={labelClasses}>Pilih Bulan</label>
            <select
              value={month || ""}
              onChange={(e) => onMonthChange(e.target.value ? parseInt(e.target.value) : null)}
              className={`${inputClasses} appearance-none`}
            >
              <option value="" className="bg-slate-900">Pilih Bulan</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m} className="bg-slate-900">
                  {new Date(2024, m - 1).toLocaleDateString("id-ID", { month: "long" })}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClasses}>Pilih Tahun</label>
            <select
              value={year || ""}
              onChange={(e) => onYearChange(e.target.value ? parseInt(e.target.value) : null)}
              className={`${inputClasses} appearance-none`}
            >
              <option value="" className="bg-slate-900">Pilih Tahun</option>
              {Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                <option key={y} value={y} className="bg-slate-900">
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

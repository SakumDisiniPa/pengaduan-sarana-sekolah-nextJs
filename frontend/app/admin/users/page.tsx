"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { pb } from "@/lib/pocketbase";
import { Users, ChevronLeft, ChevronRight, Ban, UserCheck, Search } from "lucide-react";
import Image from "next/image";
import { updateUserStatusAdmin } from "@/app/actions/admin";
import useSyncEngine from "@/hooks/useSyncEngine";
import SyncOverlay from "@/components/admin/SyncOverlay";
import { db } from "@/lib/db";
import { decryptData } from "@/lib/crypto";

type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  isBanned: boolean;
  bannedUntil: string | null;
  banReason: string | null;
  isAdmin: boolean;
};

function AdminUsersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const admin = pb.authStore.model;

  // 1. Sync Engine
  const { isSyncing, progress, isReady, error: syncError } = useSyncEngine();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  
  // Pagination
  const urlPage = Number(searchParams.get("page")) || 1;
  const urlPerPage = Number(searchParams.get("perPage")) || 10;
  const [totalPages, setTotalPages] = useState(1);


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

  // 2. Local Fetcher
  const fetchUsers = useCallback(async (isSilent = false) => {
    if (!isReady || !admin?.id) return;
    
    try {
      if (!isSilent) setLoading(true);
      
      const rawUsers = await db.users.toArray();
      const decryptedUsers = rawUsers
        .map(item => decryptData(item.data, admin.id))
        .filter(u => u && !u.isAdmin);

      const filtered = decryptedUsers.filter(u => {
        if (!searchText) return true;
        const search = searchText.toLowerCase();
        return (
          u.name?.toLowerCase().includes(search) || 
          u.email?.toLowerCase().includes(search) ||
          u.id.toLowerCase().includes(search)
        );
      });

      filtered.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

      const start = (urlPage - 1) * urlPerPage;
      const end = start + urlPerPage;
      
      setUsers(filtered.slice(start, end));
      setTotalPages(Math.ceil(filtered.length / urlPerPage));

    } catch (err) {
      console.error("Error fetching local users:", err);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [isReady, admin?.id, urlPage, urlPerPage, searchText]);

  // Auth check
  useEffect(() => {
    if (admin && admin.id && !admin.isAdmin) {
      router.push("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admin?.id, admin?.isAdmin, router]);

  // Data fetching effect
  useEffect(() => {
    if (isReady && admin && admin.isAdmin) {
      fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlPage, urlPerPage, searchText, isReady, fetchUsers]);

  // Success message handler & URL cleanup
  useEffect(() => {
    const success = searchParams.get("success");
    if (success) {
      const timer = setTimeout(() => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("success");
        const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
        router.replace(newUrl);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchParams, router, pathname]);

  const handleUnban = async (userId: string) => {
    if (!confirm("Apakah Anda yakin ingin melepas blokir user ini?")) return;
    try {
      setLoading(true);
      const result = await updateUserStatusAdmin(userId, {
        isBanned: false,
        bannedUntil: null,
        banReason: ""
      });

      if (result.success) {
        setTimeout(() => fetchUsers(true), 1000);
      } else {
        alert("Gagal melepas blokir: " + result.error);
      }
    } catch (err) {
      console.error("Unban error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBanClick = (userId: string) => {
    if (confirm("Apakah Anda yakin ingin memblokir user ini?")) {
      router.push(`/admin/users/confirm-ban/${userId}`);
    }
  };

  const getAvatarUrl = (user: User) => {
    if (user.avatar) {
      return `https://pengaduansaranasekolah.sakum.my.id/api/files/users/${user.id}/${user.avatar}`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "User")}&background=random`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 selection:bg-blue-500/30">
      <SyncOverlay 
        isSyncing={isSyncing} 
        progress={progress} 
        isReady={isReady} 
        error={syncError} 
      />
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      <div className="relative mx-auto max-w-full px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-900/40 backdrop-blur-xl shadow-2xl border border-white/10 overflow-hidden">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 sm:px-8 py-10 sm:py-14">
            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3 flex items-center gap-4">
                  <Users className="w-10 h-10" /> Manajemen User
                </h1>
                <p className="text-blue-100 text-lg max-w-2xl">
                  Kelola hak akses siswa, pantau status akun, dan lakukan moderasi pengguna secara langsung.
                </p>
              </div>
              
              {loading && !initialLoading && (
                <div className="flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span className="text-sm font-bold text-white">Sinkronisasi Data...</span>
                </div>
              )}
            </div>
          </div>

          {/* Search & Filter - Minimalist Style */}
          <div className="p-6 sm:p-8 border-b border-white/10 bg-white/5">
            <div className="max-w-md relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
              <input
                type="text"
                placeholder="Cari user berdasarkan nama atau email..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-800/50 px-4 py-3 pl-11 transition-all focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-white text-sm outline-none placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* User Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-center w-16">No</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">User Profile</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Email Address</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Aksi Moderasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-all duration-200 group border-b border-white/5">
                    <td className="px-6 py-5 text-center">
                      <div className="w-8 h-8 mx-auto rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-slate-400 group-hover:text-blue-400 group-hover:border-blue-400/50 font-bold text-xs transition-all shadow-lg">
                        {(urlPage - 1) * urlPerPage + idx + 1}
                      </div>
                    </td>
                    
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-blue-500/50 transition-colors bg-slate-800 shadow-xl">
                          <Image 
                            src={getAvatarUrl(item)} 
                            alt={item.name} 
                            fill
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-white font-bold text-base group-hover:text-blue-400 transition-colors">
                            {item.name || "Siswa User"}
                          </span>
                          <span className="text-slate-500 text-xs">ID: {item.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5 text-slate-300 text-sm font-medium">
                      {item.email}
                    </td>

                    <td className="px-6 py-5">
                      {item.isBanned ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 text-red-500 text-[10px] font-bold border border-red-500/20 uppercase tracking-widest">
                          <Ban className="w-3 h-3" /> Terblokir
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 text-green-400 text-[10px] font-bold border border-green-500/20 uppercase tracking-widest">
                          <UserCheck className="w-3 h-3" /> Aktif
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-3">
                        {item.isBanned ? (
                          <button
                            onClick={() => handleUnban(item.id)}
                            className="px-4 py-2 rounded-xl bg-green-500/10 hover:bg-green-500/20 text-green-400 text-xs font-bold border border-green-500/20 transition-all hover:scale-105 active:scale-95"
                          >
                            Unban User
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBanClick(item.id)}
                            className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-bold border border-red-500/20 transition-all hover:scale-105 active:scale-95"
                          >
                            Ban User
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-8 bg-white/5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-xs font-bold uppercase tracking-widest text-slate-500">
              <p>
                Menampilkan halaman <span className="text-blue-400">{urlPage}</span> dari <span className="text-blue-400">{totalPages}</span>
              </p>
              
              <div className="flex items-center gap-2 border-l border-white/10 pl-4">
                <span>Limit:</span>
                <select 
                  value={urlPerPage}
                  onChange={(e) => updateLimit(Number(e.target.value))}
                  className="bg-transparent text-blue-400 outline-none cursor-pointer focus:ring-0"
                >
                  <option value="5" className="bg-slate-900">5</option>
                  <option value="10" className="bg-slate-900">10</option>
                  <option value="20" className="bg-slate-900">20</option>
                  <option value="50" className="bg-slate-900">50</option>
                </select>
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
              
              <div className="flex items-center px-6 py-2 bg-white/5 border border-white/10 rounded-xl min-w-[6rem] justify-center">
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

export default function AdminUsersPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-slate-400 font-medium tracking-widest text-xs uppercase">Memuat Basis Data User...</p>
        </div>
      </div>
    }>
      <AdminUsersContent />
    </Suspense>
  );
}

"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { pb } from "../../lib/pocketbase";

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

export default function AdminDashboardPage() {
  const router = useRouter();
  const user = pb.authStore.model;

  const [usersCount, setUsersCount] = useState<number>(0);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = pb.authStore.model;
    // 1. Guard Clause: Cek auth dulu sebelum fetch apapun
    if (!user) {
      router.push("/login");
      return;
    }
    if (!user.isAdmin) {
      router.push("/");
      return;
    }

    let mounted = true;

    const init = async () => {
      try {
        setLoading(true);

        // 2. Parallel Request: Jalankan keduanya sekaligus (lebih cepat & efisien)
        const [allUsers, list] = await Promise.all([
          pb.collection("users").getFullList({ 
            requestKey: null // Mencegah auto-cancel error
          }),
          pb.collection("complaints").getFullList({
            sort: "-created",
            expand: "creator",
            requestKey: null // Mencegah auto-cancel error
          })
        ]);

        if (!mounted) return;

        // 3. Data Processing
        const pupils = allUsers.filter((u) => !u.isAdmin);
        setUsersCount(pupils.length);

        setComplaints(
          list.map((r) => ({
            id: r.id,
            title: r.title,
            status: r.status || "open",
            created: r.created,
            expand: r.expand,
          }))
        );
      } catch (err) {
        const error = err as { isAbort?: boolean };
        // Jangan log kalau cuma error cancel/abort
        if (!error.isAbort && mounted) {
          console.error("Fetch error:", err);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();

    return () => {
      mounted = false;
    };
    // Gunakan user?.id agar tidak re-run terus menerus
  }, [router]);

  // 4. Optimization: Gunakan useMemo untuk kalkulasi statik agar tidak re-render berat
  const stats = useMemo(() => ({
    totalComplaints: complaints.length,
    inProgress: complaints.filter((c) => c.status === "in-progress").length,
    resolved: complaints.filter((c) => c.status === "resolved" || c.status === "closed").length,
    rejected: complaints.filter((c) => c.status === "rejected").length,
    recent: complaints.slice(0, 5)
  }), [complaints]);

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
    <div className="relative min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-black">
      {/* Background Decor */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-purple-300 opacity-20 blur-3xl filter dark:bg-purple-800/20" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-blue-300 opacity-20 blur-3xl filter dark:bg-blue-800/20" />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl bg-white/70 backdrop-blur-md shadow-xl ring-1 ring-white/20 dark:bg-zinc-900/70">
          
          {/* Header */}
          <div className="border-b border-white/20 bg-gradient-to-r from-blue-600/10 to-purple-600/10 px-6 py-6 text-gray-900 dark:text-white">
            <h1 className="text-2xl font-bold">Dashboard Admin</h1>
            <p className="mt-1 text-sm opacity-70">Ringkasan aktivitas dan laporan</p>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard label="Total Siswa" value={usersCount} />
            <StatCard label="Total Laporan" value={stats.totalComplaints} />
            <StatCard label="Diproses" value={stats.inProgress} />
            <StatCard label="Selesai" value={stats.resolved} />
            <StatCard label="Ditolak" value={stats.rejected} />
          </div>

          {/* Table */}
          <div className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Laporan Terbaru</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-700">
                <thead className="bg-gray-50 dark:bg-zinc-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Siswa</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Kategori</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Tanggal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
                  {stats.recent.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {c.expand?.creator?.name || c.expand?.creator?.email || "Anonim"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 font-medium">{c.title}</td>
                      <td className="px-4 py-3 text-sm">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatDate(c.created)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-components untuk kerapihan kode
function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-white/50 p-4 shadow-sm ring-1 ring-black/5 dark:bg-zinc-800/50 dark:ring-white/5">
      <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</h3>
      <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status?: string }) {
  const styles: Record<string, string> = {
    resolved: "bg-green-100 text-green-800",
    closed: "bg-green-100 text-green-800",
    "in-progress": "bg-blue-100 text-blue-800",
    rejected: "bg-red-100 text-red-800",
    default: "bg-yellow-100 text-yellow-800",
  };

  const label: Record<string, string> = {
    resolved: "Selesai",
    closed: "Selesai",
    "in-progress": "Diproses",
    rejected: "Ditolak",
    default: "Menunggu",
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[status as string] || styles.default}`}>
      {label[status as string] || label.default}
    </span>
  );
}
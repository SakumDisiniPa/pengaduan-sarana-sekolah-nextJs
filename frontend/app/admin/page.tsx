"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { pb } from "../../lib/pocketbase";
import { BarChart3, Users, Clock, Hourglass, CheckCircle2, FileText } from "lucide-react";

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
      router.push("/admin/login");
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
            status: r.status || "menunggu",
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
    menunggu: complaints.filter((c) => c.status === "menunggu").length,
    diproses: complaints.filter((c) => c.status === "diproses").length,
    selesai: complaints.filter((c) => c.status === "selesai").length,
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
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
            />
            <StatCard 
              label="Menunggu" 
              value={stats.menunggu}
              icon={<Clock className="w-8 h-8" />}
              color="from-yellow-600 to-yellow-700"
            />
            <StatCard 
              label="Diproses" 
              value={stats.diproses}
              icon={<Hourglass className="w-8 h-8" />}
              color="from-blue-600 to-blue-700"
            />
            <StatCard 
              label="Selesai" 
              value={stats.selesai}
              icon={<CheckCircle2 className="w-8 h-8" />}
              color="from-green-600 to-green-700"
            />
          </div>

          {/* Table Section */}
          <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/10">
          {/* Table Section Header */}
          <div className="bg-white/5 px-6 sm:px-8 py-6 border-b border-white/10">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <FileText className="w-6 h-6" /> Laporan Terbaru
            </h2>
          </div>

          {/* Table Body */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-slate-300 uppercase tracking-wider w-12">No</th>
                  <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-slate-300 uppercase tracking-wider">Nama Siswa</th>
                  <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-slate-300 uppercase tracking-wider hidden sm:table-cell">Laporan</th>
                  <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-slate-300 uppercase tracking-wider">Status</th>
                  <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-slate-300 uppercase tracking-wider hidden lg:table-cell">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {stats.recent.map((c, idx) => (
                  <tr 
                    key={c.id} 
                    className="hover:bg-white/5 transition-colors border-b border-white/5"
                  >
                    <td className="px-4 sm:px-6 py-4">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs shadow-lg">
                        {idx + 1}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="text-sm sm:text-base font-semibold text-white truncate">
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer with count */}
          <div className="px-6 sm:px-8 py-4 bg-white/5 border-t border-white/10">
            <p className="text-sm text-slate-400">
              Menampilkan <span className="font-semibold text-white">{stats.recent.length}</span> laporan terbaru dari total <span className="font-semibold text-white">{stats.totalComplaints}</span> laporan
            </p>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-components untuk kerapihan kode
function StatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <div className={`bg-gradient-to-br ${color} rounded-2xl p-6 sm:p-8 text-white shadow-lg hover:shadow-2xl transition-all hover:scale-105 backdrop-blur-sm border border-white/20`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm sm:text-base font-semibold opacity-90">{label}</h3>
        {icon}
      </div>
      <p className="text-4xl sm:text-5xl font-bold">{value}</p>
      <div className="mt-4 h-1 w-12 bg-white/40 rounded-full" />
    </div>
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
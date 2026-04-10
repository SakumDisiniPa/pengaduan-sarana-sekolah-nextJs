import Link from "next/link";
import { FileText, Eye, Trash2, Clock, Hourglass, CheckCircle2, MapPin, User, Tag, Calendar } from "lucide-react";
import { useSearchParams } from "next/navigation";

type Complaint = {
  id: string;
  title: string;
  description: string;
  status?: string;
  created: string;
  category?: string;
  categories?: string;
  location?: string;
  photo?: string;
  expand?: {
    creator?: {
      email?: string;
      name?: string;
    };
    categories?: {
      id: string;
      name: string;
    };
  };
};

type ComplaintsListProps = {
  list: Complaint[];
  onDelete: (id: string) => void;
  formatDate: (dateStr: string) => string;
};

export default function ComplaintsList({ list, onDelete, formatDate }: ComplaintsListProps) {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const perPage = Number(searchParams.get("perPage")) || 5;

  if (list.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
          <FileText className="h-10 w-10 text-slate-500" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Belum Ada Pengaduan</h3>
        <p className="text-slate-400 max-w-xs mx-auto">
          Tidak ditemukan laporan pengaduan untuk kriteria filter yang Anda pilih.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-white/10 bg-white/5">
            <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-center w-16">No</th>
            <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Judul Laporan</th>
            <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest hidden md:table-cell">Pembuat</th>
            <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest hidden lg:table-cell">Lokasi</th>
            <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest hidden xl:table-cell">Kategori</th>
            <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest hidden sm:table-cell">Waktu</th>
            <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
            <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {list.map((c, idx) => (
            <tr 
              key={c.id} 
              className="hover:bg-white/5 transition-all duration-200 group border-b border-white/5"
            >
              <td className="px-6 py-5 text-center">
                <div className="w-8 h-8 mx-auto rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-slate-400 group-hover:text-blue-400 group-hover:border-blue-400/50 font-bold text-xs transition-all shadow-lg">
                  {(page - 1) * perPage + idx + 1}
                </div>
              </td>
              
              <td className="px-6 py-5">
                <div className="flex flex-col">
                  <span className="text-white font-semibold text-sm sm:text-base mb-1 line-clamp-1 group-hover:text-blue-400 transition-colors">
                    {c.title}
                  </span>
                  <span className="text-slate-400 text-xs line-clamp-1 opacity-60 group-hover:opacity-100 transition-opacity">
                    ID: {c.id}
                  </span>
                </div>
              </td>

              <td className="px-6 py-5 hidden md:table-cell">
                <div className="flex items-center gap-2 text-slate-300">
                  <User className="w-3.5 h-3.5 text-blue-400/70" />
                  <span className="text-sm font-medium truncate max-w-[120px]">
                    {c.expand?.creator?.name || c.expand?.creator?.email || "Anonim"}
                  </span>
                </div>
              </td>

              <td className="px-6 py-5 hidden lg:table-cell">
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <MapPin className="w-3.5 h-3.5 text-red-400/70" />
                  <span className="truncate max-w-[100px]">{c.location || "-"}</span>
                </div>
              </td>

              <td className="px-6 py-5 hidden xl:table-cell">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-400 text-xs font-bold border border-purple-500/20 whitespace-nowrap uppercase">
                  <Tag className="w-3 h-3" />
                  {c.expand?.categories?.name || c.categories || "Umum"}
                </span>
              </td>

              <td className="px-6 py-5 hidden sm:table-cell">
                <div className="flex flex-col text-slate-400">
                   <div className="flex items-center gap-1.5 text-xs mb-1">
                     <Calendar className="w-3 h-3" />
                     <span>{formatDate(c.created).split(",")[0]}</span>
                   </div>
                   <span className="text-[10px] opacity-60 pl-4">
                     {formatDate(c.created).split(",")[1] || ""}
                   </span>
                </div>
              </td>

              <td className="px-6 py-5">
                <StatusBadge status={c.status} />
              </td>

              <td className="px-6 py-5">
                <div className="flex items-center justify-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                  <Link 
                    href={`/admin/complaints/detail/${c.id}`}
                    className="p-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-all border border-blue-500/20 hover:scale-110"
                    title="Detail"
                  >
                    <Eye className="w-4.5 h-4.5" />
                  </Link>
                  <button 
                    onClick={() => onDelete(c.id)}
                    className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-all border border-red-500/20 hover:scale-110"
                    title="Hapus"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }: { status?: string }) {
  const styles: Record<string, string> = {
    menunggu: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.1)]",
    diproses: "bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]",
    selesai: "bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]",
  };

  const icons: Record<string, React.ReactNode> = {
    menunggu: <Clock className="w-3 h-3" />,
    diproses: <Hourglass className="w-3 h-3 animate-pulse" />,
    selesai: <CheckCircle2 className="w-3 h-3" />,
  };

  const labels: Record<string, string> = {
    menunggu: "Menunggu",
    diproses: "Diproses",
    selesai: "Selesai",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${styles[status as string] || styles.menunggu} transition-all`}>
      {icons[status as string] || icons.menunggu}
      {labels[status as string] || labels.menunggu}
    </span>
  );
}

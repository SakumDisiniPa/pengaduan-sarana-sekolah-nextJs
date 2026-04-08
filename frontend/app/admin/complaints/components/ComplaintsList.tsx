import Link from "next/link";
import { FileText, MapPin, User, Clock, Star } from "lucide-react";

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
  rating?: number;
  feedback_message?: string;
  admin_reply?: string;
};

const statuses = [
  { value: "menunggu", label: "Menunggu", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  { value: "diproses", label: "Diproses", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { value: "selesai", label: "Selesai", color: "bg-green-100 text-green-800 border-green-200" },
];

type ComplaintsListProps = {
  list: Complaint[];
  onDelete: (id: string) => void;
  formatDate: (dateStr: string) => string;
};

export default function ComplaintsList({ list, onDelete, formatDate }: ComplaintsListProps) {
  if (list.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-16 text-center dark:border-zinc-700">
        <FileText className="mb-4 h-16 w-16 text-gray-400" />
        <p className="text-lg font-medium text-gray-600 dark:text-gray-300">
          Belum ada pengaduan
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {list.map((complaint, index) => (
        <div
          key={complaint.id}
          className="group animate-fade-in-up rounded-xl border border-white/20 bg-white/50 p-5 shadow-sm transition-all duration-300 hover:shadow-md dark:bg-zinc-800/50"
          style={{
            animationDelay: `${index * 100}ms`,
            animationFillMode: "both",
          }}
        >
          <div className="flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {complaint.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  {complaint.description}
                </p>
              </div>
              <span
                className={`ml-4 inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${
                  statuses.find((s) => s.value === complaint.status)?.color || statuses[0].color
                }`}
              >
                {statuses.find((s) => s.value === complaint.status)?.label || statuses[0].label}
              </span>
            </div>

            {/* Location and Photo Preview */}
            <div className="flex flex-wrap items-center gap-4">
              {complaint.location && (
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <MapPin className="h-4 w-4" />
                  <span className="font-medium">{complaint.location}</span>
                </div>
              )}
              {(complaint.expand?.categories?.name || complaint.categories) && (
                <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-800">
                  <span className="font-semibold uppercase tracking-wider">{complaint.expand?.categories?.name || complaint.categories}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/20 pt-4 mt-2">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{complaint.expand?.creator?.name || complaint.expand?.creator?.email || "-"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatDate(complaint.created)}</span>
                </div>
              </div>
              {/* Feedback Notif */}
              {complaint.status === "selesai" && complaint.rating && !complaint.admin_reply && (
                <div className="text-xs text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400 px-2 py-1 rounded inline-flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-current" /> Menunggu balasan admin
                </div>
              )}
            </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Link
                  href={`/admin/complaints/detail/${complaint.id}`}
                  className="rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 shadow-sm transition-all duration-200 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:border-blue-700/50 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40"
                >
                  Detail
                </Link>
                <button
                  onClick={() => onDelete(complaint.id)}
                  className="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 shadow-sm transition-all duration-200 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500/50 dark:border-red-700/50 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
                >
                  Hapus
                </button>
              </div>
            </div>

            {/* Progress bar untuk yang diproses */}
            {complaint.status === "diproses" && (
              <div className="mt-2">
                <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-zinc-700">
                  <div
                    className="h-1.5 animate-pulse rounded-full bg-blue-600"
                    style={{ width: "60%" }}
                  />
                </div>
              </div>
            )}

            {/* Animasi pulse untuk yang menunggu */}
            {complaint.status === "menunggu" && (
              <div className="absolute right-4 top-4">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-yellow-500"></span>
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

"use client";

import Link from "next/link";
import { Circle, MessageCircle } from "lucide-react";

type Complaint = {
  id: string;
  title: string;
  description: string;
  status?: string;
  category?: string;
  priority?: string;
  created: string;
  deadline?: string;
  feedback?: string;
  creator?: string;
  location?: string;
  photo?: string;
  rating?: number;
  feedback_message?: string;
  admin_reply?: string;
};

type ComplaintsListProps = {
  list: Complaint[];
  onDelete: (id: string) => void;
  formatDateShort: (dateStr: string) => string;
};

const statusColors: Record<string, string> = {
  menunggu: "bg-yellow-100 text-yellow-800",
  diproses: "bg-blue-100 text-blue-800",
  selesai: "bg-green-100 text-green-800",
};

const statusLabels: Record<string, string> = {
  menunggu: "Menunggu",
  diproses: "Diproses",
  selesai: "Selesai",
};

const priorityColors: Record<string, { color: string; colorClass: string }> = {
  low: { color: "#22c55e", colorClass: "text-green-500" },
  medium: { color: "#eab308", colorClass: "text-yellow-500" },
  high: { color: "#ef4444", colorClass: "text-red-500" },
};

export default function ComplaintsList({ list, onDelete, formatDateShort }: ComplaintsListProps) {
  if (list.length === 0) {
    return (
      <div className="rounded-2xl bg-white/70 backdrop-blur-md shadow-xl dark:bg-zinc-900/70 p-12 text-center">
        <p className="text-gray-600 dark:text-gray-300">
          Belum ada pengaduan. Buat pengaduan pertama Anda!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {list.map((complaint) => (
        <div
          key={complaint.id}
          className="rounded-xl bg-white/5 backdrop-blur-md shadow-lg p-5 border border-white/10 hover:border-purple-500/30 transition-all flex flex-col"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {complaint.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {complaint.description.substring(0, 80)}...
              </p>
            </div>
            <span
              className={`text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap ml-2 ${
                statusColors[complaint.status || "menunggu"] || statusColors.menunggu
              }`}
            >
              {statusLabels[complaint.status || "menunggu"] || statusLabels.menunggu}
            </span>
          </div>

          <div className="flex gap-2 mb-3 flex-wrap">
            {complaint.category && (
              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                {complaint.category}
              </span>
            )}
            {complaint.priority && (
              <span className="text-xs font-semibold flex items-center gap-1">
                <Circle 
                  className={`w-3 h-3 fill-current ${priorityColors[complaint.priority]?.colorClass || priorityColors.medium.colorClass}`}
                  fill="currentColor"
                />
                Prioritas: {complaint.priority}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{complaint.location}</span>
            <span>{formatDateShort(complaint.created)}</span>
          </div>

          {/* Feedback Badge */}
          {complaint.admin_reply && (
            <div className="mt-3 p-2 bg-blue-500/20 rounded text-xs text-blue-200 flex items-center gap-2">
              <MessageCircle className="w-4 h-4" /> Ada balasan dari admin
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-3 justify-end">
            <Link 
              href={`/complaints/detail/${complaint.id}`}
              className="px-4 py-2 text-sm font-medium bg-white/10 hover:bg-white/20 rounded-lg transition"
            >
              Lihat Detail
            </Link>
            
            {complaint.status === "menunggu" && (
              <Link 
                href={`/complaints/edit/${complaint.id}`}
                className="px-4 py-2 text-sm font-medium bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition"
              >
                Edit
              </Link>
            )}

            <button 
              onClick={() => onDelete(complaint.id)}
              className="px-4 py-2 text-sm font-medium bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition"
            >
              Hapus
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

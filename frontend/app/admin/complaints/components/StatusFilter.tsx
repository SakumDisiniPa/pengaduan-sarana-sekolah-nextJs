"use client";

import { ClipboardList, Clock, Hourglass, CheckCircle2 } from "lucide-react";

interface StatusFilterProps {
  selectedStatus: string;
  onStatusChange: (status: string) => void;
}

interface StatusItem {
  value: string;
  label: string;
  icon: React.ReactNode;
}

export default function StatusFilter({ selectedStatus, onStatusChange }: StatusFilterProps) {
  const statuses: StatusItem[] = [
    { value: "all", label: "Semua", icon: <ClipboardList className="w-4 h-4" /> },
    { value: "menunggu", label: "Menunggu", icon: <Clock className="w-4 h-4" /> },
    { value: "diproses", label: "Diproses", icon: <Hourglass className="w-4 h-4" /> },
    { value: "selesai", label: "Selesai", icon: <CheckCircle2 className="w-4 h-4" /> },
  ];

  return (
    <div className="flex gap-2 flex-wrap">
      {statuses.map((status) => (
        <button
          key={status.value}
          onClick={() => onStatusChange(status.value)}
          className={`px-4 py-2 rounded-lg transition font-medium flex items-center gap-2 ${
            selectedStatus === status.value
              ? "bg-blue-600 text-white shadow-lg"
              : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
          }`}
        >
          {status.icon} {status.label}
        </button>
      ))}
    </div>
  );
}

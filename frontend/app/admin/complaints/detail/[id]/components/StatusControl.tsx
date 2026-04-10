"use client";

import { COMPLAINT_STATUSES, validateStatusTransition, requiresProofForStatus } from "../../../utils/statusLogic";
import { useRouter } from "next/navigation";

interface StatusControlProps {
  id: string;
  currentStatus: string;
  isUpdating: boolean;
  onUpdate: (status: string) => Promise<void>;
}

export default function StatusControl({ id, currentStatus, isUpdating, onUpdate }: StatusControlProps) {
  const router = useRouter();

  const handleChange = async (newStatus: string) => {
    const validation = validateStatusTransition(currentStatus, newStatus);
    
    if (!validation.allowed) {
      alert(validation.message);
      return;
    }

    if (requiresProofForStatus(newStatus)) {
      const confirmed = window.confirm(
        "Apakah Anda yakin pengaduan ini selesai? Jika yakin, Anda akan diarahkan ke halaman upload bukti penyelesaian (foto/video)."
      );
      if (confirmed) {
        router.push(`/admin/complaints/confirm?id=${id}`);
      }
      return;
    }

    try {
      await onUpdate(newStatus);
    } catch {
      // Error handled in parent
    }
  };

  const getStatusConfig = (val: string) => {
    return COMPLAINT_STATUSES.find(s => s.value === val) || COMPLAINT_STATUSES[0];
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-slate-400">Ubah Status Laporan:</span>
      <select
        value={currentStatus}
        onChange={(e) => handleChange(e.target.value)}
        disabled={isUpdating}
        className={`px-4 py-2 rounded-xl font-bold text-sm bg-slate-800 border ${
          getStatusConfig(currentStatus).color
        } appearance-none cursor-pointer hover:opacity-80 transition disabled:opacity-50`}
      >
        {COMPLAINT_STATUSES.map((s) => (
          <option key={s.value} value={s.value} className="bg-slate-800 text-white">
            {s.label}
          </option>
        ))}
      </select>
    </div>
  );
}

type Complaint = {
  id: string;
  title: string;
  description: string;
  status?: string;
  created: string;
  creator?: string;
  location?: string;
  photo?: string;
  expand?: {
    creator?: {
      email?: string;
      name?: string;
    };
  };
};

const statuses = [
  { value: "open", label: "Dibuka", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  { value: "in-progress", label: "Sedang Diproses", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { value: "resolved", label: "Selesai", color: "bg-green-100 text-green-800 border-green-200" },
  { value: "rejected", label: "Ditolak", color: "bg-red-100 text-red-800 border-red-200" },
];

type ComplaintsDetailModalProps = {
  complaint: Complaint | null;
  onClose: () => void;
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
  formatDate: (dateStr: string) => string;
};

export default function ComplaintsDetailModal({
  complaint,
  onClose,
  onStatusChange,
  onDelete,
  formatDate,
}: ComplaintsDetailModalProps) {
  if (!complaint) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white p-8 shadow-2xl dark:bg-zinc-900 animate-fade-in-up overflow-y-auto max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white pr-8">
              {complaint.title}
            </h2>
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${
                statuses.find((s) => s.value === complaint.status)?.color
              }`}
            >
              {statuses.find((s) => s.value === complaint.status)?.label}
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-300">{complaint.description}</p>
        </div>

        {/* Details */}
        <div className="space-y-4 border-t border-gray-200 py-6 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pembuat</p>
              <p className="mt-1 text-gray-900 dark:text-white">
                {complaint.expand?.creator?.name || complaint.expand?.creator?.email || "-"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tanggal</p>
              <p className="mt-1 text-gray-900 dark:text-white">{formatDate(complaint.created)}</p>
            </div>
          </div>

          {complaint.location && (
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Lokasi</p>
              <p className="mt-1 text-gray-900 dark:text-white">{complaint.location}</p>
            </div>
          )}
        </div>

        {/* Status Update & Delete */}
        <div className="flex items-end gap-4 border-t border-gray-200 pt-6 dark:border-gray-700 mt-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ubah Status
            </label>
            <select
              value={complaint.status || "open"}
              onChange={(e) => {
                onStatusChange(complaint.id, e.target.value);
              }}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 shadow-sm transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
            >
              {statuses.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => {
              if (confirm("Yakin ingin menghapus pengaduan ini?")) {
                onDelete(complaint.id);
              }
            }}
            className="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 shadow-sm transition-all duration-200 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500/50 dark:border-red-700/50 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
          >
            Hapus
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

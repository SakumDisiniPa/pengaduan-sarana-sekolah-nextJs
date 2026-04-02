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

type ComplaintsListProps = {
  list: Complaint[];
  onSelectComplaint: (complaint: Complaint) => void;
  formatDate: (dateStr: string) => string;
};

export default function ComplaintsList({ list, onSelectComplaint, formatDate }: ComplaintsListProps) {
  if (list.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-16 text-center dark:border-zinc-700">
        <svg
          className="mb-4 h-16 w-16 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
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
                  statuses.find((s) => s.value === complaint.status)?.color
                }`}
              >
                {statuses.find((s) => s.value === complaint.status)?.label}
              </span>
            </div>

            {/* Location and Photo Preview */}
            <div className="flex flex-wrap items-center gap-4">
              {complaint.location && (
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <span className="font-medium">{complaint.location}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/20 pt-4">
              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span>{complaint.expand?.creator?.name || complaint.expand?.creator?.email || "-"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{formatDate(complaint.created)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <button
                onClick={() => onSelectComplaint(complaint)}
                className="rounded-lg border border-blue-300 bg-blue-50 px-3 py-1.5 text-sm text-blue-700 shadow-sm transition-all duration-200 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:border-blue-700/50 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40"
              >
                Detail
              </button>
            </div>

            {/* Progress bar untuk yang in-progress */}
            {complaint.status === "in-progress" && (
              <div className="mt-2">
                <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-zinc-700">
                  <div
                    className="h-1.5 animate-pulse rounded-full bg-blue-600"
                    style={{ width: "60%" }}
                  />
                </div>
              </div>
            )}

            {/* Animasi pulse untuk yang open */}
            {complaint.status === "open" && (
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

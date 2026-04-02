type ComplaintsStatsProps = {
  stats: {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    rejected: number;
  };
  filter: string;
  onFilterChange: (filter: string) => void;
};

export default function ComplaintsStats({ stats, filter, onFilterChange }: ComplaintsStatsProps) {
  const getCardClass = (value: string) => {
    const baseClass = "cursor-pointer rounded-xl border p-4 transition-all duration-300 hover:scale-105";
    
    switch (value) {
      case "all":
        return `${baseClass} ${
          filter === "all"
            ? "border-blue-500 bg-blue-50 shadow-lg dark:bg-blue-900/20"
            : "border-white/20 bg-white/50 hover:shadow-md dark:bg-zinc-800/50"
        }`;
      case "open":
        return `${baseClass} ${
          filter === "open"
            ? "border-yellow-500 bg-yellow-50 shadow-lg dark:bg-yellow-900/20"
            : "border-white/20 bg-white/50 hover:shadow-md dark:bg-zinc-800/50"
        }`;
      case "in-progress":
        return `${baseClass} ${
          filter === "in-progress"
            ? "border-blue-500 bg-blue-50 shadow-lg dark:bg-blue-900/20"
            : "border-white/20 bg-white/50 hover:shadow-md dark:bg-zinc-800/50"
        }`;
      case "resolved":
        return `${baseClass} ${
          filter === "resolved"
            ? "border-green-500 bg-green-50 shadow-lg dark:bg-green-900/20"
            : "border-white/20 bg-white/50 hover:shadow-md dark:bg-zinc-800/50"
        }`;
      case "rejected":
        return `${baseClass} ${
          filter === "rejected"
            ? "border-red-500 bg-red-50 shadow-lg dark:bg-red-900/20"
            : "border-white/20 bg-white/50 hover:shadow-md dark:bg-zinc-800/50"
        }`;
      default:
        return `${baseClass} border-white/20 bg-white/50 dark:bg-zinc-800/50`;
    }
  };

  const getNumberClass = (value: string) => {
    switch (value) {
      case "open":
        return filter === "open" ? "text-yellow-600" : "text-yellow-600";
      case "in-progress":
        return filter === "in-progress" ? "text-blue-600" : "text-blue-600";
      case "resolved":
        return filter === "resolved" ? "text-green-600" : "text-green-600";
      case "rejected":
        return filter === "rejected" ? "text-red-600" : "text-red-600";
      default:
        return "text-gray-900 dark:text-white";
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4 p-6 lg:grid-cols-5">
      <div onClick={() => onFilterChange("all")} className={getCardClass("all")}>
        <p className="text-sm text-gray-600 dark:text-gray-300">Total</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
      </div>
      
      <div onClick={() => onFilterChange("open")} className={getCardClass("open")}>
        <p className="text-sm text-gray-600 dark:text-gray-300">Dibuka</p>
        <p className={`text-2xl font-bold ${getNumberClass("open")}`}>{stats.open}</p>
      </div>
      
      <div onClick={() => onFilterChange("in-progress")} className={getCardClass("in-progress")}>
        <p className="text-sm text-gray-600 dark:text-gray-300">Diproses</p>
        <p className={`text-2xl font-bold ${getNumberClass("in-progress")}`}>{stats.inProgress}</p>
      </div>
      
      <div onClick={() => onFilterChange("resolved")} className={getCardClass("resolved")}>
        <p className="text-sm text-gray-600 dark:text-gray-300">Selesai</p>
        <p className={`text-2xl font-bold ${getNumberClass("resolved")}`}>{stats.resolved}</p>
      </div>
      
      <div onClick={() => onFilterChange("rejected")} className={getCardClass("rejected")}>
        <p className="text-sm text-gray-600 dark:text-gray-300">Ditolak</p>
        <p className={`text-2xl font-bold ${getNumberClass("rejected")}`}>{stats.rejected}</p>
      </div>
    </div>
  );
}

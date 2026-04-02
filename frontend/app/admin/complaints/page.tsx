"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { pb } from "../../../lib/pocketbase";
import ComplaintsStats from "./ComplaintsStats";
import ComplaintsList from "./ComplaintsList";
import ComplaintsDetailModal from "./ComplaintsDetailModal";

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

export default function AdminComplaintsPage() {
  const router = useRouter();
  const user = pb.authStore.model;
  const [list, setList] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (!user.isAdmin) {
      router.push("/");
      return;
    }

    let mounted = true;
    let unsubscribe: (() => void) | null = null;

    const init = async () => {
      try {
        const items = await pb.collection("complaints").getFullList({
          sort: "-created",
          expand: "creator",
        });

        if (!mounted) return;

        setList(
          items.map((r) => ({
            id: r.id,
            title: r.title,
            description: r.description,
            status: r.status || "open",
            created: r.created,
            creator: r.creator,
            location: r.location,
            photo: r.photo?.[0],
            expand: r.expand,
          }))
        );
        setLoading(false);

        unsubscribe = await pb.collection("complaints").subscribe("*", (e) => {
          if (!mounted) return;

          if (e.action === "create") {
            pb.collection("complaints")
              .getOne(e.record.id, { expand: "creator" })
              .then((fullRec) => {
                setList((prev) => [
                  {
                    id: fullRec.id,
                    title: fullRec.title,
                    description: fullRec.description,
                    status: fullRec.status || "open",
                    created: fullRec.created,
                    creator: fullRec.creator,
                    location: fullRec.location,
                    photo: fullRec.photo,
                    expand: fullRec.expand,
                  },
                  ...prev,
                ]);
              });
          } else if (e.action === "update") {
            setList((prev) =>
              prev.map((c) =>
                c.id === e.record.id
                  ? { ...c, status: e.record.status || "open" }
                  : c
              )
            );
          } else if (e.action === "delete") {
            setList((prev) => prev.filter((c) => c.id !== e.record.id));
          }
        });
      } catch (err) {
        const error = err as { isAbort?: boolean };
        if (mounted && error?.isAbort !== true) {
          console.error("Load error:", err);
        }
      }
    };

    init();

    return () => {
      mounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, [user, router]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await pb.collection("complaints").update(id, { status });
    } catch (err) {
      console.error(err);
    }
  };

  const deleteComplaint = async (id: string) => {
    try {
      await pb.collection("complaints").delete(id);
      setList((prev) => prev.filter((c) => c.id !== id));
      setSelectedComplaint(null);
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return `Hari ini, ${date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else if (days === 1) {
      return `Kemarin, ${date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else if (days < 7) {
      return `${days} hari yang lalu`;
    } else {
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
  };

  const filteredList = filter === "all" ? list : list.filter((c) => c.status === filter);

  const stats = {
    total: list.length,
    open: list.filter((c) => c.status === "open").length,
    inProgress: list.filter((c) => c.status === "in-progress").length,
    resolved: list.filter((c) => c.status === "resolved").length,
    rejected: list.filter((c) => c.status === "rejected").length,
  };

  if (loading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center">
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-purple-300 opacity-20 blur-3xl filter dark:bg-purple-800/20" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-blue-300 opacity-20 blur-3xl filter dark:bg-blue-800/20" />
        </div>
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-black">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-purple-300 opacity-20 blur-3xl filter dark:bg-purple-800/20" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-blue-300 opacity-20 blur-3xl filter dark:bg-blue-800/20" />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl bg-white/70 backdrop-blur-md shadow-xl ring-1 ring-white/20 dark:bg-zinc-900/70">
          {/* Header */}
          <div className="border-b border-white/20 bg-gradient-to-r from-blue-600/10 to-purple-600/10 px-6 py-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Kelola Pengaduan
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              Admin dashboard untuk mengelola pengaduan sarana sekolah
            </p>
          </div>

          {/* Stats */}
          <ComplaintsStats stats={stats} filter={filter} onFilterChange={setFilter} />

          {/* Complaints List */}
          <div className="p-6 pt-0">
            <ComplaintsList list={filteredList} onSelectComplaint={setSelectedComplaint} formatDate={formatDate} />
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <ComplaintsDetailModal
        complaint={selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        onStatusChange={(id, status) => {
          updateStatus(id, status);
          setSelectedComplaint((prev) => (prev ? { ...prev, status } : null));
        }}
        onDelete={deleteComplaint}
        formatDate={formatDate}
      />

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
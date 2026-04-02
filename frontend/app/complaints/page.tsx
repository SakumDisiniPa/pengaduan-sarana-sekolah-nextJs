"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { pb } from "../../lib/pocketbase";

type Complaint = {
  id: string;
  title: string;
  description: string;
  status?: string;
  created: string;
  creator?: string;
  location?: string;
  photo?: string;
};

export default function ComplaintsPage() {
  const router = useRouter();
  const user = pb.authStore.model;
  const [list, setList] = useState<Complaint[]>([]);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [location, setLocation] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    let mounted = true;
    let unsubscribe: (() => void) | null = null;
    let subscribed = false;

    const init = async () => {
      try {
        // Load initial complaints
        const items = await pb.collection("complaints").getFullList({
          sort: "-created",
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
            photo: r.photo,
          }))
        );
        setLoading(false);

        // Subscribe to realtime updates (only if not already subscribed)
        if (!subscribed) {
          subscribed = true;
          unsubscribe = await pb.collection("complaints").subscribe("*", (e) => {
            if (!mounted) return;
            if (e.action === "create") {
              setList((prev) => [
                {
                  id: e.record.id,
                  title: e.record.title,
                  description: e.record.description,
                  status: e.record.status || "open",
                  created: e.record.created,
                  creator: e.record.creator,
                  location: e.record.location,
                  photo: e.record.photo,
                },
                ...prev,
              ]);
            } else if (e.action === "update") {
              setList((prev) =>
                prev.map((c) =>
                  c.id === e.record.id
                    ? {
                        ...c,
                        title: e.record.title,
                        description: e.record.description,
                        status: e.record.status || "open",
                        created: e.record.created,
                        creator: e.record.creator,
                        location: e.record.location,
                        photo: e.record.photo,
                      }
                    : c
                )
              );
            } else if (e.action === "delete") {
              setList((prev) => prev.filter((c) => c.id !== e.record.id));
            }
          });
        }
      } catch (err) {
        const error = err as { isAbort?: boolean; message?: string };
        if (mounted && error?.isAbort !== true) {
          setError("Gagal memuat pengaduan: " + error.message);
          setLoading(false);
        }
      }
    };

    init();

    return () => {
      mounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
      // Unsubscribe all realtime subscriptions for complaints
      pb.collection("complaints").unsubscribe();
    };
  }, [user, router]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      setPhotoPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !desc.trim() || !location.trim() || !user) return;

    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", desc.trim());
      formData.append("location", location.trim());
      formData.append("status", "open");
      formData.append("creator", user.id);
      
      if (photoFile) {
        formData.append("photo", photoFile);
      }

      await pb.collection("complaints").create(formData);
      
      setTitle("");
      setDesc("");
      setLocation("");
      setPhotoFile(null);
      setPhotoPreview(null);
    } catch (err) {
      const error = err as { message?: string };
      setError("Gagal membuat pengaduan: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "open":
        return "Menunggu";
      case "in-progress":
        return "Diproses";
      case "resolved":
        return "Selesai";
      case "rejected":
        return "Ditolak";
      default:
        return status;
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

  if (loading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center">
        {/* Elemen dekoratif latar */}
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
      {/* Elemen dekoratif latar */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-purple-300 opacity-20 blur-3xl filter dark:bg-purple-800/20" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-blue-300 opacity-20 blur-3xl filter dark:bg-blue-800/20" />
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl bg-white/70 backdrop-blur-md shadow-xl ring-1 ring-white/20 dark:bg-zinc-900/70">
          {/* Header */}
          <div className="border-b border-white/20 bg-gradient-to-r from-blue-600/10 to-purple-600/10 px-6 py-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Pengaduan Sarana Sekolah
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              Laporkan masalah sarana di sekolahmu
            </p>
          </div>

          {/* Form Pengaduan */}
          <div className="p-6">
            <form onSubmit={submit} className="space-y-4">
              {error && (
                <div className="animate-shake rounded-lg bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-200">
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Judul Pengaduan
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Lantai rusak di kelas A"
                  className="mt-1 block w-full rounded-lg border border-gray-300 bg-white/50 px-4 py-3 text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:border-zinc-600 dark:bg-zinc-800/50 dark:text-white"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Deskripsi Detail
                </label>
                <textarea
                  id="description"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Jelaskan masalahnya secara detail..."
                  rows={4}
                  className="mt-1 block w-full rounded-lg border border-gray-300 bg-white/50 px-4 py-3 text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:border-zinc-600 dark:bg-zinc-800/50 dark:text-white"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Lokasi <span className="text-red-500">*</span>
                </label>
                <input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Contoh: Perpustakaan, Ruang Kelas A, Lapangan"
                  className="mt-1 block w-full rounded-lg border border-gray-300 bg-white/50 px-4 py-3 text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:border-zinc-600 dark:bg-zinc-800/50 dark:text-white"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="photo"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Foto Kondisi <span className="text-gray-500">(Opsional)</span>
                </label>
                <input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="mt-1 block w-full text-sm text-gray-500 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400"
                />
                {photoPreview && (
                  <div className="mt-3 rounded-lg overflow-hidden">
                    <Image
                      src={photoPreview}
                      alt="Preview"
                      className="max-h-48 w-full object-cover rounded-lg"
                      width={500}
                      height={400}
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!title.trim() || !desc.trim() || !location.trim() || submitting}
                  className="group relative rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="absolute inset-0 -translate-x-full skew-x-12 rounded-lg bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  <span className="relative">
                    {submitting ? "Mengirim..." : "Kirim Pengaduan"}
                  </span>
                </button>
              </div>
            </form>

            {/* Daftar Pengaduan */}
            <div className="mt-10">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Daftar Pengaduan
                </h2>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {list.length} Total
                </span>
              </div>

              {list.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-12 text-center dark:border-zinc-700">
                  <svg
                    className="mb-4 h-12 w-12 text-gray-400"
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
                  <p className="text-gray-500 dark:text-gray-400">
                    Belum ada pengaduan. Jadilah yang pertama!
                  </p>
                </div>
              ) : (
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
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                              {complaint.title}
                            </h3>
                            <span
                              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                                complaint.status || "open"
                              )}`}
                            >
                              {getStatusText(complaint.status || "open")}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                            {complaint.description}
                          </p>
                          {complaint.location && (
                            <div className="mt-2 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              </svg>
                              <span className="font-medium">{complaint.location}</span>
                            </div>
                          )}
                          {complaint.photo && (() => {
                            const photoUrl = pb.files.getUrl(complaint as Record<string, unknown>, complaint.photo);
                            return photoUrl ? (
                              <div className="mt-3 rounded-lg overflow-hidden">
                                <Image 
                                  src={photoUrl} 
                                  alt="Kondisi" 
                                  className="max-h-40 w-full object-cover rounded-lg"
                                  width={400}
                                  height={160}
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              </div>
                            ) : null;
                          })()}
                          <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
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

                        {/* Status indicator dengan animasi pulse untuk yang masih open */}
                        {complaint.status === "open" && (
                          <div className="flex items-center self-end sm:self-center">
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
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Animasi */}
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
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: translateX(-2px);
          }
          20%,
          40%,
          60%,
          80% {
            transform: translateX(2px);
          }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
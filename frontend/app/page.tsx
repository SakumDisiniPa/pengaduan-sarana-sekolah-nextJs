"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { pb } from "../lib/pocketbase";

export default function Home() {
  const router = useRouter();
  const [resolvedCount, setResolvedCount] = useState<number>(0);

  useEffect(() => {
    // 1. Cek User Auth
    const user = pb.authStore.model;
    if (user?.isAdmin) {
      router.push("/admin");
    }

    // 2. Definisi fungsi Fetch
    const fetchStats = async () => {
      try {
        // Mengambil jumlah data dengan status selesai
        // Kita masukkan beberapa variasi filter agar tidak meleset (case sensitive)
        const result = await pb.collection("complaints").getList(1, 1, {
          filter: 'status = "selesai"',
          fields: "totalItems",
          requestKey: null // Mencegah error autocancel jika page di-refresh cepat
        });
        
        setResolvedCount(result.totalItems);
      } catch (error) {
        // Jika error 403 muncul di console, berarti API Rules "List" di PocketBase belum Public
        console.error("Gagal ambil stats:", error);
      }
    };

    // 3. PANGGIL fungsinya (Ini yang tadi ketinggalan)
    fetchStats();
    
  }, [router]);

  return (
    <>
      {/* Elemen dekoratif latar */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-purple-300 opacity-30 blur-3xl filter dark:bg-purple-800/20" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-blue-300 opacity-30 blur-3xl filter dark:bg-blue-800/20" />
        <div className="absolute top-1/2 left-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-300 opacity-20 blur-3xl filter dark:bg-pink-800/20" />
      </div>

      <main className="relative flex min-h-screen items-center justify-center px-4 font-sans">
        <div className="w-full max-w-3xl space-y-8 text-center sm:text-left">
          {/* Badge / Label */}
          <div
            className="animate-fade-in-up inline-block rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-1.5 text-sm font-medium text-white shadow-lg"
            style={{ animationDelay: "0.1s", animationFillMode: "both" }}
          >
            📢 Sarana Sekolah
          </div>

          {/* Headline dengan animasi */}
          <h1
            className="animate-fade-in-up text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl"
            style={{ animationDelay: "0.2s", animationFillMode: "both" }}
          >
            Aplikasi Pengaduan{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Sarana Sekolah
            </span>
          </h1>

          {/* Deskripsi */}
          <p
            className="animate-fade-in-up mx-auto max-w-xl text-lg text-gray-600 dark:text-gray-300 sm:mx-0"
            style={{ animationDelay: "0.3s", animationFillMode: "both" }}
          >
            Laporkan masalah sarana di sekolah dan berkomunikasi langsung dengan
            admin melalui chat real‑time. Cepat, mudah, dan transparan.
          </p>

          {/* Tombol aksi */}
          <div
            className="animate-fade-in-up flex flex-col gap-4 pt-4 sm:flex-row"
            style={{ animationDelay: "0.4s", animationFillMode: "both" }}
          >
            <a
              href="/siswa/complaints/create"
              className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-4 text-center text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95"
            >
              <span className="relative z-10">Buat Pengaduan</span>
              <div className="absolute inset-0 -translate-x-full skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </a>
            <a
              href="/siswa/chat"
              className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 text-center text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95"
            >
              <span className="relative z-10">Chat dengan Admin</span>
              <div className="absolute inset-0 -translate-x-full skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </a>
          </div>

          {/* Statistik mini */}
          <div
            className="animate-fade-in-up flex flex-wrap items-center justify-center gap-8 pt-12 text-sm text-gray-500 dark:text-gray-400 sm:justify-start"
            style={{ animationDelay: "0.5s", animationFillMode: "both" }}
          >
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${resolvedCount > 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
              <span className="font-medium">
                {resolvedCount > 0 ? `+${resolvedCount} pengaduan terselesaikan` : 'Siap melayani pengaduan'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <span>Dukungan admin 24/7</span>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
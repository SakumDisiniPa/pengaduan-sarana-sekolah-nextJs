"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { pb } from "@/lib/pocketbase";
import { motion } from "framer-motion";
import { ShieldAlert, Clock, LogOut, MessageCircle } from "lucide-react";

interface BlockedUser {
  id: string;
  name: string;
  email: string;
  isBanned: boolean;
  bannedUntil: string;
  banReason?: string;
  isAdmin?: boolean;
}

export default function BlockedPage() {
  const router = useRouter();
  const [user, setUser] = useState<BlockedUser | null>(null);
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 0);
    const currentUser = pb.authStore.model as unknown as BlockedUser;
    
    if (!currentUser) {
      router.push("/");
      return;
    }

    // If user is logged in but NOT banned, redirect them to dashboard/home
    const isBanned = currentUser.isBanned && currentUser.bannedUntil && new Date(currentUser.bannedUntil) > new Date();
    if (!isBanned) {
      router.push(currentUser.isAdmin ? "/admin" : "/siswa/dashboard");
      return;
    }

    setTimeout(() => setUser(currentUser), 0);
  }, [router]);

  const calculateTimeLeft = useCallback(() => {
    if (!user?.bannedUntil) return null;
    
    const difference = +new Date(user.bannedUntil) - +new Date();
    
    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return null;
  }, [user]);

  useEffect(() => {
    if (!user) return;
    
    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      if (!remaining) {
        // If time is up, maybe allow login or refresh
        clearInterval(timer);
        setTimeLeft(null);
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [user, calculateTimeLeft]);

  const handleLogout = () => {
    pb.authStore.clear();
    document.cookie = pb.authStore.exportToCookie({ httpOnly: false, path: "/" });
    router.push("/");
  };

  if (!mounted || !user) return null;

  return (
    <div className="relative min-h-screen w-full bg-slate-950 flex items-center justify-center p-4">
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[120px] animate-pulse" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-2xl bg-slate-900/80 backdrop-blur-3xl border border-red-500/20 rounded-[2.5rem] p-8 md:p-12 shadow-2xl"
      >
        <div className="text-center">
          <motion.div 
            animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
            transition={{ duration: 0.5, delay: 0.5, repeat: Infinity, repeatDelay: 5 }}
            className="inline-flex items-center justify-center w-24 h-24 bg-red-500/10 rounded-3xl mb-8 border border-red-500/30"
          >
            <ShieldAlert className="w-12 h-12 text-red-500" />
          </motion.div>

          <h1 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">Akun Anda Diblokir</h1>
          <p className="text-slate-400 text-lg mb-8 max-w-md mx-auto">
            Akses ke sistem pengaduan telah dibatasi karena pelanggaran peraturan sekolah.
          </p>

          {/* Ban Info Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-800/50 p-6 rounded-3xl border border-white/5 text-left">
              <div className="flex items-center gap-2 text-red-400 mb-2 font-bold text-xs uppercase tracking-widest">
                <MessageCircle className="w-4 h-4" /> Alasan Blokir
              </div>
              <p className="text-white text-sm font-medium leading-relaxed italic">
                &quot;{user.banReason || "Pelanggaran pedoman komunitas"}&quot;
              </p>
            </div>
            
            <div className="bg-slate-800/50 p-6 rounded-3xl border border-white/5 text-left">
              <div className="flex items-center gap-2 text-blue-400 mb-2 font-bold text-xs uppercase tracking-widest">
                <Clock className="w-4 h-4" /> Berlaku Sampai
              </div>
              <p className="text-white text-sm font-bold">
                {user.bannedUntil ? new Date(user.bannedUntil).toLocaleDateString("id-ID", { 
                  day: "numeric", 
                  month: "long", 
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                }) : "Waktu tidak ditentukan"}
              </p>
            </div>
          </div>

          {/* Live Countdown */}
          <div className="bg-gradient-to-br from-red-600/10 to-orange-600/10 p-8 rounded-3xl border border-red-500/20 mb-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500 mb-6">Sisa Waktu Pemblokiran</h3>
            {timeLeft ? (
              <div className="flex justify-center gap-4 md:gap-8">
                <CountdownUnit value={timeLeft.days} label="Hari" />
                <CountdownUnit value={timeLeft.hours} label="Jam" />
                <CountdownUnit value={timeLeft.minutes} label="Menit" />
                <CountdownUnit value={timeLeft.seconds} label="Detik" highlight />
              </div>
            ) : (
              <p className="text-green-400 font-bold animate-bounce">Masa pemblokiran berakhir. Silakan login kembali.</p>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="group flex items-center justify-center gap-3 w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold transition-all border border-white/10 hover:border-white/20 active:scale-95"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Keluar dari Sesi
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function CountdownUnit({ value, label, highlight = false }: { value: number; label: string; highlight?: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <div className={`text-3xl md:text-5xl font-black ${highlight ? 'text-red-500' : 'text-white'} mb-1 tabular-nums`}>
        {value.toString().padStart(2, '0')}
      </div>
      <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{label}</span>
    </div>
  );
}

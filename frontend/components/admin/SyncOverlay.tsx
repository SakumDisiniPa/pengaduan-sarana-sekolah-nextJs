"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Database, ShieldCheck, Wifi } from "lucide-react";

interface SyncOverlayProps {
  isSyncing: boolean;
  progress: number;
  isReady: boolean;
  error: string | null;
}

export default function SyncOverlay({ isSyncing, progress, isReady, error }: SyncOverlayProps) {
  // We show the overlay if we are syncing OR if it's the initial load and not ready yet.
  const show = !isReady || (isSyncing && progress < 100);

  if (!show && !error) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950 text-white"
      >
        {/* Background Glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative flex flex-col items-center max-w-sm w-full px-8 text-center">
          {/* Icon Animation */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-12 relative"
          >
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-2xl shadow-blue-500/20">
              <Database className="w-12 h-12 text-white" />
            </div>
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-4 border-2 border-dashed border-blue-500/30 rounded-full"
            />
          </motion.div>

          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-2xl font-bold mb-4 tracking-tight"
          >
            {error ? "Sinkronisasi Gagal" : "Sakum School Portal"}
          </motion.h2>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-slate-400 text-sm mb-12 leading-relaxed"
          >
            {error 
                ? error 
                : "Menyiapkan database lokal aman untuk performa maksimal. Mohon tunggu sebentar..."}
          </motion.p>

          {/* Progress Section */}
          {!error && (
            <div className="w-full space-y-4">
              <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck className="w-3 h-3 text-green-500" /> AES-256 Secured
                </span>
                <span className="text-sm font-black text-blue-400 tabular-nums">
                  {progress}%
                </span>
              </div>
            </div>
          )}

          {error && (
            <button 
                onClick={() => window.location.reload()}
                className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-red-500/20"
            >
                Coba Lagi
            </button>
          )}

          {/* Footer Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-16 flex items-center gap-6 text-slate-600"
          >
            <div className="flex flex-col items-center gap-1">
                <Wifi className="w-4 h-4" />
                <span className="text-[8px] uppercase tracking-tighter">Realtime</span>
            </div>
            <div className="w-px h-6 bg-white/5" />
            <div className="text-[9px] uppercase tracking-[0.2em] font-medium">
                Admin Offline Engine v1.0
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

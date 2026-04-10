"use client";

import Image from "next/image";

interface ProofSectionProps {
  proofFile: string | null;
  status: string;
}

export default function ProofSection({ proofFile, status }: ProofSectionProps) {
  if (status !== "selesai" || !proofFile) return null;

  const isVideo = (url: string) => {
    return url.match(/\.(mp4|webm|ogg|mov)$|^blob:.*type=video/i);
  };

  return (
    <div className="mt-8 pt-8 border-t border-white/10">
      <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
        <span>✅</span> Bukti Penyelesaian
      </h3>
      
      <div className="rounded-3xl overflow-hidden border border-green-500/30 shadow-lg bg-black/40 relative group aspect-video">
        {isVideo(proofFile) ? (
          <video 
            src={proofFile} 
            controls 
            className="w-full h-full object-contain"
          />
        ) : (
          <Image 
            src={proofFile} 
            alt="Bukti Selesai" 
            fill
            className="w-full h-full object-cover transition duration-700 hover:scale-105"
            unoptimized
          />
        )}
      </div>
      <p className="mt-3 text-slate-400 text-sm italic">
        * Foto/Video ini diambil oleh Admin sebagai bukti bahwa perbaikan telah selesai dilakukan.
      </p>
    </div>
  );
}

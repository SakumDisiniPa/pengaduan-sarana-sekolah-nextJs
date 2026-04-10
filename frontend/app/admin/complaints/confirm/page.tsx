"use client";

import { useState, useRef, useEffect, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { pb } from "@/lib/pocketbase";
import Link from "next/link";
import { Camera, Image as ImageIcon, Check, X, RotateCcw, Video, Square, Loader2 } from "lucide-react";
import Image from "next/image";

export default function ConfirmCompletionPage() {
  return (
    <Suspense fallback={<LoadingUI />}>
      <ConfirmContent />
    </Suspense>
  );
}

function ConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  // Video Recording Timer & Auto-stop
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 9) { // 10 seconds limit (0-9 is 10 ticks)
            stopRecording();
            return 10;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording, stopRecording]);

  // Cleanup preview URL
  useEffect(() => {
    return () => {
      if (mediaPreview && !mediaPreview.startsWith("http")) {
        URL.revokeObjectURL(mediaPreview);
      }
    };
  }, [mediaPreview]);

  // Start Camera
  const startCamera = async (mode = facingMode) => {
    try {
      // Stop existing stream first to avoid conflicts
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: mode }, 
        audio: true 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err: unknown) {
      console.error("Camera error:", err);
      alert("Gagal mengakses kamera. Pastikan izin diberikan.");
    }
  };

  // Flip Camera
  const flipCamera = () => {
    const newMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(newMode);
    if (isCameraActive) {
      startCamera(newMode);
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Capture Photo
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "completion_proof.jpg", { type: "image/jpeg" });
          setMediaFile(file);
          setMediaPreview(URL.createObjectURL(blob));
          setMediaType("image");
          stopCamera();
        }
      }, "image/jpeg", 0.8);
    }
  };

  // Record Video
  const startRecording = () => {
    if (!videoRef.current?.srcObject) return;
    chunksRef.current = [];
    const recorder = new MediaRecorder(videoRef.current.srcObject as MediaStream);
    recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/mp4" });
      const file = new File([blob], "completion_proof.mp4", { type: "video/mp4" });
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(blob));
      setMediaType("video");
      stopCamera();
    };
    recorder.start();
    mediaRecorderRef.current = recorder;
    setRecordingTime(0); // Move reset here to avoid setstate-in-effect warning
    setIsRecording(true);
  };


  // Gallery Select
  const handleGallerySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file));
      setMediaType(file.type.startsWith("video") ? "video" : "image");
      stopCamera();
    }
  };

  // Final Confirm & Upload
  const handleConfirm = async () => {
    if (!id || !mediaFile) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("completion_proof", mediaFile);
      formData.append("status", "selesai");

      await pb.collection("complaints").update(id, formData);
      
      router.replace(`/admin/complaints/detail/${id}?confirmed=true`);
    } catch (err: unknown) {
      console.error("Upload error:", err);
      alert("Gagal mengupload bukti. Coba lagi.");
      setIsUploading(false);
    }
  };

  const resetMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
    startCamera();
  };

  if (!id) return <ErrorUI message="ID Pengaduan tidak ditemukan." />;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-zinc-900 border-b border-white/5 z-20">
        <Link href={`/admin/complaints/detail/${id}`} className="p-2 hover:bg-white/10 rounded-full transition">
          <X className="w-6 h-6" />
        </Link>
        <h1 className="font-bold text-lg">Bukti Penyelesaian</h1>
        <div className="w-10" /> {/* Spacer */}
      </div>

      <div className="flex-1 relative flex flex-col justify-center items-center p-4">
        {/* Camera View */}
        {!mediaPreview && (
          <div className="w-full max-w-md aspect-[3/4] bg-zinc-800 rounded-3xl overflow-hidden relative shadow-2xl border border-white/10">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className={`w-full h-full object-cover ${facingMode === "user" ? "scale-x-[-1]" : ""}`}
            />
            {isCameraActive && !isRecording && (
              <button
                onClick={flipCamera}
                className="absolute top-6 right-6 p-3 bg-zinc-900/60 hover:bg-zinc-900 border border-white/10 rounded-full transition z-10"
                title="Ganti Kamera"
              >
                <RotateCcw className="w-5 h-5 text-white" />
              </button>
            )}
            {!isCameraActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <button
                  onClick={() => startCamera()}
                  className="px-6 py-3 bg-blue-600 rounded-full font-bold flex items-center gap-2"
                >
                  <Camera className="w-5 h-5" /> Aktifkan Kamera
                </button>
                <p className="text-zinc-500 text-sm">Amankan izin kamera untuk mengambil bukti</p>
              </div>
            )}
            {isRecording && (
              <div className="absolute top-6 left-6 flex items-center gap-3 bg-red-600 px-4 py-2 rounded-full animate-pulse shadow-lg">
                <div className="w-2.5 h-2.5 bg-white rounded-full" />
                <span className="text-sm font-bold font-mono tracking-wider">
                  00:{recordingTime.toString().padStart(2, '0')} / 00:10
                </span>
              </div>
            )}
          </div>
        )}

        {/* Media Preview */}
        {mediaPreview && (
          <div className="w-full max-w-md aspect-[3/4] bg-zinc-900 rounded-3xl overflow-hidden relative shadow-2xl border border-blue-500/30">
            {mediaType === "image" ? (
              <Image src={mediaPreview} fill className="object-cover" alt="Preview" unoptimized />
            ) : (
              <video src={mediaPreview} controls className="w-full h-full object-contain" />
            )}
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="p-8 bg-gradient-to-t from-zinc-950 to-transparent z-20">
        <div className="max-w-md mx-auto flex items-center justify-between gap-4">
          {!mediaPreview ? (
            <>
              {/* Gallery */}
              <label className="p-4 bg-zinc-800 hover:bg-zinc-700 rounded-full transition cursor-pointer">
                <ImageIcon className="w-6 h-6 text-zinc-400" />
                <input type="file" className="hidden" accept="image/*,video/*" onChange={handleGallerySelect} />
              </label>

              {/* Shutter Button Photo */}
              <button 
                onClick={capturePhoto}
                disabled={!isCameraActive || isRecording}
                className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center group active:scale-95 transition disabled:opacity-30"
              >
                <div className="w-16 h-16 bg-white rounded-full group-hover:scale-110 transition" />
              </button>

              {/* Record Button Video */}
              {!isRecording ? (
                <button 
                  onClick={startRecording}
                  disabled={!isCameraActive}
                  className="p-4 bg-zinc-800 hover:bg-red-900/40 rounded-full transition disabled:opacity-30"
                >
                  <Video className="w-6 h-6 text-zinc-400" />
                </button>
              ) : (
                <button 
                  onClick={stopRecording}
                  className="p-4 bg-red-600 rounded-full transition"
                >
                  <Square className="w-6 h-6 fill-white text-white" />
                </button>
              )}
            </>
          ) : (
            <>
              {/* Retake */}
              <button 
                onClick={resetMedia}
                className="flex-1 flex items-center justify-center gap-2 py-4 bg-zinc-800 hover:bg-zinc-700 rounded-2xl font-bold transition"
              >
                <RotateCcw className="w-5 h-5" /> Retake
              </button>

              {/* Confirm & Upload */}
              <button 
                onClick={handleConfirm}
                disabled={isUploading}
                className="flex-[2] flex items-center justify-center gap-2 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-bold transition shadow-lg shadow-blue-500/20 disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Uploading...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" /> Konfirmasi & Selesai
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingUI() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-zinc-600" />
    </div>
  );
}

function ErrorUI({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
      <X className="w-16 h-16 text-red-500 mb-4" />
      <h2 className="text-2xl font-bold mb-2">Error</h2>
      <p className="text-zinc-400 mb-8">{message}</p>
      <Link href="/admin/complaints" className="px-6 py-3 bg-zinc-800 rounded-xl font-bold">Kembali</Link>
    </div>
  );
}

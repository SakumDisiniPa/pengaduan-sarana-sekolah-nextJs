"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  // Dengan Google OAuth, registrasi terjadi otomatis saat login pertama kali.
  // Redirect ke halaman login.
  useEffect(() => {
    router.replace("/siswa/login");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto" />
        <p className="text-gray-600 dark:text-gray-300">
          Mengalihkan ke halaman login...
        </p>
        <p className="text-sm text-gray-500">
          Registrasi otomatis saat login pertama kali dengan akun Google.
        </p>
      </div>
    </div>
  );
}
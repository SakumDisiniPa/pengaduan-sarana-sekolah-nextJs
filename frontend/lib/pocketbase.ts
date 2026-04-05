import PocketBase from "pocketbase";

// 1. Gunakan URL dari Environment Variable (biar gampang kalau ganti ke sakum.my.id)
const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || "https://pengaduansaranasekolah.sakum.my.id";

export const pb = new PocketBase(pbUrl);

// 2. Logic Sinkronisasi Cookie (Agar Login Terjaga)
if (typeof window !== "undefined") {
  // Ambil session login dari cookie browser saat halaman pertama kali dibuka
  pb.authStore.loadFromCookie(document.cookie);

  // Setiap kali status auth berubah (login/logout), update cookie browser
  pb.authStore.onChange(() => {
    // Sesuai prompt kamu tadi, kita butuh cookie agar Next.js Server Side tau user sudah login
    document.cookie = pb.authStore.exportToCookie({ 
      httpOnly: false, // Set false agar bisa dibaca di client-side JS
      secure: false,   // Set true jika sudah pakai HTTPS (sakum.my.id)
      sameSite: "Lax",
      path: "/" 
    });
  }, true);
}
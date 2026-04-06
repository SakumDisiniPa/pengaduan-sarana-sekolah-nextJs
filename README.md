# Aplikasi Pengaduan Sarana Sekolah

Aplikasi web modern untuk melaporkan dan mengelola pengaduan sarana sekolah dengan fitur push notifications, chat real-time, kategori dinamis, dan sistem profil yang premium.

![Status](https://img.shields.io/badge/Status-Stable-green)
![Version](https://img.shields.io/badge/Version-2.3.0-blue)
![Frontend](https://img.shields.io/badge/Frontend-Next.js%2016-blue)
![Backend](https://img.shields.io/badge/Backend-Go%2B%20PocketBase-teal)

---

## 🎯 Fitur Unggulan (Update v2.3.0)

### 🔔 Push Notifications (OneSignal)
-   **Chat Real-time**: Notifikasi otomatis saat ada pesan baru (Siswa ↔ Admin).
-   **Update Status Pengaduan**: Siswa menerima notifikasi saat laporan "Diproses" atau "Selesai".
-   **Laporan Baru**: Admin menerima notifikasi saat ada siswa mengirim pengaduan baru.
-   **Permission Prompt**: Prompt izin notifikasi yang elegan dan persisten sampai diizinkan.

### 📸 Premium Profile Interaction
-   **Preview Modal**: Klik foto profil untuk melihat detail dalam ukuran besar.
-   **3:4 Aspect Ratio**: Tampilan portrait yang fokus dan profesional ala WhatsApp.
-   **Edit Modal**: Ganti foto profil langsung dari dalam modal menggunakan icon Pencil.
-   **Sync Real-time**: Perubahan foto langsung tercermin di dashboard.

---

## 📂 Struktur Proyek

```text
pengaduan-sarana-sekolah-nextJs/
├── backend/                        # Go + PocketBase Backend
│   ├── pb_data/                    # Database & Storage
│   ├── main.go                     # Entry point server
│   └── pb_schema.json              # Skema database
├── frontend/                       # Next.js Frontend
│   ├── app/
│   │   ├── actions/                # Server Actions (Notifications, Auth, MFA)
│   │   ├── admin/                  # Dashboard & Fitur Admin
│   │   ├── siswa/                  # Portal & Dashboard Siswa
│   │   ├── components/             # Reusable UI (OneSignal, Header, dll)
│   │   └── globals.css             # Tema & Styling
│   ├── lib/                        # Integrasi API (PocketBase, OneSignal)
│   ├── public/                     # Service Workers & Assets
│   └── package.json                # Update Version 2.3.0
├── STRUKTUR_FOLDER_LENGKAP.xml     # Export struktur detail
└── README.md                       # Dokumentasi Utama
```

---

## 🛠 Tech Stack

-   **Frontend**: Next.js 16 (App Router), TypeScript, TailwindCSS 4.x.
-   **Icons**: Lucide React.
-   **Animations**: Framer Motion.
-   **Backend**: Go & PocketBase (SQLite).
-   **Notifications**: OneSignal SDK.
-   **Deployment Support**: Cloudflare Tunnel.

---

## 🚀 Persiapan Cepat

1.  **Backend**: `cd backend && go run main.go` (Port 8090)
2.  **Frontend**: `cd frontend && npm install && npm run dev` (Port 3000)
3.  **OneSignal**: Pastikan `NEXT_PUBLIC_ONESIGNAL_APP_ID` dan `ONE_SIGNAL_APP_API_KEY` sudah terpasang di `.env.local`.

---

## 📝 Rekomendasi Pesan Commit (v2.3.0)

Rekomendasi gabungan satu baris (Bahasa Indonesia):
`feat: integrasi notifikasi push, modal foto profil premium, perbaikan URL OneSignal, dan update sistem v2.3.0`

Versi lengkap (Dengan Deskripsi Detail):
```text
feat: rilis sistem notifikasi push dan peningkatan fitur profil v2.3.0

- Integrasi OneSignal untuk notifikasi chat & status pengaduan (Dua Arah).
- Penambahan modal preview foto profil 3:4 dengan fitur edit ala WhatsApp.
- Perbaikan validasi URL absolut pada payload notifikasi OneSignal.
- Pembaruan dokumentasi README dan struktur folder lengkap.
- Update versi aplikasi ke v2.3.0.
```


---

Built with ❤️ by **Antigravity**.

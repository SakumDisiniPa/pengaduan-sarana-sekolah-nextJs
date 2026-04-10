# 📝 Log Update Sistem Pengaduan Sarana Sekolah

Daftar perubahan dan peningkatan yang telah diimplementasikan ke dalam sistem.

## [3.0.0] - 2026-04-11
### 🚀 Perombakan Total Sistem Chat
- **UI/UX Modern**: Redesain total antarmuka chat Admin dan Siswa menggunakan standar desain WhatsApp Web (Bubbles, Sidebar, Header).
- **Dual-Pane Layout**: Implementasi Sidebar pada sisi Siswa, memungkinkan pemilihan admin sekolah secara spesifik.
- **Sinkronisasi IndexedDB (Dexie.js)**: Implementasi sistem sinkronisasi pesan lokal untuk performa instan dan dukungan offline yang lebih baik.
- **Smart Sorting**: Daftar kontak otomatis mengurutkan berdasarkan pesan terbaru ke paling atas.
- **Moderasi Siswa (Admin)**: Halaman manajemen user (`/admin/users`) untuk melihat data siswa secara menyeluruh dengan fitur **Ban/Unban** akses akun.
- **Wajib Bukti Penyelesaian**: Admin **wajib** melampirkan bukti foto/video sebelum laporan dapat diubah statusnya menjadi **Selesai**.
- **In-App Media Capture**: Fitur kamera dan perekam video terintegrasi langsung di aplikasi (max durasi rekam 10 detik) untuk memudahkan Admin mengambil bukti di lapangan.
- **Optimasi Data User**: Perbaikan sistem loading data user di dashboard admin untuk penanganan ribuan data yang lebih responsif.

### 🛠️ Optimasi & Stabilitas
- **100% Type Safety**: Migrasi seluruh komponen chat dari `any` ke TypeScript interfaces yang ketat.
- **Optimasi Gambar**: Migrasi seluruh avatar ke `next/image` dengan konfigurasi remote hostname yang aman.
- **Scroll Fix**: Perbaikan bug layout yang menyebabkan seluruh halaman ikut bergulir saat menavigasi pesan.
- **Search Security**: Penambahan pemeriksaan null-safety pada fitur pencarian sidebar untuk mencegah crash.

## [2.4.0] - 2026-04-05
### 📂 Manajemen Kategori & Ikon
- **Dynamic Categories**: Migrasi dari hardcoded list ke database-driven categories (PocketBase).
- **Lucide Icon Migration**: Mengganti seluruh emoji/icon lama dengan library `lucide-react` yang lebih profesional.
- **Admin Controls**: Penambahan fitur ban/unban user dengan sistem konfirmasi yang lebih stabil.

## [2.3.0] - 2026-04-03
### 🔐 Keamanan & Autentikasi
- **Domain-Restricted Auth**: Pembatasan login hanya untuk domain sekolah (`@smkn1padaherang.sch.id`).
- **MFA Implementation**: Implementasi Two-Factor Authentication (OTP) untuk keamanan ekstra.
- **OAuth Integration**: Dukungan login via Google dengan sinkronisasi profil otomatis.

---
*Update terakhir: 11 April 2026 oleh Antigravity Assistant*

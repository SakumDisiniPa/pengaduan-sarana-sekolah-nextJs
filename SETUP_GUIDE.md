# Setup & Run Guide - Aplikasi Pengaduan Sarana Sekolah

Panduan lengkap untuk setup dan menjalankan aplikasi.

---

## Prerequisites

- **Go 1.20+** (untuk backend)
- **Node.js 18+** (untuk frontend)  
- **npm** atau **yarn**

Verifikasi:
```bash
go version
node --version
npm --version
```

---

## Backend Setup (PocketBase + Go)

### 1. Install Dependencies

```bash
cd /home/sakum-disini-pa/Documents/webntahlah/backend
go mod tidy
```

### 2. Run Backend

```bash
go run main.go
```

Output yang diharapkan:
```
Starting PocketBase (embedded)...
Admin UI: http://localhost:8090/_/
API: http://localhost:8090/api/
```

**Backend siap di** `http://localhost:8090`

---

## Frontend Setup (Next.js)

### 1. Install Dependencies

```bash
cd /home/sakum-disini-pa/Documents/webntahlah/frontend
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Output yang diharapkan:
```
> frontend@0.1.0 dev
> next dev

  ▲ Next.js 16.x
  - Local:        http://localhost:3000
  - Environments: .env.local

✓ Ready in 1.2s
```

**Frontend siap di** `http://localhost:3000`

---

## Database Setup (PocketBase Collections)

### Option 1: Import dari JSON (Recommended)

1. Backend sudah running (`http://localhost:8090/_/`)
2. Buka **Admin UI**
3. Klik **Settings** (ikon gear) di sidebar bawah
4. Pilih **Import data**
5. Pilih file `/home/sakum-disini-pa/Documents/webntahlah/backend/pb_export.json`
6. Klik **Import**

✓ Collection `complaints` dan `chats` sudah dibuat otomatis.

### Option 2: Manual Setup (Alternative)

Jika import gagal, buat manual melalui Admin UI:

#### Collection 1: `complaints`

1. **Collections → New collection**
2. Nama: `complaints`
3. Klik **Create**
4. Fields (klik "+" untuk tambah):
   - `title` (Text) - Required ✓
   - `description` (Text) - Required ✓
   - `status` (Text) - Optional
5. **Save**

#### Collection 2: `chats`

1. **Collections → New collection**
2. Nama: `chats`
3. Klik **Create**
4. Fields:
   - `text` (Text) - Required ✓
   - `sender` (Relation ke `users`) - Required ✓
   - `recipient` (Relation ke `users`) - Optional
5. **Save**

---

## Create Admin User

### Melalui Admin UI:

1. Buka Admin UI (`http://localhost:8090/_/`)
2. **Collections → users**
3. Klik **+ New record**
4. Isi form:
   - **Email**: `admin@example.com`
   - **Password**: `password123` (min 8 char)
   - **Confirm password**: `password123`
5. Klik **Save**
6. Scroll ke bawah, cari field `isAdmin`
7. **Toggle ON** switch `isAdmin`
8. Klik **Save** lagi

✓ Admin user siap dengan email: `admin@example.com`

### Melalui Frontend Register:

Atau daftar via frontend, lalu toggle admin flag di Admin UI.

---

## Jalankan Aplikasi

Pastikan terminal ada 2:

**Terminal 1 (Backend):**
```bash
cd backend
go run main.go
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

---

## Test Aplikasi

### 1. Homepage
- Buka http://localhost:3000
- Lihat halaman utama dengan tombol "Buat Pengaduan" dan "Chat dengan Admin"

### 2. Register (User Biasa)
- Klik **Register**
- Isi email: `user1@example.com`, password: `password123`
- Klik **Register**
- Redirect ke `/chat`

### 3. Login
- Klik **Login**
- Masukkan email & password user yang sudah dibuat
- Klik **Login**

### 4. Fitur Complaints (Pengaduan)
- Dari header, klik **Home** (untuk kembali)
- Atau direct akses http://localhost:3000/complaints
- Isi form:
  - **Judul Pengaduan**: "Lantai rusak"
  - **Deskripsi**: "Lantai di kelas A retak berbahaya"
- Klik **Kirim Pengaduan**
- ✓ Pengaduan muncul di daftar dengan status "open"

### 5. Fitur Chat Realtime
- Klik **Chat** di header
- Tulis pesan: "Kapan lantainya diperbaiki?"
- Klik **Kirim**
- ✓ Pesan muncul dengan timestamp

### 6. Admin Dashboard (Setup)
Jangan lupa setup admin user dulu!

1. Login dengan akun admin (`admin@example.com`)
2. Di header muncul 2 menu baru:
   - **Admin Chat** → `/admin/chats`
   - **Complaints** → `/admin/complaints`

### 7. Admin - Manage Complaints
- Admin akses `/admin/complaints`
- Lihat semua pengaduan dari semua user
- Dropdown **Status**: pilih "Sedang Diproses" atau "Selesai"
- ✓ Status update realtime untuk semua user

### 8. Admin - Chat Dashboard
- Admin akses `/admin/chats`
- Lihat semua percakapan
- Dropdown **Reply to user**: pilih user
- Tulis balasan & klik **Kirim**
- ✓ User melihat balasan admin realtime

---

## Troubleshooting

### Error: "Cannot connect to PocketBase"
- ✓ Pastikan backend running (`go run main.go`)
- ✓ Pastikan URL di `frontend/lib/pocketbase.ts` = `http://localhost:8090`

### Error: "Collection not found"
- ✓ Pastikan sudah import JSON atau setup manual
- ✓ Restart backend: `Ctrl+C` lalu `go run main.go`

### Realtime chat/complaints tidak update
- ✓ Refresh page
- ✓ Pastikan frontend & backend sama network
- ✓ Check browser console: `F12 → Console`

### Admin menu tidak muncul
- ✓ Pastikan login dengan akun yang `isAdmin = true`
- ✓ Cek di Admin UI → Collections → users → pilih user
- ✓ Scroll bawah, toggle `isAdmin` ke ON

### Port 3000 atau 8090 sudah terpakai
Ganti port:

**Frontend** (ganti port 3000):
```bash
npm run dev -- -p 3001
```

**Backend** (ganti port 8090):
Edit `backend/main.go`: ganti `8090` jadi port lain, lalu update `frontend/lib/pocketbase.ts`

---

## Code Structure

```
webntahlah/
├── backend/
│   ├── main.go                    # Server PocketBase
│   ├── go.mod                     # Go dependencies
│   ├── README.md                  # Backend docs
│   ├── pb_export.json             # Database schema (import)
│   └── pb_data/                   # Database storage (auto-created)
│
├── frontend/
│   ├── app/
│   │   ├── layout.tsx             # Root layout
│   │   ├── page.tsx               # Homepage
│   │   ├── login/page.tsx         # Login form
│   │   ├── register/page.tsx      # Register form
│   │   ├── complaints/page.tsx    # User: Buat & Lihat Pengaduan
│   │   ├── chat/page.tsx          # User: Chat dengan Admin
│   │   ├── admin/
│   │   │   ├── complaints/page.tsx # Admin: Manage Pengaduan
│   │   │   └── chats/page.tsx      # Admin: Manage Chat
│   │   └── components/
│   │       └── Header.tsx         # Navigation & Auth UI
│   ├── lib/
│   │   └── pocketbase.ts          # PocketBase client setup
│   ├── package.json               # npm dependencies
│   └── README.md                  # Frontend docs
│
└── POCKETBASE_SCHEMA.md           # Dokumentasi schema lengkap
```

---

## Production Deployment (Future)

Untuk deploy ke production:

1. **Backend**: Build Go binary, deploy ke server (Railway, Render, VPS)
2. **Frontend**: Build Next.js, deploy ke Vercel atau server
3. **Database**: Backup PocketBase `pb_data/` folder secara regular

---

## Support

Pertanyaan atau issues:
- Baca [POCKETBASE_SCHEMA.md](./POCKETBASE_SCHEMA.md) untuk dokumentasi database
- Baca README di folder `backend/` dan `frontend/`
- Lihat [PocketBase docs](https://pocketbase.io/docs/)

---

**Happy Coding!** 🎉

# PocketBase Schema Documentation

Dokumentasi lengkap schema dan struktur database untuk aplikasi Pengaduan Sarana Sekolah.

---

## Collections Overview

Aplikasi ini memiliki 3 collection utama:

1. **users** (built-in auth) – autentikasi pengguna
2. **complaints** – pengaduan sarana sekolah
3. **chats** – pesan real-time antara user dan admin

---

## 1. Users Collection (`_pb_users_auth_`)

Collection bawaan PocketBase untuk autentikasi. Ini sudah otomatis tersedia.

### Fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | text (primary key) | ✓ | ID unik 15 karakter random |
| `email` | email | ✓ | Email unik untuk login |
| `password` | password | ✓ | Password terenkripsi (min 8 char) |
| `passwordConfirm` | password | ✓ | Konfirmasi password (saat create) |
| `name` | text | ✗ | Nama pengguna (opsional) |
| `avatar` | file | ✗ | Foto profil (opsional) |
| `emailVisibility` | bool | ✗ | Email terlihat di publik (default false) |
| `verified` | bool | ✗ | Email sudah diverifikasi (default false) |
| `isAdmin` | bool | ✗ | Flag untuk admin role (PENTING: toggle ini manual dari Admin UI) |
| `created` | autodate | ✓ | Timestamp otomatis |
| `updated` | autodate | ✓ | Timestamp otomatis |

### Rules:

- **listRule**: `id = @request.auth.id` – user hanya bisa list user milik sendiri
- **viewRule**: `id = @request.auth.id` – user hanya bisa lihat profil sendiri
- **createRule**: `""` – siapa saja bisa register (kosong = publik)
- **updateRule**: `id = @request.auth.id` – user hanya bisa update profil sendiri
- **deleteRule**: `id = @request.auth.id` – user hanya bisa delete akun sendiri

### Cara membuat Admin:

1. Buka Admin UI → **Collections → users**
2. Klik "New record"
3. Isi `email`, `password`, `passwordConfirm`
4. **Simpan**, lalu scroll ke bawah
5. Toggle switch `isAdmin` ke **ON**
6. Klik "Save" lagi

---

## 2. Complaints Collection

Collection untuk pengaduan sarana sekolah.

### Schema JSON:

```json
{
  "id": "complaints",
  "name": "complaints",
  "type": "base",
  "system": false,
  "schema": [
    {
      "name": "title",
      "type": "text",
      "required": true,
      "unique": false
    },
    {
      "name": "description",
      "type": "text",
      "required": true,
      "unique": false
    },
    {
      "name": "status",
      "type": "text",
      "required": false,
      "unique": false
    }
  ],
  "listRule": "",
  "viewRule": "",
  "createRule": "",
  "updateRule": "id = @request.auth.id || @request.auth.isAdmin",
  "deleteRule": "id = @request.auth.id || @request.auth.isAdmin"
}
```

### Fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | text (primary key) | ✓ | ID unik otomatis dari PocketBase |
| `title` | text | ✓ | Judul pengaduan |
| `description` | text | ✓ | Deskripsi detail |
| `category` | select | ✓ | Kategori: AC Rusak, Lantai Retak, Atap Bocor, etc |
| `location` | text | ✓ | Lokasi pengaduan (Kelas A, Perpustakaan, dll) |
| `priority` | select | ✗ | Prioritas: low, medium, high (default: medium) |
| `status` | text | ✗ | Status: `open`, `in-progress`, `resolved`, `rejected` |
| `photo` | files | ✗ | Foto bukti pengaduan |
| `feedback` | text | ✗ | Umpan balik/progress update dari admin |
| `deadline` | date | ✗ | Target tanggal penyelesaian |
| `estimated_cost` | number | ✗ | Estimasi biaya perbaikan |
| `creator` | relation | ✓ | Referensi ke users (yang membuat) |
| `created` | autodate | ✓ | Timestamp pembuatan |
| `updated` | autodate | ✓ | Timestamp perubahan terakhir |

### Sample Data:

```json
{
  "id": "rec_complaint_1",
  "created": "2026-03-03T08:00:00.000Z",
  "updated": "2026-03-03T08:00:00.000Z",
  "title": "Lantai rusak di kelas A",
  "description": "Lantai retak dan berbahaya, mohon segera diperbaiki.",
  "category": "Lantai Retak",
  "location": "Kelas A",
  "priority": "high",
  "status": "in-progress",
  "photo": ["photo_uuid_1"],
  "feedback": "Sudah dilaporkan ke maintenance. Target penyelesaian: 1 minggu.",
  "deadline": "2026-03-10T23:59:59Z",
  "estimated_cost": 500000,
  "creator": "user_student_1"
}
```

### Rules & Permissions:

- **listRule**: `""` – semua orang bisa melihat daftar pengaduan (publik)
- **viewRule**: `""` – semua orang bisa melihat detail pengaduan
- **createRule**: `""` – siapa saja bisa membuat pengaduan
- **updateRule**: `id = @request.auth.id || @request.auth.isAdmin` – pembuat atau admin bisa update
- **deleteRule**: `id = @request.auth.id || @request.auth.isAdmin` – pembuat atau admin bisa hapus

---

## 3. Chats Collection

Collection untuk percakapan real-time antara user biasa dan admin.

### Schema JSON:

```json
{
  "id": "chats",
  "name": "chats",
  "type": "base",
  "system": false,
  "schema": [
    {
      "name": "text",
      "type": "text",
      "required": true,
      "unique": false
    },
    {
      "name": "sender",
      "type": "relation",
      "required": true,
      "unique": false,
      "options": {
        "collectionId": "_pb_users_auth_",
        "cascadeDelete": false
      }
    },
    {
      "name": "recipient",
      "type": "relation",
      "required": false,
      "unique": false,
      "options": {
        "collectionId": "_pb_users_auth_",
        "cascadeDelete": false
      }
    }
  ],
  "listRule": "",
  "viewRule": "sender = @request.auth.id || recipient = @request.auth.id || @request.auth.isAdmin",
  "createRule": "@request.auth.id != null",
  "updateRule": "",
  "deleteRule": "sender = @request.auth.id || @request.auth.isAdmin"
}
```

### Fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | text (primary key) | ✓ | ID unik otomatis |
| `text` | text | ✓ | Isi pesan |
| `sender` | relation | ✓ | Referensi ke users (yang mengirim) |
| `recipient` | relation | ✗ | Referensi ke users (yang menerima) |
| `created` | autodate | ✓ | Timestamp otomatis |
| `updated` | autodate | ✓ | Timestamp otomatis |

### Sample Data:

```json
{
  "id": "rec_chat_1",
  "created": "2026-03-03T09:00:00.000Z",
  "updated": "2026-03-03T09:00:00.000Z",
  "text": "Halo, kapan lantai di kelas A diperbaiki?",
  "sender": "user123",
  "recipient": "admin456"
}
```

### Rules & Permissions:

- **listRule**: `""` – siapa saja bisa list (akan di-filter di frontend)
- **viewRule**: `sender = @request.auth.id || recipient = @request.auth.id || @request.auth.isAdmin` – hanya pengirim, penerima, atau admin yang bisa lihat
- **createRule**: `@request.auth.id != null` – hanya user yang sudah login bisa buat pesan
- **updateRule**: `""` – pesan tidak bisa diedit
- **deleteRule**: `sender = @request.auth.id || @request.auth.isAdmin` – hanya pengirim atau admin yang bisa hapus

---

## Rules Reference

### RecordScope Variables:

- `@request.auth.id` – ID user yang sedang login
- `@request.auth.email` – Email user yang sedang login
- `@request.auth.isAdmin` – Boolean: apakah user adalah admin

### Common Operators:

| Operator | Meaning |
|----------|---------|
| `=` | Sama dengan |
| `!=` | Tidak sama dengan |
| `\|\|` | OR (atau) |
| `&&` | AND (dan) |
| `@request.auth.id != null` | User harus login |

### Contoh Rule:

```
sender = @request.auth.id || @request.auth.isAdmin
```
→ **Hanya pengirim pesan atau admin yang bisa**

---

## Import Data ke PocketBase

Jika Anda ingin mengimpor koleksi dan sample data sekaligus:

1. Jalankan backend: `go run main.go`
2. Buka Admin UI: `http://localhost:8090/_/`
3. Ke menu **Settings → Import data**
4. Pilih file `pb_export.json` dari folder `backend/`
5. Klik **Import**

PocketBase akan membuat collection `complaints` dan `chats` dengan skema yang benar.

### Atau Manual Setup:

Jika import gagal, buat collection manual melalui Admin UI:

1. **Collections → New collection**
2. Nama: `complaints`
3. Fields (klik "+" untuk tambah):
   - `title` (text, required)
   - `description` (text, required)
   - `status` (text, optional)
4. Buat, lalu repeat untuk `chats` dengan:
   - `text` (text, required)
   - `sender` (relation ke users, required)
   - `recipient` (relation ke users, optional)

---

## API Endpoints (Auto-generated by PocketBase)

Semua endpoint di-generate otomatis oleh PocketBase:

### Complaints:

```
GET    /api/collections/complaints/records?sort=-created
POST   /api/collections/complaints/records
GET    /api/collections/complaints/records/{id}
PATCH  /api/collections/complaints/records/{id}
DELETE /api/collections/complaints/records/{id}
```

### Chats:

```
GET    /api/collections/chats/records?sort=-created&expand=sender,recipient
POST   /api/collections/chats/records
GET    /api/collections/chats/records/{id}
DELETE /api/collections/chats/records/{id}
```

### Users (Auth):

```
POST   /api/collections/users/auth-with-password
GET    /api/collections/users/auth-refresh
POST   /api/collections/users
GET    /api/collections/users/records?expand=...
PATCH  /api/collections/users/{id}
```

---

## Frontend Integration

### Connect to PocketBase:

File: `frontend/lib/pocketbase.ts`

```typescript
import PocketBase from "pocketbase";

export const pb = new PocketBase("http://localhost:8090");
```

### Get Collections:

```typescript
// Fetch complaints
const complaints = await pb.collection("complaints").getFullList();

// Create complaint
const rec = await pb.collection("complaints").create({
  title: "Lantai rusak",
  description: "...",
  status: "open",
});

// Update status
await pb.collection("complaints").update(id, { status: "in-progress" });

// Delete
await pb.collection("complaints").delete(id);
```

### Subscribe to Realtime:

```typescript
const unsubscribe = await pb.collection("chats").subscribe("*", (e) => {
  if (e.action === "create") {
    console.log("New message:", e.record);
  }
});

// Cleanup
unsubscribe();
```

### Authentication:

```typescript
// Register
await pb.collection("users").create({
  email: "user@example.com",
  password: "password123",
  passwordConfirm: "password123",
});

// Login
await pb.collection("users").authWithPassword("user@example.com", "password123");

// Get current user
const user = pb.authStore.model;

// Logout
pb.authStore.clear();

// Listen to auth changes
pb.authStore.onChange(() => {
  const user = pb.authStore.model; // null jika logout
});
```

---

## Troubleshooting

### Koleksi tidak muncul di Admin UI

→ Restart server PocketBase (`go run main.go`)

### Tidak bisa membuat record

→ Periksa `createRule`. Jika kosong (`""`), berarti publik OK.

### "User tidak authorized" error

→ Periksa `listRule`, `viewRule`, `updateRule`, `deleteRule` pada koleksi. Pastikan rule sesuai dengan user role.

### Realtime subscribe tidak jalan

→ Pastikan frontend connect ke PocketBase dengan URL yang benar (`http://localhost:8090`).

### Tidak bisa login

→ Pastikan sudah ada user di collection `users`. Buat dari Admin UI atau register dari frontend.

---

## Notes

- PocketBase otomatis menyediakan collection `users` untuk autentikasi.
- Realtime subscribe hanya perlu di setup saat component mount.
- Rule berbasis `@request.auth.id` memastikan data privacy.
- Admin dapat diatur dengan toggle `isAdmin` pada user record.

Untuk pertanyaan lebih lanjut, lihat [dokumentasi PocketBase](https://pocketbase.io/docs/).

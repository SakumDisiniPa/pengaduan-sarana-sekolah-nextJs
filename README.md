# Aplikasi Pengaduan Sarana Sekolah

Aplikasi web modern untuk melaporkan dan mengelola pengaduan sarana sekolah dengan fitur chat real-time antara pengguna biasa dan admin.

![Status](https://img.shields.io/badge/Status-Development-blue)

---

## 🎯 Features

### User (Pengguna Biasa):
- ✅ **Register & Login** – Autentikasi email/password via PocketBase
- ✅ **Buat Pengaduan** – Submit laporan sarana rusak/bermasalah
- ✅ **Lihat Status** – Track status pengaduan (Dibuka → Diproses → Selesai)
- ✅ **Chat Real-time** – Percakapan langsung dengan admin (WebSocket)
- ✅ **Responsive UI** – Tampilan mobile & desktop friendly (TailwindCSS)

### Admin (Pengelola):
- ✅ **Dashboard Pengaduan** – Lihat semua pengaduan dari semua user
- ✅ **Update Status** – Ubah status pengaduan real-time
- ✅ **Chat Dashboard** – Lihat & balas pesan dari user
- ✅ **Role-based Access** – Hanya admin yang bisa akses menu admin

---

## 🛠 Tech Stack

### Backend:
- **Go 1.20+** – Efficient, fast server
- **PocketBase** – Embedded database (SQLite) + auto REST API + Realtime WebSockets
- **No external dependencies** – All-in-one backend solution

### Frontend:
- **Next.js 16+** – React App Router, SSR ready
- **TypeScript** – Type-safe development
- **TailwindCSS** – Modern responsive styling
- **PocketBase JS Client** – Realtime queries & auth

### Database:
- **PocketBase** (SQLite embedded)
  - Collections: `users`, `complaints`, `chats`
  - Auto REST API endpoints
  - Built-in authentication
  - Realtime subscriptions

---

## 📁 Project Structure

```
webntahlah/
├── backend/                        # Go + PocketBase backend
│   ├── main.go                     # Server entry point
│   ├── go.mod                      # Go module definition
│   ├── README.md                   # Backend documentation
│   └── pb_export.json              # Database schema (export/import)
│
├── frontend/                       # Next.js React frontend
│   ├── app/
│   │   ├── layout.tsx              # Root layout (server)
│   │   ├── page.tsx                # Homepage
│   │   ├── login/page.tsx          # Login page
│   │   ├── register/page.tsx       # Register page
│   │   ├── complaints/page.tsx     # User complaints
│   │   ├── chat/page.tsx           # User chat with admin
│   │   ├── admin/
│   │   │   ├── chats/page.tsx      # Admin: manage chats
│   │   │   └── complaints/page.tsx # Admin: manage complaints
│   │   └── components/
│   │       └── Header.tsx          # Navigation header
│   ├── lib/
│   │   └── pocketbase.ts           # PocketBase client
│   ├── package.json                # npm dependencies
│   └── README.md                   # Frontend docs
│
├── POCKETBASE_SCHEMA.md            # Database schema documentation
├── SETUP_GUIDE.md                  # How to run locally
└── README.md (ini)                 # Project overview

```

---

## 🚀 Quick Start

### Prerequisites
- Go 1.20+: https://golang.org/dl
- Node.js 18+: https://nodejs.org/

### 1. Start Backend

```bash
cd backend
go mod tidy
go run main.go
```

Output:
```
Starting PocketBase (embedded)...
Admin UI: http://localhost:8090/_/
API: http://localhost:8090/api/
```

### 2. Setup Database

**Option A: Import (Recommended)**
1. Open http://localhost:8090/_/
2. Go to **Settings → Import data**
3. Select `backend/pb_export.json`
4. Click **Import**

**Option B: Manual**
- Create collection `complaints` with fields: `title`, `description`, `status`
- Create collection `chats` with fields: `text`, `sender` (relation), `recipient` (relation)
- See [POCKETBASE_SCHEMA.md](./POCKETBASE_SCHEMA.md) for details

### 3. Create Admin User

In Admin UI:
1. **Collections → users**
2. **New record** → email: `admin@example.com`, password: `password123`
3. Toggle `isAdmin` to ON
4. Save

### 4. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Access: http://localhost:3000

---

## 📖 How to Use

### As Regular User:

1. **Register**
   - Click "Register"
   - Email: `user@example.com`, Password: `password123`
   - Auto-login to chat page

2. **Make Complaint**
   - From header, click "Home" then "Buat Pengaduan"
   - Fill form: Title & Description
   - Click "Kirim Pengaduan"
   - See status updates in real-time

3. **Chat with Admin**
   - Click "Chat" in header
   - Type message & press Enter
   - See admin replies in real-time

### As Admin:

1. **Login**
   - Email: `admin@example.com`, Password: `password123`

2. **Manage Complaints**
   - Click "Complaints" in header
   - See all complaints from all users
   - Update status for each complaint
   - Changes update in real-time for users

3. **Chat with Users**
   - Click "Admin Chat" in header
   - Select user from dropdown
   - Type reply
   - Messages appear in user's chat instantly

---

## 📚 Documentation

- **[POCKETBASE_SCHEMA.md](./POCKETBASE_SCHEMA.md)** – Complete database schema, fields, rules, API endpoints
- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** – Detailed setup, troubleshooting, deployment
- **[backend/README.md](./backend/README.md)** – Backend-specific documentation
- **[frontend/README.md](./frontend/README.md)** – Frontend-specific documentation

---

## 🔐 Security & Permissions

### Authentication
- User registration & login via `users` collection
- Passwords hashed automatically by PocketBase
- JWT tokens for session management

### Authorization Rules (PocketBase Rules)

```
Complaints:
  - Anyone can VIEW
  - Anyone can CREATE
  - Only creator or admin can UPDATE/DELETE

Chats:
  - Only sender, recipient, or admin can VIEW
  - Only authenticated users can CREATE
  - Only sender or admin can DELETE
```

See [POCKETBASE_SCHEMA.md](./POCKETBASE_SCHEMA.md) for complete rule definitions.

---

## 🔧 API Endpoints

All endpoints auto-generated by PocketBase at `http://localhost:8090/api/`

### Collections:
- `GET/POST /api/collections/complaints/records`
- `GET/POST /api/collections/chats/records`
- `POST /api/collections/users/auth-with-password`

See [POCKETBASE_SCHEMA.md](./POCKETBASE_SCHEMA.md#api-endpoints) for full list.

---

## 📱 Responsive Design

- **Mobile-first** TailwindCSS components
- **Touch-friendly** buttons & forms
- Tested on: Chrome, Firefox, Safari, Mobile browsers

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Cannot connect to PocketBase" | Backend must be running: `go run main.go` |
| "Collection not found" | Import `pb_export.json` or create collections manually |
| Chat/Complaints not updating | Refresh page or check browser console (F12) |
| Admin menu not visible | Login with admin user (`isAdmin = true`) |
| Port already in use | Change port in run command (see SETUP_GUIDE.md) |

More troubleshooting: [SETUP_GUIDE.md#troubleshooting](./SETUP_GUIDE.md#troubleshooting)

---

## 📝 License

Educational project for school complaint system.

---

## 👤 Author

Built with ❤️ using Go, Next.js, and PocketBase.

---

## 🎓 Learning Resources

- [PocketBase Documentation](https://pocketbase.io/docs/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Go Documentation](https://golang.org/doc/)
- [TailwindCSS](https://tailwindcss.com/docs)

---

## ✅ Testing Checklist

- [ ] Backend running on `http://localhost:8090`
- [ ] Frontend running on `http://localhost:3000`
- [ ] Can register new user
- [ ] Can login as user
- [ ] Can submit complaint
- [ ] Can send chat message
- [ ] Admin user created with `isAdmin = true`
- [ ] Admin can see all complaints
- [ ] Admin can update complaint status
- [ ] Admin can reply to user chat
- [ ] User sees real-time updates

---

**Ready to test?** Follow [SETUP_GUIDE.md](./SETUP_GUIDE.md) for step-by-step setup.

Happy coding! 🚀

# Aplikasi Pengaduan Sarana Sekolah

Aplikasi web modern untuk melaporkan dan mengelola pengaduan sarana sekolah dengan fitur chat real-time, kategori dinamis, sistem prioritas, dan dashboard analytics yang komprehensif.

![Status](https://img.shields.io/badge/Status-Development-blue)
![Frontend](https://img.shields.io/badge/Frontend-Next.js%2016-blue)
![Backend](https://img.shields.io/badge/Backend-Go%2B%20PocketBase-teal)
![Icons](https://img.shields.io/badge/Icons-Lucide%20React-green)

---

## 🎯 Fitur Unggulan (Update v2.3.0)

### User (Pengguna Biasa):
- ✅ **Register & Login** – Autentikasi email/password dengan MFA optional
- ✅ **Profile Management** – Edit nama, foto profile, dan password
- ✅ **Buat Pengaduan** – Submit laporan dengan kategori, prioritas, dan foto bukti
- ✅ **Lihat Status Real-time** – Track status pengaduan (Menunggu → Diproses → Selesai)
- ✅ **Filter & Search** – Filter pengaduan berdasarkan status, kategori, prioritas
- ✅ **Feedback Admin** – Terima balasan dari admin untuk setiap pengaduan
- ✅ **Rating Sistem** – Berikan rating untuk pengaduan yang selesai
- ✅ **Chat Real-time** – Percakapan langsung dengan admin (WebSocket)
- ✅ **Modern UI/UX** – Lucide React icons, Tailwind CSS, responsive design

### Admin (Pengelola):
- ✅ **Dashboard Analytics** – Stats real-time: Total siswa, pengaduan menunggu/diproses/selesai
- ✅ **Manage Kategori** – CRUD kategori pengaduan (Create, Read, Update, Delete)
- ✅ **Advanced Filtering** – Filter kompleks: kategori, prioritas, siswa, tanggal, bulan/tahun
- ✅ **Bulk Actions** – Update status pengaduan dengan view detail
- ✅ **Feedback System** – Berikan feedback & balasan untuk tiap pengaduan
- ✅ **Chat Management** – View & balas pesan dari multiple users
- ✅ **Profile Management** – Edit nama, foto, password, dan MFA settings
- ✅ **Responsive Admin Panel** – Full-featured admin dashboard dengan Lucide icons
- ✅ **Role-based Access** – Hanya admin yang bisa akses menu admin

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

## 🛠 Tech Stack

### Backend:
- **Go 1.20+** – High-performance, concurrent server
- **PocketBase** – Embedded database (SQLite) + Auto REST API + Realtime WebSockets
- **Notifications**: OneSignal SDK.
- **Zero external dependencies** – All-in-one backend solution

### Frontend:
- **Next.js 16+** – React App Router, Server Components, optimized
- **TypeScript** – Full type-safe development
- **TailwindCSS 4.x** – Modern utility-first styling
- **Lucide React** – 600+ beautiful, consistent SVG icons
- **Framer Motion** – Smooth animations & transitions
- **PocketBase JS Client** – Realtime queries & auth management

### Database:
- **PocketBase** (SQLite embedded)
  - Collections: `users`, `complaints`, `categories`, `chats`
  - Auto REST API + WebSocket subscriptions
  - Built-in authentication system
  - Real-time data synchronization
  - Automatic backups

## 📋 Detailed Features Breakdown

```
pengaduan-sarana-sekolah-nextJs/
├── 📁 backend/
│   ├── 📁 pb_data/
│   │   ├── 📁 backups/
│   │   ├── 📁 storage/
│   │   ├── 📄 auxiliary.db
│   │   └── 📄 data.db
│   ├── ⚙️ .gitignore
│   ├── 📝 README.md
│   ├── 📄 go.mod
│   ├── 📄 go.sum
│   ├── 🐹 main.go
│   └── ⚙️ pb_schema.json
├── 📁 frontend/
│   ├── 📁 OneSignalSDK-v16-ServiceWorker/
│   │   ├── 📁 OneSignalSDK-v16-ServiceWorker/
│   │   └── 📁 __MACOSX/
│   │       ├── 📁 OneSignalSDK-v16-ServiceWorker/
│   │       │   └── 📄 ._OneSignalSDKWorker.js
│   │       └── ⚙️ ._OneSignalSDK-v16-ServiceWorker
│   ├── 📁 app/
│   │   ├── 📁 actions/
│   │   │   ├── 📄 mfa.ts
│   │   │   ├── 📄 notifications.ts
│   │   │   └── 📄 userAuth.ts
│   │   ├── 📁 admin/
│   │   │   ├── 📁 chats/
│   │   │   │   ├── 📁 components/
│   │   │   │   │   ├── 📄 ChatHeader.tsx
│   │   │   │   │   ├── 📄 ChatInput.tsx
│   │   │   │   │   ├── 📄 ChatSidebar.tsx
│   │   │   │   │   ├── 📄 ContextMenu.tsx
│   │   │   │   │   ├── 📄 EmptyState.tsx
│   │   │   │   │   ├── 📄 LoadingState.tsx
│   │   │   │   │   ├── 📄 MessageBubble.tsx
│   │   │   │   │   ├── 📄 MessagesList.tsx
│   │   │   │   │   └── 📄 index.ts
│   │   │   │   ├── 📁 hooks/
│   │   │   │   │   ├── 📄 index.ts
│   │   │   │   │   ├── 📄 useChats.ts
│   │   │   │   │   ├── 📄 useNotifications.ts
│   │   │   │   │   └── 📄 useSendMessage.ts
│   │   │   │   ├── 📁 types/
│   │   │   │   │   └── 📄 index.ts
│   │   │   │   ├── 📁 utils/
│   │   │   │   │   └── 📄 messageHelpers.ts
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 complaints/
│   │   │   │   ├── 📁 components/
│   │   │   │   │   ├── 📄 ComplaintsList.tsx
│   │   │   │   │   ├── 📄 FilterControls.tsx
│   │   │   │   │   └── 📄 StatusFilter.tsx
│   │   │   │   ├── 📁 detail/
│   │   │   │   │   └── 📁 [id]/
│   │   │   │   │       └── 📄 page.tsx
│   │   │   │   ├── 📁 hooks/
│   │   │   │   │   ├── 📄 index.ts
│   │   │   │   │   ├── 📄 useAdminComplaints.ts
│   │   │   │   │   ├── 📄 useComplaintDetail.ts
│   │   │   │   │   └── 📄 useNotifications.ts
│   │   │   │   ├── 📁 types/
│   │   │   │   │   └── 📄 index.ts
│   │   │   │   ├── 📁 utils/
│   │   │   │   │   ├── 📄 complaintService.ts
│   │   │   │   │   ├── 📄 complaintTransform.ts
│   │   │   │   │   ├── 📄 dateFormatDetail.ts
│   │   │   │   │   ├── 📄 dateFormatter.ts
│   │   │   │   │   ├── 📄 filterUtils.ts
│   │   │   │   │   ├── 📄 index.ts
│   │   │   │   │   └── 📄 statusConstants.ts
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 kategori/
│   │   │   │   ├── 📁 create/
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 edit/
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 login/
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 profile/
│   │   │   │   ├── 📁 components/
│   │   │   │   │   ├── 📄 MessageAlert.tsx
│   │   │   │   │   ├── 📄 MfaSection.tsx
│   │   │   │   │   ├── 📄 ProfileSection.tsx
│   │   │   │   │   ├── 📄 SecuritySection.tsx
│   │   │   │   │   └── 📄 index.ts
│   │   │   │   ├── 📁 hooks/
│   │   │   │   │   ├── 📄 index.ts
│   │   │   │   │   ├── 📄 useMessage.ts
│   │   │   │   │   ├── 📄 useMfa.ts
│   │   │   │   │   └── 📄 useProfile.ts
│   │   │   │   ├── 📁 types/
│   │   │   │   │   └── 📄 index.ts
│   │   │   │   ├── 📁 utils/
│   │   │   │   │   ├── 📄 avatarUtils.ts
│   │   │   │   │   ├── 📄 index.ts
│   │   │   │   │   ├── 📄 mfaService.ts
│   │   │   │   │   ├── 📄 passwordService.ts
│   │   │   │   │   └── 📄 profileService.ts
│   │   │   │   └── 📄 page.tsx
│   │   │   └── 📄 page.tsx
│   │   ├── 📁 components/
│   │   │   ├── 📄 Header.tsx
│   │   │   └── 📄 OneSignalInit.tsx
│   │   ├── 📁 register/
│   │   │   └── 📄 page.tsx
│   │   ├── 📁 siswa/
│   │   │   ├── 📁 chat/
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 complaints/
│   │   │   │   ├── 📁 create/
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 detail/
│   │   │   │   │   └── 📁 [id]/
│   │   │   │   │       └── 📄 page.tsx
│   │   │   │   └── 📁 edit/
│   │   │   │       └── 📁 [id]/
│   │   │   │           └── 📄 page.tsx
│   │   │   ├── 📁 dashboard/
│   │   │   │   ├── 📁 components/
│   │   │   │   │   └── 📄 ComplaintsList.tsx
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 login/
│   │   │   │   └── 📄 page.tsx
│   │   │   └── 📁 profile/
│   │   │       ├── 📁 components/
│   │   │       │   ├── 📄 MessageAlert.tsx
│   │   │       │   ├── 📄 MfaSection.tsx
│   │   │       │   ├── 📄 ProfileSection.tsx
│   │   │       │   ├── 📄 SecuritySection.tsx
│   │   │       │   └── 📄 index.ts
│   │   │       ├── 📁 hooks/
│   │   │       │   ├── 📄 index.ts
│   │   │       │   ├── 📄 useMessage.ts
│   │   │       │   ├── 📄 useMfa.ts
│   │   │       │   └── 📄 useProfile.ts
│   │   │       ├── 📁 types/
│   │   │       │   └── 📄 index.ts
│   │   │       ├── 📁 utils/
│   │   │       │   ├── 📄 avatarUtils.ts
│   │   │       │   ├── 📄 index.ts
│   │   │       │   ├── 📄 mfaService.ts
│   │   │       │   ├── 📄 passwordService.ts
│   │   │       │   └── 📄 profileService.ts
│   │   │       └── 📄 page.tsx
│   │   ├── 📄 favicon.ico
│   │   ├── 🎨 globals.css
│   │   ├── 📄 layout.tsx
│   │   └── 📄 page.tsx
│   ├── 📁 lib/
│   │   ├── 📁 utils/
│   │   │   └── 📄 debounce.ts
│   │   ├── 📄 categories.ts
│   │   ├── 📄 complaintsQueries.ts
│   │   ├── 📄 onesignal.ts
│   │   ├── 📄 onesignalUserHelper.ts
│   │   └── 📄 pocketbase.ts
│   ├── 📁 public/
│   │   ├── 📄 OneSignalSDKWorker.js
│   │   ├── 🖼️ file.svg
│   │   ├── 🖼️ globe.svg
│   │   ├── 🖼️ next.svg
│   │   ├── 🖼️ vercel.svg
│   │   └── 🖼️ window.svg
│   ├── ⚙️ .env.local.example
│   ├── ⚙️ .gitignore
│   ├── 📝 README.md
│   ├── 📄 eslint.config.mjs
│   ├── 📄 next-env.d.ts
│   ├── 📄 next.config.ts
│   ├── ⚙️ package-lock.json
│   ├── ⚙️ package.json
│   ├── 📄 postcss.config.mjs
│   ├── ⚙️ screet.json
│   ├── 📄 tailwind.config.cjs
│   ├── ⚙️ tsconfig.json
│   └── 📄 tsconfig.tsbuildinfo
├── 📝 CHAT_NOTIFICATION_EXAMPLE.md
├── 📝 COMPLAINT_NEW_NOTIFICATION_EXAMPLE.md
├── 📝 COMPLAINT_STATUS_UPDATE_NOTIFICATION_EXAMPLE.md
├── 📝 IMPLEMENTATION_ANALYSIS.md
├── 📝 IMPLEMENTATION_GUIDE.md
├── 📝 INTEGRATION_CHECKLIST.md
├── 📝 ONESIGNAL_DEBUGGING_GUIDE.md
├── 📝 ONESIGNAL_FIX_DOCUMENTATION.md
├── 📝 ONESIGNAL_SETUP.md
├── 📝 POCKETBASE_SCHEMA.md
├── 📝 QUICK_START_SOP.md
├── 📝 README.md
├── 📝 README_IMPLEMENTATION.md
├── 📝 SCHEMA_FIX_GUIDE.md
├── 📝 SETUP_GUIDE.md
├── 📝 SUMMARY_AUDIT.md
└── 📝 VERIFICATION_CHECKLIST.md  - Filter by status (Menunggu, Diproses, Selesai)
  - Search text dalam title/description
  - Sort by date (newest/oldest)
  - Pagination untuk performa

#### Real-time Chat
- Direct messaging dengan admin
- Real-time message delivery (WebSocket)
- Message history persisted
- User/Admin identification dengan avatar
- Typing indicators & online status

### Admin Features

#### Dashboard & Analytics
- **Live Statistics**:
  - Total siswa/user count
  - Pengaduan menunggu (yellow badge)
  - Pengaduan diproses (blue badge)
  - Pengaduan selesai (green badge)
  - Recent complaints table dengan expandable details

- **Visual Design**: Gradient backgrounds, glassmorphism effects, smooth animations

#### Category Management (CMS)
- **Create Category**:
  - Input kategori name dengan validation
  - Prevent duplicate kategori names
  - Real-time availability check
  - Success message sebelum redirect

- **Edit Category**:
  - Edit kategori yang existing
  - Loading state saat fetch data
  - Success confirmation sebelum back
  - Timeout handling (5s) dengan graceful degradation

- **Delete Category**:
  - Confirmation dialog sebelum delete
  - Soft delete (existing complaints tetap reference)
  - Loading spinner saat delete
  - Success/error notification

- **List View**:
  - Table dengan sorting & pagination
  - Empty state dengan icon & message
  - Action buttons (Edit/Delete) dengan icons

#### Complaint Management
- **Advanced Filtering**:
  - Filter by Status (Menunggu, Diproses, Selesai)
  - Filter by Category (dynamic dari database)
  - Filter by Priority (Low, Medium, High)
  - Filter by Student/Creator (dropdown)
  - Filter by Date Range (from-to)
  - Filter by Month & Year
  - Search text dalam title/description
  - Filter mode selector (toggle antara filter types)

- **Complaint Details**:
  - Full complaint info dengan student details
  - Photo preview (if ada bukti)
  - Timeline dari status changes
  - Admin feedback/reply

- **Status Management**:
  - Quick update status (Menunggu → Diproses → Selesai)
  - Real-time sync ke user's dashboard
  - Status color coding (yellow/blue/green)

- **Feedback System**:
  - Add feedback untuk complaint
  - Edit existing feedback
  - Delete feedback
  - Text formatting support
  - Auto-notify user via real-time

- **Bulk Operations**:
  - Select multiple complaints
  - Bulk status update
  - Bulk delete (dengan confirmation)

#### User Management
- View all registered users
- User statistics
- Last login tracking
- MFA status indicator
- Admin status management (toggle isAdmin)

#### Real-time Chat for Admin
- **Chat Dashboard**:
  - List all users dengan unread count
  - Search users
  - Select user untuk chat

- **Chat Interface**:
  - Message history dengan scroll
  - Send/receive messages real-time
  - Message timestamp
  - User avatar & status

#### Profile & Security
- Same as user profile management
- Additional: Admin-specific settings
- Security log (optional)
- Activity tracking

---

## 🎨 UI/UX Improvements

### Icons & Visual System
- **Lucide React Icons**: 600+ professionally designed SVG icons
  - All emoji replacements (👤 → User, 🚪 → LogOut, 📊 → BarChart3, dll)
  - Consistent sizing & styling
  - Accessible color contrasts
  - Hover & active states

### Design System
- **Color Palette**:
  - Primary: Blue to Purple gradient
  - Success: Green (#22c55e)
  - Warning: Yellow (#eab308)
  - Error: Red (#ef4444)
  - Neutral: Slate grays

- **Components**:
  - Buttons: Gradient, solid, outline variants
  - Cards: Glassmorphism with backdrop blur
  - Forms: Proper spacing, labels, validation
  - Tables: Sortable, responsive, pagination
  - Modals: Smooth animations, focus management
  - Alerts: Success/error/warning states

### Animations & Transitions
- Page load animations
- Smooth transitions antara pages
- Loading spinners & skeletons
- Hover effects pada interactive elements
- Framer Motion untuk complex animations

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px)
- Touch-friendly buttons & spacing
- Optimized untuk landscape & portrait
- Tested di: Chrome, Firefox, Safari, Mobile browsers

### Loading States
- Loading indicator sebelum render
- Skeleton screens untuk data fetching
- Loading buttons dengan spinners
- Timeout handling (5s default)
- Graceful error fallbacks
- Success notifications dengan countdown

---

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
4. Click **Import**, buat account
   - Email: `user@example.com`, Password: `password123`
   - Optional: Enable MFA dengan TOTP app

2. **Setup Profile**
   - Go to Profile
   - Upload foto (avatar)
   - Edit nama & password

3. **Make Complaint**
   - Click "Dashboard" → "Buat Pengaduan"
   - Isi:
     - **Title**: Judul pengaduan
     - **Description**: Detail masalah
     - **Category**: Pilih dari list kategori admin
     - **Priority**: Low/Medium/High
     - **Location**: Tempat kejadian
     - **Photo**: Upload bukti (optional)
   - Submit → Realtime tracking status
   - Header menampilkan menu admin-only

2. **Manage Kategori** ✨
   - Click "Kategori" di header
   - **View**: Table dengan semua kategori
   - **Create**: Click "Tambah Kategori" → input name → save
   - **Edit**: Click edit icon → change name → loading + success message
   - **Delete**: Click delete icon → confirm → loading + notification
   - Real-time validation (prevent duplicates)

3. **Dashboard Analytics**
   - Main dashboard menampilkan:
     - Total siswa (Users icon)
     - Pengaduan menunggu (Clock icon)
     - Pengaduan diproses (Hourglass icon)
     - Pengaduan selesai (CheckCircle icon)
     - Recent complaints table
   - All stats update real-time

4. **Manage Complaints** (Advanced Filtering)
   - Click "Complaints" di header
   - **Filter by**:
     - Status: Semua/Menunggu/Diproses/Selesai
     - Category: Dynamic list dari admin kategori
     - Priority: Low/Medium/High
     - Student: Dropdown list
     - Date Range: From-To picker
     - Month & Year: Year selector + month picker
     - Text Search: Search dalam title/description
   - **View Details**:
     - Student info (name, email)
     - Complaint full text
     - Photos (if uploaded)
     - Priority & category (color-coded)

5. **Update Complaint Status**
   - From complaints list, click status badge
   - Choose: Menunggu → Diproses → Selesai
   - Real-time sync ke user dashboard
   - User notified instantly

6. **Send Feedback**
   - Click complaint → "Feedback" section
   - Type feedback message
   - Send → notification ke user
   - User bisa lihat feedback real-time

7. **Chat Management**
   - Click "Admin Chat" di header
   - Select user dari dropdown
   - See message history
   - Send reply → instant delivery

8. **User Management** (via dashboard)
   - See total users
   - View last login info
   - Check MFA status
   - Toggle admin role (if needed)
6. **Rate & Feedback**
   - Setelah complaint selesai ("Selesai" status)
   - Berikan rating (1-5 stars)
   - Optional feedback text

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

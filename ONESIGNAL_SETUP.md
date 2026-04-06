# Integrasi OneSignal - Setup Guide

## 📋 Skenario Notifikasi

Aplikasi akan mengirimkan 3 jenis notifikasi:

1. **Chat Notifications** - Saat ada pesan chat baru
   - Admin menerima notifikasi dari siswa atau pengguna lain
   - Siswa menerima notifikasi dari admin

2. **New Complaint Notifications** - Saat siswa membuat laporan baru
   - Admin menerima notifikasi dengan detail laporan
   - Siswa menerima konfirmasi laporan diterima

3. **Status Update Notifications** - Saat status laporan berubah
   - Siswa menerima notifikasi perubahan status: pending → diproses → selesai/ditolak
   - Admin menerima notifikasi jika admin lain mengubah status

## 🔑 Konfigurasi yang Diperlukan

### 1. File `.env.local` (Frontend)

Tambahkan di file `frontend/.env.local`:

```
NEXT_PUBLIC_ONESIGNAL_API_KEY=YOUR_REST_API_KEY
```

### 2. Dapatkan OneSignal Credentials

1. Buat akun di [OneSignal.com](https://onesignal.com)
2. Buat aplikasi baru "Web Push"
3. Dapatkan:
   - **App ID**: `547121ee-9739-42af-af9e-c6828547d872` (sudah ada di kode)
   - **REST API Key**: Masukkan ke `.env.local`
   - **Auth Token**: Untuk backend (jika diperlukan)

### 3. Service Worker

Service Worker file sudah tersedia di:
```
/public/OneSignalSDKWorker.js
```

Pastikan file ini accessible di root public folder.

## 🔧 Implementasi di Aplikasi

### A. Chat Notifications

**Lokasi:** `frontend/app/admin/chats/hooks/useSendMessage.ts`

Tambahkan setelah pesan berhasil dikirim:

```typescript
import { sendChatNotification, notifyAdminsOfNewChat } from "./useNotifications";

// Di dalam hook sendMessage, setelah pesan berhasil dibuat:
if (recipient.isAdmin) {
  // Notify admin tentang pesan baru
  await notifyAdminsOfNewChat(sender, messageContent, [recipient]);
} else {
  // Notify user tentang pesan baru
  await sendChatNotification(recipient, sender, messageContent);
}
```

### B. New Complaint Notifications

**Lokasi:** `frontend/app/siswa/complaints/create/page.tsx`

Tambahkan setelah complaint berhasil dibuat:

```typescript
import { notifyAdminsOfNewComplaint } from "../../hooks/useNotifications";

// Di dalam form submission:
try {
  const newComplaint = await pb.collection("complaints").create({
    title,
    description,
    location,
    status: "pending",
    creator: pb.authStore.model?.id,
    photo: uploadedPhoto,
  });

  // Fetch admin users
  const admins = await pb.collection("users").getFullList({
    filter: 'isAdmin = true'
  });

  // Send notification ke semua admin
  await notifyAdminsOfNewComplaint(newComplaint, pb.authStore.model, admins);
  
  router.push("/siswa/complaints");
} catch (error) {
  console.error("Error creating complaint:", error);
}
```

### C. Status Update Notifications

**Lokasi:** `frontend/app/admin/complaints/components/` (di update status component)

Tambahkan saat status diubah:

```typescript
import { 
  notifyComplaintStatusChange,
  notifyAdminsOfStatusChange 
} from "../hooks/useNotifications";

// Di dalam function updateComplaintStatus:
try {
  const oldStatus = complaint.status;
  
  const updated = await pb.collection("complaints").update(complaintId, {
    status: newStatus,
    // ... field lainnya
  });

  // Get complaint creator
  const creator = await pb.collection("users").getOne(complaint.creator);
  
  // Notify creator about status change
  await notifyComplaintStatusChange(updated, creator.id, newStatus);

  // Notify other admins
  const admins = await pb.collection("users").getFullList({
    filter: 'isAdmin = true'
  });
  
  await notifyAdminsOfStatusChange(
    updated,
    pb.authStore.model,
    oldStatus,
    newStatus,
    admins
  );
  
  setComplaint(updated);
} catch (error) {
  console.error("Error updating complaint:", error);
}
```

## 📱 Cara User Subscribe ke Notifikasi

1. User membuka aplikasi
2. OneSignal automatic prompt muncul
3. User klik "Allow" atau "Subscribe"
4. OneSignal SDK akan menangani subscription
5. User akan menerima notifikasi

## 🧪 Testing

### Test dari OneSignal Dashboard:

1. Masuk ke OneSignal Dashboard
2. Pilih aplikasi Anda
3. Buat "Campaign" baru
4. Select "Transactional" → "REST API"
5. Gunakan endpoint yang sudah tersedia di `lib/onesignal.ts`

### Test dari Browser Console:

```javascript
// Check OneSignal status
window.OneSignalDeferred.push(async function(OneSignal) {
  const permission = await OneSignal.getNotificationPermission();
  console.log("Permission:", permission);
  
  const id = await OneSignal.getUserId();
  console.log("OneSignal User ID:", id);
  
  const subscription = await OneSignal.getSubscriptionAsync();
  console.log("Subscription:", subscription);
});
```

## 🚨 Troubleshooting

### Notifikasi tidak terkirim:
1. Pastikan API Key sudah benar di `.env.local`
2. Pastikan rest API Key memiliki permission "Messages"
3. Check OneSignal Dashboard > Messages untuk error logs

### Service Worker Error:
1. Pastikan file `OneSignalSDKWorker.js` ada di public folder
2. Cek browser console untuk error messages
3. Verify file permissions

### User tidak terlihat di OneSignal:
1. Buka aplikasi di browser (trigger SDK)
2. Allow notification permissions
3. Check OneSignal Dashboard > Audience > All Users

## 📚 File-file yang dibuat:

- `frontend/app/components/OneSignalInit.tsx` - Inisialisasi OneSignal
- `frontend/lib/onesignal.ts` - Service untuk mengirim notifikasi
- `frontend/app/admin/chats/hooks/useNotifications.ts` - Hook chat notifications
- `frontend/app/admin/complaints/hooks/useNotifications.ts` - Hook complaints notifications
- `frontend/.env.local` - Konfigurasi (perlu dibuat)

## ✅ Checklist Implementasi:

- [ ] Tambahkan `NEXT_PUBLIC_ONESIGNAL_API_KEY` ke `.env.local`
- [ ] Test OneSignal initialization di browser devtools
- [ ] Integrate chat notification di `useSendMessage` hook
- [ ] Integrate new complaint notification di create page
- [ ] Integrate status update notification di update function
- [ ] Test mengirim notifikasi dari OneSignal Dashboard
- [ ] Verify notification muncul di browser
- [ ] Test click handling (routing ke halaman yang tepat)

---

**Note:** All functions maintain existing functionality - hanya ditambahkan notifikasi tanpa mengubah flow yang sudah ada.

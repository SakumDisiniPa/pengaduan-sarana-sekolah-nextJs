# OneSignal Integration Checklist

Panduan lengkap untuk mengintegrasikan OneSignal notifications ke aplikasi.

## ✅ File-file yang Sudah Dibuat

### Core Implementation Files:
- ✅ `frontend/app/components/OneSignalInit.tsx` - Inisialisasi OneSignal SDK
- ✅ `frontend/lib/onesignal.ts` - Service untuk mengirim notifikasi
- ✅ `frontend/lib/onesignalUserHelper.ts` - Helper untuk user tagging
- ✅ `frontend/app/admin/chats/hooks/useNotifications.ts` - Hook chat notifications
- ✅ `frontend/app/admin/complaints/hooks/useNotifications.ts` - Hook complaints notifications

### Documentation & Examples:
- ✅ `ONESIGNAL_SETUP.md` - Dokumentasi setup lengkap
- ✅ `.env.local.example` - Template environment variables
- ✅ `CHAT_NOTIFICATION_EXAMPLE.md` - Contoh implementasi chat
- ✅ `COMPLAINT_NEW_NOTIFICATION_EXAMPLE.md` - Contoh implementasi laporan baru
- ✅ `COMPLAINT_STATUS_UPDATE_NOTIFICATION_EXAMPLE.md` - Contoh implementasi status update

### Service Worker:
- ✅ `OneSignalSDKWorker.js` - Sudah ada di `/public/OneSignalSDK-v16-ServiceWorker/OneSignalSDK-v16-ServiceWorker/`

## 📋 Langkah-langkah Implementasi

### Step 1: Konfigurasi .env.local
```bash
# Buat file frontend/.env.local
cp frontend/.env.local.example frontend/.env.local
```

Tambahkan REST API Key dari OneSignal:
```
NEXT_PUBLIC_ONESIGNAL_API_KEY=YOUR_REST_API_KEY_HERE
```

### Step 2: Verifikasi Service Worker
Service Worker file sudah ada di lokasi yang tepat:
```
public/OneSignalSDKWorker.js
```

Pastikan file ini accessible dan tidak diubah.

### Step 3: Implementasi Chat Notifications (Optional - Recommend)

**File yang diubah:** `frontend/app/admin/chats/hooks/useSendMessage.ts`

Ganti seluruh isi dengan kode dari `CHAT_NOTIFICATION_EXAMPLE.md`

**Atau** tambahkan langsung ini setelah message berhasil dibuat:
```typescript
import { sendChatNotification } from "./useNotifications";

// Setelah: await pb.collection("chats").create({...})
if (admin) {
  await sendChatNotification(selectedUser, admin, text.trim()).catch(err => 
    console.warn("Notification error:", err)
  );
}
```

### Step 4: Implementasi New Complaint Notifications (Required)

**File yang diubah:** `frontend/app/siswa/complaints/create/page.tsx`

Tambahkan import:
```typescript
import { notifyAdminsOfNewComplaint } from "@/app/admin/complaints/hooks/useNotifications";
```

Di dalam `handleSubmit`, setelah complaint berhasil dibuat:
```typescript
const newComplaint = await pb.collection("complaints").create(formData);

// Tambahkan ini:
try {
  const admins = await pb.collection("users").getFullList({
    filter: 'isAdmin = true'
  });
  if (admins.length > 0) {
    await notifyAdminsOfNewComplaint(newComplaint, user, admins);
  }
} catch (err) {
  console.warn("Notification error:", err);
}
```

### Step 5: Implementasi Status Update Notifications (Required)

**File yang diubah:** `frontend/app/admin/complaints/detail/[id]/page.tsx`

Tambahkan import:
```typescript
import { 
  notifyComplaintStatusChange,
  notifyAdminsOfStatusChange 
} from "@/app/admin/complaints/hooks/useNotifications";
```

Update `handleUpdateStatus` function lihat contoh di `COMPLAINT_STATUS_UPDATE_NOTIFICATION_EXAMPLE.md`

Key part:
```typescript
try {
  await updateComplaintStatus(id, newStatus);
  const updated = await pb.collection("complaints").getOne(id);
  
  // Notify creator
  await notifyComplaintStatusChange(updated, updated.creator, newStatus).catch(e => 
    console.warn("Notification error:", e)
  );
  
  // Notify other admins
  const admins = await pb.collection("users").getFullList({ filter: 'isAdmin = true' });
  await notifyAdminsOfStatusChange(updated, pb.authStore.model, oldStatus, newStatus, admins)
    .catch(e => console.warn("Notification error:", e));
} catch (err) {
  // Handle error
}
```

### Step 6: Setup User Tagging (Optional tapi Recommended)

**File:** `frontend/app/siswa/login/page.tsx` atau `frontend/app/admin/login/page.tsx`

Setelah user berhasil login:
```typescript
import { setupOneSignalUser } from "@/lib/onesignalUserHelper";

// Setelah authentication berhasil:
await setupOneSignalUser(userData);
```

### Step 7: Test Aplikasi

1. **Clear browser cache & localStorage**
   ```javascript
   localStorage.clear()
   sessionStorage.clear()
   ```

2. **Test Chat Notifications**
   - Login sebagai admin
   - Buka chat
   - Kirim pesan ke user
   - User seharusnya menerima notifikasi

3. **Test New Complaint Notifications**
   - Login sebagai siswa
   - Buat laporan baru
   - Admin seharusnya menerima notifikasi

4. **Test Status Update Notifications**
   - Login sebagai admin
   - Buka detail laporan yang ada
   - Ubah status
   - Siswa/creator seharusnya menerima notifikasi
   - Admin lain seharusnya menerima notifikasi perubahan

4. **Check OneSignal Dashboard**
   - Visit: https://app.onesignal.com
   - Masuk ke aplikasi Anda
   - Check "Messages" tab untuk delivery status
   - Check "All Users" untuk list subscribers

## 🔍 Debugging

### Browser Console Commands:
```javascript
// Check OneSignal status
window.OneSignalDeferred.push(async function(OneSignal) {
  console.log("User ID:", await OneSignal.getUserId());
  console.log("Permission:", await OneSignal.getNotificationPermission());
  console.log("Subscription:", await OneSignal.getSubscriptionAsync());
});

// Check OneSignal ID di localStorage
console.log(localStorage.getItem("oneSignalId"));
```

### Troubleshooting:
- **Notifikasi tidak terkirim?** 
  - Check `.env.local` API Key
  - Check OneSignal Dashboard → Messages → Logs
  - Verify user has permission to receive notifications

- **Service Worker Error?**
  - Check `public/OneSignalSDKWorker.js` exists
  - Clear browser cache
  - Check browser console for errors

- **User tidak muncul di OneSignal?**
  - User harus open aplikasi & allow notifications
  - Check browser notification permission
  - Clear browser cache dan reload

## 📊 Monitoring

Setelah implementasi, monitor di OneSignal Dashboard:

1. **Campaign/Messages** → Check delivery rates
2. **Audience** → All Users → See subscribers
3. **Analytics** → Click rates, delivery rates
4. **Logs** → Detailed error logs

## 🎯 Summary

**Apa yang sudah dilakukan:**
- OneSignal SDK sudah ter-integrate di layout
- Service ini sudah siap mengirim notifikasi ke users
- Hooks sudah dibuat untuk 3 skenario notification
- Documentation & examples sudah tersedia

**Yang perlu dilakukan:**
1. Setup `.env.local` dengan API Key
2. Integrate hooks ke 3 pages (chat, complaint create, complaint detail)
3. Test di browser
4. Monitor di OneSignal Dashboard

**Manfaat:**
✅ Chat dengan sender & content terekspor  
✅ Admin notified saat laporan baru  
✅ User notified saat status laporan berubah  
✅ Non-blocking - jika notification gagal, flow tetap jalan  
✅ Tidak mengubah fungsionalitas yang ada  

---

**Pertanyaan?** Lihat file dokumentasi:
- `ONESIGNAL_SETUP.md` - Setup lengkap
- `CHAT_NOTIFICATION_EXAMPLE.md` - Chat detail
- `COMPLAINT_NEW_NOTIFICATION_EXAMPLE.md` - New Complaint detail
- `COMPLAINT_STATUS_UPDATE_NOTIFICATION_EXAMPLE.md` - Status Update detail

# OneSignal Notification Debugging Guide

## 🔍 Checklist untuk Debug

### 1. ✅ Check Environment Variable
```bash
cd frontend

# Lihat apa isi env.local
cat .env.local

# Seharusnya ada:
# NEXT_PUBLIC_ONESIGNAL_API_KEY=YOUR_REST_API_KEY_HERE
# atau ONE_SIGNAL_APP_API_KEY=... (untuk server)
```

**⚠️ PENTING:** Gunakan `REST API Key`, BUKAN App API Key!

---

### 2. ✅ Check Browser Console (Admin Browser)

Buka **DevTools** (F12) → **Console** tab, cari log ini:

```javascript
// Notifikasi 1: OneSignal Initialized
"OneSignal initialized successfully"

// Notifikasi 2: Subscription Status
"OneSignal Status: { onesignalId: "...", isSubscribed: true, isPushEnabled: true }"

// Jika ada notifikasi diterima:
"Notification received (foreground):"
```

**Jika tidak ada log = OneSignal SDK tidak load!**
- Check network tab → OneSignalSDK.page.js downloaded?
- Check OneSignalSDKWorker.js di cache?

---

### 3. ✅ Check Admin Allow Notification

Di browser admin:
1. Klik icon **🔔 Notification Bell** (kanan atas URL bar)
2. Seharusnya show "Notification" permission status
3. Jika "Block" → click "Reset" → Reload page
4. OneSignal prompt seharusnya muncul → Click "Allow"

**Jika sudah "Allow":**
- Check OneSignal Dashboard → Audience → All Users
- Admin user seharusnya ada dengan subscription active

---

### 4. ✅ Check Server Logs (Terminal npm)

Saat buat laporan baru, lihat logs di terminal:

```
Sending notification to admins: { count: 1, title: '[LAPORAN BARU] x', hasApiKey: true }
Sending payload: {
  app_id: "547121ee-9739-42af-af9e-c6828547d872",
  userIds: 1,
  title: "[LAPORAN BARU] x",
  channel: "push"
}
Notification sent successfully: {
  id: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  errors: {}
}
```

**Jika ada error di response:**
```
OneSignal API error response: {
  status: 400,
  error: { errors: [...] },
  userIds: [...]
}
```
→ Cek error message untuk lihat apa masalahnya

---

### 5. ✅ Check OneSignal Dashboard

1. Go to https://app.onesignal.com
2. Select your app
3. **Messages** tab → Lihat apakah notifikasi terkirim:
   - ✅ Status "Delivered" - notifikasi sampai ke delivery network
   - ❌ Status "Failed" - ada error di OneSignal
   - ⏳ Status "Throttled" - terlalu banyak notifikasi

4. **Audience** tab → All Users
   - Admin user seharusnya ada
   - Status: "Active" atau "Subscribed"

---

### 6. ✅ Test Notifikasi Manual di OneSignal

1. OneSignal Dashboard → **Messages** tab
2. Click **"New Campaign"**
3. Select **"Transactional"** → **"OneSignal API"**
4. Create test notification ke admin user
5. Klik send

**Jika berhasil dari OneSignal Dashboard tapi tidak dari API:**
→ Ada masalah di API Key atau payload format

---

## 🐛 Common Issues & Solutions

### Issue 1: "OneSignal initialized successfully" tidak muncul
**Penyebab:** OneSignal SDK tidak load dari CDN  
**Solusi:**
```bash
# Clear browser cache
Ctrl+Shift+Delete → Clear all
# atau 
Ctrl+F5 (hard refresh)

# Restart dev server
npm run dev
```

### Issue 2: Subscription status `isPush: false / isPushEnabled: false`
**Penyebab:** Browser belum allow notifikasi  
**Solusi:**
1. Click 🔔 notification bell → "Reset" permission
2. Reload page
3. Click "Allow" di OneSignal prompt
4. Check console lagi

### Issue 3: API error `{"errors": {"invalid_external_ids": [...]}}`
**Penyebab:** User ID format salah atau user belum subscribed  
**Solusi:**
- Admin user di PocketBase harus ada dengan ID yang unique
- Admin harus allow notifikasi dulu sebelum bisa terima di OneSignal

### Issue 4: Payload sent successfully tapi notif tidak muncul
**Penyebab:** Browser tab tidak active, atau notification di-dismiss  
**Solusi:**
- Keep browser tab ACTIVE saat test
- Check notification center (Windows: ⊕ notification area)
- Check OneSignal Dashboard untuk confirm delivered

---

## 📝 Debug Steps Lengkap

1. **Buka admin browser** → F12 → Console
2. **Lihat OneSignal logs** (lihat di step 4 atas)
3. **Check subscription status** - harus `isPush: true`
4. **Check server logs** - harus show "Notification sent successfully"
5. **Check OneSignal Dashboard** - Message status harus "Delivered"
6. **Tunggu 2-3 detik** - notifikasi mungkin delayed
7. **Klik browser notification bell** - check notification history

---

## 🔧 Enable Debug Mode (Advanced)

Edit `app/components/OneSignalInit.tsx`:
```typescript
// Di dalam OneSignal.init():
const config: any = {
  appId: "547121ee-9739-42af-af9e-c6828547d872",
  notifyButton: { enable: true },
};

// Tambah ini untuk logging lebih detail:
OneSignal.Debug.setLogLevel("debug"); // BUKAN production
```

Sekarang console akan show lebih banyak OneSignal debug messages.

---

## ✅ Expected Flow

```
1. Admin open browser
   ↓
2. OneSignal SDK load & init
   ↓
3. Admin allow notification permission
   ↓
4. OneSignal subscribe admin → show di OneSignal Dashboard
   ↓
5. Siswa buat laporan
   ↓
6. Server kirim ke OneSignal API
   ↓
7. OneSignal deliver to admin
   ↓
8. Admin browser terima & show notifikasi
   ↓
9. Admin klik notifikasi → navigate ke /admin/complaints
```

Jika ada step yang skip → cek di guide atas!

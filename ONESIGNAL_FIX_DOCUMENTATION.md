# Fix OneSignal API - Dokumentasi Perubahan

## 🔧 Perubahan yang Dilakukan

Berdasarkan dokumentasi resmi OneSignal API v1 Push Notification, ada beberapa perubahan penting:

### 1. Authorization Header
**Sebelumnya (SALAH):**
```
Authorization: Basic ${API_KEY}
```

**Sekarang (BENAR):**
```
Authorization: Key ${API_KEY}
```

### 2. Targeting Users
**Sebelumnya (tidak didukung):**
```json
{
  "include_external_user_ids": ["user1", "user2"]
}
```

**Sekarang (BENAR - sesuai dokumentasi):**
```json
{
  "include_aliases": {
    "external_id": ["user1", "user2"]
  },
  "target_channel": "push"
}
```

### 3. API Endpoint
**Sebelumnya:**
```
https://onesignal.com/api/v1/notifications
```

**Sekarang:**
```
https://onesignal.com/api/v1/notifications?c=push
```

## 📝 File yang Diupdate

- ✅ `app/actions/notifications.ts`
  - Updated `serverSendBulkNotification()` function
  - Updated `serverSendNotification()` function
  - Fixed headers & payload structure

## 🔑 API Key yang Benar

**PENTING:** Pastikan Anda menggunakan **REST API Key**, BUKAN App API Key!

1. Go to https://app.onesignal.com
2. Select your app
3. Go to Settings → Keys & IDs
4. Copy **REST API Key** (bukan App API Key)
   - Format: biasanya mulai dengan `ZmU5ZmY0NmUtYTA4YS00...` (Base64)
   - Panjang: ~80 karakter
5. Paste ke `frontend/.env.local`:
   ```
   NEXT_PUBLIC_ONESIGNAL_API_KEY=ZmU5ZmY0NmUtYTA4YS00...
   ```

## ✅ Sekarang Notifikasi Seharusnya Bekerja!

```bash
cd frontend
npm run dev
```

Test:
1. Buat laporan baru sebagai siswa
2. Admin seharusnya menerima notifikasi
3. Check browser notification + OneSignal Dashboard

Jika masih gagal, check:
```bash
# Verify API Key di .env.local
cat .env.local | grep ONESIGNAL
```

## 📚 Referensi Dokumentasi

Sesuai dengan dokumentasi OneSignal API v1:
- **Endpoint:** POST `/notifications?c=push`
- **Header:** `Key ${REST_API_KEY}`
- **Targeting:** `include_aliases` dengan `external_id`
- **Channel:** `target_channel: "push"`

Dokumentasi lengkap: https://documentation.onesignal.com/reference/create-notification

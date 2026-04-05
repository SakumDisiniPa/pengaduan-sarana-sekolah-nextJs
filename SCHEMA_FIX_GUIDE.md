# 🔧 SCHEMA FIX - PANDUAN LENGKAP

## 👉 STEP-BY-STEP: Perbarui Complaints Collection

### Langkah 1: Buka PocketBase Admin UI
```
URL: http://127.0.0.1:8090/_/
```

---

### Langkah 2: Edit Collection "complaints"

1. Buka **Collections** → **complaints**
2. Klik **Edit Collection** (icon pensil)
3. Pergi ke tab **SCHEMA**

---

### Langkah 3: Tambah Field Baru

#### ✅ Field 3: `location` (CONFIRM)
- **Name:** `location`
- **Type:** `Text`
- **Required:** ✓ YES
- **Description:** "Lokasi pengaduan (misal: Kelas A, Perpustakaan)"

#### ✅ Field 4: `photo` (CONFIRM)
- **Name:** `photo`
- **Type:** `Files`
- **Required:** ✗ NO
- **Description:** "Foto bukti pengaduan"

#### ✅ Field 5: `category`
- **Name:** `category`
- **Type:** `Select`
- **Required:** ✓ YES
- **Values:** (copy-paste ini)
  ```
  AC Rusak
  Lantai Retak
  Atap Bocor
  Pintu Rusak
  Jendela Rusak
  Meja Rusak
  Kursi Rusak
  Pencahayaan Rusak
  Kamar Mandi Rusak
  Taman Tidak Terawat
  Lainnya
  ```

#### ✅ Field 6: `priority`
- **Name:** `priority`
- **Type:** `Select`
- **Required:** ✗ NO (default: "medium")
- **Values:**
  ```
  low
  medium
  high
  ```

#### ✅ Field 7: `deadline`
- **Name:** `deadline`
- **Type:** `Date`
- **Required:** ✗ NO
- **Description:** "Target tanggal penyelesaian"

#### ✅ Field 8: `feedback`
- **Name:** `feedback`
- **Type:** `Text (long)`
- **Required:** ✗ NO
- **Description:** "Umpan balik/progress update dari admin"

#### ✅ Field 9: `estimated_cost`
- **Name:** `estimated_cost`
- **Type:** `Number`
- **Required:** ✗ NO
- **Description:** "Estimasi biaya perbaikan"

---

### Langkah 4: Update Collection Rules

#### Perbarui `viewRule`:
```
Ganti dari: ""
Menjadi: ""
(tetap public, tapi nantinya akan di-filter di frontend)
```

#### Update `listRule`:
```
Tetap: ""
(semua user bisa list pengaduan)
```

---

### Langkah 5: SAVE

Klik tombol **SAVE** di bawah

---

## 📋 Checklist Fields

```
✓ id (sudah ada - primary key)
✓ title (sudah ada - text)
✓ description (sudah ada - text)
✓ status (sudah ada - text)
✓ created (sudah ada - autodate)
✓ updated (sudah ada - autodate)
✓ creator (seharusnya ada untuk relation, check!)
---
□ location (TAMBAH - TEXT, required)
□ photo (TAMBAH - FILES, optional)
□ category (TAMBAH - SELECT, required)
□ priority (TAMBAH - SELECT, optional)
□ deadline (TAMBAH - DATE, optional)
□ feedback (TAMBAH - TEXT long, optional)
□ estimated_cost (TAMBAH - NUMBER, optional)
```

---

## ⚠️ PERHATIAN

Setelah menambah fields, **JANGAN LUPA**:

1. ✅ Verify di database records sudah bisa punya values baru
2. ✅ Update TypeScript types di frontend (`Complaint` interface)
3. ✅ Update form input untuk submit pengaduan baru
4. ✅ Update display components untuk menampilkan fields baru
5. ✅ Setup database hooks/procedures untuk validasi (OPTIONAL tapi recommended)

---

## 🔗 Relationship Check

### Creator Field
Complaints harus punya **creator** field yang link ke users collection.

**Check apakah sudah ada:**
1. Buka **complaints** collection
2. Cek di SCHEMA apakah ada field `creator` dengan type `Relation`
3. Jika tidak ada, tambahkan:
   - **Name:** `creator`
   - **Type:** `Relation`
   - **Collection:** `users`
   - **Required:** ✓ YES

---

## ✅ Setelah Selesai Schema

Lanjut dengan:
1. Update frontend components
2. Add feedback viewing functionality
3. Implement advanced filters
4. Optimize queries


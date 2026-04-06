/**
 * CONTOH IMPLEMENTASI COMPLAINT NEW NOTIFICATIONS
 * 
 * Update file: frontend/app/siswa/complaints/create/page.tsx
 * 
 * Tambahkan import dan update handleSubmit function
 * untuk mengirim notifikasi ke admin saat laporan baru dibuat.
 */

// ============================================
// 1. TAMBAHKAN IMPORT (di bagian paling atas)
// ============================================

import { notifyAdminsOfNewComplaint } from "@/app/admin/complaints/hooks/useNotifications";

// ============================================
// 2. UPDATE handleSubmit FUNCTION
// ============================================

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!user) return;
  if (!title.trim() || !desc.trim() || !location.trim() || !category.trim()) return;

  setSubmitting(true);
  setError(null);

  try {
    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("description", desc.trim());
    formData.append("location", location.trim());
    formData.append("category", category);
    formData.append("creator", user.id);
    formData.append("status", "menunggu");
    if (photoFile) {
      formData.append("photo", photoFile);
    }

    // 1. CREATE COMPLAINT (existing logic)
    const newComplaint = await pb.collection("complaints").create(formData);

    // 2. TAMBAHAN: Fetch semua admin untuk notifikasi
    try {
      const admins = await pb.collection("users").getFullList({
        filter: 'isAdmin = true',
        fields: 'id,email,name,isAdmin' // Only fetch necessary fields
      });

      // 3. KIRIM NOTIFIKASI KE SEMUA ADMIN
      if (admins.length > 0) {
        await notifyAdminsOfNewComplaint(newComplaint, user, admins);
        console.log(`Notification sent to ${admins.length} admin(s)`);
      }
    } catch (notificationError) {
      // Jangan block flow jika notifikasi gagal
      console.warn("Notification error (non-blocking):", notificationError);
    }

    // 4. REDIRECT (existing logic)
    router.push("/siswa/dashboard?success=true");
  } catch (err: any) {
    setError("Gagal membuat laporan: " + err.message);
    setSubmitting(false);
  }
};

// ============================================
// PENJELASAN PERUBAHAN
// ============================================

/**
 * Perubahan yang dibuat:
 * 
 * 1. Import: 
 *    - Tambahkan import notifyAdminsOfNewComplaint dari hook
 *    
 * 2. Setelah pb.collection("complaints").create():
 *    - Simpan result ke newComplaint variable
 *    - Fetch semua admin dari users collection dengan filter
 *    - Panggil notifyAdminsOfNewComplaint dengan data complaint, user, dan list admin
 *    
 * 3. Error handling:
 *    - Notifikasi error ditangani dalam try-catch terpisah
 *    - Jika notifikasi gagal, user tetap redirect (non-blocking)
 *    - Error ditampilkan di console untuk debugging
 *    
 * 4. TIDAK DIUBAH:
 *    - Parameter function atau return type
 *    - Validasi form
 *    - FormData creation
 *    - Error handling untuk complaint creation
 *    - Router redirect flow
 *    - UI/State management
 *    
 * HASIL:
 * - User membuat laporan → admin menerima notifikasi
 * - Notifikasi berisi: judul laporan, nama user, lokasi
 * - Klik notifikasi → buka halaman admin complaints
 * - Jika notifikasi gagal, laporan tetap dibuat
 */

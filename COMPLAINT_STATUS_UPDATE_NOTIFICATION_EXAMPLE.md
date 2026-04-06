/**
 * CONTOH IMPLEMENTASI COMPLAINT STATUS UPDATE NOTIFICATIONS
 * 
 * Update file: frontend/app/admin/complaints/detail/[id]/page.tsx
 * 
 * Tambahkan import dan update handleUpdateStatus function
 * untuk mengirim notifikasi ke user creator dan admin lainnya
 */

// ============================================
// 1. TAMBAHKAN IMPORT (di bagian paling atas)
// ============================================

import { 
  notifyComplaintStatusChange,
  notifyAdminsOfStatusChange 
} from "@/app/admin/complaints/hooks/useNotifications";

// ============================================
// 2. UPDATE handleUpdateStatus FUNCTION
// ============================================

// OLD CODE (sebelum):
/*
const handleUpdateStatus = async (newStatus: string) => {
  if (!complaint) return;
  setIsUpdatingStatus(true);
  try {
    await updateComplaintStatus(id, newStatus);
    setCurrentStatus(newStatus);
  } catch (err) {
    // Error already handled in service
  } finally {
    setIsUpdatingStatus(false);
  }
};
*/

// NEW CODE (sesudah dengan notifikasi):
const handleUpdateStatus = async (newStatus: string) => {
  if (!complaint) return;
  setIsUpdatingStatus(true);
  
  const oldStatus = currentStatus; // Save untuk notifikasi admin
  
  try {
    // 1. UPDATE STATUS (existing logic)
    await updateComplaintStatus(id, newStatus);
    setCurrentStatus(newStatus);

    // 2. TAMBAHAN: Fetch complaint terbaru untuk data yang lengkap
    try {
      const updatedComplaint = await pb.collection("complaints").getOne(id);
      
      // 3. KIRIM NOTIFIKASI KE CREATOR
      // Beritahu user/siswa bahwa status laporan mereka berubah
      await notifyComplaintStatusChange(
        updatedComplaint,
        updatedComplaint.creator,
        newStatus
      );
      console.log("Notification sent to complaint creator");

      // 4. KIRIM NOTIFIKASI KE ADMIN LAINNYA
      // Beritahu admin lain bahwa ada perubahan status
      try {
        const currentUser = pb.authStore.model;
        const allAdmins = await pb.collection("users").getFullList({
          filter: 'isAdmin = true',
          fields: 'id,email,name,isAdmin'
        });
        
        if (currentUser && allAdmins.length > 0) {
          await notifyAdminsOfStatusChange(
            updatedComplaint,
            currentUser,
            oldStatus,
            newStatus,
            allAdmins
          );
          console.log("Status change notification sent to other admins");
        }
      } catch (adminNotifError) {
        console.warn("Admin notification error (non-blocking):", adminNotifError);
      }
      
    } catch (notificationError) {
      // Jangan block flow jika notifikasi gagal
      console.warn("Notification error (non-blocking):", notificationError);
    }

  } catch (err) {
    // Error already handled in service
  } finally {
    setIsUpdatingStatus(false);
  }
};

// ============================================
// PENJELASAN PERUBAHAN
// ============================================

/**
 * Perubahan yang dibuat:
 * 
 * 1. Import:
 *    - Tambahkan import notifyComplaintStatusChange dan notifyAdminsOfStatusChange
 *    
 * 2. Sebelum update:
 *    - Save oldStatus untuk dibandingkan dengan newStatus
 *    
 * 3. Setelah updateComplaintStatus() berhasil:
 *    - Fetch complaint terbaru dengan getOne() untuk data lengkap
 *    - Panggil notifyComplaintStatusChange untuk beritahu creator
 *    - Fetch semua admin untuk notifikasi status change
 *    - Panggil notifyAdminsOfStatusChange untuk beritahu admin lain
 *    
 * 4. Error handling:
 *    - Setiap notifikasi dalam try-catch tersendiri
 *    - Jika notifikasi gagal, status update tetap jalan (non-blocking)
 *    - Error ditampilkan di console untuk debugging
 *    
 * 5. TIDAK DIUBAH:
 *    - Parameter atau return type dari function
 *    - Logik status update
 *    - UI update (setCurrentStatus)
 *    - Error handling untuk status update itu sendiri
 *    - Struktur loading state
 *    
 * HASIL:
 * - Admin mengubah status laporan
 * - Creator (user yang membuat laporan) menerima notifikasi dengan pesan khusus
 * - Admin lain menerima notifikasi bahwa ada perubahan status
 * - Jika notifikasi gagal, status tetap update
 * 
 * NOTIFIKASI YANG DIKIRIM:
 * - Ke Creator: "Laporan Anda Sedang Diproses", "Laporan Anda Selesai", dll
 * - Ke Admin: "[Admin Name] mengubah status dari [Old Status] ke [New Status]"
 */

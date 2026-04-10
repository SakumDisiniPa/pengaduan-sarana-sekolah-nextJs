/**
 * Hook untuk mengirim notifikasi complaint
 * - Notifikasi ke admin saat complaint baru
 * - Notifikasi ke creator saat status berubah
 */

import { 
  serverSendNotification, 
  serverSendBulkNotification 
} from "@/app/actions/notifications";
import type { User } from "../types";

export interface Complaint {
  id: string;
  title: string;
  description: string;
  status: string;
  creator?: string | User;
  location?: string;
  photo?: string;
}

/**
 * Send notification ke admin tentang complaint baru
 * @param complaint - Data complaint
 * @param creator - User yang membuat complaint
 * @param admins - Daftar admin users
 */
export async function notifyAdminsOfNewComplaint(
  complaint: Complaint,
  creator: User,
  admins: User[]
) {
  try {
    const adminIds = admins.map(admin => admin.id);
    const title = `[LAPORAN BARU] ${complaint.title}`;
    const content = `${creator.name || creator.email} melaporkan masalah di ${complaint.location}`;
    
    const data = {
      type: "new_complaint",
      complaintId: complaint.id,
      creatorName: creator.name || creator.email,
      location: complaint.location,
      webUrl: "/admin/complaints",
    };

    console.log("Siap kirim notif ke Admin:", adminIds);

    return await serverSendBulkNotification(
      adminIds,
      title,
      content,
      data
    );
  } catch (error) {
    console.error("Error notifying admins of new complaint:", error);
    return null;
  }
}

/**
 * Send notification ke creator saat status complaint berubah
 * @param complaint - Data complaint
 * @param creatorId - ID creator
 * @param newStatus - Status baru
 * @param updateDescription - Deskripsi perubahan (optional)
 */
export async function notifyComplaintStatusChange(
  complaint: Complaint,
  creatorId: string,
  newStatus: string,
  updateDescription?: string
) {
  try {
    const statusMessages: Record<string, { title: string; message: string }> = {
      "diproses": {
        title: "Admin - Laporan Diproses",
        message: `Laporan "${complaint.title}" sedang diproses oleh tim admin.`
      },
      "selesai": {
        title: "Admin - Laporan Selesai",
        message: `Laporan "${complaint.title}" telah selesai diperbaiki. Terima kasih atas laporannya.`
      },
      "ditolak": {
        title: "Admin - Laporan Ditolak",
        message: `Laporan "${complaint.title}" ditolak. ${updateDescription || "Silakan hubungi admin untuk informasi lebih lanjut."}`
      }
    };


    const statusInfo = statusMessages[newStatus] || {
      title: "Admin - Pembaruan Status",
      message: `Status laporan "${complaint.title}" telah diperbarui menjadi: ${newStatus}`
    };

    const data = {
      type: "status_update",
      complaintId: complaint.id,
      status: newStatus,
      title: complaint.title,
      webUrl: `/siswa/complaints/detail/${complaint.id}`,
    };

    return await serverSendNotification(
      creatorId,
      statusInfo.title,
      statusInfo.message,
      data
    );
  } catch (error) {
    console.error("Error notifying status change:", error);
    return null;
  }
}

/**
 * Send notification ke student saat admin memberikan balasan/respon
 * @param complaint - Data complaint
 * @param creatorId - ID creator
 * @param replyMessage - Isi balasan admin
 */
export async function notifyStudentOfAdminReply(
  complaint: Complaint,
  creatorId: string,
  replyMessage: string
) {
  try {
    const title = "Admin - Balasan Baru";
    // Bersihkan isi pesan agar tidak terlalu panjang di notifikasi push
    const previewMessage = replyMessage.length > 50 
      ? replyMessage.substring(0, 47) + "..." 
      : replyMessage;
      
    const message = `Admin memberikan balasan: "${previewMessage}"`;

    const data = {
      type: "admin_reply",
      complaintId: complaint.id,
      webUrl: `/siswa/complaints/detail/${complaint.id}`,
    };

    return await serverSendNotification(
      creatorId,
      title,
      message,
      data
    );
  } catch (error) {
    console.error("Error notifying admin reply:", error);
    return null;
  }
}

/**
 * Send notification ke admin tentang perubahan status complaint
 * @param complaint - Data complaint
 * @param changedBy - User yang mengubah status
 * @param oldStatus - Status lama
 * @param newStatus - Status baru
 * @param admins - Daftar admin users
 */
export async function notifyAdminsOfStatusChange(
  complaint: Complaint,
  changedBy: User,
  oldStatus: string,
  newStatus: string,
  admins: User[]
) {
  try {
    const adminIds = admins
      .filter(admin => admin.id !== changedBy.id)
      .map(admin => admin.id);

    if (adminIds.length === 0) return null;

    const title = `Status Laporan Diubah: ${complaint.title}`;
    const content = `${changedBy.name || changedBy.email} mengubah status dari "${oldStatus}" menjadi "${newStatus}"`;
    
    const data = {
      type: "status_changed",
      complaintId: complaint.id,
      changedBy: changedBy.name || changedBy.email,
      status: newStatus,
      webUrl: `/admin/complaints`,
    };

    return await serverSendBulkNotification(
      adminIds,
      title,
      content,
      data
    );
  } catch (error) {
    console.error("Error notifying admins of status change:", error);
    return null;
  }
}

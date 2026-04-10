/**
 * Hook untuk mengirim notifikasi saat ada chat baru
 * Digunakan di admin chat page dan siswa chat page
 */

import { 
  serverSendNotification, 
  serverSendBulkNotification 
} from "@/app/actions/notifications";
import type { User } from "../types";

/**
 * Send chat notification ke user
 * @param recipient - User yang menerima pesan
 * @param sender - User yang mengirim pesan
 * @param messageContent - Isi pesan
 */
export async function sendChatNotification(
  recipient: User,
  sender: User,
  messageContent: string
) {
  try {
    // Potong isi pesan jika terlalu panjang
    const shortContent = messageContent.substring(0, 100);
    const title = "Admin - Pesan Baru";
    
    const data = {
      type: "chat",
      senderId: sender.id,
      senderName: sender.name || sender.email,
      message: shortContent,
      webUrl: "/siswa/chat",
    };


    return await serverSendNotification(
      recipient.id,
      title,
      shortContent,
      data
    );
  } catch (error) {
    console.error("Error sending chat notification:", error);
    return null;
  }
}

/**
 * Send notification ke semua admin tentang chat baru dari user
 * @param sender - User yang mengirim pesan
 * @param messageContent - Isi pesan
 * @param admins - Daftar admin users
 */
export async function notifyAdminsOfNewChat(
  sender: User,
  messageContent: string,
  admins: User[]
) {
  try {
    const adminIds = admins.map(admin => admin.id);
    const shortContent = messageContent.substring(0, 100);
    const title = `Pesan baru dari ${sender.name || sender.email}`;
    
    const data = {
      type: "chat",
      senderId: sender.id,
      senderName: sender.name || sender.email,
      message: shortContent,
      webUrl: "/admin/chats",
    };

    return await serverSendBulkNotification(
      adminIds,
      title,
      shortContent,
      data
    );
  } catch (error) {
    console.error("Error notifying admins:", error);
    return null;
  }
}

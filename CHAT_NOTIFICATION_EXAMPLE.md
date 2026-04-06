/**
 * CONTOH IMPLEMENTASI CHAT NOTIFICATIONS
 * 
 * Update file: frontend/app/admin/chats/hooks/useSendMessage.ts
 * 
 * Ganti isi file dengan kode di bawah ini untuk menambahkan notifikasi
 * saat pesan dikirim, tanpa mengubah fungsionalitas yang ada.
 */

"use client";

import { useState } from "react";
import { pb } from "../../../../lib/pocketbase";
import { sendChatNotification } from "./useNotifications";
import type { User } from "../types";

export const useSendMessage = (admin: User | null | undefined) => {
  const [sending, setSending] = useState(false);

  const send = async (text: string, selectedUser: User | null) => {
    if (!text.trim() || !selectedUser || sending) return false;

    setSending(true);
    try {
      // 1. Create pesan (existing logic)
      const newMessage = await pb.collection("chats").create({
        text: text.trim(),
        sender: admin?.id,
        recipient: selectedUser.id,
      });

      // 2. TAMBAHAN: Kirim notifikasi ke recipient
      if (admin) {
        try {
          await sendChatNotification(selectedUser, admin, text.trim());
          console.log("Notification sent to recipient");
        } catch (notificationError) {
          // Jangan block message sending jika notifikasi gagal
          console.warn("Notification error (non-blocking):", notificationError);
        }
      }

      setSending(false);
      return true;
    } catch (err) {
      console.error("Gagal kirim pesan:", err);
      setSending(false);
      return false;
    }
  };

  return { send, sending };
};

/**
 * PENJELASAN PERUBAHAN:
 * 
 * 1. Import: Tambahkan import dari useNotifications hook
 *    import { sendChatNotification } from "./useNotifications";
 * 
 * 2. Setelah pesan berhasil dibuat (newMessage), kita kirim notifikasi:
 *    - Check jika admin ada
 *    - Panggil sendChatNotification dengan selectedUser (recipient), admin (sender), dan message content
 * 
 * 3. Notifikasi dijalankan dalam try-catch terpisah:
 *    - Jika notifikasi gagal, pesan tetap terkirim (non-blocking)
 *    - Error ditampilkan di console tapi tidak menghentikan proses
 * 
 * 4. TIDAK ADA PERUBAHAN pada:
 *    - Tipe return atau parameter
 *    - Error handling untuk pesan
 *    - Logika UI atau state management
 *    - Fungsionalitas yang sudah ada
 */

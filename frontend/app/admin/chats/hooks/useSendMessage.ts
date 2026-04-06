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
      // 1. Create message
      await pb.collection("chats").create({
        text: text.trim(),
        sender: admin?.id,
        recipient: selectedUser.id,
      });

      // 2. Send notification to recipient
      if (admin) {
        try {
          await sendChatNotification(selectedUser, admin, text.trim());
          console.log("Notification sent to student:", selectedUser.email);
        } catch (notificationError) {
          // Non-blocking error
          console.warn("Notification error:", notificationError);
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


"use client";

import { useState } from "react";
import { pb } from "../../../../lib/pocketbase";
import type { User } from "../types";

export const useSendMessage = (admin: User | null | undefined) => {
  const [sending, setSending] = useState(false);

  const send = async (text: string, selectedUser: User | null) => {
    if (!text.trim() || !selectedUser || sending) return false;

    setSending(true);
    try {
      await pb.collection("chats").create({
        text: text.trim(),
        sender: admin?.id,
        recipient: selectedUser.id,
      });
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

"use client";

import { useEffect, useState } from "react";
import { pb } from "../../../../lib/pocketbase";
import type { Message } from "../types";

export const useChats = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let unsubscribe: (() => void) | null = null;

    const initChats = async () => {
      try {
        const list = await pb.collection("chats").getFullList<Message>({
          sort: "-created",
          expand: "sender,recipient",
          requestKey: null,
        });

        if (!mounted) return;
        setMessages(list);
        setLoading(false);

        // Realtime Subscribe
        unsubscribe = await pb.collection("chats").subscribe("*", async (e) => {
          if (e.action === "create" && mounted) {
            const fullRec = await pb.collection("chats").getOne<Message>(e.record.id, {
              expand: "sender,recipient",
            });
            setMessages((prev) => [fullRec, ...prev]);
          }
        });
      } catch (err) {
        const error = err as { isAbort?: boolean };
        if (!error.isAbort) console.error("Gagal ambil chats:", err);
        if (mounted) setLoading(false);
      }
    };

    initChats();
    return () => {
      mounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return { messages, loading };
};

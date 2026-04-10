"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { decryptData } from "@/lib/crypto";
import { pb } from "@/lib/pocketbase";
import type { Message } from "@/app/admin/chats/types";

export const useSiswaChats = (isReady: boolean) => {
  const user = pb.authStore.model;

  const messages = useLiveQuery(async () => {
    if (!isReady || !user?.id) return [] as Message[];
    
    // Read from Dexie, sorted by created date
    const raw = await db.chats.orderBy("created").toArray();
    
    return raw.map(item => {
      try {
        const decrypted = decryptData(item.data, user.id) as Message;
        // Basic security double-check: ensure the message actually belongs to this user
        if (decrypted.sender === user.id || decrypted.recipient === user.id) {
          return decrypted;
        }
        return null;
      } catch (err) {
        console.error("Decrypt error for message:", item.id, err);
        return null;
      }
    }).filter(m => m !== null) as Message[];
  }, [isReady, user?.id]);

  const loading = isReady && messages === undefined;

  return { 
    messages: messages || [], 
    loading: !isReady || loading 
  };
};

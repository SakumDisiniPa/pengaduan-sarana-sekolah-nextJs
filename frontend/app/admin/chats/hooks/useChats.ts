"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { decryptData } from "@/lib/crypto";
import { pb } from "@/lib/pocketbase";
import type { Message } from "../types";

export const useChats = (isReady: boolean) => {
  const admin = pb.authStore.model;

  const messages = useLiveQuery(async () => {
    if (!isReady || !admin?.id) return [] as Message[];
    
    const raw = await db.chats.orderBy("created").toArray();
    return raw.map(item => {
      try {
        return decryptData(item.data, admin.id) as Message;
      } catch (err) {
        console.error("Decrypt error for message:", item.id, err);
        return null;
      }
    }).filter(m => m !== null) as Message[];
  }, [isReady, admin?.id]);

  const loading = isReady && messages === undefined;

  return { 
    messages: messages || [], 
    loading: !isReady || loading 
  };
};

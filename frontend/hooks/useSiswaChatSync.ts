"use client";

import { useState, useCallback, useEffect } from "react";
import { pb } from "@/lib/pocketbase";
import { db } from "@/lib/db";
import { encryptData } from "@/lib/crypto";

export default function useSiswaChatSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const user = pb.authStore.model;

  const initialSync = useCallback(async () => {
    if (!user || user.isAdmin) return; // Only for students
    
    setIsSyncing(true);
    setError(null);

    try {
      // 1. Fetch Student Chats
      const records = await pb.collection("chats").getFullList({
          sort: "created",
          filter: `sender="${user.id}" || recipient="${user.id}"`,
          expand: "sender,recipient"
      });

      // 2. Fetch Categories (useful for student context)
      const categories = await pb.collection("categories").getFullList();

      // 3. Save to IndexedDB
      await db.transaction("rw", [db.chats, db.categories, db.syncMetadata], async () => {
        // Clear old local data for these specific collections
        await db.chats.clear();
        await db.categories.clear();
        
        // Save Chats
        const encryptedChats = records.map(r => ({
          id: r.id,
          roomId: r.roomId || "",
          created: r.created,
          data: encryptData(r, user.id)
        }));
        await db.chats.bulkAdd(encryptedChats);

        // Save Categories
        const encryptedCats = categories.map(c => ({
          id: c.id,
          data: encryptData(c, user.id)
        }));
        await db.categories.bulkAdd(encryptedCats);
        
        // Update metadata
        await db.syncMetadata.put({ 
          id: "siswa_chats", 
          lastSync: new Date().toISOString() 
        });
      });

      setIsReady(true);
    } catch (err: unknown) {
      console.error("Siswa Sync Error:", err);
      setError(err instanceof Error ? err.message : "Gagal sinkronisasi chat.");
    } finally {
      setIsSyncing(false);
    }
  }, [user]);

  // Handle Realtime updates for Student
  useEffect(() => {
    if (!user || user.isAdmin || !isReady) return;

    let unsubChat: (() => void) | null = null;

    const setupChatRealtime = async () => {
      unsubChat = await pb.collection("chats").subscribe("*", async (e) => {
        const { action, record } = e;
        
        // Security check: Only process if it belongs to this student
        if (record.sender !== user.id && record.recipient !== user.id) return;

        try {
          if (action === "create" || action === "update") {
            const finalRecord = await pb.collection("chats").getOne(record.id, { 
              expand: "sender,recipient",
              requestKey: null 
            });

            await db.transaction("rw", db.chats, async () => {
              await db.chats.put({
                id: finalRecord.id,
                roomId: finalRecord.roomId || "",
                created: finalRecord.created,
                data: encryptData(finalRecord, user.id)
              });
            });
          } else if (action === "delete") {
            await db.chats.delete(record.id);
          }
        } catch (trxErr) {
          console.error("Realtime Siswa Chat Error:", trxErr);
        }
      });
    };

    setupChatRealtime();

    return () => {
      if (unsubChat) unsubChat();
    };
  }, [user, isReady]);

  // Check if we need initial sync
  useEffect(() => {
    if (!user || user.isAdmin) return;

    const checkSyncStatus = async () => {
      const meta = await db.syncMetadata.get("siswa_chats");
      if (!meta) {
        initialSync();
      } else {
        setIsReady(true);
      }
    };

    checkSyncStatus();
  }, [user, initialSync]);

  return { isSyncing, isReady, error, initialSync };
}

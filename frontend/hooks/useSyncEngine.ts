"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { pb } from "@/lib/pocketbase";
import { db } from "@/lib/db";
import { encryptData } from "@/lib/crypto";

export default function useSyncEngine() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [error, setError] = useState<string | null>(null);
  const user = pb.authStore.model;

  // Track if initial sync is done
  const [isReady, setIsReady] = useState(false);

  // COLLECTIONS TO SYNC
  const collections = useMemo(() => ["users", "complaints", "categories", "chats"], []);

  const initialSync = useCallback(async () => {
    if (!user?.isAdmin) return;
    
    setIsSyncing(true);
    setError(null);
    setProgress(0);

    try {
      let completedSteps = 0;
      const totalSteps = collections.length;

      for (const col of collections) {
        // 1. Fetch from server
        // Note: For large datasets, we might want to batch this, but getFullList is fine for moderate sizes.
        const records = await pb.collection(col).getFullList({
            sort: "-created",
            // Include expansions if needed
            expand: col === "chats" ? "sender,recipient" : ""
        });

        // 2. Save to IndexedDB (Encrypted)
        await db.transaction("rw", [db.getTable(col), db.syncMetadata], async () => {
          // Clear old data for a fresh start on initial sync
          await db.getTable(col).clear();
          
          const encryptedRecords = records.map(r => ({
            id: r.id,
            roomId: r.roomId || "", // for chats
            created: r.created,
            lastUpdated: r.updated,
            data: encryptData(r, user.id)
          }));

          await db.getTable(col).bulkAdd(encryptedRecords);
          
          // Update metadata
          await db.syncMetadata.put({ 
            id: col, 
            lastSync: new Date().toISOString() 
          });
        });

        completedSteps++;
        setProgress(Math.round((completedSteps / totalSteps) * 100));
      }

      setIsReady(true);
    } catch (err: unknown) {
      console.error("Initial Sync Error:", err);
      const msg = err instanceof Error ? err.message : "Gagal sinkronisasi data.";
      setError(msg);
    } finally {
      setIsSyncing(false);
    }
  }, [user?.id, user?.isAdmin, collections]);

  // Handle Realtime updates
  useEffect(() => {
    if (!user?.isAdmin || !isReady) return;

    const unsubscribes: Promise<() => void>[] = collections.map(async (col) => {
      return await pb.collection(col).subscribe("*", async (e) => {
        const { action, record } = e;
        
        try {
          if (action === "create" || action === "update") {
            // 1. Fetch full record OUTSIDE transaction if needed
            let finalRecord = record;
            if (col === "chats") {
              try {
                finalRecord = await pb.collection("chats").getOne(record.id, { 
                  expand: "sender,recipient",
                  requestKey: null 
                });
              } catch (expandErr) {
                console.warn("Failed to expand chat record on update:", expandErr);
                // Fallback to non-expanded record if network fails
              }
            }

            // 2. Perform DB operation in transaction
            await db.transaction("rw", db.getTable(col), async () => {
              await db.getTable(col).put({
                id: finalRecord.id,
                roomId: finalRecord.roomId || "",
                created: finalRecord.created,
                lastUpdated: finalRecord.updated,
                data: encryptData(finalRecord, user.id)
              });
            });
          } else if (action === "delete") {
            await db.transaction("rw", db.getTable(col), async () => {
              await db.getTable(col).delete(record.id);
            });
          }
        } catch (trxErr) {
          console.error(`Realtime Sync Error (${col}):`, trxErr);
        }
      });
    });

    return () => {
      unsubscribes.forEach(async (p) => {
        try {
          const unsub = await p;
          unsub();
        } catch (e) {
          console.error("Unsubscribe error:", e);
        }
      });
    };
  }, [user?.id, user?.isAdmin, isReady, collections]);

  // Check if we need initial sync on mount
  useEffect(() => {
    if (!user?.isAdmin) return;

    const checkSyncStatus = async () => {
      const metadata = await db.syncMetadata.toArray();
      if (metadata.length < collections.length) {
        // Missing some collections, start sync
        initialSync();
      } else {
        setIsReady(true);
      }
    };

    checkSyncStatus();
  }, [user?.isAdmin, initialSync, collections.length]);

  return { isSyncing, progress, error, isReady, initialSync };
}

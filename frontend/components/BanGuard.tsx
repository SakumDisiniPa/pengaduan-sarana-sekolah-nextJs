"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { pb } from "@/lib/pocketbase";
import { AuthModel } from "pocketbase";

export default function BanGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const subscriptionRef = useRef<string | null>(null);

  useEffect(() => {
    const user = pb.authStore.model;
    
    // Function to check ban status and redirect
    const checkBanStatus = (record: AuthModel) => {
      if (!record) return;
      
      const isBanned = record.isBanned && record.bannedUntil && new Date(record.bannedUntil) > new Date();
      
      if (isBanned) {
        if (pathname !== "/blocked") {
          router.push("/blocked");
        }
      } else {
        // If they were on /blocked but are no longer banned, redirect them out
        if (pathname === "/blocked") {
          router.push(record.isAdmin ? "/admin" : "/siswa/dashboard");
        }
      }
    };

    // 1. Initial check
    if (user) {
      checkBanStatus(user);
    }

    // 2. Realtime subscription to the current user's record
    if (user?.id && !subscriptionRef.current) {
      subscriptionRef.current = user.id;
      pb.collection("users").subscribe(user.id, (e) => {
        if (e.action === "update") {
          // IMPORTANT: Update local authStore with fresh data from server
          // This keeps the local state in sync without requiring a page refresh
          pb.authStore.save(pb.authStore.token, e.record);
          checkBanStatus(e.record);
        } else if (e.action === "delete") {
          pb.authStore.clear();
          router.push("/");
        }
      });
    }

    // 3. Fallback: Periodic re-fetch (Poll every 30 seconds)
    // Realtime can sometimes drop, so we verify status periodically
    const pollInterval = setInterval(async () => {
      if (pb.authStore.model?.id) {
        try {
          const freshUser = await pb.collection("users").getOne(pb.authStore.model.id);
          if (freshUser) {
            // Update store if different
            if (JSON.stringify(freshUser.isBanned) !== JSON.stringify(pb.authStore.model.isBanned)) {
               pb.authStore.save(pb.authStore.token, freshUser);
               checkBanStatus(freshUser);
            }
          }
        } catch (err) {
          // If 404, user might be deleted
          console.error("Poll error:", err);
        }
      }
    }, 30000);

    // 4. Listener for local authStore changes (manual logouts, etc)
    const unsubscribeStore = pb.authStore.onChange((token, model) => {
      if (model) {
        checkBanStatus(model);
      } else {
        // If logged out, and on a protected page, redirect to home
        if (pathname.startsWith("/siswa") || pathname.startsWith("/admin") || pathname === "/blocked") {
          router.push("/");
        }
      }
    });

    return () => {
      if (subscriptionRef.current) {
        pb.collection("users").unsubscribe(subscriptionRef.current);
        subscriptionRef.current = null;
      }
      clearInterval(pollInterval);
      unsubscribeStore();
    };
  }, [pathname, router]);

  return null;
}

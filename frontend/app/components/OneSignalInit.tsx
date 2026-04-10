"use client";

import { useEffect } from "react";
import { pb } from "@/lib/pocketbase";

export interface OneSignalConfig {
  appId: string;
  notifyButton: {
    enable: boolean;
  };
  allowLocalhostAsSecureOrigin?: boolean;
}

interface OneSignalInterface {
  init: (config: OneSignalConfig) => Promise<void>;
  login: (id: string) => Promise<void>;
  Debug: { setLogLevel: (val: string) => void };
  Notifications: {
    permission: boolean;
    requestPermission: () => Promise<void>;
    addEventListener: (name: string, cb: (event: { notification: { data: Record<string, unknown> } }) => void) => void;
  };
  User: {
    PushSubscription: {
      optedIn: boolean;
      addEventListener: (name: string, cb: (subscription: { id: string; optedIn: boolean; token?: string }) => void) => void;
    };
  };
}

export default function OneSignalInit() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Register service worker first
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/OneSignalSDKWorker.js")
        .then(() => console.log("Service Worker registered"))
        .catch((err: unknown) => console.warn("Service Worker registration failed:", err));
    }

    // Initialize OneSignal
    const win = window as unknown as { OneSignalDeferred: Array<(os: OneSignalInterface) => Promise<void>> };
    if (win.OneSignalDeferred) {
      win.OneSignalDeferred.push(async (OneSignal: OneSignalInterface) => {
        try {
          // Disable OneSignal logging in production
          if (process.env.NODE_ENV === "production") {
            OneSignal.Debug.setLogLevel("warn");
          }

          // Initialize with your OneSignal App ID
          const config: OneSignalConfig = {
            appId: "547121ee-9739-42af-af9e-c6828547d872", // Hardcoded
            notifyButton: {
              enable: false, // Hide the bell icon
            },
          };

          console.log("OneSignal Config:", config);

          // Add localhost config for development
          if (process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_POCKETBASE_URL?.includes("localhost")) {
            config.allowLocalhostAsSecureOrigin = true;
          }

          await OneSignal.init(config);
          console.log("OneSignal initialized successfully");

          // CUSTOM PERMISSION PROMPT
          const checkPermissionAndPrompt = async () => {
            const permission = OneSignal.Notifications.permission;
            const isOptedIn = OneSignal.User.PushSubscription.optedIn;

            console.log("Check Permission:", { permission, isOptedIn });

            // Only prompt if not granted and not opted in
            if (!permission && !isOptedIn) {
              const confirmResult = window.confirm("Terima notifikasi? untuk mendapatkan notifikasi update realtime");
              if (confirmResult) {
                try {
                  await OneSignal.Notifications.requestPermission();
                } catch (err: unknown) {
                  console.error("Permission request failed:", err);
                }
              }
            }
          };

          // Run the check after a small delay to ensure OneSignal state is ready
          setTimeout(checkPermissionAndPrompt, 1500);

          // SET EXTERNAL ID (PENTING!)

          const currentUser = pb.authStore.model;
          if (currentUser?.id) {
            await OneSignal.login(currentUser.id);
            console.log("OneSignal external_id set to PocketBase user ID:", currentUser.id);
          } else {
            console.warn("No PocketBase user logged in");
          }
          
          console.log("OneSignal ready - waiting for user to subscribe");

          // Handle notification click
          OneSignal.Notifications.addEventListener("click", (event: { notification: { data: Record<string, unknown> } }) => {
            console.log("Notification clicked:", event);
            const data = event.notification.data;
            
            // Navigate based on notification type
            if (data?.type === "chat") {
              window.location.href = `/admin/chats`;
            } else if (data?.type === "new_complaint") {
              window.location.href = `/admin/complaints`;
            } else if (data?.type === "status_update") {
              window.location.href = `/siswa/complaints`;
            }
          });

          // Handle notification received in foreground
          OneSignal.Notifications.addEventListener("foreground", (event: { notification: { data: Record<string, unknown> } }) => {
            console.log("Notification received (foreground):", event);
            console.log("Foreground notification data:", event.notification.data);
          });

          // Listen untuk update subscription
          OneSignal.User.PushSubscription.addEventListener("change", (subscription: { id: string; optedIn: boolean; token?: string }) => {
            console.log("Push subscription changed:", {
              id: subscription.id,
              optedIn: subscription.optedIn,
              token: subscription.token ? "present" : "missing"
            });
          });

          // When user subscribes
          OneSignal.User.PushSubscription.addEventListener('change', (subscription: { id: string; optedIn: boolean; token?: string }) => {
            if (subscription.token) {
              console.log("✅ User subscribed to push notifications");
              console.log("Subscription details:", {
                id: subscription.id,
                optedIn: subscription.optedIn,
                token: subscription.token ? "present" : "missing"
              });
            }
          });

        } catch (error: unknown) {
          console.error("OneSignal initialization error:", error);
        }
      });
    }
  }, []);

  return null;
}

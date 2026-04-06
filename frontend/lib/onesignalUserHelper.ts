"use server"
/**
 * OneSignal User Tagging Utility
 * 
 * Menandai user di OneSignal dengan tags agar notifikasi bisa di-target
 * Panggil fungsi ini saat user login atau update profile
 */

import { setOneSignalUserTags } from "@/lib/onesignal";

/**
 * Setup identifikasi user di OneSignal saat login
 * @param user - User dari PocketBase
 * @param oneSignalId - ID dari OneSignal SDK
 */
export async function setupOneSignalUser(user: any, oneSignalId?: string) {
  try {
    if (!oneSignalId && typeof window !== "undefined") {
      // Cek localStorage untuk OneSignal ID jika tidak diberikan
      oneSignalId = localStorage.getItem("oneSignalId") || undefined;
    }

    if (!oneSignalId) {
      console.warn("OneSignal ID tidak tersedia");
      return false;
    }

    // Set external ID untuk matching dengan database
    const tags: Record<string, any> = {
      // User ID dari PocketBase
      user_id: user.id,
      
      // Email
      email: user.email,
      
      // Name
      name: user.name || user.email,
      
      // Role tags
      is_admin: user.isAdmin ? "true" : "false",
      role: user.isAdmin ? "admin" : "siswa",
      
      // Subscription status
      created_at: new Date().toISOString(),
    };

    // Jika user adalah admin, tambahkan tag khusus
    if (user.isAdmin) {
      tags.notification_type = "admin";
    } else {
      tags.notification_type = "user";
      tags.user_id_pocketbase = user.id;
    }

    // Set tags di OneSignal
    const success = await setOneSignalUserTags(user.id, tags);
    
    if (success) {
      console.log("OneSignal user tags set successfully");
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Error setting up OneSignal user:", error);
    return false;
  }
}

/**
 * Update user tags saat terjadi perubahan
 * Contoh: saat user update profile atau ubah role
 */
export async function updateOneSignalUserTags(
  userId: string,
  updates: Record<string, any>
) {
  try {
    const success = await setOneSignalUserTags(userId, updates);
    if (success) {
      console.log("OneSignal user tags updated");
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error updating OneSignal tags:", error);
    return false;
  }
}

/**
 * Cleanup OneSignal saat logout
 */
export async function cleanupOneSignalOnLogout() {
  try {
    if (typeof window !== "undefined") {
      // Clear OneSignal ID from localStorage
      localStorage.removeItem("oneSignalId");
      
      // Optional: unsubscribe dari push notifications
      if ((window as any).OneSignal) {
        // await OneSignal.unsubscribeFromPushNotifications();
      }
      
      console.log("OneSignal cleanup completed");
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error in OneSignal cleanup:", error);
    return false;
  }
}

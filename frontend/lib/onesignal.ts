"use server"
/**
 * OneSignal Notification Service
 * Menangani pengiriman notifikasi ke users
 */

// Ambil API key dan App ID dari environment variables
const ONE_SIGNAL_APP_ID = process.env.ONE_SIGNAL_APP_ID || "";
const ONE_SIGNAL_API_KEY = process.env.ONE_SIGNAL_APP_API_KEY || "";

/**
 * Send notification ke user tertentu
 * @param userId - ID PocketBase user
 * @param title - Judul notifikasi
 * @param content - Isi notifikasi
 * @param data - Data tambahan (untuk routing)
 */
export async function sendNotification(
  externalUserId: string,
  title: string,
  content: string,
  data?: Record<string, unknown>
) {
  try {
    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Basic ${ONE_SIGNAL_API_KEY}`,
      },
      body: JSON.stringify({
        app_id: ONE_SIGNAL_APP_ID,
        include_external_user_ids: [externalUserId],
        headings: { en: title },
        contents: { en: content },
        data: data || {},
        web_url: data?.webUrl,
        ios_url: data?.iosUrl,
        android_channel_id: "notification_channel",
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("OneSignal error:", error);
      return null;
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error sending notification:", error);
    return null;
  }
}

/**
 * Send notification ke admin
 * @param title - Judul notifikasi
 * @param content - Isi notifikasi
 * @param data - Data tambahan
 */
export async function sendAdminNotification(
  title: string,
  content: string,
  data?: Record<string, unknown>
) {
  try {
    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Basic ${ONE_SIGNAL_API_KEY}`,
      },
      body: JSON.stringify({
        app_id: ONE_SIGNAL_APP_ID,
        filters: [
          {
            field: "tag",
            key: "role",
            value: "admin",
          },
        ],
        headings: { en: title },
        contents: { en: content },
        data: data || {},
        web_url: data?.webUrl,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("OneSignal error:", error);
      return null;
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error sending admin notification:", error);
    return null;
  }
}

/**
 * Send notification ke multiple users
 * @param userIds - Array of PocketBase user IDs
 * @param title - Judul notifikasi
 * @param content - Isi notifikasi
 * @param data - Data tambahan
 */
export async function sendBulkNotification(
  userIds: string[],
  title: string,
  content: string,
  data?: Record<string, unknown>
) {
  try {
    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Basic ${ONE_SIGNAL_API_KEY}`,
      },
      body: JSON.stringify({
        app_id: ONE_SIGNAL_APP_ID,
        include_external_user_ids: userIds,
        headings: { en: title },
        contents: { en: content },
        data: data || {},
        web_url: data?.webUrl,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("OneSignal error:", error);
      return null;
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error sending bulk notification:", error);
    return null;
  }
}

/**
 * Set user tags di OneSignal untuk better targeting
 * Panggil ini saat user login atau update profile
 */
export async function setOneSignalUserTags(
  externalUserId: string,
  tags: Record<string, unknown>
) {
  try {
    const response = await fetch(
      `https://onesignal.com/api/v1/users/${externalUserId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Basic ${ONE_SIGNAL_API_KEY}`,
        },
        body: JSON.stringify({
          properties: {
            tags: tags,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("OneSignal error:", error);
      return null;
    }

    return true;
  } catch (error) {
    console.error("Error setting user tags:", error);
    return null;
  }
}

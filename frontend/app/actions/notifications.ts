"use server";

/**
 * Server Action untuk mengirim notifikasi OneSignal
 * Sesuai dengan dokumentasi OneSignal API v1 Push Notification
 */

const ONE_SIGNAL_APP_ID = "547121ee-9739-42af-af9e-c6828547d872"; // Hardcoded
const ONE_SIGNAL_API_KEY = process.env.ONE_SIGNAL_APP_API_KEY || "";
const APP_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || "https://pengaduansaranasekolah.sakum.my.id";

// Helper untuk memastikan URL selalu absolut (OneSignal requirement)
const getAbsoluteUrl = (path?: string) => {
  if (!path) return undefined;
  if (path.startsWith("http")) return path;
  // Hilangkan slash di depan jika ada, lalu gabungkan dengan APP_URL
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${APP_URL}${cleanPath}`;
};


export async function serverSendBulkNotification(
  userIds: string[],
  title: string,
  content: string,
  data?: Record<string, unknown>
) {
  try {
    console.log("Sending notification to admins:", {
      count: userIds.length,
      title,
      hasApiKey: !!ONE_SIGNAL_API_KEY,
    });

    if (!ONE_SIGNAL_API_KEY) {
      console.warn("OneSignal API Key not configured");
      return null;
    }

    if (userIds.length === 0) {
      console.warn("No user IDs provided");
      return null;
    }

    const payload = {
      app_id: ONE_SIGNAL_APP_ID,
      include_aliases: {
        external_id: userIds,
      },
      target_channel: "push",
      headings: { en: title },
      contents: { en: content },
      data: data || {},
      web_url: getAbsoluteUrl(data?.webUrl as string | undefined),
    };


    console.log("Sending payload:", {
      app_id: payload.app_id,
      userIds: userIds.length,
      title,
      channel: payload.target_channel
    });

    const response = await fetch("https://onesignal.com/api/v1/notifications?c=push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Key ${ONE_SIGNAL_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("OneSignal API error:", error);
      return null;
    }

    const result = await response.json();
    console.log("Notification sent successfully");
    return result;
  } catch (error) {
    console.error("Error sending notification:", error);
    return null;
  }
}

export async function serverSendNotification(
  externalUserId: string,
  title: string,
  content: string,
  data?: Record<string, unknown>
) {
  try {
    console.log("Sending notification to user:", {
      userId: externalUserId,
      title,
    });

    if (!ONE_SIGNAL_API_KEY) {
      console.warn("OneSignal API Key not configured");
      return null;
    }

    const response = await fetch("https://onesignal.com/api/v1/notifications?c=push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Key ${ONE_SIGNAL_API_KEY}`,
      },
      body: JSON.stringify({
        app_id: ONE_SIGNAL_APP_ID,
        include_aliases: {
          external_id: [externalUserId],
        },
        target_channel: "push",
        headings: { en: title },
        contents: { en: content },
        data: data || {},
        web_url: getAbsoluteUrl(data?.webUrl as string | undefined),
      }),
    });


    if (!response.ok) {
      const error = await response.json();
      console.error("OneSignal API error:", error);
      return null;
    }

    const result = await response.json();
    console.log("Notification sent successfully");
    return result;
  } catch (error) {
    console.error("Error sending notification:", error);
    return null;
  }
}

"use server";

import PocketBase from "pocketbase";

/**
 * FETCH USERS WITH SUPERUSER PRIVILEGES
 * Digunakan agar admin bisa melihat email walau emailVisibility = false.
 */
export async function fetchUsersAdmin(page: number, perPage: number, searchText: string) {
  try {
    const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || "https://pengaduansaranasekolah.sakum.my.id");

    // Login sebagai Superuser/Admin PocketBase
    // Menggunakan koleksi "_superusers" untuk versi terbaru
    await pb.collection("_superusers").authWithPassword(
      process.env.PB_ADMIN_EMAIL!,
      process.env.PB_ADMIN_PASSWORD!
    );

    const filter = searchText
      ? `(name ~ "${searchText}" || email ~ "${searchText}") && isAdmin = false`
      : `isAdmin = false`;

    // Ambil data dengan akses penuh
    const result = await pb.collection("users").getList(page, perPage, {
      sort: "-created",
      filter: filter,
    });

    // Kembalikan data murni (Plain Object) agar bisa dikirim dari Server ke Client
    return {
      success: true,
      items: result.items.map((item) => ({
        id: item.id,
        name: item.name,
        email: item.email,
        avatar: item.avatar,
        isBanned: item.isBanned,
        bannedUntil: item.bannedUntil,
        banReason: item.banReason,
        isAdmin: item.isAdmin,
      })),
      totalPages: result.totalPages,
      totalItems: result.totalItems,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("fetchUsersAdmin Error:", message);
    return {
      success: false,
      error: message,
      items: [],
      totalPages: 0,
      totalItems: 0,
    };
  }
}

/**
 * UPDATE USER STATUS WITH SUPERUSER PRIVILEGES
 * Digunakan untuk Ban/Unban agar tidak terhalang izin client-side.
 */
export async function updateUserStatusAdmin(userId: string, data: Partial<{
  isBanned: boolean;
  bannedUntil: string | null;
  banReason: string;
}>) {
  try {
    const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || "https://pengaduansaranasekolah.sakum.my.id");

    await pb.collection("_superusers").authWithPassword(
      process.env.PB_ADMIN_EMAIL!,
      process.env.PB_ADMIN_PASSWORD!
    );

    await pb.collection("users").update(userId, data);

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("updateUserStatusAdmin Error:", message);
    return { success: false, error: message };
  }
}

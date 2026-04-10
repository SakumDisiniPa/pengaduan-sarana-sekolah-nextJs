import { pb } from "@/lib/pocketbase";

export const deleteComplaint = async (id: string): Promise<void> => {
  const confirmed = window.confirm(
    "Apakah anda yakin ingin menghapus laporan pengaduan ini secara permanen?"
  );
  if (!confirmed) throw new Error("Delete cancelled by user");

  try {
    await pb.collection("complaints").delete(id);
  } catch (err) {
    console.error("Error deleting complaint:", err);
    alert("Gagal menghapus masalah dari database.");
    throw err;
  }
};

export const updateComplaintStatus = async (
  id: string,
  status: string
): Promise<void> => {
  try {
    await pb.collection("complaints").update(id, { status });
  } catch (err: unknown) {
    console.error("Error updating status:", err);
    const message = err instanceof Error ? err.message : "Gagal memperbarui status";
    alert(message);
    throw err;
  }
};

export const sendAdminReply = async (
  id: string,
  adminReply: string
): Promise<void> => {
  if (!adminReply.trim()) {
    throw new Error("Balasan tidak dapat kosong");
  }

  try {
    await pb.collection("complaints").update(id, { admin_reply: adminReply });
  } catch (err: unknown) {
    console.error("Error sending reply:", err);
    const message = err instanceof Error ? err.message : "Gagal mengirim balasan";
    alert(message);
    throw err;
  }
};

export const updateComplaintCategory = async (
  id: string,
  categories: string
): Promise<void> => {
  try {
    await pb.collection("complaints").update(id, { categories });
  } catch (err: unknown) {
    console.error("Error updating categories:", err);
    const message = err instanceof Error ? err.message : "Gagal memperbarui kategori";
    alert(message);
    throw err;
  }
};

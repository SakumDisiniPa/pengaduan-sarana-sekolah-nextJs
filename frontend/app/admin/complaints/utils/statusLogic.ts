/**
 * Utility for handling complaint status logic and transitions.
 */

export const COMPLAINT_STATUSES = [
  { value: "menunggu", label: "Menunggu", color: "border-yellow-500/50 text-yellow-400" },
  { value: "diproses", label: "Diproses", color: "border-blue-500/50 text-blue-400" },
  { value: "selesai", label: "Selesai", color: "border-green-500/50 text-green-400" },
];

/**
 * Validates if a status transition is allowed.
 * @param currentStatus - The current status of the complaint
 * @param newStatus - The target status
 * @returns { allowed: boolean; message?: string }
 */
export const validateStatusTransition = (
  currentStatus: string,
  newStatus: string
): { allowed: boolean; message?: string } => {
  // Prevent reverting to 'menunggu' if already 'diproses' or 'selesai'
  if (newStatus === "menunggu" && (currentStatus === "diproses" || currentStatus === "selesai")) {
    return {
      allowed: false,
      message: "Laporan yang sudah diproses tidak bisa dikembalikan ke status Menunggu.",
    };
  }

  // Prevent reverting to 'diproses' if already 'selesai'
  if (newStatus === "diproses" && currentStatus === "selesai") {
    return {
      allowed: false,
      message: "Laporan yang sudah Selesai tidak bisa dikembalikan ke status Sedang Diproses.",
    };
  }

  return { allowed: true };
};

/**
 * Checks if a status change requires a confirmation redirect (e.g., to upload proof)
 * @param newStatus - The target status
 * @returns boolean
 */
export const requiresProofForStatus = (newStatus: string): boolean => {
  return newStatus === "selesai";
};

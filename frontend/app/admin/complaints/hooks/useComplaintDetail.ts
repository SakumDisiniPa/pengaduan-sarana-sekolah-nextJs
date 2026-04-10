import { useEffect, useState, useRef } from "react";
import { pb } from "@/lib/pocketbase";
import { Complaint } from "../types";
import { transformComplaint } from "../utils/complaintTransform";

interface UseComplaintDetailResult {
  complaint: Complaint | null;
  loading: boolean;
  error: string | null;
}

export const useComplaintDetail = (
  complaintId: string
): UseComplaintDetailResult => {
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isFetched = useRef(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const record = await pb.collection("complaints").getOne(complaintId, {
          expand: "creator,categories",
          requestKey: null,
        });
        const transformedData = transformComplaint(record as Record<string, unknown>);
        setComplaint(transformedData);
        isFetched.current = true;
      } catch (err: unknown) {
        if (!(err as { isAbort?: boolean }).isAbort) {
          setError(
            "Gagal memuat detail pengaduan. Halaman mungkin tidak ditemukan."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    if (!isFetched.current) {
      fetchDetail();
    }

    // --- REALTIME SUBSCRIPTION ---
    pb.collection("complaints").subscribe(complaintId, async (e) => {
      if (e.action === "update") {
        try {
          // Re-fetch full record with expansions to avoid "Unknown" data
          const fullRecord = await pb.collection("complaints").getOne(complaintId, {
            expand: "creator,categories",
            requestKey: null
          });
          const transformedData = transformComplaint(fullRecord as Record<string, unknown>);
          setComplaint(transformedData);
        } catch (err) {
          console.error("Error refreshing real-time update:", err);
          // Fallback to partial update if fetch fails (not ideal but better than nothing)
          const transformedPartial = transformComplaint(e.record as Record<string, unknown>);
          setComplaint((prev) => prev ? { ...prev, ...transformedPartial } : prev);
        }
      } else if (e.action === "delete") {
        setError("Laporan ini baru saja dihapus.");
        setComplaint(null);
      }
    });

    return () => {
      pb.collection("complaints").unsubscribe(complaintId);
    };
  }, [complaintId]);

  return {
    complaint,
    loading,
    error,
  };
};

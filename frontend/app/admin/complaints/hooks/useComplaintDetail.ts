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
        const transformedData = transformComplaint(record);
        setComplaint(transformedData);
        isFetched.current = true;
      } catch (err: any) {
        if (!err.isAbort) {
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
    pb.collection("complaints").subscribe(complaintId, (e) => {
      if (e.action === "update") {
        setComplaint((prev) => {
          if (!prev) return prev;
          const updated = transformComplaint(e.record);
          return {
            ...prev,
            ...updated,
          };
        });
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

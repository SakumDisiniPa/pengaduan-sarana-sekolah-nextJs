import { useEffect, useState } from "react";
import { pb } from "@/lib/pocketbase";
import {
  getComplaints,
  ComplaintFilters,
} from "@/lib/complaintsQueries";
import { Complaint, User } from "../types";
import { transformComplaints } from "../utils/complaintTransform";

interface UseAdminComplaintsOptions {
  page: number;
  filters: ComplaintFilters;
  enabled?: boolean;
}

interface UseAdminComplaintsResult {
  complaints: Complaint[];
  loading: boolean;
  initialLoading: boolean;
  totalPages: number;
  users: User[];
  loadUsers: () => Promise<void>;
}

export const useAdminComplaints = (
  options: UseAdminComplaintsOptions
): UseAdminComplaintsResult => {
  const { page, filters, enabled = true } = options;

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  const loadUsers = async () => {
    try {
      const userList = await pb.collection("users").getFullList({
        requestKey: null
    });
      setUsers(
        userList.map((u) => ({
          id: u.id,
          email: u.email || "",
          name: u.name,
        }))
      );
    } catch (err) {
      console.error("Error loading users:", err);
    }
  };

  // Load users on mount
  useEffect(() => {
    loadUsers();
  }, []);

  // Load complaints with realtime subscription
  useEffect(() => {
    if (!enabled) return;

    let mounted = true;
    let unsubscribe: (() => void) | null = null;

    const init = async () => {
      try {
        setLoading(true);

        // Fetch dengan pagination
        const result = await getComplaints(filters, {
          page,
          perPage: 20,
          sort: "-created",
        });

        if (!mounted) return;

        setComplaints(transformComplaints(result.items as any[]));
        setTotalPages(result.totalPages);

        setLoading(false);
        setInitialLoading(false);

        // Subscribe realtime (hanya untuk updates, bukan untuk initial load)
        try {
          unsubscribe = await pb
            .collection("complaints")
            .subscribe("*", (e) => {
              if (!mounted) return;

              if (
                e.action === "create" ||
                e.action === "update" ||
                e.action === "delete"
              ) {
                // Reload data ketika ada perubahan (SILENT REFETCH)
                init();
              }
            });
        } catch (err) {
          const error = err as { isAbort?: boolean };
          if (error?.isAbort !== true) {
            console.error("Subscribe error:", err);
          }
        }
      } catch (err) {
        const error = err as { isAbort?: boolean };
        if (mounted && error?.isAbort !== true) {
          console.error("Load error:", err);
          if (initialLoading) {
            setLoading(false);
            setInitialLoading(false);
          }
        }
      }
    };

    init();

    return () => {
      mounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, [filters, page, enabled]);

  return {
    complaints,
    loading,
    initialLoading,
    totalPages,
    users,
    loadUsers,
  };
};

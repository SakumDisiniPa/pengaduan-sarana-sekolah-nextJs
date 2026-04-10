import { useEffect, useState, useCallback } from "react";
import { db } from "@/lib/db";
import { decryptData } from "@/lib/crypto";
import { ComplaintFilters } from "@/lib/complaintsQueries";
import { Complaint, User } from "../types";
import { transformComplaints } from "../utils/complaintTransform";
import { pb } from "@/lib/pocketbase";

interface UseAdminComplaintsOptions {
  page: number;
  filters: ComplaintFilters;
  isReady: boolean; // From Sync Engine
  perPage?: number;
}

interface UseAdminComplaintsResult {
  complaints: Complaint[];
  loading: boolean;
  initialLoading: boolean;
  totalPages: number;
  users: User[];
}

export const useAdminComplaints = (
  options: UseAdminComplaintsOptions
): UseAdminComplaintsResult => {
  const { page, filters, isReady, perPage = 20 } = options;

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  const admin = pb.authStore.model;

  const loadLocalData = useCallback(async (isSilent = false) => {
    if (!isReady || !admin?.id) return;

    try {
      if (!isSilent) setLoading(true);

      // 1. Load Users
      const rawUsers = await db.users.toArray();
      const decryptedUsers = rawUsers
        .map(u => decryptData(u.data, admin.id))
        .filter(u => u);
      
      setUsers(decryptedUsers.map(u => ({
        id: u.id,
        email: u.email || "",
        name: u.name,
      })));

      // 2. Load and Filter Complaints
      const rawComplaints = await db.complaints.toArray();
      const decryptedComplaints = rawComplaints
        .map(c => decryptData(c.data, admin.id))
        .filter(c => c);

      // Manual Filtration
      let filtered = decryptedComplaints;

      // Status
      if (filters.status && filters.status !== "all") {
        filtered = filtered.filter(c => c.status === filters.status);
      }

      // Search Text
      if (filters.searchText) {
        const search = filters.searchText.toLowerCase();
        filtered = filtered.filter(c => 
          c.title?.toLowerCase().includes(search) ||
          c.description?.toLowerCase().includes(search)
        );
      }

      // Creator (if specified in filters)
      if (filters.creator) {
        filtered = filtered.filter(c => c.creator === filters.creator);
      }

      // Sorting
      filtered.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());

      // Pagination
      const start = (page - 1) * perPage;
      const end = start + perPage;
      
      setComplaints(transformComplaints(filtered.slice(start, end)));
      setTotalPages(Math.ceil(filtered.length / perPage));

    } catch (err) {
      console.error("Local complaints load error:", err);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [isReady, admin?.id, page, perPage, filters]);

  useEffect(() => {
    if (isReady) {
      loadLocalData();
    }
  }, [isReady, loadLocalData]);

  return {
    complaints,
    loading,
    initialLoading,
    totalPages,
    users,
  };
};

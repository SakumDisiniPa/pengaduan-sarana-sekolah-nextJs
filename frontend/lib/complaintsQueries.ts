// Query helpers untuk complaints dengan efficient filtering
// File: frontend/lib/complaintsQueries.ts

import { pb } from './pocketbase';

/**
 * Complaint Query Helper - Dengan efficient filtering dan pagination
 */

export interface ComplaintFilters {
  status?: string;
  category?: string;
  priority?: string;
  creator?: string;
  dateFrom?: string;
  dateTo?: string;
  month?: number;
  year?: number;
  searchText?: string;
}

export interface QueryOptions {
  page?: number;
  perPage?: number;
  sort?: string;
}

/**
 * Build efficient filter string untuk PocketBase
 * Menggunakan array method untuk construct filter queries
 */
function buildFilterString(filters: ComplaintFilters): string {
  const filterParts: string[] = [];

  // Status filter
  if (filters.status && filters.status !== 'all') {
    filterParts.push(`status = "${filters.status}"`);
  }

  // Category filter
  if (filters.category) {
    filterParts.push(`category = "${filters.category}"`);
  }

  // Priority filter
  if (filters.priority) {
    filterParts.push(`priority = "${filters.priority}"`);
  }

  // Creator/Student filter
  if (filters.creator) {
    filterParts.push(`creator = "${filters.creator}"`);
  }

  // Date range filter
  if (filters.dateFrom) {
    filterParts.push(`created >= "${filters.dateFrom}T00:00:00Z"`);
  }
  if (filters.dateTo) {
    filterParts.push(`created <= "${filters.dateTo}T23:59:59Z"`);
  }

  // Month filter
  if (filters.month && filters.year) {
    const startDate = `${filters.year}-${String(filters.month).padStart(2, '0')}-01`;
    const nextMonth = filters.month === 12 ? 1 : filters.month + 1;
    const nextYear = filters.month === 12 ? filters.year + 1 : filters.year;
    const endDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;
    
    filterParts.push(`created >= "${startDate}T00:00:00Z"`);
    filterParts.push(`created < "${endDate}T00:00:00Z"`);
  }

  // Search filter - untuk title dan description menggunakan ~
  if (filters.searchText) {
    const search = filters.searchText.toLowerCase();
    filterParts.push(`(title ~ "${search}" || description ~ "${search}")`);
  }

  return filterParts.join(' && ');
}

/**
 * Get complaints dengan efficient query
 * - Filter di database level (bukan di memory)
 * - Dengan pagination
 * - Dengan sorting
 */
export async function getComplaints(
  filters: ComplaintFilters = {},
  options: QueryOptions = {}
) {
  const {
    page = 1,
    perPage = 20,
    sort = '-created'
  } = options;

  const filter = buildFilterString(filters);

  try {
    const result = await pb.collection('complaints').getList(page, perPage, {
      filter: filter || undefined,
      sort: sort,
      expand: 'creator', // Expand creator details
      requestKey: null,
    });

    return result;
  } catch (error) {
    console.error('Error fetching complaints:', error);
    throw error;
  }
}

/**
 * Get single complaint dengan details
 */
export async function getComplaintDetail(id: string) {
  try {
    const complaint = await pb.collection('complaints').getOne(id, {
      expand: 'creator',
    });
    return complaint;
  } catch (error) {
    console.error('Error fetching complaint detail:', error);
    throw error;
  }
}

/**
 * Get complaints stats berdasarkan filters
 * Menggunakan getFullList untuk stats (dengan filter untuk efficiency)
 */
export async function getComplaintsStats(filters: ComplaintFilters = {}) {
  try {
    const filter = buildFilterString(filters);
    
    const allComplaints = await pb.collection('complaints').getFullList({
      filter: filter || undefined,
      requestKey: null,
    });

    // Array operations untuk count stats (sesuai PocketBase select: menunggu, diproses, selesai)
    const stats = {
      total: allComplaints.length,
      menunggu: allComplaints.filter(c => c.status === 'menunggu').length,
      diproses: allComplaints.filter(c => c.status === 'diproses').length,
      selesai: allComplaints.filter(c => c.status === 'selesai').length,
    };

    // Group by category
    const byCategory = allComplaints.reduce((acc, c) => {
      const cat = c.category || 'uncategorized';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Group by priority
    const byPriority = allComplaints.reduce((acc, c) => {
      const pri = c.priority || 'medium';
      acc[pri] = (acc[pri] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      ...stats,
      byCategory,
      byPriority,
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw error;
  }
}

/**
 * Get complaints untuk export/reporting
 */
export async function getComplaintsForExport(filters: ComplaintFilters = {}) {
  try {
    const filter = buildFilterString(filters);
    
    const complaints = await pb.collection('complaints').getFullList({
      filter: filter || undefined,
      sort: '-created',
      expand: 'creator',
    });

    return complaints;
  } catch (error) {
    console.error('Error fetching complaints for export:', error);
    throw error;
  }
}

/**
 * Update complaint status dan feedback
 */
export async function updateComplaint(
  id: string,
  data: {
    status?: string;
    feedback?: string;
    priority?: string;
    deadline?: string;
  }
) {
  try {
    const updated = await pb.collection('complaints').update(id, data);
    return updated;
  } catch (error) {
    console.error('Error updating complaint:', error);
    throw error;
  }
}

/**
 * Categories are now fetched dynamically from PocketBase.
 * See: lib/categories.ts → useCategories()
 */

export const COMPLAINT_PRIORITIES = ['low', 'medium', 'high'] as const;

export const STATUS_OPTIONS = [
  { value: 'menunggu', label: 'Menunggu', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'diproses', label: 'Diproses', color: 'bg-blue-100 text-blue-800' },
  { value: 'selesai', label: 'Selesai', color: 'bg-green-100 text-green-800' },
] as const;

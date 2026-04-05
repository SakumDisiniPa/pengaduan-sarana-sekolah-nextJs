import { ComplaintFilters } from "@/lib/complaintsQueries";
import { FilterMode } from "../types";

export const buildEffectiveFilters = (
  filters: ComplaintFilters,
  filterMode: FilterMode,
  dateFrom: string,
  dateTo: string,
  month: number | null,
  year: number | null,
  searchText: string
): ComplaintFilters => {
  const base = { ...filters };

  if (filterMode === "date" && dateFrom && dateTo) {
    base.dateFrom = dateFrom;
    base.dateTo = dateTo;
  } else if (filterMode === "month" && month && year) {
    base.month = month;
    base.year = year;
  } else if (filterMode === "custom") {
    if (dateFrom) base.dateFrom = dateFrom;
    if (dateTo) base.dateTo = dateTo;
  }

  if (searchText) {
    base.searchText = searchText;
  }

  return base;
};

"use client";

import { useEffect, useState } from "react";
import { pb } from "./pocketbase";

export interface Category {
  id: string;
  name: string;
}

/**
 * Fetch semua kategori dari koleksi "categories" di PocketBase.
 * Diurutkan berdasarkan nama (ascending).
 */
export async function fetchCategories(): Promise<Category[]> {
  try {
    const records = await pb.collection("categories").getFullList({
      sort: "name",
      requestKey: null,
    });
    return records.map((r) => ({ id: r.id, name: r.name }));
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

/**
 * React hook untuk mengambil daftar kategori.
 * Bisa dipakai di mana saja (admin filter, siswa create complaint, dll).
 */
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    fetchCategories().then((data) => {
      if (mounted) {
        setCategories(data);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  const refetch = () => {
    setLoading(true);
    fetchCategories().then((data) => {
      setCategories(data);
      setLoading(false);
    });
  };

  return { categories, loading, refetch };
}

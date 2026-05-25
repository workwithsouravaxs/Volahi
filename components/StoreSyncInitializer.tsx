"use client";

import { useEffect } from 'react';
import { useVolahiStore } from '@/lib/store';

export default function StoreSyncInitializer() {
  const fetchStoreData = useVolahiStore((state) => state.fetchStoreData);

  useEffect(() => {
    // Initial Hydration from Supabase DB on application mount
    fetchStoreData();
  }, [fetchStoreData]);

  return null;
}

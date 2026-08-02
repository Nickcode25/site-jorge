"use client";

import { useCallback, useEffect, useState } from "react";
import { mockProperties } from "@/src/lib/mock-data";
import { isSupabaseConfigured, supabase } from "@/src/lib/supabase";
import type { Property } from "@/src/types/property";

export function useProperties(featuredOnly = false) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    if (!isSupabaseConfigured || !supabase) {
      setProperties(featuredOnly ? mockProperties.filter((item) => item.destaque).slice(0, 3) : mockProperties);
      setLoading(false);
      return;
    }

    let query = supabase.from("imoveis").select("*").order("criado_em", { ascending: false });
    if (featuredOnly) query = query.eq("destaque", true).limit(3);
    const { data, error: queryError } = await query;
    if (queryError) setError("Não foi possível carregar os imóveis agora.");
    setProperties((data as Property[]) ?? []);
    setLoading(false);
  }, [featuredOnly]);

  useEffect(() => {
    void load();
  }, [load]);

  return { properties, loading, error, reload: load, demoMode: !isSupabaseConfigured };
}

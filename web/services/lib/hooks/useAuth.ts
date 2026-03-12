import { useEffect, useState } from "react";
import { ensureProfile } from "@/services/auth/users/profile";
import { supabase } from "@/services/auth/supabase";
import { populateUser } from "@/services/auth/client";
import { User } from "@/services/auth/utils/types";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function load() {
      const mapped = await populateUser();
      if (!mapped) return;

      const profile = await ensureProfile(mapped, supabase);
      if (profile) setUser({
        id: profile.id,
        name: profile.name ?? undefined,
        email: profile.email ?? undefined,
        role: profile.role as User['role'],
        createdAt: undefined,
      });
    }
    load();
  }, []);

  return { user };
}
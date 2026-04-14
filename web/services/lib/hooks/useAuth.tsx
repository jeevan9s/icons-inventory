"use client";

// auth hook
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { ensureProfile } from "@/services/auth/users/profile";
import { supabase } from "@/services/auth/supabase";
import { populateUser } from "@/services/auth/client";
import { User } from "@/services/auth/utils/types";

const UserContext = createContext<{ user: User | null; isLoading: boolean }>({
  user: null,
  isLoading: true,
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const mapped = await populateUser();
        if (!mapped) {
          setIsLoading(false);
          return;
        }

        const profile = await ensureProfile(mapped, supabase);
        if (profile) {
          setUser({
            id: profile.id,
            name: profile.name ?? undefined,
            email: profile.email ?? undefined,
            role: profile.role as User['role'],
            createdAt: undefined,
          });
        }
      } catch (e) {
        console.error("Auth error:", e);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  return (
    <UserContext.Provider value={{ user, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
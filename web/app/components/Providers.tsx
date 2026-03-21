"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, ReactNode } from "react";
import { UserProvider } from "@/services/lib/hooks/useAuth";

export default function Providers({ children }: { children: ReactNode }) {
  // Creating the client inside useState prevents it from 
  // being recreated on every re-render
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>{children}</UserProvider>
    </QueryClientProvider>
  );
}
// client-side auth

import { createBrowserClient } from "@supabase/ssr";
import { msTenantId, supabaseAnonKey, supabaseURL, User } from "./utils/types";

export const getBrowserClient = () => createBrowserClient(supabaseURL(), supabaseAnonKey());

export const loginWithMicrosoft = async () => {
    const supabase = getBrowserClient()
    return await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: {
            scopes: 'openid email profile',
            redirectTo: 'https://icons-ims.vercel.app/api/auth/callback', // changed for PROD
            queryParams: {tenant: msTenantId(), prompt: 'select_account'}  
        }
    })
}

export const logout = async () => {
  const supabase = getBrowserClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("logout failed:", error);
    return;
  }
  window.location.href = '/auth/logout';
};

export async function populateUser(): Promise<User | null> {
    const supabase = getBrowserClient();

    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) return null;

        const { data: profile } = await supabase
            .from("Profiles")
            .select("*")
            .eq("id", user.id)
            .single();

        if (!profile) return null;

        return {
            id: user.id,
            email: user.email,
            name: profile.name,
            role: profile.role,
            createdAt: user.created_at,
        };

    } catch (error) {
        console.error("failed to populate user: ", error);
        return null;
    }
}


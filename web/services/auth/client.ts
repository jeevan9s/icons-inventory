// client-side auth

import { createBrowserClient } from "@supabase/ssr";
import { msTenantId, supabaseAnonKey, supabaseURL, User } from "./utils/types";
import { mapUser } from "./utils/mapUser";

export const getBrowserClient = () => createBrowserClient(supabaseURL(), supabaseAnonKey());

export const loginWithMicrosoft = async () => {
    const supabase = getBrowserClient()
    return await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: {
            scopes: 'openid email profile',
            redirectTo: 'http://localhost:3000/api/auth/callback', // for dev
            queryParams: {tenant: msTenantId()}  
        }
    })
}

export const logout = async () => {
    const supabase = getBrowserClient()
    await supabase.auth.signOut()
    window.location.href = '/'
}

export async function populateUser(): Promise<User | null> {
    const supabase = getBrowserClient();

    try {
        const { data: {user}, error}  = await supabase.auth.getUser();
        if (error || !user) return null;
        return mapUser(user);

    } catch (error) {
        console.error("failed to populate user: ", error);
        return null;
    }
}



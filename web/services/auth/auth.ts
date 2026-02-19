
import { createBrowserClient, createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { User } from "@supabase/supabase-js";
import { msTenantId, StaffUser, supabaseAnonKey, supabaseURL } from "./utils/types";
import { NextRequest, NextResponse } from "next/server";

const mapUser = (user: User): StaffUser => ({
    id: user.id,
    email: user.email,
    name: user.user_metadata?.full_name || user.user_metadata?.name || "iCons Staff Member",
    lastSignIn: user.last_sign_in_at,
})

export const getBrowserClient = () => createBrowserClient(supabaseURL, supabaseAnonKey)
export const getServerClient = async () => {
    const cookieStore = await cookies();
    return createServerClient(
        supabaseURL, supabaseAnonKey, {
            cookies: {
                getAll: () => cookieStore.getAll(),
                setAll: (cookiesToSet) => {
                    try {
                        cookiesToSet.forEach(({name, value, options}) => cookieStore.set(name, value, options))
                    } catch {}
                }
            }
        }
    )
}

export const loginWithMicrosoft = async () => {
    const supabase = getBrowserClient()
    return await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: {
            scopes: 'openid email profile',
            redirectTo: 'http://localhost:3000/api/auth/callback', // for dev
            queryParams: {tenant: msTenantId}  
        }
    })
}

export const logout = async () => {
    const supabase = getBrowserClient()
    await supabase.auth.signOut()
    window.location.href = '/'
}

export const getCurrentUser = async (): Promise<StaffUser | null> => {
    const supabase = await getServerClient()
    const {data: {user}} = await supabase.auth.getUser()
    return user ? mapUser(user) : null
}

// middleware logic
export const updateSession = async (request: NextRequest) => {
    let response = NextResponse.next({headers: request.headers})

    const supabase = createServerClient(supabaseURL, supabaseAnonKey, {
        cookies: {
            getAll: () => request.cookies.getAll(),
            setAll: (cookiesToSet) =>{
                cookiesToSet.forEach(({name, value, options }) => request.cookies.set(name, value))
                response = NextResponse.next({request})
                cookiesToSet.forEach(({name, value, options}) => response.cookies.set(name, value, options))
            }
        }
    }
)

await supabase.auth.getUser()
return response
}

export async function populateUser(): Promise<StaffUser | null> {
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



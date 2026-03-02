// server-side auth
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { User, supabaseAnonKey, supabaseURL } from "./utils/types";
import { NextRequest, NextResponse } from "next/server";
import { mapUser } from "./utils/mapUser";

export const getServerClient = async () => {
    const cookieStore = await cookies();
    return createServerClient(
        supabaseURL(), supabaseAnonKey(), {
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

export const getCurrentUser = async (): Promise<User | null> => {
    const supabase = await getServerClient()
    const {data: {user}} = await supabase.auth.getUser()
    return user ? mapUser(user) : null
}

// middleware logic
export const updateSession = async (request: NextRequest) => {
    let response = NextResponse.next({headers: request.headers})

    const supabase = createServerClient(supabaseURL(), supabaseAnonKey(), {
        cookies: {
            getAll: () => request.cookies.getAll(),
            setAll: (cookiesToSet) =>{
                cookiesToSet.forEach(({name, value}) => request.cookies.set(name, value))
                response = NextResponse.next({request})
                cookiesToSet.forEach(({name, value, options}) => response.cookies.set(name, value, options))
            }
        }
    }
)

await supabase.auth.getUser()
return response
}
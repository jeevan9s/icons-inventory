import { User as SupabaseUser } from "@supabase/supabase-js";
import { User, Role } from "./types";

// map a supabase user "struct" to the app-defined User type 
export const mapUser = (user: SupabaseUser): User => ({
    id: user.id,
    email: user.email,
    name: user.user_metadata?.name,
    role: user.user_metadata?.role as Role,
    createdAt: user.created_at,
})
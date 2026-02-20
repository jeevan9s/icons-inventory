import { User } from "@supabase/supabase-js"
import { StaffUser } from "./types"

export const mapUser = (user: User): StaffUser => ({
    id: user.id,
    email: user.email,
    name: user.user_metadata?.full_name || user.user_metadata?.name || "iCons Staff Member",
    lastSignIn: user.last_sign_in_at,
})
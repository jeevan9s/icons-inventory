import { ensureProfile } from "../users/profile";
import { createSupabaseClient } from "@/services/shared/utils";
import mapSupabaseUser from "@/services/shared/utils";

const supabase = createSupabaseClient(); 

export default function authListener() {
    supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === "SIGNED_IN" && session?.user) {
        try {
            const appUser = mapSupabaseUser(session.user);
            const profile = await ensureProfile(appUser)
            console.log("profile verified:", profile)
        } catch (err) {
            console.error("failed to verify profile", err);
        }
    }
})
}


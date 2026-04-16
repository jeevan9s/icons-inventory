import { supabase } from "@/services/auth/supabase"; 
import { ensureProfile } from "../users/profile";
import mapSupabaseUser from "@/services/shared/utils";

// map a user to the supabase Profiles table based on a listened login event
export default function authListener(onProfileVerified?: (profile: any) => void) {

  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {

    if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session?.user) {
      try {
        const appUser = mapSupabaseUser(session.user);        
        const profile = await ensureProfile(appUser, supabase);
        
        console.log("verified profile:", profile); 
        
        if (profile && onProfileVerified) {
          onProfileVerified(profile);
        } 
      } catch (err) {
        console.error("failed to verify profile", err);
      }
    }
  });

  return subscription;
}

// import { createClient, SupabaseClient } from "@supabase/supabase-js";
// import { supabaseAnonKey, supabaseURL } from "../auth/utils/types";
// import { Database } from "@/app/databasetesting/database.types";
import type {User as IUser} from "@/services/auth/utils/types"
import type {User as SUser} from "@supabase/auth-js"

// export function createSupabaseClient(url?: string, key?: string): SupabaseClient<Database> {
//     const supaURL = url || supabaseURL();
//     const supaKey = key || supabaseAnonKey();

//     return createClient<Database>(supaURL, supaKey); 
// }

type SupabaseUserMetadata = {
  full_name?: string;
};

export default function mapSupabaseUser(user: SUser): IUser {
  const metadata = user.user_metadata as SupabaseUserMetadata | undefined

  return {
    id: user.id,
    name: metadata?.full_name || "Unknown",
    email: user.email || "",
    role: "Dev",
    createdAt: new Date().toISOString(),
  }
}
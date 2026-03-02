import { SupabaseClient } from "@supabase/supabase-js";
import { User } from "../utils/types";
import { Database } from "@/app/databasetesting/database.types";

export async function ensureProfile(user: User, supabaseClient: SupabaseClient<Database>) {
  let profile = await getUserProfile(user.id, supabaseClient);

  if (!profile) {
    const { data: inserted, error } = await supabaseClient
      .from("Profiles")
      .upsert({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role ?? "Dev",
      })
      .select()
      .single();

    if (error) {
      console.error("error inserting profile:", error);
      throw error;
    }
    profile = inserted;
  }
  return profile;
}

export async function getUserProfile(userId: string, supabaseClient: SupabaseClient<Database>) {
  const { data: profile, error } = await supabaseClient
    .from("Profiles")
    .select("id, role, name, email")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("getUserProfile error:", error);
    return null;
  }

  return profile;
}
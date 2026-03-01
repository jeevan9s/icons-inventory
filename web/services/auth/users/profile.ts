import { Role } from "@/app/databasetesting/database.types";
import { createSupabaseClient } from "@/services/shared/utils";
import { User } from "../utils/types";

// verify that an auth'd user exists in the profiles table, if not, log them
export async function ensureProfile(user: User) {
  const supabase = createSupabaseClient()

  let profile = await getUserProfile(user.id)

  if (!profile) {
    const { data: insertedProfile, error } = await supabase
      .from("Profiles")
      .insert(
        {
          id: user.id,
          name: user.name,
          email: user.email,
          role: (user.role ?? "Dev") as Role,
        },
      )
      .select()
      .single()

    if (error) {
        throw new Error("failed to create profile: " + error.message)
        }

            profile = insertedProfile
    }

        return profile
    }


export async function getUserProfile(userId: string) {
  const supabase = createSupabaseClient()

  const { data: profile, error } = await supabase
    .from("Profiles")
    .select("id, role, name, email")
    .eq("id", userId)
    .maybeSingle()

  if (error) {console.error("getUserProfile error", error); return null}

  return profile;
}
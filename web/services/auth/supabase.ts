import { createBrowserClient } from "@supabase/ssr";
import { supabaseAnonKey, supabaseURL } from "./utils/types";
import { Database } from "@/app/databasetesting/database.types";

export const supabase = createBrowserClient<Database>(supabaseURL(), supabaseAnonKey())
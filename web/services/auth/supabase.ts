import { createBrowserClient } from "@supabase/ssr";
import { supabaseAnonKey, supabaseURL } from "./utils/types";
import { Database } from "../lib/database-functions/database.types";

export const supabase = createBrowserClient<Database>(supabaseURL(), supabaseAnonKey())
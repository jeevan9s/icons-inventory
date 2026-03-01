import { Role } from "@/app/databasetesting/database.types";
import { loadEnvVar } from "./helpers";

export interface User {
    id: string;
    name: string | undefined, 
    email: string | undefined,
    role:Role;
    createdAt: string | undefined
};



// env vars
// export const clientId = loadEnvVar("MS_CLIENT_ID")
// export const clientSecret = loadEnvVar("MS_CLIENT_SECRET");
// export const devRedirectUri = loadEnvVar("MS_DEV_REDIRECT_URI");
// export const prodRedirectUri = loadEnvVar("MS_PROD_REDIRECT_URI");
// export const jwtSecret = loadEnvVar("JWT_SECRET"); 
// export const jwtExpiry = loadEnvVar("JWT_EXPIRATION");
export const supabaseURL = () => loadEnvVar("NEXT_PUBLIC_SUPABASE_URL");
export const supabaseAnonKey = () => loadEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY");
export const msTenantId =  () => loadEnvVar("NEXT_PUBLIC_MS_TENANT_ID");

export const devRedirectUri = () => loadEnvVar("NEXT_PUBLIC_DEV_REDIRECT_URI");
export const prodRedirectUri = () => loadEnvVar("NEXT_PUBLIC_PROD_REDIRECT_URI");
    
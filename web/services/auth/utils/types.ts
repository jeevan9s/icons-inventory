import { loadEnvVar } from "./helpers";


export type role = "admin" | "operator";

export interface StaffUser {
    id: string;
    email: string | undefined,
    name: string | undefined, 
    lastSignIn?: string,
    role?:role;
};

// env vars
// export const clientId = loadEnvVar("MS_CLIENT_ID")
// export const clientSecret = loadEnvVar("MS_CLIENT_SECRET");
// export const devRedirectUri = loadEnvVar("MS_DEV_REDIRECT_URI");
// export const prodRedirectUri = loadEnvVar("MS_PROD_REDIRECT_URI");
// export const jwtSecret = loadEnvVar("JWT_SECRET"); 
// export const jwtExpiry = loadEnvVar("JWT_EXPIRATION");
export const supabaseURL = loadEnvVar("NEXT_PUBLIC_SUPABASE_URL");
export const supabaseAnonKey = loadEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY");
export const supabasePubKey = loadEnvVar("NEXT_PUBLIC_SUPABASE_PUB_KEY");
export const msTenantId = loadEnvVar("NEXT_PUBLIC_MS_TENANT_ID");
export const devRedirectUri = loadEnvVar("DEV_REDIRECT_URI");
export const prodRedirectUri = loadEnvVar("PROD_REDIRECT_URI");



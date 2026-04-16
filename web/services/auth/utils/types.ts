import { loadEnvVar } from "./helpers";

export type Role = "Dev" | "Admin" | "Operator";

export interface User {
    id: string;
    name: string | undefined, 
    email: string | undefined,
    role:Role;
    createdAt?: string | undefined
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

export const emailJSServiceID = () => loadEnvVar("NEXT_PUBLIC_EMAIL_JS_SERVICE_ID"); 
export const emailJSPubID = () => loadEnvVar("NEXT_PUBLIC_EMAIL_JS_PUB_KEY");
export const  emailJSTemplateID = () => loadEnvVar("NEXT_PUBLIC_EMAIL_JS_TEMPLATE_ID");

    
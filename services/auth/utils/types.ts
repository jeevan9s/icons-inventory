import dotenv from "dotenv";
import path from "path";
import { loadEnvVar } from "./helpers";

dotenv.config({path: path.resolve(__dirname, "../env.services")});

export type role = "admin" | "operator";

export interface user {
    email: string; 
    role: role;
}

const def = "default";

// env 
export const clientId = loadEnvVar("MS_CLIENT_ID", def)
export const clientSecret = loadEnvVar("MS_CLIENT_SECRET", def);
export const redirectURI = loadEnvVar("MS_REDIRECT_URI", def);
export const tenantId = loadEnvVar("MS_TENANT_ID", def);
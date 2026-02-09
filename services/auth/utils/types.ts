import dotenv from "dotenv";

dotenv.config();

export type role = "admin" | "operator";

export interface user {
    email: string; 
    role: role;
}

// env 
export const REDIRECT_URI = process.env.
import dotenv from "dotenv";
import path from "path";

dotenv.config({path: path.resolve(__dirname, "../env.services")});

export function loadEnvVar(key: string, fallback?: string): string {
    const value = process.env[key] ?? fallback; 
    if (value == undefined) {
        throw new Error(`missing env var: ${key}`)
    }
    return value;
}
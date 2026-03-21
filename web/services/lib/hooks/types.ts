import { Database } from "../database-functions/database.types";

export type TableName = keyof Database['public']['Tables'];
export type filterQualifier = "e" | "gt" | "lt" | "gte" | "lte" | "ilike";
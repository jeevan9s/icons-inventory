// env stuff

const ENV_MAP: Record<string, string | undefined> = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_SUPABASE_PUB_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUB_KEY,
  NEXT_PUBLIC_MS_TENANT_ID: process.env.NEXT_PUBLIC_MS_TENANT_ID,
  NEXT_PUBLIC_DEV_REDIRECT_URI: process.env.NEXT_PUBLIC_DEV_REDIRECT_URI,
  NEXT_PUBLIC_PROD_REDIRECT_URI: process.env.NEXT_PUBLIC_PROD_REDIRECT_URI,
  NEXT_PUBLIC_EMAIL_JS_SERVICE_ID: process.env.NEXT_PUBLIC_EMAIL_JS_SERVICE_ID, 
  NEXT_PUBLIC_EMAIL_JS_PUB_KEY: process.env.NEXT_PUBLIC_EMAIL_JS_PUB_KEY, 
  NEXT_PUBLIC_EMAIL_JS_TEMPLATE_ID: process.env.NEXT_PUBLIC_EMAIL_JS_TEMPLATE_ID, 

};

export function loadEnvVar(key: string, fallback?: string): string {
  const value = ENV_MAP[key] ?? fallback;
  if (!value) {
    throw new Error(`env variable is missing: ${key}`);
  }
  return value;
}
export function loadEnvVar(key: string, fallback?: string): string {
    const value = process.env[key] ?? fallback;
    if (value === undefined) {
        throw new Error(`missing env var: ${key}`);
    }
    console.log(value);
    return value;
}

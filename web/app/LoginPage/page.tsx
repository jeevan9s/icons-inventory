"use client"; // must be a Client Component to use browser APIs
import { onLogin } from "@/services/auth/authCallers";

export default function LoginPage() {
  async function startMSLogin() {
    try {
      await onLogin(); // browser-safe
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="flex flex-col items-center justify-center gap-3">
        <h1>Microsoft OAuth login test</h1>
        <button
          onClick={startMSLogin}
          className="bg-neutral-800 hover:bg-neutral-700 text-white py-2 px-4 rounded-lg cursor-pointer"
        >
          Login
        </button>
      </div>
    </div>
  );
}

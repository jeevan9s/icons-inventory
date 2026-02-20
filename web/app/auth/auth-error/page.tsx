"use client";

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="flex flex-col items-center justify-center gap-3">
        <h1>auth failed</h1>
        <p>check URL params for more detailes on the error.</p>
      </div>
    </div>
  );
}

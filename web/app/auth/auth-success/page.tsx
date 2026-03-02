
"use client"

import { useEffect, useState } from "react";
import authListener from "@/services/auth/utils/authListener";

export default function AuthSuccessPage() {
const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const subscription = authListener((profile) => {
      setUser(profile);
    });

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="flex flex-col items-center justify-center gap-3">
        <h1 className="font-semibold">login success</h1>
        {user ? (
          <div className="text-center text-zinc-600 dark:text-zinc-400">
            <p>login details:</p>
            <p>
              name:{" "}
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {user.name}
              </span>
            </p>
            <p>
              email address:{" "}
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {user.email}
              </span>
            </p>
          </div>
        ) : (
          <p className="text-sm text-zinc-400 animate-pulse">
            loading profile...
          </p>
        )}

        <button
          onClick={() => (window.location.href = "/")}
          className="mt-4 px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm hover:bg-zinc-800 transition-colors"
        >
          return
        </button>
      </div>
    </div>
  );
}

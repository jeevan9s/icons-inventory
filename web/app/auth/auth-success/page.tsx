"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/main/dashboard");
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center bg-neutral-100 select-none">
      <div className="flex flex-1 items-center justify-center px-6">
        <div className="flex flex-col md:flex-row items-start gap-10 text-center md:text-left">
          <div className="flex flex-col gap-4">
            <h1 className="font-thin text-4xl sm:text-5xl md:text-7xl lg:text-8xl text-black font-mp">
              Authorized
            </h1>

            <h3 className="text-black/80 font-med font-mp text-base sm:text-lg md:text-xl lg:text-2xl">
              You will now be redirected to the main dashboard.
            </h3>
          </div>
        </div>
      </div>

      <div className="px-6 py-4">
        <p className="text-black/80 font-mp text-sm">built for the iCons</p>
      </div>
    </div>
  );
}

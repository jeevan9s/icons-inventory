"use client";
import Navbar from "@/app/components/Navbar";

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex flex-col items-center bg-neutral-100 select-none">
      <Navbar pageType="main" />

      <div className="flex flex-1 items-center justify-center px-6">
        <div className="flex flex-col md:flex-row items-start gap-10 text-center md:text-left">
          <div className="flex flex-col gap-4">
            <h1 className="font-thin text-4xl sm:text-5xl md:text-7xl lg:text-8xl text-black font-mp">
              Not Authorized
            </h1>

            <h3 className="text-black/80 font-med font-mp text-base sm:text-lg md:text-xl lg:text-2xl">
              You do not have access to this software. Contact admin if this is a mistake.
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

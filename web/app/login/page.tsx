"use client"; 
import { onLogin } from "@/services/auth/authCallers";
import Navbar from "@/app/components/Navbar";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  async function startMSLogin() {
    try {
      await onLogin(); // browser-safe
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center bg-neutral-100 select-none">
      <Navbar pageType="main" />

      <div className="flex flex-1 items-center justify-center px-6">
        <div className="flex flex-col md:flex-row items-start gap-10 text-center md:text-left">
          <div className="flex flex-col gap-4 max-w-4xl">
            <h1 className="font-thin text-4xl sm:text-5xl md:text-7xl lg:text-8xl text-black font-mp">
              Login with Microsoft
            </h1>

            <h3 className="text-black/80 font-med font-mp text-base sm:text-lg md:text-xl lg:text-2xl">
              Use your Queen&apos;s NETID
            </h3>

            <p className="text-black/70 text-base sm:text-lg leading-relaxed mt-4">
              Once logged in, you&apos;ll be able to access the system.
            </p>

            <p className="text-black/70 text-sm sm:text-base mt-2">
              If you don&apos;t have an account yet, please contact admin for
              access
            </p>

            <Button onClick={startMSLogin} className="h-14 mt-5 w-full sm:w-64 rounded-lg text-white text-lg transition-transform duration-200 hover:bg-zinc-600 bg-zinc-800 hover:scale-105 hover:cursor-pointer">
              Login
            </Button>
          </div>
        </div>
      </div>

      <div className="px-6 py-4">
        <p className="text-black/80 font-mp text-sm">built for the iCons</p>
      </div>
    </div>
  );
}

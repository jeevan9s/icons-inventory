"use client";
import { Button } from "@/components/ui/button";
import Navbar from "../../components/Navbar";
import Link from "next/link";

export default function NotAuthorized() {
  return (
    <div className="min-h-screen flex flex-col items-center  bg-gray-100 select-none">
      <Navbar pageType="error" />
      <div className="flex flex-1 items-center justify-center px-6">
        <div className="flex flex-col md:flex-row items-center gap-10 text-center md:text-center">
          <div className="flex flex-col gap-4">
            <h1 className="font-thin text-4xl sm:text-5xl md:text-7xl lg:text-8xl text-black font-mp">
              Unauthorized Access
            </h1>

            <h3 className="text-black/80 font-med font-mp text-base sm:text-lg md:text-xl lg:text-2xl">
                You do not have permission to view this page. Contact developers or admins if you believe this is an error.
            </h3>

            <Link href="/">
              <Button className="h-14 mt-5 w-full sm:w-64 rounded-lg text-white text-lg transition-transform duration-200 hover:bg-zinc-600 bg-zinc-800 hover:scale-105 hover:cursor-pointer">
                Return
              </Button>
            </Link>
          </div>

          <div>
          </div>
        </div>
      </div>

      <div className="px-6 py-4">
        <p className="text-black/80 font-mp text-sm">built for the iCons</p>
      </div>
    </div>
  );
}

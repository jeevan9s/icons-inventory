"use client";
import { Button } from "@/components/ui/button";
import Navbar from "./components/Navbar";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center bg-neutral-100 select-none">
      <Navbar pageType="home" />
      <div className="flex flex-1 items-center justify-center px-6">
        <div className="flex flex-col md:flex-row items-start gap-10 text-center md:text-left">
          <div className="flex flex-col gap-4">
            <h1 className="font-thin text-4xl sm:text-5xl md:text-7xl lg:text-8xl text-black font-mp">
              iCons IMS
            </h1>

            <h3 className="text-black/80 font-med font-mp text-base sm:text-lg md:text-xl lg:text-2xl">
              Inventory Management System
            </h3>

            <Link href="/login">
              <Button className="h-14 mt-5 w-full sm:w-64 rounded-lg text-white text-lg transition-transform duration-200 hover:bg-zinc-600 bg-zinc-800 hover:scale-105 hover:cursor-pointer">
                Launch
              </Button>
            </Link>
          </div>

          <div>
            <div className="flex flex-col gap-4 text-left max-w-lg">
              <p className="text-black/70 text-base sm:text-lg leading-relaxed">
                Centralized inventory management and tracking.
              </p>
              <ul className="list-disc list-inside text-black/80 text-base sm:text-lg space-y-2">
                <li>Reliable inventory tracking</li>
                <li>Real-time equipment updates</li>
                <li>Support through detailed user guide and documentation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-4">
        <p className="text-black/80 font-mp text-sm">built for the iCons</p>
      </div>
    </div>
  );
}

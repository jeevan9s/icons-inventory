"use client";
import { Button } from "@/components/ui/button";
import Navbar from "@/app/components/Navbar";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center  bg-gray-300 select-none">
      <Navbar pageType="main" />
      <div className="flex flex-1 items-center justify-center px-6">
      </div>

      <div className="px-6 py-4">
        <p className="text-black/80 font-mp text-sm">built for the iCons</p>
      </div>
    </div>
  );
}

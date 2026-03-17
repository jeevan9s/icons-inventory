"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

type navbarProps = {
  pageType: "home" | "landing" | "main" | "error" | "dashboard";
};

export default function Navbar({ pageType }: navbarProps) {
  const pathname = usePathname();

  const getButtonClass = (href: string) => {
    const isActive = pathname === href;
    return `px-3 py-1 bg-transparent rounded-lg text-white text-sm transition-transform duration-200 hover:bg-transparent hover:font-bold hover:scale-103 hover:cursor-pointer ${
      isActive ? "underline underline-offset-4 decoration-1" : ""
    }`;
  };

  return (
    <div className="flex justify-between items-center px-6 py-4 h-18 sm:h-22 md:h-24 z-1 bg-neutral-100">
      <div className="left-5 right-5 w-40 sm:w-52 md:w-64">
        <a href="https://www.engsoc.queensu.ca" rel="noopener noreferrer" target="_blank">
          <Image src="/engsoc_logo.png" alt="engsoc logo" width={500} height={500} className="w-full h-auto" />
        </a>
      </div>
      <div className="hidden absolute left-1/2 -translate-x-1/2 mx-auto sm:flex items-center p-1.5 bg-zinc-800 rounded-full shadow-lg border border-white/5">
        <div className="flex gap-2 items-center px-4 py-2 bg-white/10 rounded-full">
          {(pageType === "landing" || pageType === "main") && (
            <Link href="/main/dashboard">
              <Button className={getButtonClass("/main/dashboard")}>
                Home
              </Button>
            </Link>
          )}
          {(pageType === "landing" || pageType === "home" || pageType === "error") && (
            <a target="_blank" rel="noopener noreferrer" href="https://www.engsoc.queensu.caservices/educational/icons/">
              <Button className="px-3 py-1 bg-transparent rounded-lg text-white text-sm transition-transform duration-200 hover:bg-transparent hover:font-bold hover:scale-103 hover:cursor-pointer">
                About
              </Button>
            </a>
          )}
          {(pageType === "main" || pageType === "error") && (
            <Link href="/support">
              <Button className={getButtonClass("/support")}>
                Support
              </Button>
            </Link>
          )}
          <Link href="/contact">
            <Button className={getButtonClass("/contact")}>
              Contact
            </Button>
          </Link>
        </div>
        {(pageType === "landing" || pageType === "home") && (
          <Link href="/login">
            <Button className="px-3 m-3 py-1 bg-white/90 rounded-xl text-black text-sm transition-transform duration-200 hover:bg-white hover:font-bold hover:scale-105 hover:cursor-pointer">
              Launch
            </Button>
          </Link>
        )}
        {pageType === "error" && (
          <Link href="/">
            <Button className="px-3 m-3 py-1 bg-white/90 rounded-xl text-black text-sm transition-transform duration-200 hover:bg-white hover:font-bold hover:scale-105 hover:cursor-pointer">
              Return
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

// reusable navbar with props
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type navbarProps = {
    pageType: "home" | "landing" | "main"
}

export default function Navbar({ pageType }: navbarProps ) {
 
    return (
    <div className="flex justify-between items-center px-6 py-4 z-1">
      <div className="absolute left-5 right-5 mt-10 w-40 sm:w-52 md:w-64">
        <a href="https://www.engsoc.queensu.ca/" rel="noopener noreferrer" target="_blank">
        <Image
          src="/engsoc_logo.png"
          alt="engsoc logo"
          width={500}
          height={500}
          className="w-full h-auto"
        />
        </a>
      </div>

      <div className="hidden sm:flex items-center p-1.5 bg-zinc-800 rounded-full shadow-lg border border-white/5">
        <div className="flex gap-2 items-center px-4 py-2 bg-white/10 rounded-full">
            {pageType !== "home" && (
            <Link href="/">
            <Button className="px-3 py-1 bg-transparent rounded-lg text-white text-sm transition-transform duration-200 hover:bg-transparent hover:font-bold hover:scale-103 hover:cursor-pointer">
              Home
            </Button>
          </Link>
          )}

         
          <a target="_blank" rel="noopener noreferrer" href="https://www.engsoc.queensu.ca/services/educational/icons/">
            <Button className="px-3 py-1 bg-transparent rounded-lg text-white text-sm transition-transform duration-200 hover:bg-transparent hover:font-bold hover:scale-103 hover:cursor-pointer">
              About
            </Button>
          </a>

          {(pageType === "main") && (
          <Link href="/support">
            <Button className="px-3 py-1 bg-transparent rounded-lg text-white text-sm transition-transform duration-200 hover:bg-transparent hover:font-bold hover:scale-103 hover:cursor-pointer">
              Support
            </Button>
          </Link>
          )}

          <Link href="/contact">
            <Button className="px-3 py-1 bg-transparent rounded-lg text-white text-sm transition-transform duration-200 hover:bg-transparent hover:font-bold hover:scale-103 hover:cursor-pointer">
              Contact
            </Button>
          </Link>
        </div>
        
        {(pageType === "landing" || pageType === "home") &&  (
        <Link href="/login">
        <Button className="px-3 m-3 py-1 bg-white/90 rounded-xl text-black text-sm transition-transform duration-200 hover:bg-white hover:font-bold hover:scale-105 hover:cursor-pointer">
          Launch
        </Button>
        </Link>
        )}
      </div>
    </div>
  );
}

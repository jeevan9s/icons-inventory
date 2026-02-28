"use client";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="flex flex-col items-center justify-center gap-3">
        <h1>iCons inventory management</h1>
        <button
          className="bg-neutral-800 hover:bg-neutral-700 text-white py-2 px-4 rounded-lg cursor-pointer"
          onClick={() => router.push("/auth/login")} 
        >
          auth test
        </button>
        <button 
          className="bg-neutral-800 hover:bg-neutral-700 text-white py-2 px-4 rounded-lg cursor-pointer"
          onClick={() => router.push("/databasetesting")}
        >
          database test
        </button>
      </div>
    </div>
  );
}
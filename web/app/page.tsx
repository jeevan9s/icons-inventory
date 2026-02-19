"use client";
import { useState } from "react";
import LoginPage from "./LoginPage/page";

export default function Home() {


  const [loginVisible, setLoginVisible] = useState(false);



  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      
      <div className="flex flex-col items-center justify-center gap-3">
        <h1 className="mt-5">in development</h1>
        {/* {!loginVisible && ( */}
        <button
          className="bg-neutral-800 hover:bg-neutral-700 text-white py-2 px-4 rounded-lg cursor-pointer" onClick={() => setLoginVisible(true)}>
         auth test </button> 

          {/* {loginVisible && (
            <LoginPage />
          )} */}
      </div>
    </div>
  );
}

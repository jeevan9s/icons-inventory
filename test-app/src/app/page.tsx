"use client"
import { useState } from "react";

export default function Home() {

const [buttonOn, setButtonOn] = useState(false);
const [flaskResponse, setFlaskResponse] = useState("");

  const handleClick = async () => {
    setButtonOn(true);

    try {
        const res = await fetch("http://localhost:5000/sup"); // flask route URL
        const data  = await res.json();
        setFlaskResponse(data.message);
    } catch (err) {
      console.error("fetch error", err);
    }
  }

  return (
 <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
  <div className="flex flex-col items-center justify-center gap-3">
    <h1>quick test</h1>

    <button className="bg-neutral-800 hover:bg-neutral-700 text-white py-2 px-4 rounded-lg cursor-pointer" onClick={handleClick}>
      say wsp to backend
    </button>

    {buttonOn && (
      <p className="mt-4 text-md">{flaskResponse}</p>
    )}
  </div>
</div>

  );
}

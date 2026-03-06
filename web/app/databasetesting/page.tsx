"use client"; // must be a Client Component to use browser APIs
import { getData, addEntry, deleteEntry } from "../../lib/databaseHelpers"


export default function DatabaseTestingPage() {
    return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <h1>Database Testing Page</h1>
        <button className="bg-neutral-800 hover:bg-neutral-700 text-white py-2 px-4 rounded-lg cursor-pointer" onClick={ () => getData()}>Get All Data</button>
        <button className="bg-neutral-800 hover:bg-neutral-700 text-white py-2 px-4 rounded-lg cursor-pointer" onClick={ () => addEntry(55)}>Add entry</button>
        <button className="bg-neutral-800 hover:bg-neutral-700 text-white py-2 px-4 rounded-lg cursor-pointer" onClick={ () => deleteEntry(55)}>Delete entry</button>
    </div>
    );
}

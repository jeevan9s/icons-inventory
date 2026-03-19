"use client"; // must be a Client Component to use browser APIs
import { getData, deleteById, exportTable, insertEntry, updateEntry, getDataFiltered } from "../../services/lib/database-functions/databaseHelpers"


export default function DatabaseTestingPage() {
    return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <h1>Database Testing Page</h1>
        <button className="bg-neutral-800 hover:bg-neutral-700 text-white py-2 px-4 rounded-lg cursor-pointer" onClick={ async () => console.log( await getData("Testing Table", "created_at", true, 6, 2))}>Get All Data</button>
        <button className="bg-neutral-800 hover:bg-neutral-700 text-white py-2 px-4 rounded-lg cursor-pointer" onClick={ () => deleteById("Testing Table", 55)}>Delete entry</button>
        <button className="bg-neutral-800 hover:bg-neutral-700 text-white py-2 px-4 rounded-lg cursor-pointer" onClick={ () => exportTable("Testing Table")}>Export Table</button>
        <button className="bg-neutral-800 hover:bg-neutral-700 text-white py-2 px-4 rounded-lg cursor-pointer" onClick={ async () => console.log(await insertEntry("Testing Table", {value: 400}))}>insertEntry </button>
        <button className="bg-neutral-800 hover:bg-neutral-700 text-white py-2 px-4 rounded-lg cursor-pointer" onClick={ async () => console.log(await updateEntry("Testing Table", 50, {value: 999}))}>updateEntry </button>
        <button className="bg-neutral-800 hover:bg-neutral-700 text-white py-2 px-4 rounded-lg cursor-pointer" onClick={ async () => console.log(await getDataFiltered("Testing Table", "value", "gte", 42))}>getDataFiltered </button>
    </div>
    );
}

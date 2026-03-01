"use client"; // must be a Client Component to use browser APIs
import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'
import { randomInt } from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUB_KEY
const supabase = createClient<Database>(supabaseUrl!, supabaseKey!)

export default function DatabaseTestingPage() {
    
    async function getAllData() {
        console.log("Testing database connection...");
        let { data, error } = await supabase
        .from('Testing Table')
        .select('*')
        data?.forEach((row) => {
            console.log("Row:", row);
        });
        console.log("Error:", error);
    }

    async function addEntry(val: number) {
        console.log("Adding entry");
        const { data, error } = await supabase
        .from('Testing Table')
        .insert({value: val})
        .select()
        data?.forEach((row) => {
            console.log("Row ", row);
        });
        console.log("Error: ",error);
    }

    async function deleteEntry(val: number) {
        console.log("Removing Entry");
        const { data, error } = await supabase
        .from("Testing Table")
        .delete()
        .eq('value', val)
        .select();
        
    }

    return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <h1>Database Testing Page</h1>
        <button className="bg-neutral-800 hover:bg-neutral-700 text-white py-2 px-4 rounded-lg cursor-pointer" onClick={getAllData}>Get All Data</button>
        <button className="bg-neutral-800 hover:bg-neutral-700 text-white py-2 px-4 rounded-lg cursor-pointer" onClick={ () => addEntry(55)}>Add entry</button>
        <button className="bg-neutral-800 hover:bg-neutral-700 text-white py-2 px-4 rounded-lg cursor-pointer" onClick={ () => deleteEntry(55)}>Delete entry</button>
    </div>
    );
}

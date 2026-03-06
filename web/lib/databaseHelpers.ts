"use client"; // must be a Client Component to use browser APIs
import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUB_KEY
const supabase = createClient<Database>(supabaseUrl!, supabaseKey!)

//Gets data entries from specified table beginning with entry # 'begin' and entry number 'end'
export async function getData(table?: string, begin?: number, end?: number) {
    console.log(`Getting entries ${begin} to ${end} from ${table} ...`);
    let { data, error } = await supabase
    .from(table as "Loan Items" | "Loans" | "Stock" | "Testing Table" | "Profiles")
    .select('*')
    data?.forEach((row) => {
        console.log("Row:", row);
    });
    console.log("Error:", error);
}

export async function addEntry(val: number) {
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

export async function deleteEntry(val: number) {
    console.log("Removing Entry");
    const { data, error } = await supabase
    .from("Testing Table")
    .delete()
    .eq('value', val)
    .select();
    
}

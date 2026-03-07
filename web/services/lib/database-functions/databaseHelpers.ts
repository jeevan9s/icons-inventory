"use client"; // must be a Client Component to use browser APIs
import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUB_KEY
const supabase = createClient<Database>(supabaseUrl!, supabaseKey!)

//  Gets data entries from specified table
//  When no additional parameters supplied, returns all entries in table.
//  First optional parameter specifies the end entry, second specifies the count of items.
//  Second parameter specifies the starting entry.
//  If only count is provided, it will return the 'count' most recent entries
export async function getData(table: string, count?: number, begin?: number) {
    console.log(`Getting entries ${begin} to ${count} from ${table} ...`); // TODO remove this when implemented
    let entries: Array<Object>;
    if (count === undefined && begin === undefined) { 
        let data =
        while    
    }
    let { data, error } = await supabase
    .from(table as "Loan Items" | "Loans" | "Stock" | "Testing Table" | "Profiles")
    .select('*');
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

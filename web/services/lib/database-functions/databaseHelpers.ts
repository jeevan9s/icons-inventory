"use client"; // must be a Client Component to use browser APIs
import { ValueOf } from 'next/dist/shared/lib/constants';
import { Database } from './database.types';
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUB_KEY
const supabase = createClient<Database>(supabaseUrl!, supabaseKey!)

//  Gets data entries from specified table
//  When no additional parameters supplied, returns all entries in table.
//  First optional parameter specifies the end entry, second specifies the count of items.
//  Second parameter specifies the starting entry.
//  If only count is provided, it will return the 'count' most recent entries
//
//  For full functionality, ensure that database.types.ts is up to date.
export async function getData<table_name extends keyof Database['public']['Tables']>(table: table_name, count?: number, begin?: number) {
    console.log(`Getting entries ${begin} to ${count} from ${table} ...`); // TODO remove this when testing completed
    let entries: Array<Object> = [];
    if (count === undefined && begin === undefined) { // if nothing specified, get all entries
        const { count } = await supabase.from(table).select("", { count: 'exact'});
        if (count == null) return; 
        for (let i = count; i >= 0; i-=1000) {
            let { data, error } = await supabase
            .from(table)
            .select("*")
            .range(Math.max(0, i-1000), i);
            if (data == null) break;
            entries = entries.concat(data);
        }
        return entries;
    }
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

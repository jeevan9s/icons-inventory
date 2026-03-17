"use client"; // must be a Client Component to use browser APIs
import { Database } from './database.types';
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUB_KEY
const supabase = createClient<Database>(supabaseUrl!, supabaseKey!)

//  Gets data entries from specified table ordered based on an input column name
//  When no additional parameters supplied, returns all entries in table.
//  First optional parameter specifies the number of entries to return, or if -1, explicitly return all elements.
//  Second optional parameter specifies the starting entry (inclusively indexed at zero).
//
//  For full functionality, ensure that database.types.ts is up to date.
export async function getData<table_name extends keyof Database['public']['Tables'],column extends keyof Database['public']['Tables'][table_name]['Row']>(table: table_name, order: column, ascending: boolean, count?: number, begin?: number) {
    let ordString: string = order as string;
    let entries: Array<Object> = [];
    // get all entries
    if ((count === undefined || count === -1) && begin === undefined) {
        const { count, error } = await supabase.from(table).select("", { count: 'exact'});
        if (error) console.error(error);
        if (count == null) return entries; 
        for (let i = count; i >= 0; i-=1000) {
            let { data, error } = await supabase
            .from(table)
            .select("*")
            .order(ordString, { ascending: ascending })
            .range(Math.max(0, i-1000), i);
            if (data == null) break;
            if (error) console.error(error);
            entries = entries.concat(data);
        }
        return entries;
    }
    // get count entries
    else if (begin === undefined && (count !== undefined && count !== -1)) {
        count --;
        for (let i = count; i >= 0; i-=1000) {
            let { data, error } = await supabase
            .from(table)
            .select("*")
            .order(ordString, { ascending: ascending })
            .range(Math.max(0, i-1000), i);
            if (data == null) break;
            if (error) console.error(error);
            entries = entries.concat(data);
        }
        return entries;
    }
    // get count entries, starting at begin
    else if (begin !== undefined && (count !== undefined && count !== -1)) {
        count --;
        for (let i = count+begin; i >= begin; i-=1000) {
            let { data, error } = await supabase
            .from(table)
            .select("*")
            .order(ordString, { ascending: ascending })
            .range(Math.max(begin, i-1000), i);
            if (data == null) break;
            if (error) console.error(error);
            entries = entries.concat(data);
        }
        return entries;
    }
    // get all entries starting at begin
    else {
        const { count, error } = await supabase.from(table).select("", { count: 'exact'});
        if (error) console.error(error);
        if (count == null) return entries; 
        for (let i = begin!; i <= count-begin!; i+=1000) {
            let { data, error } = await supabase
            .from(table)
            .select("*")
            .order(ordString, { ascending: ascending })
            .range(i, count);
            if (data == null) break;
            if (error) console.error(error);
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
    if (error) console.error(error);
    data?.forEach((row) => {
        console.log("Row ", row);
    });
}

//  Delete by id deletes an entry from the specified table based on it's unique id number.
export async function deleteById<table_name extends keyof Database['public']['Tables'], identificationNumber extends Database['public']['Tables'][table_name]['Row']['id']>
 (table: table_name, id: identificationNumber) {
    const { data, error } = await supabase
    .from(table)
    .delete()
    .eq('id', id as any);
    if (error) console.error(error);
    if (data) console.log(data);
}

//  Export table function takes in a name of a table in the database and exports it to the browser downloader
//  as a table_name.csv
export async function exportTable<table_name extends keyof Database['public']['Tables']> (table: table_name) {
    let entries: Array<Object> = await getData(table, 'id', true, -1);
    if (entries.length === 0) {
        console.log("No entries to export");
        return;
    }
    let headers: string[] = Object.keys(entries[0]);
    let csvContent: string = headers.join(",") + "\n";
    entries.forEach((entry) => {
        Object.values(entry).forEach((value) => {
            let formatted  = typeof value == "object" && value ? JSON.stringify(value) : value
            formatted = String(formatted ?? "");

            csvContent += `"${formatted.replace(/"/g, '""')}",`
 
        })
        csvContent += "\n";
    });
    // Download the CSV file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${table}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
}


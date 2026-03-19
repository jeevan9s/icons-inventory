"use client"; // must be a Client Component to use browser APIs

import Papa from "papaparse";
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

//  Gets data entries from a specified table where their column 'searchBy' has the value of
//  qualifier.
export async function getDataFiltered<table_name extends keyof Database['public']['Tables'],column extends Database['public']['Tables'][table_name]['Row']> (table: table_name, filterBy: keyof column, qualifier: "e" | "gt" | "lt" | "gte" | "lte", filterTerm: column[keyof column]) {
    if (qualifier === "e") {
        const { data, error } = await supabase
        .from(table)
        .select("*")
        .eq(filterBy as string, filterTerm as any);
        if (error) console.error(error);
        return data || [];
    } else if (qualifier === "gt") {
        const { data, error } = await supabase
        .from(table)
        .select("*")
        .gt(filterBy as string, filterTerm as any);
        if (error) console.error(error);
        return data || [];
    } else if (qualifier === "lt") {
        const { data, error } = await supabase
        .from(table)
        .select("*")
        .lt(filterBy as string, filterTerm as any);
        if (error) console.error(error);
        return data || [];
    } else if (qualifier === "gte") {
        const { data, error } = await supabase
        .from(table)
        .select("*")
        .gte(filterBy as string, filterTerm as any);
        if (error) console.error(error);
        return data || [];
    } else if (qualifier === "lte") {
        const { data, error } = await supabase
        .from(table)
        .select("*")
        .lte(filterBy as string, filterTerm as any);
        if (error) console.error(error);
        return data || [];
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
            csvContent += `"${value}",`;
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
export async function insertEntry<T extends keyof Database["public"]["Tables"], row extends Database["public"]["Tables"][T]["Insert"]>
(table: T, data: row) {
  const { data: insertedData, error } = await supabase
    .from(table)
    .insert(data as any)
    .select();

  if (error) {
    console.error(`Error inserting into ${String(table)}:`, error);
    return null;
  }

  console.log(data);

  return insertedData;
}

export async function updateEntry<T extends keyof Database["public"]["Tables"], row extends Database["public"]["Tables"][T]["Update"]>
(table: T, id: Database["public"]["Tables"][T]["Row"]["id"], updatedData: row) {
  const { data, error } = await supabase
    .from(table)
    .update(updatedData as any)
    .eq("id", id as any)
    .select();

  if (error) {
    console.error(`Error updating ${String(table)} with id ${id}:`, error);
    return null;
  }

  return data;
}

export async function importCSV<table_name extends keyof Database["public"]["Tables"]>(table: table_name,file: File) {
  const text = await file.text();

  const parsed = Papa.parse<Database["public"]["Tables"][table_name]["Insert"]>(text, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true
  });

  if (parsed.errors.length > 0) {
    console.error("CSV parse errors:", parsed.errors);
    return null;
  }

  const rows = parsed.data as Database["public"]["Tables"][table_name]["Insert"][];

  if (rows.length === 0) {
    console.log("CSV file has no data."); 
    return null;
  }

  const { data, error } = await supabase
    .from(table)
    .insert(rows as any)
    .select();

  if (error) {
    console.error("Error importing CSV:", error);
    return null;
  }

  console.log(`Successfully imported CSV into ${String(table)}`, data);
  return data;
}
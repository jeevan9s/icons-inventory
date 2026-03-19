"use client";

import Layout from "../components/Layout";
import { 
useDatabase
} from "@/services/lib/hooks/useDatabase";

export default function Testing() {
    const {useGetRows, useDeleteRow, useExport, useRowFiltered, useRowInsert} = useDatabase();
    const { refetch: getAll } = useGetRows("Stock");;
    const { mutate: remove } = useDeleteRow("Stock");
    const {mutate: exports } = useExport("Stock");
    const {refetch: getFiltered} = useRowFiltered("Stock", "total_stock", "e", 4);
    const {mutate: insert} = useRowInsert<"Stock">();

    return (
        <Layout>
            <div className="min-h-screen flex flex-col items-center bg-neutral-100 select-none">
                <div className="flex flex-1 items-center justify-center px-6">
                    <div className="flex flex-col md:flex-row items-start gap-10 text-center md:text-left">
                        <div className="flex flex-col gap-4">
                            <h1 className="font-thin text-4xl sm:text-5xl md:text-7xl lg:text-8xl text-black font-mp">
                                Library Hook Testing
                            </h1>

                            <h3 className="text-black/80 text-center font-med font-mp text-base sm:text-lg md:text-xl lg:text-2xl">
                                check hook outputs and prints through the console. (Ctrl+Shift+I)
                            </h3>

                            <div className="flex flex-wrap gap-4 justify-center mt-8">
                                <button 
                                    onClick={() => getAll()} 
                                    className="px-6 py-2 bg-white border border-neutral-300 rounded text-xs font-bold hover:bg-neutral-50 transition-colors hover:cursor-pointer"
                                >
                                    get all rows
                                </button>

                                {/* copy and paste from here */}
                                <button 
                                    onClick={() => remove(1)} 
                                    className="px-6 py-2 bg-red-600 text-white rounded text-xs font-bold hover:bg-red-700 transition-colors hover:cursor-pointer"
                                >
                                    delete row ID
                                </button>
                                {/* to here, and replace the function (remove(1)) with the funciton you implemented to test */}

                                                                <button 
                                    onClick={() => exports("Stock")} 
                                    className="px-6 py-2 bg-white border border-neutral-300 rounded text-xs font-bold hover:bg-neutral-50 transition-colors hover:cursor-pointer"
                                >
                                    export table by name
                                </button>
                                
                                
                                <button 
                                    onClick={() => getFiltered()} 
                                    className="px-6 py-2 bg-white text-black rounded text-xs font-bold hover:bg-red-700 transition-colors hover:cursor-pointer"
                                >
                                    use row filtered
                                </button>
                                
                                <button 
                                    onClick={() => insert({
                                        table: "Stock" , 
                                        data: {
                                            id: 6,
                                            name: "charger",
                                            net_stock: 6,
                                            total_stock: 9, 
                                            item_properties: {"equipment_type" : "electronic"}
                                        }
                                        
                                    })} 
                                    className="px-6 py-2 bg-white text-black rounded text-xs font-bold hover:bg-red-700 transition-colors hover:cursor-pointer"
                                >
                                    insert row
                                </button>
                                



                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4">
                    <p className="text-black/80 font-mp text-sm">built for the iCons</p>
                </div>
            </div>
        </Layout>
    );
}
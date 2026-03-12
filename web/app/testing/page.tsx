"use client";

import { useRows, useRowDelete } from "@/services/lib/hooks/useDatabase";

export default function Testing() {
    const { data: stock } = useRows("Stock");
    
    const { mutate } = useRowDelete("Stock");

    const handleDelete = () => {
        mutate(2); 
    };

    return (
        <div>
            <button onClick={handleDelete}>Delete ID 2</button>
            <pre>{JSON.stringify(stock, null, 2)}</pre>
        </div>
    );
}
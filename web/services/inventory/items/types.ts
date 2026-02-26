export interface Item {
    name: string,
    id: number,
    location?: string,
    quantity?: number,
    status?: status,
    equipmentType: equipmentType
}

type status =  {
    rented: string,
    inStock: string,
    outStock: string
}

// maybe in-future make this dynamic
type equipmentType = {
    electronic: string,
    stationary: string,
    lab: string,
    misc: string
}


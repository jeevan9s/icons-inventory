export interface Rental {
    name: string,
    id: number,
    location?: string,
    quantity?: number,
    status?: status,
    equipmentType: equipmentType
}

type status = "rented" | "inStock" | "outStock"
type equipmentType = "electronic" | "stationary" | "lab" | "misc"
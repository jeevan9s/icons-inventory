export interface Item {
    name: string,
    id: number,
    location?: string,
    quantity?: number,
    status?: status,
    equipmentType: equipmentType
}

// fix: these "sub-types" should just be a union/collection of strings, instead of objects with fields. 
type status = "rented" | "inStock" | "outStock"

// this can be made dynamic in the future by making the equipmentType field in the Item interface a string, and adding a validation function.
type equipmentType = "electronic" | "stationary" | "lab" | "misc"


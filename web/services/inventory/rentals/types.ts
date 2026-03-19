export interface Rental {
    name: string,
    id: number,
    location: string,
    quantity: number,
    status: status,
    equipmentType: equipmentType,
    notes: string;
}

type status = "onLoan" | "returned" | "overdue"
type equipmentType = "electronic" | "stationary" | "lab" | "misc"
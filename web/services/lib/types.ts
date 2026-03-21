// types for component-usage

export type LoanRow = {
  id: number;
  signee: string;
  student_name?: string | null;
  student_number: number;
  location?: string | null;
  notes?: string | null;
  time_out: string;
  time_in?: string | null;
  status?: string;
  display_name?: string;
  equipment_type?: equipmentType;
  item_name?: string;
  item_quantity?: number | null;
  loan_item_id?: number | null;
  item_id?: number | null;
};

export type InventoryRow = {
  id: number;
  name: string;
  total_stock: number;
  net_stock: number;
  item_properties: {
    equipment_type?: equipmentType;
    [key: string]: unknown;
  } | null;
};

export interface LoanItemRow {
  id: number;
  loan_id: number;
  item_id: number;
  status?: string;
}

export type ActivityItem = {
  id: number | string;
  type: 'loan' | 'stock';
  date: Date;
  status: string;
  item_name: string;
  student_name?: string;
  display_name?: string;
  action: 'logged' | 'completed' | 'added' | 'updated';
};

export type ExportFilters = {
  signeeName?: string;
  startDateTime?: string;
  endDateTime?: string;
  status?: string;
  equipment_type?: string;
  threshold?: number;
};

export type ExportPayload = {
  mode: "all" | "selected" | "filtered";
  ids?: (string | number)[];
  filters?: ExportFilters;
};

export type equipmentType = "stationary" | "electronic" | "misc";

export type Role = "Admin" | "Dev" | "Operator";
export type Section = "users" | "equipment";

export const ROLES: Role[] = ["Admin", "Dev", "Operator"];
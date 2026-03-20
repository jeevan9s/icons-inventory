// types for component-usage

export type LoanRow = {
  id: number;
  item: string;
  signee: string;
  student_number: string; 
  student_name: string;
  location: string;
  notes: string;
  time_out: string;
  time_in: string;
  status: string;
  display_name?: string;
  equipment_type?: equipmentType
  item_name?: string;
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

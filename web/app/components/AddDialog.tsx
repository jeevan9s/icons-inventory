"use client";

import { TableType, addDialogTitles } from "../frontendTypes";
import Modal from "./Modal";
import { useState, useEffect, useRef, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Package, ClipboardList, Loader2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@/services/lib/hooks/useAuth";
import {
  useRowInsert,
  useUpdateRow,
  useGetRows,
} from "@/services/lib/hooks/useDatabase";
import { getDataFiltered } from "@/services/lib/database-functions/databaseHelpers";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { InventoryRow, LoanRow } from "@/services/lib/types";
import { normalizeEqType } from "@/services/lib/helpers";
import { normalize } from "path";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  initialTableType: TableType;
  fixedTableType?: boolean;
  editData?: InventoryRow | LoanRow;
};

export default function AddDialog({
  isOpen,
  onClose,
  initialTableType,
  fixedTableType,
  editData,
}: Props) {
  const [tableType, setTableType] = useState<TableType>(initialTableType);
  const [loanItems, setLoanItems] = useState([
    { name: "", quantity: 1, equipment_type: "" },
  ]);
  const [showDropdowns, setShowDropdowns] = useState<boolean[]>([false]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const isEditMode = !!editData;
  const router = useRouter();
  const { user } = useUser();

  const insertRow = useRowInsert();
  const updateStockRow = useUpdateRow("Stock");
  const updateLoanRow = useUpdateRow("Loans");
  const updateLoanItemRow = useUpdateRow("Loan Items");
  const queryClient = useQueryClient();
  const { data: stockRows = [] } = useGetRows("Stock");

  const customEquipmentTypes =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("custom_equipment_types") ?? "[]").map(normalizeEqType)
      : [];

  const equipmentTypes = Array.from(
    new Set([
      ...(stockRows as any[])
        .map((r) => normalizeEqType(r.item_properties?.equipment_type))
        .filter(Boolean),
      ...customEquipmentTypes,
    ]),
  ) as string[];

  useEffect(() => {
    setTableType(initialTableType);
  }, [initialTableType]);

  useEffect(() => {
    if (!editData || !isOpen) return;
    if (initialTableType === "Loans") {
      const loan = editData as LoanRow;
      setLoanItems([
        {
          name: loan.item_name ?? "",
          quantity: loan.item_quantity ?? 1,
          equipment_type: normalizeEqType(loan.equipment_type),
        },
      ]);
      setShowDropdowns([false]);
    }
  }, [editData, isOpen, initialTableType]);

  useEffect(() => {
    if (!isOpen) {
      setLoanItems([{ name: "", quantity: 1, equipment_type: "" }]);
      setShowDropdowns([false]);
    }
  }, [isOpen]);

  const addRow = () => {
    setLoanItems([...loanItems, { name: "", quantity: 1, equipment_type: "" }]);
    setShowDropdowns([...showDropdowns, false]);
  };

  const removeRow = (index: number) => {
    setLoanItems(loanItems.filter((_, i) => i !== index));
    setShowDropdowns(showDropdowns.filter((_, i) => i !== index));
    inputRefs.current = inputRefs.current.filter((_, i) => i !== index);
  };

  const updateLoanItem = (
    index: number,
    field: "name" | "quantity" | "equipment_type",
    value: string | number,
  ) => {
    const newItems = [...loanItems];

    if (field === "equipment_type") value = normalizeEqType(value as string); 

    newItems[index] = { ...newItems[index], [field]: value };
    setLoanItems(newItems);
  };

  const returnToggle = useUpdateRow("Loans");

  const handleReturnToggle = useCallback(
    (row: LoanRow) => {
      // toggle time_in
      const newTimeIn = row.time_in ? null : new Date().toISOString();

      updateLoanRow.mutate(
        {
          id: row.id!, // row.id must exist
          data: { time_in: row.time_in ? null : new Date().toISOString() },
        },
        {
          onSuccess: () => {
            toast.success(
              row.time_in ? "Check-in removed" : "Item returned successfully",
            );
            router.refresh();
          },
          onError: () => toast.error("Failed to update loan status"),
        },
      );
    },
    [updateLoanRow, router],
  );

  const handleLoanSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  if (!user?.id) return toast.error("User session missing.");

  const formData = new FormData(e.currentTarget);
  const rawStudentNum = formData.get("student_number") as string;
  const studentNum = parseInt(rawStudentNum);

  if (studentNum > 2147483647) {
    toast.error("Student number too long (Max 10 digits).");
    return;
  }

  if (isEditMode) {
    const loan = editData as LoanRow;
    try {
      await updateLoanRow.mutateAsync({
        id: loan.id!,
        data: {
          student_name: formData.get("student_name") as string,
          student_number: studentNum,
          location: formData.get("location") as string,
          notes: formData.get("notes") as string,
        },
      });

      if (loan.loan_item_id && loan.item_id) {
        const results = await getDataFiltered(
          "Stock",
          "name",
          "ilike",
          `%${loanItems[0].name.trim()}%`,
        );
        const stockMatch = loanItems[0].equipment_type
          ? (results as any[]).filter(
              (r) =>
                normalizeEqType(r.item_properties?.equipment_type) ===
                normalizeEqType(loanItems[0].equipment_type),
            )
          : (results as any[]);

        if (stockMatch && stockMatch.length > 0) {
          const stock = stockMatch[0];
          const qtyDiff = loanItems[0].quantity - (loan.item_quantity ?? 1);

          await updateLoanItemRow.mutateAsync({
            id: loan.loan_item_id,
            data: { item_quantity: loanItems[0].quantity },
          });

          await updateStockRow.mutateAsync({
            id: stock.id,
            data: { net_stock: Number(stock.net_stock) - qtyDiff },
          });
        }
      }

      toast.success("Loan updated.");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["Loans"] }),
        queryClient.invalidateQueries({ queryKey: ["Stock"] }),
        queryClient.invalidateQueries({ queryKey: ["Loan Items"] }),
      ]);
      onClose();
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    }
    return;
  }

  try {
    const existingLoans = await getDataFiltered(
      "Loans",
      "student_number",
      "e",
      studentNum,
    );
    const activeLoan = (existingLoans as LoanRow[])?.find((l) => !l.time_in);

    let targetLoanId: string | number;

    if (activeLoan) {
      targetLoanId = activeLoan.id!;
      toast.info(`Adding to ${activeLoan.student_name}'s active loan.`);
    } else {
      const loanResponse = await insertRow.mutateAsync({
        table: "Loans",
        data: {
          student_name: formData.get("student_name") as string,
          student_number: studentNum,
          location: formData.get("location") as string,
          notes: formData.get("notes") as string,
          signee: user.id,
          time_out: new Date().toISOString(),
        },
      });
      targetLoanId = loanResponse?.[0]?.id;
      if (!targetLoanId) throw new Error("Failed to generate Loan ID");
    }

    for (const item of loanItems) {
      const results = await getDataFiltered(
        "Stock",
        "name",
        "ilike",
        `%${item.name.trim()}%`,
      );
      const stockMatch = item.equipment_type
        ? (results as any[]).filter(
            (r) =>
              normalizeEqType(r.item_properties?.equipment_type) ===
              normalizeEqType(item.equipment_type),
          )
        : (results as any[]);

      if (!stockMatch || stockMatch.length === 0) {
        toast.error(`"${item.name}" not found in inventory.`);
        continue;
      }

      const stock = stockMatch[0];

      await insertRow.mutateAsync({
        table: "Loan Items",
        data: {
          loan_id: Number(targetLoanId),
          item_id: stock.id,
          item_quantity: item.quantity,
        },
      });

      await updateStockRow.mutateAsync({
        id: stock.id,
        data: { net_stock: Number(stock.net_stock) - Number(item.quantity) },
      });
    }

    toast.success(
      activeLoan
        ? "Items added to existing loan."
        : "Loan authorized and inventory updated.",
    );
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["Loans"] }),
      queryClient.invalidateQueries({ queryKey: ["Stock"] }),
      queryClient.invalidateQueries({ queryKey: ["Loan Items"] }),
    ]);
    onClose();
    router.refresh();
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Transaction failed";
    console.error("TRANSACTION FAILED:", errorMessage);
    toast.error(errorMessage);
  }
};

  const handleStockSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const total = parseInt(formData.get("total_stock") as string);

    if (isEditMode) {
      const stock = editData as InventoryRow;
      try {
        await updateStockRow.mutateAsync({
          id: stock.id,
          data: {
            name: formData.get("name") as string,
            total_stock: total,
            net_stock: parseInt(formData.get("net_stock") as string),
            item_properties: {
              ...stock.item_properties,
              equipment_type: normalizeEqType(formData.get("equipment_type") as string),
            },
          },
        });
        toast.success("Item updated");
        await queryClient.invalidateQueries({ queryKey: ["Stock"] });
        onClose();
        router.refresh();
      } catch {
        toast.error("Failed to update item");
      }
      return;
    }

    try {
      await insertRow.mutateAsync({
        table: "Stock",
        data: {
          name: formData.get("name") as string,
          total_stock: total,
          net_stock: total,
          item_properties: {
            equipment_type: normalizeEqType(formData.get("equipment_type") as string),
          },
        },
      });
      toast.success("Stock added");
      await queryClient.invalidateQueries({ queryKey: ["Stock"] });
      onClose();
      router.refresh();
    } catch (error) {
      toast.error("Failed to add stock");
    }
  };

  const loanEditData =
    isEditMode && initialTableType === "Loans" ? (editData as LoanRow) : null;
  const stockEditData =
    isEditMode && initialTableType === "Stock"
      ? (editData as InventoryRow)
      : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isEditMode
          ? `Edit ${initialTableType === "Stock" ? "Item" : "Loan"}`
          : addDialogTitles[tableType]
      }
      size="xl"
    >
      <div className="flex flex-col gap-6 py-2 font-mp">
        {!fixedTableType && !isEditMode && (
          <div className="space-y-3">
            <Label className="text-xs uppercase tracking-wider text-neutral-400 font-bold">
              Select Table
            </Label>
            <div className="flex items-center gap-1 bg-neutral-100 rounded-xl p-1">
              {(["Loans", "Stock"] as TableType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTableType(t)}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all hover:cursor-pointer hover:scale-105 duration-200
                  ${tableType === t ? "bg-white shadow-sm text-neutral-800" : "text-neutral-500 hover:text-neutral-700"}`}
                >
                  {t === "Stock" && <Package size={14} />}
                  {t === "Loans" && <ClipboardList size={14} />}
                  {t === "Stock" ? "Inventory" : t}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {tableType === "Loans" && (
            <form
              onSubmit={handleLoanSubmit}
              className="space-y-6 animate-in fade-in slide-in-from-bottom-2"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold text-neutral-500">
                    Student Name
                  </Label>
                  <Input
                    name="student_name"
                    placeholder="Name"
                    defaultValue={loanEditData?.student_name ?? ""}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold text-neutral-500">
                    Student Number
                  </Label>
                  <Input
                    name="student_number"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{8}"
                    title="Enter an 8-digit student ID"
                    placeholder="ID"
                    maxLength={8}
                    defaultValue={loanEditData?.student_number ?? ""}
                    required
                  />
                </div>
              </div>

              <div className="space-y-3 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                <div className="flex justify-between items-center">
                  <Label className="text-[10px] uppercase font-bold text-neutral-400">
                    Equipment List
                  </Label>
                  {!isEditMode && (
                    <Button
                      type="button"
                      onClick={addRow}
                      variant="ghost"
                      className="h-6 text-[10px] gap-1 hover:bg-white hover:cursor-pointer hover:scale-103 uppercase font-bold"
                    >
                      <Plus size={12} /> Add Item
                    </Button>
                  )}
                </div>

                {loanItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex gap-2 items-end group animate-in zoom-in-95 duration-200"
                  >
                    <div className="flex-[3] space-y-1 relative">
                      <Input
                        ref={(el) => {
                          inputRefs.current[index] = el;
                        }}
                        placeholder="Item Name"
                        value={item.name}
                        onChange={(e) => {
                          updateLoanItem(index, "name", e.target.value);
                          const next = [...showDropdowns];
                          next[index] = true;
                          setShowDropdowns(next);
                        }}
                        onFocus={() => {
                          const next = [...showDropdowns];
                          next[index] = true;
                          setShowDropdowns(next);
                        }}
                        onBlur={() => {
                          setTimeout(() => {
                            const next = [...showDropdowns];
                            next[index] = false;
                            setShowDropdowns(next);
                          }, 200);
                        }}
                        required
                        className="bg-white"
                      />
                      {showDropdowns[index] && (
                        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-xl shadow-lg max-h-40 overflow-y-auto">
                          {(stockRows as any[])
                            .filter((s) =>
                              item.name.trim() === ""
                                ? true
                                : s.name
                                    ?.toLowerCase()
                                    .includes(item.name.toLowerCase()),
                            )
                            .filter((s) =>
                              item.equipment_type
                                ? s.item_properties?.equipment_type ===
                                  item.equipment_type
                                : true,
                            )
                            .slice(0, 8)
                            .map((s) => (
                              <div
                                key={s.id}
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  const newItems = [...loanItems];
                                  newItems[index] = {
                                    ...newItems[index],
                                    name: s.name,
                                    equipment_type:
                                      s.item_properties?.equipment_type ?? "",
                                  };
                                  setLoanItems(newItems);
                                  const next = [...showDropdowns];
                                  next[index] = false;
                                  setShowDropdowns(next);
                                  if (inputRefs.current[index]) {
                                    inputRefs.current[index]!.value = s.name;
                                  }
                                }}
                                className="flex items-center justify-between w-full px-3 py-2 text-xs text-left hover:bg-neutral-50 transition-colors cursor-pointer"
                              >
                                <span className="font-medium text-neutral-700 capitalize">
                                  {s.name}
                                </span>
                                <span className="text-neutral-400 capitalize">
                                  {s.item_properties?.equipment_type ?? "—"}
                                </span>
                              </div>
                            ))}
                          {(stockRows as any[]).filter((s) =>
                            item.name.trim() === ""
                              ? true
                              : s.name
                                  ?.toLowerCase()
                                  .includes(item.name.toLowerCase()),
                          ).length === 0 && (
                            <div className="px-3 py-2 text-xs text-neutral-400">
                              No items found
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex-[2] space-y-1">
                      <select
                        value={item.equipment_type}
                        onChange={(e) =>
                          updateLoanItem(
                            index,
                            "equipment_type",
                            e.target.value,
                          )
                        }
                        className="w-full h-9 text-xs border border-neutral-200 rounded-lg px-3 bg-white text-neutral-700 font-mp focus:outline-none focus:ring-1 focus:ring-neutral-300"
                      >
                        <option value="">All types</option>
                        {equipmentTypes.map((type) => (
                          <option key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="w-20 space-y-1">
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          updateLoanItem(
                            index,
                            "quantity",
                            parseInt(e.target.value) || 0,
                          )
                        }
                        min="1"
                        required
                        className="bg-white"
                      />
                    </div>
                    {loanItems.length > 1 && !isEditMode && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => removeRow(index)}
                        className="text-neutral-400 hover:text-red-500 h-10 px-2"
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold text-neutral-500">
                  Location (Not Required)
                </Label>
                <Input
                  name="location"
                  placeholder="e.g. Rm 101"
                  defaultValue={loanEditData?.location ?? ""}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold text-neutral-500">
                  Notes
                </Label>
                <Textarea
                  name="notes"
                  placeholder="Any additional notes..."
                  defaultValue={loanEditData?.notes ?? ""}
                  className="resize-none h-20"
                />
              </div>

              {isEditMode && loanEditData && (
                <Button
                  onClick={() => handleReturnToggle(loanEditData)}
                  title="Return Item"
                  className="w-full hover:scale-105 transition-all hover:cursor-pointer duration-200 bg-neutral-600 text-white"
                >
                  {updateLoanRow.isPending ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "Complete Loan"
                  )}
                </Button>
              )}

              <Button
                type="submit"
                disabled={insertRow.isPending || updateLoanRow.isPending}
                className="w-full hover:scale-105 transition-all duration-200 hover:cursor-pointer shadow-lg"
              >
                {insertRow.isPending || updateLoanRow.isPending ? (
                  <Loader2 className="animate-spin" />
                ) : isEditMode ? (
                  "Save Changes"
                ) : (
                  "Authorize Loan"
                )}
              </Button>
            </form>
          )}

          {tableType === "Stock" && (
            <form
              onSubmit={handleStockSubmit}
              className="space-y-4 animate-in fade-in slide-in-from-bottom-2"
            >
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold text-neutral-500">
                  Equipment Name
                </Label>
                <Input
                  name="name"
                  placeholder="e.g. Sony A7III"
                  defaultValue={stockEditData?.name ?? ""}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold text-neutral-500">
                    Type
                  </Label>
                  <select
                    name="equipment_type"
                    required
                    defaultValue={
                      stockEditData?.item_properties?.equipment_type ?? ""
                    }
                    className="w-full h-9 text-xs border border-neutral-200 rounded-lg px-3 bg-white text-neutral-700 font-mp focus:outline-none focus:ring-1 focus:ring-neutral-300 hover:cursor-pointer transition-all"
                  >
                    <option value="" disabled>
                      Select type...
                    </option>
                    {equipmentTypes.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="total_stock"
                    className="text-[10px]  uppercase font-bold text-neutral-500"
                  >
                    Total Quantity
                  </Label>
                  <Input
                    id="total_stock"
                    name="total_stock"
                    type="number"
                    min="1"
                    defaultValue={stockEditData?.total_stock ?? ""}
                  />
                </div>
              </div>
              {isEditMode && (
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold text-neutral-500">
                    Available
                  </Label>
                  <Input
                    name="net_stock"
                    type="number"
                    min="0"
                    defaultValue={stockEditData?.net_stock ?? ""}
                  />
                </div>
              )}

              <Button
                type="submit"
                disabled={insertRow.isPending || updateStockRow.isPending}
                className="w-full hover:scale-105 transition-all hover:cursor-pointer duration-200 bg-neutral-900"
              >
                {insertRow.isPending || updateStockRow.isPending ? (
                  <Loader2 className="animate-spin" />
                ) : isEditMode ? (
                  "Save Changes"
                ) : (
                  "Add to Inventory"
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </Modal>
  );
}

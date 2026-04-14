import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

interface EditableCellProps {
  value: string;
  rowId: string;
  columnId: string;
  updateData: (id: string, columnId: string, value: string) => void;
}

export const EditableCell = ({ value: initialValue, rowId, columnId, updateData }: EditableCellProps) => {
  const [value, setValue] = useState(initialValue);
  const [isEditing, setIsEditing] = useState(false);

  // sync local state if external data changes
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const onBlur = () => {
    setIsEditing(false);
    if (value !== initialValue) {
      updateData(rowId, columnId, value);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
    if (e.key === "Escape") {
      setValue(initialValue);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        autoFocus
        className="h-7 text-xs px-2 py-0 border-blue-400 focus-visible:ring-1 font-mp"
      />
    );
  }

  return (
    <div 
      onClick={() => setIsEditing(true)}
      className="cursor-pointer hover:bg-neutral-100 px-2 py-1 rounded transition-colors truncate min-h-[1.5rem]"
    >
      {value || <span className="text-neutral-300 font-mp italic">Empty</span>}
    </div>
  );
};
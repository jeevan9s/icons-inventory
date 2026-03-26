"use client";

import { useState } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import Modal from "./Modal";
import { Button } from "@/components/ui/button";

interface RowActionsMenuProps {
  onEdit: () => void;
  onDelete: () => void;
  itemName?: string;
}

export default function RowActionsMenu({ onEdit, onDelete, itemName }: RowActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleDelete = () => {
    setIsOpen(false);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    setIsConfirmOpen(false);
    onDelete();
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size="sm">
        <div className="flex flex-col items-center justify-center gap-1 font-mp -mx-2 w-full">
          <button
            onClick={() => { setIsOpen(false); onEdit(); }}
            className="flex items-center gap-2.5 px-3 py-2 text-lg text-neutral-600 hover:bg-neutral-50 rounded-lg transition-all hover:cursor-pointer hover:scale-103 w-full text-center justify-center"
          >
            <Pencil size={18} className="text-neutral-400" /> Edit
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2.5 px-3 py-2 text-lg text-red-500 hover:bg-red-50 rounded-lg transition-all hover:cursor-pointer hover:scale-103 w-full text-center justify-center"
          >
            <Trash2 size={18} /> Delete
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Confirm Delete"
        size="sm"
      >
        <div className="flex flex-col gap-4 font-mp">
          <p className="text-sm text-neutral-600">
            Are you sure you want to delete
            {itemName ? <span className="font-semibold text-neutral-800"> "{itemName}"</span> : " this item"}?

          </p>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => setIsConfirmOpen(false)}
              className="flex-1 h-9 text-xs border border-neutral-200 hover:cursor-pointer hover:scale-103"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              className="flex-1 h-9 text-xs bg-red-500 hover:bg-red-600 hover:cursor-pointer hover:scale-103 text-white"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      <button
        onClick={(e) => { e.stopPropagation(); setIsOpen(true); }}
        className="p-1 text-neutral-300 hover:text-neutral-700 transition-colors rounded"
      >
        <MoreVertical size={14} />
      </button>
    </>
  );
}
"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";

export function DeleteButton({ id, onDelete }: { id: string, onDelete: (id: string) => Promise<void> }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button 
      onClick={() => {
        if (confirm("Are you sure you want to delete this quotation? This action cannot be undone.")) {
          startTransition(() => onDelete(id));
        }
      }}
      disabled={isPending}
      className="text-red-500 hover:text-red-700 disabled:opacity-50 flex items-center"
      title="Delete Quotation"
    >
      <Trash2 size={16} />
    </button>
  );
}

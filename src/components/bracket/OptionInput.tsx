"use client";

import { GripVertical, X } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface OptionInputProps {
  id: string;
  value: string;
  index: number;
  onChange: (value: string) => void;
  onRemove: () => void;
  canRemove: boolean;
}

export function OptionInput({
  id,
  value,
  index,
  onChange,
  onRemove,
  canRemove,
}: OptionInputProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 ${isDragging ? "opacity-50" : ""}`}
    >
      <button
        type="button"
        className="cursor-grab touch-none text-text-muted hover:text-text-secondary"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={16} />
      </button>
      <span className="w-6 text-center text-xs font-mono text-text-muted">
        {index + 1}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Entry ${index + 1}`}
        maxLength={80}
        className="flex-1 rounded-lg border border-border-default bg-bg-surface px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-border-active focus:ring-1 focus:ring-accent-primary/30 transition-colors"
      />
      {canRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="text-text-muted hover:text-danger cursor-pointer transition-colors"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}

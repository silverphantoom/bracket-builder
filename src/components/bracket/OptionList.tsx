"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { OptionInput } from "./OptionInput";
import { Plus } from "lucide-react";
import { computeBracketSize } from "@/lib/bracket-logic";

interface OptionListProps {
  entries: string[];
  onChange: (entries: string[]) => void;
}

export function OptionList({ entries, onChange }: OptionListProps) {
  const [ids] = useState(() =>
    Array.from({ length: 32 }, (_, i) => `option-${i}`)
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        const oldIndex = ids.indexOf(active.id as string);
        const newIndex = ids.indexOf(over.id as string);
        const newEntries = arrayMove(entries, oldIndex, newIndex);
        onChange(newEntries);
      }
    },
    [entries, ids, onChange]
  );

  const addEntry = () => {
    if (entries.length < 32) {
      onChange([...entries, ""]);
    }
  };

  const addBatch = () => {
    const remaining = 32 - entries.length;
    const toAdd = Math.min(8, remaining);
    onChange([...entries, ...Array(toAdd).fill("")]);
  };

  const removeEntry = (index: number) => {
    onChange(entries.filter((_, i) => i !== index));
  };

  const updateEntry = (index: number, value: string) => {
    const updated = [...entries];
    updated[index] = value;
    onChange(updated);
  };

  const filledCount = entries.filter((e) => e.trim()).length;
  const bracketSize = computeBracketSize(Math.max(filledCount, 3));
  const byeCount = bracketSize - filledCount;

  return (
    <div className="space-y-3">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={ids.slice(0, entries.length)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {entries.map((entry, index) => (
              <OptionInput
                key={ids[index]}
                id={ids[index]}
                value={entry}
                index={index}
                onChange={(val) => updateEntry(index, val)}
                onRemove={() => removeEntry(index)}
                canRemove={entries.length > 3}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={addEntry}
          disabled={entries.length >= 32}
          className="flex items-center gap-1 text-sm text-accent-primary hover:text-orange-400 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <Plus size={14} />
          Add entry
        </button>
        {entries.length < 25 && (
          <button
            type="button"
            onClick={addBatch}
            className="text-sm text-text-muted hover:text-text-secondary cursor-pointer"
          >
            + Add 8 more
          </button>
        )}
      </div>

      <div className="flex items-center justify-between rounded-lg bg-bg-surface border border-border-default px-3 py-2 text-xs">
        <span className="text-text-secondary">
          Bracket size:{" "}
          <span className="font-mono font-semibold text-text-primary">
            {bracketSize}
          </span>
        </span>
        {byeCount > 0 && filledCount >= 3 && (
          <span className="text-text-muted">
            {byeCount} {byeCount === 1 ? "entry" : "entries"} will auto-advance
            (BYE)
          </span>
        )}
      </div>
    </div>
  );
}

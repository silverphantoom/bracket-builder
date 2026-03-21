"use client";

import { cn } from "@/lib/utils";
import { type InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  charCount?: { current: number; max: number };
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, charCount, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="mb-1.5 block text-sm font-medium text-text-secondary"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "w-full rounded-lg border bg-bg-surface px-3 py-2.5 text-sm text-text-primary",
            "placeholder:text-text-muted",
            "transition-colors duration-150 ease-out",
            "focus:outline-none focus:border-border-active focus:ring-1 focus:ring-accent-primary/30",
            error
              ? "border-danger"
              : "border-border-default hover:border-border-active",
            className
          )}
          {...props}
        />
        <div className="mt-1 flex items-center justify-between">
          {error && <p className="text-xs text-danger">{error}</p>}
          {charCount && (
            <p
              className={cn(
                "ml-auto text-xs",
                charCount.current > charCount.max
                  ? "text-danger"
                  : "text-text-muted"
              )}
            >
              {charCount.current}/{charCount.max}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Input.displayName = "Input";

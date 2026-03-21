"use client";

import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-accent-primary text-white hover:bg-orange-600 active:bg-orange-700 shadow-[0_0_0_1px_rgba(249,115,22,0.3),0_4px_24px_rgba(0,0,0,0.4)]",
  secondary:
    "bg-bg-raised text-text-primary border border-border-default hover:border-border-active hover:bg-bg-surface",
  ghost:
    "bg-transparent text-text-secondary hover:text-text-primary hover:bg-bg-raised",
  danger:
    "bg-danger text-white hover:bg-red-600 active:bg-red-700",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm rounded-lg",
  md: "px-4 py-2.5 text-sm rounded-lg min-h-[44px]",
  lg: "px-6 py-3 text-base rounded-xl min-h-[44px]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-semibold transition-colors duration-150 ease-out cursor-pointer",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        disabled={disabled}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

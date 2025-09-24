"use client";

import { cn } from "@/lib/utils";

interface CalculatorDisplayProps {
  value: string;
  className?: string;
}

export const CalculatorDisplay = ({ value, className }: CalculatorDisplayProps) => {
  return (
    <div
      className={cn(
        "bg-background border rounded-lg p-4 text-right text-2xl font-mono min-h-[80px] flex items-center justify-end shadow-sm",
        className
      )}
    >
      <span className="text-foreground break-all">{value || "0"}</span>
    </div>
  );
};
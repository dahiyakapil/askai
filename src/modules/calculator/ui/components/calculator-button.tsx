"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CalculatorButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  className?: string;
  disabled?: boolean;
}

export const CalculatorButton = ({ 
  onClick, 
  children, 
  variant = "outline",
  className,
  disabled = false
}: CalculatorButtonProps) => {
  return (
    <Button
      onClick={onClick}
      variant={variant}
      disabled={disabled}
      className={cn(
        "h-12 text-lg font-semibold",
        className
      )}
    >
      {children}
    </Button>
  );
};
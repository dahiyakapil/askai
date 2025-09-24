"use client";

import { Calculator } from "../components/calculator";

export const CalculatorView = () => {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">Calculator</h1>
        <p className="text-muted-foreground">
          A simple calculator for basic arithmetic operations
        </p>
      </div>
      
      <Calculator />
    </div>
  );
};
"use client";

import { useState, useCallback } from "react";
import { CalculatorDisplay } from "./calculator-display";
import { CalculatorButton } from "./calculator-button";

type Operator = '+' | '-' | '*' | '/' | null;

export const Calculator = () => {
  const [display, setDisplay] = useState("0");
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<Operator>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const inputNumber = useCallback((num: string) => {
    if (waitingForOperand) {
      setDisplay(String(num));
      setWaitingForOperand(false);
    } else {
      setDisplay(display === "0" ? String(num) : display + num);
    }
  }, [display, waitingForOperand]);

  const inputDot = useCallback(() => {
    if (waitingForOperand) {
      setDisplay("0.");
      setWaitingForOperand(false);
    } else if (display.indexOf(".") === -1) {
      setDisplay(display + ".");
    }
  }, [display, waitingForOperand]);

  const clear = useCallback(() => {
    setDisplay("0");
    setPreviousValue(null);
    setOperator(null);
    setWaitingForOperand(false);
  }, []);

  const performOperation = useCallback((nextOperator: Operator) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operator) {
      const currentValue = previousValue || 0;
      let result: number;

      switch (operator) {
        case '+':
          result = currentValue + inputValue;
          break;
        case '-':
          result = currentValue - inputValue;
          break;
        case '*':
          result = currentValue * inputValue;
          break;
        case '/':
          result = inputValue !== 0 ? currentValue / inputValue : 0;
          break;
        default:
          return;
      }

      setDisplay(String(result));
      setPreviousValue(result);
    }

    setWaitingForOperand(true);
    setOperator(nextOperator);
  }, [display, previousValue, operator]);

  const calculate = useCallback(() => {
    if (operator && previousValue !== null) {
      const inputValue = parseFloat(display);
      const currentValue = previousValue;
      let result: number;

      switch (operator) {
        case '+':
          result = currentValue + inputValue;
          break;
        case '-':
          result = currentValue - inputValue;
          break;
        case '*':
          result = currentValue * inputValue;
          break;
        case '/':
          result = inputValue !== 0 ? currentValue / inputValue : 0;
          break;
        default:
          return;
      }

      setDisplay(String(result));
    }
    
    setOperator(null);
    setPreviousValue(null);
    setWaitingForOperand(true);
  }, [display, previousValue, operator]);

  const handleOperatorClick = (op: Operator) => {
    performOperation(op);
  };

  return (
    <div className="max-w-md mx-auto bg-card p-6 rounded-lg shadow-lg border">
      <CalculatorDisplay value={display} className="mb-4" />
      
      <div className="grid grid-cols-4 gap-3">
        {/* First Row */}
        <CalculatorButton 
          onClick={clear} 
          variant="secondary"
          className="col-span-2 bg-red-100 hover:bg-red-200 text-red-800"
        >
          Clear
        </CalculatorButton>
        <CalculatorButton onClick={() => handleOperatorClick('/')} variant="default">
          ÷
        </CalculatorButton>
        <CalculatorButton onClick={() => handleOperatorClick('*')} variant="default">
          ×
        </CalculatorButton>

        {/* Second Row */}
        <CalculatorButton onClick={() => inputNumber("7")}>7</CalculatorButton>
        <CalculatorButton onClick={() => inputNumber("8")}>8</CalculatorButton>
        <CalculatorButton onClick={() => inputNumber("9")}>9</CalculatorButton>
        <CalculatorButton onClick={() => handleOperatorClick('-')} variant="default">
          −
        </CalculatorButton>

        {/* Third Row */}
        <CalculatorButton onClick={() => inputNumber("4")}>4</CalculatorButton>
        <CalculatorButton onClick={() => inputNumber("5")}>5</CalculatorButton>
        <CalculatorButton onClick={() => inputNumber("6")}>6</CalculatorButton>
        <CalculatorButton onClick={() => handleOperatorClick('+')} variant="default">
          +
        </CalculatorButton>

        {/* Fourth Row */}
        <CalculatorButton onClick={() => inputNumber("1")}>1</CalculatorButton>
        <CalculatorButton onClick={() => inputNumber("2")}>2</CalculatorButton>
        <CalculatorButton onClick={() => inputNumber("3")}>3</CalculatorButton>
        <CalculatorButton 
          onClick={calculate} 
          variant="default"
          className="row-span-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          =
        </CalculatorButton>

        {/* Fifth Row */}
        <CalculatorButton 
          onClick={() => inputNumber("0")} 
          className="col-span-2"
        >
          0
        </CalculatorButton>
        <CalculatorButton onClick={inputDot}>.</CalculatorButton>
      </div>
    </div>
  );
};
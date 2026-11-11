import { useState, useEffect } from "react";

export const useAnimatedValue = (value: string): string => {
  const [displayValue, setDisplayValue] = useState("0");
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (hasAnimated) return;

    const numericMatch = value.match(/[\d,]+\.?\d*/);
    if (!numericMatch) {
      setDisplayValue(value);
      return;
    }

    const targetValue = parseFloat(numericMatch[0].replace(/,/g, ""));
    const prefix = value.match(/^\$/) ? "$" : "";
    const suffix = value.match(/%$/) ? "%" : "";
    const duration = 2000;
    const steps = 60;
    const increment = targetValue / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current += increment;
      if (step >= steps) {
        clearInterval(timer);
        setDisplayValue(value);
        setHasAnimated(true);
      } else {
        const formatted = current.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
        setDisplayValue(`${prefix}${formatted}${suffix}`);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value, hasAnimated]);

  return displayValue;
};

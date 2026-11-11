// src/hooks/useDebounce.ts
import { useState, useEffect, useCallback, useRef } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);  // ✅ Fixed: Added explicit type with undefined

  return useCallback(
    ((...args: any[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }) as T,
    [callback, delay]
  );
}

export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  limit: number
): T {
  const inThrottleRef = useRef<boolean>(false);  // ✅ Fixed: Added explicit type
  const lastArgsRef = useRef<any[] | undefined>(undefined);  // ✅ Fixed: Added explicit type with undefined

  return useCallback(
    ((...args: any[]) => {
      if (!inThrottleRef.current) {
        callback(...args);
        inThrottleRef.current = true;
        setTimeout(() => {
          inThrottleRef.current = false;
          if (lastArgsRef.current) {
            callback(...lastArgsRef.current);
            lastArgsRef.current = undefined;  // ✅ Fixed: Now works with the correct type
          }
        }, limit);
      } else {
        lastArgsRef.current = args;
      }
    }) as T,
    [callback, limit]
  );
}
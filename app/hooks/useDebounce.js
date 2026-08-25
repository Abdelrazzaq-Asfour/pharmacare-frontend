// // High-performance debounce hook to optimize POS search and heavy catalog filtering
'use client';
import { useState, useEffect } from 'react';

export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // // Set timer to delay state update during high-frequency keystrokes
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // // Clean up previous timeout instance to prevent memory leaks and race conditions
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
// FILE: src/lib/tempId.ts

let tempIdCounter = 0;

/**
 * Generates a unique, stable, client-side-only temporary ID.
 * This is perfect for keys in React lists during optimistic updates.
 * @param prefix A string prefix for the ID (e.g., 'temp-set')
 * @returns A unique string like 'temp-set-1', 'temp-set-2', etc.
 */
export const getNextTempId = (prefix: string = 'temp'): string => {
  tempIdCounter += 1;
  return `${prefix}-${tempIdCounter}`;
};
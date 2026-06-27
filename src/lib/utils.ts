/**
 * Retrieves a nested value from an object given a dot-notation path.
 * E.g., getNestedValue({ user: { name: 'Alice' } }, 'user.name') returns 'Alice'
 */
export function getNestedValue(obj: any, path: string): any {
  if (!obj || !path) return undefined;
  return path.split('.').reduce((acc, part) => {
    if (acc === null || acc === undefined) return undefined;
    return acc[part];
  }, obj);
}

/**
 * Default comparator for sorting.
 * Supports strings, numbers, dates, booleans, and null/undefined values.
 */
export function defaultCompare(a: any, b: any, dataType?: 'string' | 'number' | 'date' | 'boolean'): number {
  // Handle nulls and undefined
  if (a === null || a === undefined) {
    return b === null || b === undefined ? 0 : 1; // puts nulls/undefined at the bottom/end
  }
  if (b === null || b === undefined) {
    return -1;
  }

  // Parse according to dataType if specified
  if (dataType === 'number') {
    const numA = Number(a);
    const numB = Number(b);
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }
  }

  if (dataType === 'date') {
    const dateA = new Date(a).getTime();
    const dateB = new Date(b).getTime();
    if (!isNaN(dateA) && !isNaN(dateB)) {
      return dateA - dateB;
    }
  }

  if (dataType === 'boolean') {
    return (a ? 1 : 0) - (b ? 1 : 0);
  }

  // Fallback to string comparison or natural comparison
  const strA = String(a).toLowerCase();
  const strB = String(b).toLowerCase();

  return strA.localeCompare(strB, undefined, { numeric: true, sensitivity: 'base' });
}

/**
 * Checks if a value matches a search query.
 */
export function matchesQuery(value: any, query: string): boolean {
  if (value === null || value === undefined) return false;
  const str = String(value).toLowerCase();
  return str.includes(query.toLowerCase());
}

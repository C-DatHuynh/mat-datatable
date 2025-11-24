// Utility functions

export const isNonEmpty = (value: any): boolean => {
  if (value === null || value === undefined) return false;

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  // For primitive values (string, number, boolean), check against empty string (you can customize this)
  return value !== '';
};

export const findAllValuesByKey = (root: object, targetKey: string) => {
  const results = [];
  const stack = [root];
  const visited = new WeakSet(); // avoid re-walking same object (and handle cycles)

  while (stack.length > 0) {
    const node = stack.pop();

    // Only objects (including arrays) can contain keys
    if (node && typeof node === 'object') {
      // Skip if we've already processed this object (optimization + safety)
      if (visited.has(node)) continue;
      visited.add(node);

      if (Array.isArray(node)) {
        // Push array elements to stack
        for (let i = 0; i < node.length; i++) {
          stack.push(node[i]);
        }
      } else {
        // Plain object
        for (const [key, value] of Object.entries(node)) {
          if (key === targetKey) {
            results.push(value);
          }
          // Only descend into nested objects/arrays
          if (value && typeof value === 'object') {
            stack.push(value);
          }
        }
      }
    }
  }
  return results;
};

export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

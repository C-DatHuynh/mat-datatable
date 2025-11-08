// Utility functions

export const isNonEmpty = (value: any): boolean => {
  if (value === null || value === undefined) return false;

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  // For primitive values (string, number, boolean), check against empty string (you can customize this)
  return value !== '';
};

export const splitArrayIntoChunks = (arr: any[], n: number) => {
  const result: any[] = [];
  for (let i = 0; i < arr.length; i += n) {
    const chunk = arr.slice(i, i + n);
    result.push(chunk);
  }
  return result;
};

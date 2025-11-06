import { PrimitiveType } from './types';

export const isNonEmpty = (value: any): boolean => {
  if (value === null || value === undefined) return false;

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  // For primitive values (string, number, boolean), check against empty string (you can customize this)
  return value !== '';
};

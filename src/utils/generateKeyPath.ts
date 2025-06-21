/**
 * Generates a stable key path for nested objects.
 * @param basePath - The base path of the parent.
 * @param key - The key of the current item.
 * @returns A dot-notation path string.
 */
export const generateKeyPath = (basePath: string, key: string | number): string => {
  return basePath ? `${basePath}.${key}` : String(key);
};

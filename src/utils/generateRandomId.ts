/**
 * generateRandomId utility
 * Generates a random ID suitable for React Native environments
 * Pattern: timestamp + random hex digits (no crypto dependency)
 */

export const generateRandomId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${randomPart}`;
};

/**
 * DevnFW Shared Utilities
 */

/**
 * Generates a clean URL-friendly slug from a string
 */
export const generateSlug = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
};

/**
 * Formats a Date objects to a readable string (YYYY-MM-DD HH:mm:ss)
 */
export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toISOString().replace('T', ' ').split('.')[0];
};

/**
 * Delay execution for a certain amount of milliseconds
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Simple email validation regex
 */
export const isValidEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Clean whitespace from a string
 */
export const cleanString = (str: string): string => {
  return str.replace(/\s+/g, ' ').trim();
};

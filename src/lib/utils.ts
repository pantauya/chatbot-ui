import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combine multiple Tailwind CSS classes into one string.
 * It automatically resolves conflicting classes.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

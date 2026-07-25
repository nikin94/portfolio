import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge conditional class names and resolve conflicting Tailwind utilities
 * (the later class wins). The standard helper for composing `className`.
 */
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

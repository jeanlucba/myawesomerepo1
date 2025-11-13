export * from './format'
export * from './calculations'
export * from './error'

// Tailwind merge utility for className conflicts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

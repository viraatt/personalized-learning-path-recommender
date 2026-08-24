import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Merge Tailwind class strings, resolving conflicts (last wins).
// Standard shadcn/ui helper — `@/lib/utils` alias target in components.json.
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
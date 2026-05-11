import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { ExperienceData } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Compute total years of experience from a list of roles.
 *
 * - Honors `current=true` (or null/missing endDate) as "still ongoing today".
 * - Merges overlapping intervals — concurrent roles don't double-count.
 * - Skips entries with unparseable dates instead of throwing.
 *
 * Accepted date formats: anything `new Date()` can parse, including "YYYY-MM",
 * "YYYY-MM-DD", and full ISO strings.
 */
export function calculateYearsOfExperience(experiences: ExperienceData[]): number {
  if (!experiences || experiences.length === 0) return 0

  const now = Date.now()
  const intervals = experiences
    .map((e) => {
      if (!e.startDate) return null
      // YYYY-MM needs a day appended for Date to parse reliably across browsers.
      const startStr = /^\d{4}-\d{2}$/.test(e.startDate) ? `${e.startDate}-01` : e.startDate
      const start = new Date(startStr).getTime()
      if (Number.isNaN(start)) return null

      let end: number
      if (e.current || !e.endDate) {
        end = now
      } else {
        const endStr = /^\d{4}-\d{2}$/.test(e.endDate) ? `${e.endDate}-01` : e.endDate
        end = new Date(endStr).getTime()
        if (Number.isNaN(end)) return null
      }
      if (end <= start) return null
      return [start, end] as [number, number]
    })
    .filter((i): i is [number, number] => i !== null)
    .sort((a, b) => a[0] - b[0])

  // Merge overlapping windows so concurrent jobs don't count twice.
  const merged: [number, number][] = []
  for (const [s, e] of intervals) {
    const last = merged[merged.length - 1]
    if (last && s <= last[1]) {
      last[1] = Math.max(last[1], e)
    } else {
      merged.push([s, e])
    }
  }

  const totalMs = merged.reduce((sum, [s, e]) => sum + (e - s), 0)
  return totalMs / (365.25 * 24 * 60 * 60 * 1000)
}

/**
 * Human-readable years-of-experience string.
 * - <1 year   → "11 mo"
 * - <10 years → "3.5 yrs"
 * - ≥10 years → "12 yrs"
 */
export function formatYearsOfExperience(years: number): string {
  if (years < 1) {
    const months = Math.max(0, Math.round(years * 12))
    return `${months} mo`
  }
  if (years < 10) return `${years.toFixed(1)} yrs`
  return `${Math.round(years)} yrs`
}

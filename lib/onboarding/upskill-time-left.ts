/** Total months until applying (matches backend / onboarding cap). */
export const MAX_UPSKILL_MONTHS = 60;

/** Full years 0–5; remainder months 0–11 (5×12+0 = 60). */
export const UPSKILL_YEARS_MAX = 5;
export const UPSKILL_MONTH_MIN = 0;
export const UPSKILL_MONTH_MAX = 11;

export function maxMonthForYear(years: number) {
  const cap = MAX_UPSKILL_MONTHS - years * 12;
  return Math.min(UPSKILL_MONTH_MAX, Math.max(UPSKILL_MONTH_MIN, cap));
}

/** Decode total months into full years + remainder months. */
export function totalMonthsToParts(total: number) {
  const t = Math.min(Math.max(0, total), MAX_UPSKILL_MONTHS);
  if (t === 0) return { years: 0, months: 0 };
  const years = Math.min(UPSKILL_YEARS_MAX, Math.floor(t / 12));
  const months = t - years * 12;
  return { years, months };
}

export function partsToTotalMonths(years: number, months: number) {
  const y = Math.min(UPSKILL_YEARS_MAX, Math.max(0, years));
  const m = Math.min(UPSKILL_MONTH_MAX, Math.max(UPSKILL_MONTH_MIN, months));
  return Math.min(y * 12 + m, MAX_UPSKILL_MONTHS);
}

export function formatUpskillYearsSummary(totalMonths: number): string {
  if (totalMonths <= 0) return "0 years";
  const y = totalMonths / 12;
  const rounded = Math.round(y * 10) / 10;
  if (rounded === Math.floor(rounded)) {
    return `${rounded} year${rounded === 1 ? "" : "s"}`;
  }
  return `${rounded} years`;
}

export const UPSKILL_PRESETS = [
  { months: 3, label: "3 mo" },
  { months: 6, label: "6 mo" },
  { months: 12, label: "1 yr" },
  { months: 24, label: "2 yr" },
  { months: 60, label: "5 yr" },
] as const;

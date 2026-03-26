"use client";

import { OnboardingArrowNumberPicker } from "@/components/onboarding/onboarding-arrow-number-picker";
import {
  UPSKILL_YEARS_MAX,
  UPSKILL_MONTH_MIN,
  maxMonthForYear,
} from "@/lib/onboarding/upskill-time-left";
import { cn } from "@/lib/utils";

type TimeLeftYearMonthControlsProps = {
  years: number;
  months: number;
  onYearsChange: (y: number) => void;
  onMonthsChange: (m: number) => void;
  className?: string;
};

/** Shared years (0–5) + months (0–11) arrow pickers — same UX as onboarding career step. */
export function TimeLeftYearMonthControls({
  years,
  months,
  onYearsChange,
  onMonthsChange,
  className,
}: TimeLeftYearMonthControlsProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-start justify-center gap-8 sm:gap-10",
        className
      )}
    >
      <OnboardingArrowNumberPicker
        label="Years"
        ariaLabel="Years until you apply"
        min={0}
        max={UPSKILL_YEARS_MAX}
        value={years}
        onChange={onYearsChange}
      />
      <OnboardingArrowNumberPicker
        label="Months"
        ariaLabel="Extra months after full years (0 to 11)"
        min={UPSKILL_MONTH_MIN}
        max={maxMonthForYear(years)}
        value={months}
        onChange={onMonthsChange}
      />
    </div>
  );
}

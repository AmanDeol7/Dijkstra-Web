"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

type OnboardingArrowNumberPickerProps = {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
  ariaLabel: string;
  /** Optional formatter (e.g. pad or suffix in label only). */
  formatDisplay?: (n: number) => string;
};

export function OnboardingArrowNumberPicker({
  label,
  value,
  onChange,
  min,
  max,
  ariaLabel,
  formatDisplay,
}: OnboardingArrowNumberPickerProps) {
  const inc = () => onChange(Math.min(max, value + 1));
  const dec = () => onChange(Math.max(min, value - 1));
  const show = formatDisplay ? formatDisplay(value) : String(value);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="text-[11px] font-medium text-muted-foreground">
        {label}
      </span>
      <div className="flex flex-col items-center overflow-hidden rounded-lg border border-white/10 bg-white/5 p-px">
        <button
          type="button"
          aria-label={`Increase ${label}`}
          onClick={inc}
          disabled={value >= max}
          className={cn(
            "flex h-7 w-9 shrink-0 items-center justify-center rounded-md border-0 bg-transparent",
            "text-foreground transition-colors hover:bg-white/10",
            "disabled:pointer-events-none disabled:opacity-35"
          )}
        >
          <ChevronUp className="h-3.5 w-3.5" strokeWidth={2.25} />
        </button>
        <div
          role="spinbutton"
          aria-valuenow={value}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-label={ariaLabel}
          className="flex min-h-9 min-w-11 select-none items-center justify-center tabular-nums text-lg font-semibold tracking-tight text-foreground"
        >
          {show}
        </div>
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          onClick={dec}
          disabled={value <= min}
          className={cn(
            "flex h-7 w-9 shrink-0 items-center justify-center rounded-md border-0 bg-transparent",
            "text-foreground transition-colors hover:bg-white/10",
            "disabled:pointer-events-none disabled:opacity-35"
          )}
        >
          <ChevronDown className="h-3.5 w-3.5" strokeWidth={2.25} />
        </button>
      </div>
    </div>
  );
}

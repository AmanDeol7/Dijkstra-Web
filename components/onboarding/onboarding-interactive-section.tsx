"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const onboardingGlassPanelClassName =
  "rounded-2xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-xl";

export const onboardingGlassPanelPaddingClassName = "p-4 sm:p-6";

export const onboardingPickerWellClassName =
  "rounded-2xl border border-white/10 bg-white/[0.06] p-5 sm:p-6";

export function onboardingPickerChipClassName(active: boolean) {
  return cn(
    "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
    active
      ? "border-primary bg-primary/20 text-foreground ring-1 ring-primary/40"
      : "border-white/25 bg-white/10 text-muted-foreground hover:border-white/30 hover:bg-white/18 hover:text-foreground"
  );
}

/** Circular prev/next controls for horizontal pickers */
export function onboardingPickerNavButtonClassName() {
  return cn(
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
    "border border-white/25 bg-white/10 text-foreground shadow-sm",
    "transition-colors hover:bg-white/18"
  );
}

/** Highlight block for the current selection summary (timeline, etc.) */
export function onboardingAccentSummaryClassName() {
  return "rounded-xl border border-primary/25 bg-primary/10 p-3 text-center";
}

export const onboardingMeterTrackClassName =
  "h-2 w-full overflow-hidden rounded-full bg-white/10";

export const onboardingMeterFillClassName =
  "h-full rounded-full bg-primary transition-[width] duration-300";

type OnboardingInteractiveSectionProps = {
  title: string;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
};

/**
 * Shared shell for interactive onboarding blocks (time to upskill, salary, etc.).
 */
export function OnboardingInteractiveSection({
  title,
  description,
  children,
  className,
  bodyClassName,
}: OnboardingInteractiveSectionProps) {
  return (
    <section
      className={cn(
        onboardingGlassPanelClassName,
        onboardingGlassPanelPaddingClassName,
        className
      )}
    >
      <h3 className="mb-1 text-lg font-semibold tracking-tight text-foreground">
        {title}
      </h3>
      {description != null ? (
        <div className="mb-4 text-sm leading-relaxed text-muted-foreground">
          {description}
        </div>
      ) : null}
      <div className={cn(bodyClassName)}>{children}</div>
    </section>
  );
}

export function OnboardingPickerWell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(onboardingPickerWellClassName, className)}>{children}</div>
  );
}

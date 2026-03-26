"use client";

import { useCallback, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SALARY_RANGES } from "@/types/enum-constants";
import { cn } from "@/lib/utils";
import {
  OnboardingInteractiveSection,
  OnboardingPickerWell,
  onboardingPickerChipClassName,
  onboardingPickerNavButtonClassName,
} from "@/components/onboarding/onboarding-interactive-section";

/** Half of chip width for scroll centering (slim pills ~4.5rem → 2.25rem). */
const SALARY_CHIP_HALF = "2.25rem";

function salaryRankShortLabel(value: string): string {
  if (!value || value === "UNRANKED") return "Unranked";
  if (value === "OBSIDIAN") return "Obsidian";
  const [tierRaw, num] = value.split("_");
  if (!num) return value.replace(/_/g, " ");
  const tierMap: Record<string, string> = {
    IRON: "Iron",
    BRONZE: "Bronze",
    SILVER: "Silver",
    GOLD: "Gold",
    PLATINUM: "Platinum",
    DIAMOND: "Diamond",
    EMERALD: "Emerald",
    LAPIS: "Lapis",
    QUARTZ: "Quartz",
    SAPHIRE: "Sapphire",
  };
  const tier =
    tierMap[tierRaw] ??
    tierRaw.charAt(0) + tierRaw.slice(1).toLowerCase();
  return `${tier} ${num}`;
}

type OnboardingSalaryCircularPickerProps = {
  value: string;
  onChange: (v: string) => void;
};

export function OnboardingSalaryCircularPicker({
  value,
  onChange,
}: OnboardingSalaryCircularPickerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const rankKey =
    value && SALARY_RANGES.some((s) => s.value === value)
      ? value
      : "UNRANKED";
  const active = SALARY_RANGES.find((s) => s.value === value);
  const activeLabel =
    active?.label ??
    "Select the bracket that matches your goal for when you apply.";

  const step = useCallback(
    (delta: number) => {
      const idx = SALARY_RANGES.findIndex((s) => s.value === value);
      const i = idx < 0 ? 0 : idx;
      const next = Math.min(
        SALARY_RANGES.length - 1,
        Math.max(0, i + delta)
      );
      const picked = SALARY_RANGES[next];
      if (picked.value !== value) onChange(picked.value);
    },
    [value, onChange]
  );

  useEffect(() => {
    const key = value || SALARY_RANGES[0]?.value;
    if (!key) return;
    const el = chipRefs.current.get(key);
    el?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [value]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const idx = SALARY_RANGES.findIndex((s) => s.value === value);
      const i = idx < 0 ? 0 : idx;
      const next = Math.min(
        SALARY_RANGES.length - 1,
        Math.max(0, i + (e.deltaY > 0 ? 1 : -1))
      );
      const picked = SALARY_RANGES[next];
      if (picked.value !== value) onChange(picked.value);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [value, onChange]);

  const navBtn = cn(
    onboardingPickerNavButtonClassName(),
    "h-8 w-8"
  );

  return (
    <OnboardingInteractiveSection
      title="Expected salary"
      description={
        <>
          Choose the range you&apos;re aiming for{" "}
          <span className="font-medium text-foreground">
            by the time you start applying
          </span>
          — it should fit the prep timeline you set above.
        </>
      }
      bodyClassName="space-y-0"
    >
      <div className="relative flex flex-col items-center">
        <div
          className="pointer-events-none absolute top-2 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
          aria-hidden
        />
        <div className="relative flex flex-col items-center">
          <img
            key={rankKey}
            src={`/Ranks/${rankKey}.png`}
            alt=""
            className="h-24 w-24 object-contain drop-shadow-lg transition-opacity duration-200 sm:h-28 sm:w-28 mt-4"
            onError={(e) => {
              e.currentTarget.src = "/Ranks/UNRANKED.png";
            }}
          />
          <p className="mt-3 max-w-[20rem] text-center text-sm font-semibold leading-snug text-foreground">
            {activeLabel}
          </p>
        </div>

        <OnboardingPickerWell className="relative mt-6 w-full max-w-lg px-0.5">
          <button
            type="button"
            aria-label="Previous salary bracket"
            onClick={() => step(-1)}
            className={cn(
              "absolute top-1/2 left-0.5 z-20 -translate-y-1/2",
              navBtn
            )}
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={2.25} />
          </button>
          <button
            type="button"
            aria-label="Next salary bracket"
            onClick={() => step(1)}
            className={cn(
              "absolute top-1/2 right-0.5 z-20 -translate-y-1/2",
              navBtn
            )}
          >
            <ChevronRight className="h-4 w-4" strokeWidth={2.25} />
          </button>

          <div
            ref={scrollRef}
            className="mx-9 flex snap-x snap-mandatory gap-1 overflow-x-auto rounded-full border border-white/10 bg-white/[0.07] py-1.5 shadow-[inset_0_1px_6px_rgba(0,0,0,0.12)] [&::-webkit-scrollbar]:hidden"
            style={{
              scrollbarWidth: "none",
              scrollPaddingLeft: `calc(50% - ${SALARY_CHIP_HALF})`,
              scrollPaddingRight: `calc(50% - ${SALARY_CHIP_HALF})`,
              paddingLeft: `calc(50% - ${SALARY_CHIP_HALF})`,
              paddingRight: `calc(50% - ${SALARY_CHIP_HALF})`,
            }}
          >
            {SALARY_RANGES.map((salary) => {
              const selected = value === salary.value;
              return (
                <button
                  key={salary.value}
                  ref={(el) => {
                    if (el) chipRefs.current.set(salary.value, el);
                    else chipRefs.current.delete(salary.value);
                  }}
                  type="button"
                  onClick={() => onChange(salary.value)}
                  className={cn(
                    "min-w-18 shrink-0 snap-center rounded-full border px-2 py-1 text-center text-[11px] font-semibold leading-tight transition-all sm:min-w-20 sm:text-xs",
                    onboardingPickerChipClassName(selected)
                  )}
                >
                  {salaryRankShortLabel(salary.value)}
                </button>
              );
            })}
          </div>
        </OnboardingPickerWell>
      </div>
    </OnboardingInteractiveSection>
  );
}

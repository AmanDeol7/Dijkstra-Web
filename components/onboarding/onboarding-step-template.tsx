"use client";

import type { ReactNode } from "react";
import { StepIndicator } from "@/components/onboarding/step-indicator";
import type { StepId } from "@/lib/onboarding/onboarding-steps";
import { cn } from "@/lib/utils";

interface OnboardingStepTemplateProps {
  currentStep: number;
  completedSteps: StepId[];
  title?: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  afterContent?: ReactNode;
  contentClassName?: string;
  hideHeader?: boolean;
}

/**
 * Shared layout for onboarding steps 1–7: read-only top step rail, icon + title, body, optional guide links.
 * Footer (Back / Next + dots) is rendered by the parent page.
 */
export function OnboardingStepTemplate({
  currentStep,
  completedSteps,
  title,
  description,
  icon,
  children,
  afterContent,
  contentClassName,
  hideHeader,
}: OnboardingStepTemplateProps) {
  return (
    <div className="flex w-full flex-col">
      <StepIndicator
        currentStep={currentStep}
        completedSteps={completedSteps}
        interactive={false}
      />

      {!hideHeader ? (
        <div className="space-y-4 pt-4 text-center">
          <div className="mx-auto flex justify-center">{icon}</div>
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">
            {title}
          </h2>
          <p className="mx-auto max-w-md px-4 text-sm text-muted-foreground sm:text-base">
            {description}
          </p>
        </div>
      ) : null}

      <div
        className={cn(
          "mx-auto w-full flex-1",
          hideHeader ? "pt-4 pb-6" : "py-6",
          contentClassName ?? "max-w-lg"
        )}
      >
        {children}
      </div>

      {afterContent ? <div className="pb-2">{afterContent}</div> : null}
    </div>
  );
}

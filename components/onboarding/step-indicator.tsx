"use client";

import { CheckCircle } from "lucide-react";
import type { StepId } from "@/lib/onboarding/onboarding-steps";
import { ONBOARDING_STEPS_METADATA } from "@/lib/onboarding/onboarding-steps";
import { CustomIcon } from "@/components/custom-icon";

interface StepIndicatorProps {
  currentStep: number;
  completedSteps: StepId[];
  onStepClick?: (stepNumber: number) => void;
  /** When false, top circles are display-only (no navigation). */
  interactive?: boolean;
}

export function StepIndicator({
  currentStep,
  completedSteps,
  onStepClick,
  interactive = true,
}: StepIndicatorProps) {
  // Get steps excluding welcome
  const steps = ONBOARDING_STEPS_METADATA.slice(1);

  return (
    <div className="flex items-center justify-center mb-4 sm:mb-6 px-4">
      <div className="flex items-center justify-between w-full max-w-md sm:max-w-lg">
        {steps.map((step, index) => {
          const Icon =
            typeof step.icon === "string" ? null : step.icon;
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = index + 1 === currentStep;

          const Wrapper = interactive ? "button" : "div";
          const wrapperProps = interactive
            ? {
                type: "button" as const,
                onClick: () => onStepClick?.(index + 1),
              }
            : {};

          return (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <Wrapper
                  {...wrapperProps}
                  className={`
                    w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-200
                    ${interactive ? "cursor-pointer hover:scale-105" : "cursor-default"}
                    ${
                      isCompleted
                        ? "bg-green-500 border-green-500 text-white"
                        : isCurrent
                        ? "bg-blue-500 border-blue-500 text-white"
                        : `bg-linear-to-br ${step.color} border-white/30 text-white hover:border-gray-400`
                    }
                  `}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : Icon ? (
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <CustomIcon
                      iconType={step.icon as string}
                      className="w-4 h-4 sm:w-5 sm:h-5"
                    />
                  )}
                </Wrapper>
                <span
                  className={`
                    mt-1 text-xs font-medium text-center leading-tight
                    ${interactive ? "cursor-pointer" : "cursor-default"}
                    ${
                      isCompleted || isCurrent
                        ? "text-gray-900 dark:text-white"
                        : "text-gray-500"
                    }
                  `}
                  {...(interactive
                    ? { onClick: () => onStepClick?.(index + 1) }
                    : {})}
                >
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`
                    flex-1 h-0.5 mx-2 sm:mx-3 transition-all duration-200
                    ${
                      completedSteps.includes(steps[index + 1].id)
                        ? "bg-green-500"
                        : "bg-white/30"
                    }
                  `}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}


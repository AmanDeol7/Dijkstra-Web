"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { Loader2, AlertCircle, Building2, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CompanyAutoComplete } from "@/components/autocompletes/company-autocomplete";
import { useMutation } from "@tanstack/react-query";
import { authClient } from "@/lib/auth/auth-client";
import { Domain, Tools, Rank } from "@/types/server/dataforge/enums";
import { CAREER_PATHS } from "@/data/career-paths";
import { TOOLS_OPTIONS } from "@/types/enum-constants";
import { formatTimeDisplay, cn } from "@/lib/utils";
import type { OnboardingFormData } from "@/types/client/onboarding/onboarding";
import { OnboardUserRequest } from "@/types/server/dataforge/User/user";
import { submitDataforgeOnboarding } from "@/services/onboarding/OnboardingService";
import { updateOnboardingUserState } from "@/lib/onboarding/onboarding-auth";
import {
  OnboardingInteractiveSection,
  OnboardingPickerWell,
  onboardingMeterFillClassName,
  onboardingMeterTrackClassName,
  onboardingPickerChipClassName,
} from "@/components/onboarding/onboarding-interactive-section";
import { TimeLeftYearMonthControls } from "@/components/onboarding/time-left-year-month-controls";
import { OnboardingSalaryCircularPicker } from "@/components/onboarding/onboarding-salary-circular-picker";
import {
  MAX_UPSKILL_MONTHS,
  UPSKILL_MONTH_MIN,
  UPSKILL_PRESETS,
  formatUpskillYearsSummary,
  maxMonthForYear,
  partsToTotalMonths,
  totalMonthsToParts,
} from "@/lib/onboarding/upskill-time-left";

type CareerStepProps = {
  formData: OnboardingFormData;
  updateFormData: (updates: Partial<OnboardingFormData>) => void;
  onFinished: () => Promise<void>;
};

export function OnboardingCareerStep(props: CareerStepProps) {
  const { formData, updateFormData, onFinished } = props;
  const { data: session } = authClient.useSession();
  const [localPrimarySpec, setLocalPrimarySpec] = useState(
    formData.primarySpecialization
  );
  const [localSecondarySpecs, setLocalSecondarySpecs] = useState(
    formData.secondarySpecializations
  );
  const initialUpskill = totalMonthsToParts(formData.timeToUpskill);
  const [upsYears, setUpsYears] = useState(initialUpskill.years);
  const [upsMonths, setUpsMonths] = useState(initialUpskill.months);
  const [upskillTouched, setUpskillTouched] = useState(
    formData.timeToUpskill > 0
  );

  const localTimeToUpskill = useMemo(() => {
    if (!upskillTouched && upsYears === 0 && upsMonths === 0) return 0;
    return partsToTotalMonths(upsYears, upsMonths);
  }, [upskillTouched, upsYears, upsMonths]);

  useEffect(() => {
    const maxM = maxMonthForYear(upsYears);
    setUpsMonths((m) => Math.min(maxM, Math.max(UPSKILL_MONTH_MIN, m)));
  }, [upsYears]);

  const setYears = useCallback((y: number) => {
    setUpskillTouched(true);
    setUpsYears(y);
  }, []);

  const setMonths = useCallback((m: number) => {
    setUpskillTouched(true);
    setUpsMonths(m);
  }, []);

  const [localExpectedSalary, setLocalExpectedSalary] = useState(
    formData.expectedSalary
  );
  const [localSelectedTools, setLocalSelectedTools] = useState(
    formData.selectedTools
  );
  const [localDreamCompany, setLocalDreamCompany] = useState(
    formData.dreamCompany
  );
  const [localDreamRole, setLocalDreamRole] = useState(formData.dreamRole);
  const [selectedCompanyData, setSelectedCompanyData] = useState<{
    name: string;
    logo_url?: string;
  } | null>(null);

  const mutation = useMutation({
    mutationFn: async (data: OnboardUserRequest) => {
      const res = await submitDataforgeOnboarding(data);
      await updateOnboardingUserState(authClient, {
        onboardingStep: 8,
        completedOnboarding: true,
      });
      return res;
    },
    onSuccess: async () => {
      updateFormData({
        primarySpecialization: localPrimarySpec,
        secondarySpecializations: localSecondarySpecs,
        timeToUpskill: localTimeToUpskill,
        expectedSalary: localExpectedSalary,
        selectedTools: localSelectedTools,
        dreamCompany: localDreamCompany,
        dreamRole: localDreamRole,
      });
      await onFinished();
    },
  });

  const handleSave = () => {
    const user = session?.user as { username?: string; name?: string; access_token?: string; email?: string } | undefined;
    const githubUsername = user?.username ?? "";

    if (!githubUsername) {
      console.error("username not found in session");
      return;
    }

    if (!formData.leetcodeHandle?.trim()) {
      console.error("LeetCode username not found");
      return;
    }

    const linkedinUserName = formData.linkedinHandle.trim();
    if (!linkedinUserName) {
      console.error("LinkedIn username not set");
      return;
    }

    mutation.mutate({
      first_name:
        typeof user?.name === "string" ? user.name.split(" ")[0] : undefined,
      access_token:
        typeof user?.access_token === "string" ? user.access_token : "Test",
      middle_name:
        typeof user?.name === "string" ? user.name.split(" ")[1] : undefined,
      last_name:
        typeof user?.name === "string" ? user.name.split(" ")[2] : undefined,
      github_user_name: githubUsername,
      linkedin_user_name: linkedinUserName,
      leetcode_user_name: formData.leetcodeHandle.trim(),
      primary_specialization: localPrimarySpec as Domain,
      secondary_specializations: localSecondarySpecs as Domain[],
      expected_salary_bucket: localExpectedSalary as unknown as Rank,
      time_left: localTimeToUpskill,
      primary_email: user?.email ?? "",
      tools_to_learn: localSelectedTools as Tools[],
      dream_company: localDreamCompany,
      dream_company_logo: selectedCompanyData?.logo_url || "",
      dream_position: localDreamRole,
      rank: Rank.UNRANKED,
      streak: 0,
    });
  };

  const handlePrimarySpecChange = (spec: string) => {
    setLocalPrimarySpec(spec);
    setLocalSecondarySpecs((prev) => prev.filter((s) => s !== spec));
  };

  const handleSecondarySpecChange = (spec: string) => {
    if (localSecondarySpecs.includes(spec)) {
      setLocalSecondarySpecs((prev) => prev.filter((s) => s !== spec));
    } else if (localSecondarySpecs.length < 3) {
      setLocalSecondarySpecs((prev) => [...prev, spec]);
    }
  };

  const remainingFieldsComplete =
    localTimeToUpskill > 0 &&
    localTimeToUpskill <= MAX_UPSKILL_MONTHS &&
    localExpectedSalary !== "" &&
    localDreamCompany !== "" &&
    localDreamRole !== "" &&
    localSelectedTools.length > 0;

  return (
    <div className="max-h-[min(520px,55vh)] space-y-4 overflow-y-auto sm:space-y-6 sm:px-0">
      <div className="mx-auto max-w-6xl space-y-4 sm:space-y-6">
        {/* Specializations */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-left sm:p-6 shadow-xl">
          <h3 className="mb-4 text-lg font-semibold text-foreground">
            Career Specializations
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            Choose your primary specialization and 3 secondary areas of interest
          </p>

          {/* Instructions — steps 1–3: green, grey, red (left-aligned) */}
          <div className="mb-6 space-y-3 rounded-lg border border-white/10 bg-white/5 p-4 text-left">
            <div className="flex items-start gap-3 rounded-md bg-emerald-500/15 p-3 ring-1 ring-emerald-500/25">
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 shadow-sm ring-2 ring-emerald-400/40">
                <span className="text-xs font-bold text-white">1</span>
              </div>
              <div className="min-w-0 flex-1 text-left">
                <h4 className="mb-1 text-sm font-medium text-emerald-800 dark:text-emerald-300">
                  Step 1: Choose Primary Specialization
                </h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                  {!localPrimarySpec
                    ? "Click on any career path to set it as your primary specialization"
                    : `${CAREER_PATHS[localPrimarySpec as keyof typeof CAREER_PATHS]?.label} is your primary specialization`}
                </p>
              </div>
            </div>

            {localPrimarySpec && (
              <div className="flex items-start gap-3 rounded-md bg-slate-500/15 p-3 ring-1 ring-slate-400/30">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-600 shadow-sm ring-2 ring-slate-400/35">
                  <span className="text-xs font-bold text-white">2</span>
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <h4 className="mb-1 text-sm font-medium text-slate-800 dark:text-slate-200">
                    Step 2: Choose 3 Secondary Specializations
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-400">
                    {localSecondarySpecs.length === 0
                      ? "Now select 3 additional areas of interest from the remaining options"
                      : `Selected ${localSecondarySpecs.length}/3 secondary specializations`}
                  </p>
                </div>
              </div>
            )}

            {localPrimarySpec && localSecondarySpecs.length === 3 && (
              <div className="flex items-start gap-3 rounded-md bg-rose-500/15 p-3 ring-1 ring-rose-500/30">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-600 shadow-sm ring-2 ring-rose-400/40">
                  <span className="text-xs font-bold text-white">3</span>
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <h4 className="mb-1 text-sm font-medium text-rose-800 dark:text-rose-300">
                    Step 3: Fill the remaining fields
                  </h4>
                  <p className="text-xs text-rose-700 dark:text-rose-400">
                    {remainingFieldsComplete
                      ? "Everything below is filled in—use Save Career Plan when you're ready to finish."
                      : "Scroll down and complete time to upskill, expected salary, dream company, dream role, and tools to learn. Then tap Save Career Plan."}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Selection Status */}
          <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">
                Selection Progress
              </span>
              <span className="text-xs text-muted-foreground">
                {localPrimarySpec ? "1" : "0"}/1 Primary •{" "}
                {localSecondarySpecs.length}/3 Secondary
              </span>
            </div>
            <div className="flex gap-2">
              <div
                className={`flex-1 h-2 rounded-full ${
                  localPrimarySpec ? "bg-primary" : "bg-white/20"
                }`}
              ></div>
              <div
                className={`flex-1 h-2 rounded-full ${
                  localSecondarySpecs.length >= 1 ? "bg-primary" : "bg-white/20"
                }`}
              ></div>
              <div
                className={`flex-1 h-2 rounded-full ${
                  localSecondarySpecs.length >= 2 ? "bg-primary" : "bg-white/20"
                }`}
              ></div>
              <div
                className={`flex-1 h-2 rounded-full ${
                  localSecondarySpecs.length >= 3 ? "bg-primary" : "bg-white/20"
                }`}
              ></div>
            </div>
          </div>

          {/* Career Paths Grid - Grouped by Factions */}
          <div className="space-y-6">
            {Object.entries(
              Object.entries(CAREER_PATHS).reduce(
                (acc, [key, path]) => {
                  const faction = path.faction || "Other";
                  if (!acc[faction]) acc[faction] = [];
                  acc[faction].push([key, path]);
                  return acc;
                },
                {} as Record<
                  string,
                  Array<[string, typeof CAREER_PATHS[keyof typeof CAREER_PATHS]]>
                >
              )
            ).map(([faction, paths]) => {
              const factionGradient = paths[0][1].gradient;

              return (
                <div key={faction} className="space-y-3">
                  {/* Faction Header */}
                  <div
                    className={`flex items-center gap-2 pb-2 border-b border-white/20`}
                  >
                    <div
                      className={`w-1 h-6 rounded-full bg-linear-to-b ${factionGradient}`}
                    ></div>
                    <h4 className="text-base font-semibold text-foreground">
                      {faction}
                    </h4>
                    <span className="text-xs text-muted-foreground">
                      ({paths.length} paths)
                    </span>
                  </div>

                  {/* Faction Paths Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {paths.map(([key, path]) => {
                      const isPrimary = localPrimarySpec === key;
                      const isSecondary = localSecondarySpecs.includes(key);
                      const isDisabled =
                        !isPrimary &&
                        !isSecondary &&
                        localSecondarySpecs.length >= 3 &&
                        localPrimarySpec !== "";

                      return (
                        <div
                          key={key}
                          className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            isPrimary
                              ? "border-primary bg-primary/10 ring-2 ring-primary/50"
                              : isSecondary
                              ? "border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/50"
                              : isDisabled
                              ? "border-white/10 opacity-50 cursor-not-allowed"
                              : "border-white/20 hover:border-white/40 hover:bg-white/5"
                          }`}
                          onClick={() => {
                            if (isDisabled) return;

                            if (!localPrimarySpec) {
                              handlePrimarySpecChange(key);
                            } else if (isPrimary) {
                              setLocalPrimarySpec("");
                            } else if (isSecondary) {
                              handleSecondarySpecChange(key);
                            } else {
                              if (localSecondarySpecs.length < 3) {
                                handleSecondarySpecChange(key);
                              }
                            }
                          }}
                        >
                          <div className="text-center">
                            <div
                              className={`w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-2 rounded-xl bg-linear-to-br ${path.gradient} flex items-center justify-center p-2 shadow-lg`}
                            >
                              <img
                                src={`/${path.icon}`}
                                alt={path.label}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                  const parent = e.currentTarget.parentElement;
                                  if (parent) {
                                    const span = document.createElement("span");
                                    span.className =
                                      "text-white text-xs font-bold";
                                    span.textContent = path.shortLabel;
                                    parent.appendChild(span);
                                  }
                                }}
                              />
                            </div>
                            <h4 className="text-xs font-medium text-foreground mb-1">
                              {path.label}
                            </h4>

                            {/* Selection Indicators */}
                            {(isPrimary || isSecondary) && (
                              <div className="flex justify-center">
                                {isPrimary && (
                                  <Badge
                                    variant="default"
                                    className="text-xs bg-primary px-2 py-0.5"
                                  >
                                    Primary
                                  </Badge>
                                )}
                                {isSecondary && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs bg-blue-500/20 text-blue-600 px-2 py-0.5"
                                  >
                                    Secondary
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Time to upskill & expected salary — shared glass design system */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
          <OnboardingInteractiveSection
            title="Time to upskill"
            description="How long until you plan to apply? Use the arrows to set years and months (up to five years total)."
            bodyClassName="space-y-4"
          >
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Quick presets
              </p>
              <div className="flex flex-wrap gap-2">
                {UPSKILL_PRESETS.map(({ months, label }) => {
                  const active = localTimeToUpskill === months;
                  return (
                    <button
                      key={months}
                      type="button"
                      onClick={() => {
                        setUpskillTouched(true);
                        const p = totalMonthsToParts(months);
                        setUpsYears(p.years);
                        setUpsMonths(p.months);
                      }}
                      className={onboardingPickerChipClassName(active)}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <OnboardingPickerWell className="p-4 sm:p-5">
              <TimeLeftYearMonthControls
                className="mb-4"
                years={upsYears}
                months={upsMonths}
                onYearsChange={setYears}
                onMonthsChange={setMonths}
              />
              {localTimeToUpskill > 0 ? (
                <div className="mb-4 text-center">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Your timeline
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {formatTimeDisplay(localTimeToUpskill)}
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-primary">
                    ≈{" "}
                    {formatUpskillYearsSummary(localTimeToUpskill)} until
                    applications
                  </p>
                </div>
              ) : null}
              <div className={cn(onboardingMeterTrackClassName, "mb-2")}>
                <div
                  className={onboardingMeterFillClassName}
                  style={{
                    width: `${Math.min(100, (localTimeToUpskill / MAX_UPSKILL_MONTHS) * 100)}%`,
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>0</span>
                <span>60 months max</span>
              </div>
            </OnboardingPickerWell>

            {localTimeToUpskill <= 0 ? (
              <p className="text-center text-xs text-muted-foreground">
                Choose at least{" "}
                <span className="font-medium text-foreground">1 month</span>{" "}
                total (presets or arrows).
              </p>
            ) : null}
          </OnboardingInteractiveSection>

          <OnboardingSalaryCircularPicker
            value={localExpectedSalary}
            onChange={setLocalExpectedSalary}
          />
        </div>

        {/* Dream company & role */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur-xl sm:p-8">
          <div className="mb-6 max-w-2xl">
            <h3 className="text-lg font-semibold text-foreground">
              Career destination
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              The company and role you are preparing for — we use this to
              personalize your path.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 md:gap-10">
            <div className="flex min-w-0 flex-col gap-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <Building2 className="h-4 w-4" aria-hidden />
                </span>
                Dream company
              </div>
              <p className="text-xs text-muted-foreground">
                Search the directory or add your own name — then confirm below.
              </p>
              <CompanyAutoComplete
                value={localDreamCompany}
                onChange={(company) => {
                  setLocalDreamCompany(company.name);
                  setSelectedCompanyData(company);
                }}
                selectedCompany={selectedCompanyData}
                triggerClassName="border-white/20 bg-white/10 hover:bg-white/15 hover:border-white/30"
              />
              {localDreamCompany ? (
                <div className="mt-1 flex items-center gap-3 rounded-xl border border-white/10 bg-white/6 p-3">
                  {selectedCompanyData?.logo_url ? (
                    <img
                      src={selectedCompanyData.logo_url}
                      alt=""
                      className="h-11 w-11 shrink-0 rounded-lg border border-white/10 bg-white object-contain p-1"
                    />
                  ) : (
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/10 text-sm font-bold text-foreground">
                      {localDreamCompany.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {localDreamCompany}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Saved as your target employer
                    </p>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex min-w-0 flex-col gap-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <Briefcase className="h-4 w-4" aria-hidden />
                </span>
                Dream role
              </div>
              <p className="text-xs text-muted-foreground">
                Target title or level — specific beats vague for planning.
              </p>
              <Input
                value={localDreamRole}
                onChange={(e) => setLocalDreamRole(e.target.value)}
                placeholder="e.g. Senior Backend Engineer, Staff ML Engineer"
                className="h-11 border-white/20 bg-white/10 text-base placeholder:text-muted-foreground/70"
                autoComplete="off"
              />
            </div>
          </div>
        </div>

        {/* Tools Selection */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl">
          <h3 className="text-lg font-semibold mb-4 text-foreground">
            Tools & Technologies
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Tap everything you want to upskill in — all options are visible at
            once.
          </p>

          <div className="flex flex-wrap gap-2">
            {TOOLS_OPTIONS.map((tool) => {
              const on = localSelectedTools.includes(tool.value);
              return (
                <button
                  key={tool.value}
                  type="button"
                  onClick={() => {
                    setLocalSelectedTools((prev) =>
                      on
                        ? prev.filter((t) => t !== tool.value)
                        : [...prev, tool.value]
                    );
                  }}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-left text-sm font-medium transition-colors",
                    on
                      ? "border-primary bg-primary/15 text-foreground ring-1 ring-primary/40"
                      : "border-white/15 bg-white/5 text-muted-foreground hover:border-white/30 hover:bg-white/10 hover:text-foreground"
                  )}
                >
                  {tool.label}
                </button>
              );
            })}
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            Selected: {localSelectedTools.length} tools
          </div>
        </div>

        {/* Error Alert */}
        {mutation.isError && (
          <div className="max-w-2xl mx-auto">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {mutation.error instanceof Error
                  ? mutation.error.message
                  : "An error occurred. Please try again"}
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Save Button */}
        <div className="text-center">
          <Button
            onClick={handleSave}
            disabled={
              !(
                localPrimarySpec !== "" &&
                localSecondarySpecs.length === 3 &&
                localTimeToUpskill > 0 &&
                localTimeToUpskill <= MAX_UPSKILL_MONTHS &&
                localExpectedSalary !== "" &&
                localSelectedTools.length > 0 &&
                localDreamCompany !== "" &&
                localDreamRole !== ""
              ) || mutation.isPending
            }
            className="px-8 py-3"
            size="lg"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Account...
              </>
            ) : (
              "Save Career Plan"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}


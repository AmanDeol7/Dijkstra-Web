// Personal Details Form Component

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { personalDetailsSchema, type PersonalDetailsFormData } from "@/types/client/profile-section/schemas";
import {
  clampTimeLeftMonths,
  MAX_TIME_LEFT_MONTHS,
} from "@/constants/profile.constants";
import { SALARY_RANGES } from "@/types/enum-constants";
import {
  OnboardingPickerWell,
  onboardingMeterFillClassName,
  onboardingMeterTrackClassName,
} from "@/components/onboarding/onboarding-interactive-section";
import { TimeLeftYearMonthControls } from "@/components/onboarding/time-left-year-month-controls";
import {
  formatUpskillYearsSummary,
  maxMonthForYear,
  partsToTotalMonths,
  totalMonthsToParts,
} from "@/lib/onboarding/upskill-time-left";
import { formatTimeDisplay, cn } from "@/lib/utils";
import { CompanyAutoComplete } from "@/components/autocompletes/company-autocomplete";
import { LocationAutoComplete } from "@/components/autocompletes/location-autocomplete";
import { CareerPathSelector } from "../../shared/career-path-selector";
import { CareerPathCard } from "../../shared/career-path-card";
import { CAREER_PATHS, type CareerPathKey } from "@/data/career-paths";
import { X } from "lucide-react";
import type { PersonalDetailsData, Rank, Domain, Tools } from "@/types/client/profile-section/profile-sections";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";

interface PersonalDetailsFormProps {
  data: PersonalDetailsData | undefined;
  onUpdate: (data: Partial<PersonalDetailsData>) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function PersonalDetailsForm({ data, onUpdate, onCancel, isLoading }: PersonalDetailsFormProps) {
  const [selectedCompanyData, setSelectedCompanyData] = useState<{name: string, logo_url?: string} | null>(
    data?.dreamCompany ? { name: data.dreamCompany } : null
  );
  const [selectedLocationData, setSelectedLocationData] = useState<{
    city: string, 
    state?: string, 
    country: string,
    latitude?: number,
    longitude?: number
  } | null>(
    data?.locationCity && data?.locationCountry 
      ? { 
          city: data.locationCity, 
          state: data.locationState,
          country: data.locationCountry,
          latitude: data.locationLatitude,
          longitude: data.locationLongitude
        } 
      : null
  );
  const [pathSelectionOpen, setPathSelectionOpen] = useState<'primary' | 'secondary' | null>(null);

  const form = useForm<PersonalDetailsFormData>({
    resolver: zodResolver(personalDetailsSchema),
    defaultValues: {
      firstName: data?.firstName || "",
      middleName: data?.middleName || "",
      lastName: data?.lastName || "",
      bio: data?.bio || "",
      locationCity: data?.locationCity || "",
      locationState: data?.locationState || "",
      locationCountry: data?.locationCountry || "",
      locationLatitude: data?.locationLatitude || undefined,
      locationLongitude: data?.locationLongitude || undefined,
      primaryEmail: data?.primaryEmail || "",
      secondaryEmail: data?.secondaryEmail || "",
      universityEmail: data?.universityEmail || "",
      workEmail: data?.workEmail || "",
      website: data?.website || "",
      githubUserName: data?.githubUserName || "",
      linkedinUserName: data?.linkedinUserName || "",
      orcidUserName: data?.orcidUserName || "",
      leetcodeUserName: data?.leetcodeUserName || "",
      dreamCompany: data?.dreamCompany || "",
      dreamCompanyLogo: data?.dreamCompanyLogo || "",
      dreamPosition: data?.dreamPosition || "",
      expectedSalaryBucket: data?.expectedSalaryBucket || "UNRANKED",
      timeLeft: clampTimeLeftMonths(data?.timeLeft, 12),
      primarySpecialization: data?.primarySpecialization || "FULLSTACK",
      secondarySpecializations: data?.secondarySpecializations || [],
      toolsToLearn: data?.toolsToLearn || [],
    },
  });

  useEffect(() => {
    const raw = data?.timeLeft;
    if (raw != null && raw > MAX_TIME_LEFT_MONTHS) {
      form.setValue("timeLeft", clampTimeLeftMonths(raw));
    }
  }, [data?.timeLeft, form]);

  const onSubmit = (formData: PersonalDetailsFormData) => {
    try {
      onUpdate({
        ...formData,
        timeLeft: clampTimeLeftMonths(formData.timeLeft, 12),
        expectedSalaryBucket: formData.expectedSalaryBucket as Rank,
        primarySpecialization: formData.primarySpecialization as Domain,
        secondarySpecializations: formData.secondarySpecializations as Domain[],
        toolsToLearn: formData.toolsToLearn as Tools[],
      });
      toast.success("Personal details updated successfully!");
      onCancel();
    } catch (error) {
      toast.error("Failed to update personal details");
    }
  };

  const handlePathSelection = (type: 'primary' | 'secondary', pathKey: CareerPathKey) => {
    if (type === "primary") {
      form.setValue("primarySpecialization", pathKey);
    } else {
      const currentSecondaryPaths = form.getValues("secondarySpecializations");
      const newSecondaryPaths = [...currentSecondaryPaths];
      const index = newSecondaryPaths.indexOf(pathKey);
      if (index > -1) {
        newSecondaryPaths.splice(index, 1);
      } else if (newSecondaryPaths.length < 3) {
        newSecondaryPaths.push(pathKey);
      }
      form.setValue("secondarySpecializations", newSecondaryPaths);
    }
    setPathSelectionOpen(null);
  };

  const removeSecondaryPath = (index: number) => {
    const currentSecondaryPaths = form.getValues("secondarySpecializations");
    const newSecondaryPaths = currentSecondaryPaths.filter((_, i) => i !== index);
    form.setValue("secondarySpecializations", newSecondaryPaths);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your first name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="middleName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Middle Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your middle name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your last name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Tell us about yourself..." 
                    rows={3}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <FormLabel>Location</FormLabel>
            <LocationAutoComplete
              value={selectedLocationData ? 
                `${selectedLocationData.city}, ${selectedLocationData.state ? selectedLocationData.state + ', ' : ''}${selectedLocationData.country}` 
                : ""}
              onChange={(location) => {
                form.setValue("locationCity", location.city);
                form.setValue("locationState", location.state || "");
                form.setValue("locationCountry", location.country);
                form.setValue("locationLatitude", location.latitude);
                form.setValue("locationLongitude", location.longitude);
                setSelectedLocationData(location);
              }}
              selectedLocation={selectedLocationData}
            />
          </div>
          
          <FormField
            control={form.control}
            name="primaryEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Primary Email (Linked to GitHub)</FormLabel>
                <FormControl>
                  <Input placeholder="your.email@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="secondaryEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Secondary Email (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="secondary@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="universityEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>University Email (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="student@university.edu" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="workEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Work Email (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="work@company.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="https://yourwebsite.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="githubUserName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>GitHub Username</FormLabel>
                <FormControl>
                  <Input placeholder="yourusername" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="linkedinUserName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>LinkedIn Username (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="yourusername" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="leetcodeUserName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>LeetCode Username (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="yourusername" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* Career Goals */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold">Career Goals</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="dreamCompany"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dream Company</FormLabel>
                  <FormControl>
                    <CompanyAutoComplete
                      value={field.value}
                      onChange={(company) => {
                        field.onChange(company.name);
                        form.setValue("dreamCompanyLogo", company.logo_url || "");
                        setSelectedCompanyData(company);
                      }}
                      selectedCompany={selectedCompanyData}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="dreamPosition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dream Position</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Senior Software Engineer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="expectedSalaryBucket"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expected Salary Bucket</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select salary range" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SALARY_RANGES.map((salary) => (
                        <SelectItem key={salary.value} value={salary.value}>
                          {salary.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="timeLeft"
              render={({ field }) => {
                const total = clampTimeLeftMonths(field.value, 12);
                const { years, months } = totalMonthsToParts(total);
                const setClampedTotal = (raw: number) => {
                  field.onChange(
                    Math.min(
                      MAX_TIME_LEFT_MONTHS,
                      Math.max(1, raw)
                    )
                  );
                };
                const handleYearsChange = (y: number) => {
                  const maxM = maxMonthForYear(y);
                  const newMonths = Math.min(months, maxM);
                  setClampedTotal(partsToTotalMonths(y, newMonths));
                };
                const handleMonthsChange = (m: number) => {
                  setClampedTotal(partsToTotalMonths(years, m));
                };
                return (
                  <FormItem>
                    <FormLabel>Time left</FormLabel>
                    <FormControl>
                      <OnboardingPickerWell className="p-4 sm:p-5">
                        <TimeLeftYearMonthControls
                          className="mb-4"
                          years={years}
                          months={months}
                          onYearsChange={handleYearsChange}
                          onMonthsChange={handleMonthsChange}
                        />
                        <div className="mb-4 text-center">
                          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                            Your timeline
                          </p>
                          <p className="mt-1 text-sm font-semibold text-foreground">
                            {formatTimeDisplay(total)}
                          </p>
                          <p className="mt-0.5 text-xs font-medium text-primary">
                            ≈{" "}
                            {formatUpskillYearsSummary(total)} until
                            applications
                          </p>
                        </div>
                        <div className={cn(onboardingMeterTrackClassName, "mb-2")}>
                          <div
                            className={onboardingMeterFillClassName}
                            style={{
                              width: `${Math.min(100, (total / MAX_TIME_LEFT_MONTHS) * 100)}%`,
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                          <span>0</span>
                          <span>60 months max</span>
                        </div>
                      </OnboardingPickerWell>
                    </FormControl>
                    <FormDescription>
                      Use the arrows to set years and months (1-60 months
                      total, same cap as onboarding).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          </div>

          {/* Career Paths */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Primary Career Path */}
              <div>
                <FormLabel className="text-sm font-medium mb-3 block">
                  Primary Career Path
                </FormLabel>
                <CareerPathSelector
                  type="primary"
                  selectedPath={form.watch("primarySpecialization") as CareerPathKey}
                  selectedPaths={form.watch("secondarySpecializations") as CareerPathKey[]}
                  onSelect={(pathKey) => handlePathSelection('primary', pathKey)}
                  onClose={() => setPathSelectionOpen(null)}
                  isOpen={pathSelectionOpen === 'primary'}
                  onOpenChange={(open) => setPathSelectionOpen(open ? 'primary' : null)}
                />
              </div>

              {/* Secondary Career Paths */}
              <div>
                <FormLabel className="text-sm font-medium mb-3 block">
                  Secondary Career Paths (up to 3)
                </FormLabel>
                <div className="flex flex-wrap gap-3">
                  {form.watch("secondarySpecializations").map((pathKey, index) => (
                    <div key={pathKey} className="relative group w-24 h-24">
                      <CareerPathCard
                        pathKey={pathKey as CareerPathKey}
                        isSecondary={true}
                        onClick={() => {}}
                        showBadge={false}
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeSecondaryPath(index)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                  {form.watch("secondarySpecializations").length < 3 && (
                    <CareerPathSelector
                      type="secondary"
                      selectedPath={form.watch("primarySpecialization") as CareerPathKey}
                      selectedPaths={form.watch("secondarySpecializations") as CareerPathKey[]}
                      onSelect={(pathKey) => handlePathSelection('secondary', pathKey)}
                      onClose={() => setPathSelectionOpen(null)}
                      isOpen={pathSelectionOpen === 'secondary'}
                      onOpenChange={(open) => setPathSelectionOpen(open ? 'secondary' : null)}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex gap-2 pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}


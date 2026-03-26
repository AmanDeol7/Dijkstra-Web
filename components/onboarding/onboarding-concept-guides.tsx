import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Central place for “New to this?” / guide links. Import these in step content.
 * Paths resolve under /onboarding/guides (re-exporting onboarding-old content).
 */
export const ONBOARDING_CONCEPT_GUIDES = {
  github: {
    href: "/onboarding/guides/github",
    label: "Understanding GitHub",
  },
  git: {
    href: "/onboarding/guides/git",
    label: "Understanding Git",
  },
  vscode: {
    href: "/onboarding/guides/vscode",
    label: "Understanding VS Code",
  },
  discord: {
    href: "/onboarding/guides/discord",
    label: "Understanding Discord",
  },
  linkedin: {
    href: "/onboarding/guides/linkedin",
    label: "Understanding LinkedIn",
  },
  leetcode: {
    href: "/onboarding/guides/leetcode",
    label: "Understanding LeetCode",
  },
} as const;

export type OnboardingGuideKey = keyof typeof ONBOARDING_CONCEPT_GUIDES;

const VS_CODE_DOWNLOAD = "https://code.visualstudio.com/download";

export function VsCodeDownloadLink() {
  return (
    <div className="text-center">
      <Button variant="default" size="sm" className="bg-blue-500 border-white/20 hover:bg-blue-600" asChild>
        <a href={VS_CODE_DOWNLOAD} target="_blank" rel="noopener noreferrer">
          <ExternalLink className="mr-2 size-4" />
          Download VS Code
        </a>
      </Button>
    </div>
  );
}

interface NewToConceptLinkProps {
  guideKey: OnboardingGuideKey;
  step: number;
  className?: string;
}

/**
 * “New to X?” row with link to the full guide page (returns with ?step= for resume).
 */
export function NewToConceptLink({ guideKey, step, className }: NewToConceptLinkProps) {
  const g = ONBOARDING_CONCEPT_GUIDES[guideKey];
  return (
    <div className={`text-center ${className ?? ""}`}>
      <p className="mb-2 text-xs text-muted-foreground">New to this concept?</p>
      <Button variant="ghost" size="sm" className="border border-white/20" asChild>
        <a href={`${g.href}?step=${step}`}>
          <ExternalLink className="mr-2 size-4" />
          {g.label}
        </a>
      </Button>
    </div>
  );
}

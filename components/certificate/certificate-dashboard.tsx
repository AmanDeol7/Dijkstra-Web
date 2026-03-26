"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Cell,
  Label,
  Pie,
  PieChart,
} from "recharts";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { apiCall } from "@/services/CoreApiService";
import type { GetFullUserProfileResponse } from "@/types/server/dataforge/User/full-profile";
import type { LeetCodeStatisticsResponse } from "@/types/client/dashboard/leetcode-statistics";
import { SALARY_RANGES } from "@/constants/profile.constants";
import {
  Github,
  Linkedin,
  Globe,
  MapPin,
  Flame,
  Star,
  GitFork,
  Calendar,
  Award,
  Briefcase,
  BookOpen,
  Code2,
  Users,
  FileText,
  FlaskConical,
  Target,
  Clock,
  Trophy,
  GraduationCap,
  Building2,
  ExternalLink,
  AlertCircle,
} from "lucide-react";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function capitalize(s: string): string {
  return s ? s[0].toUpperCase() + s.slice(1).toLowerCase() : "";
}

function formatRank(rank: string): string {
  if (!rank || rank === "UNRANKED") return "Unranked";
  const parts = rank.split("_");
  if (parts.length === 1) return capitalize(parts[0]);
  const tier = capitalize(parts[0]);
  const num = ({ "1": "I", "2": "II", "3": "III" } as Record<string, string>)[parts[1]] ?? parts[1];
  return `${tier} ${num}`;
}

const RANK_TIER_COLORS: Record<string, string> = {
  UNRANKED: "bg-zinc-500/20 text-zinc-400 border border-zinc-500/30",
  IRON:     "bg-zinc-400/20 text-zinc-300 border border-zinc-400/30",
  BRONZE:   "bg-amber-600/20 text-amber-400 border border-amber-600/30",
  SILVER:   "bg-slate-400/20 text-slate-300 border border-slate-400/30",
  GOLD:     "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
  PLATINUM: "bg-cyan-400/20 text-cyan-300 border border-cyan-400/30",
  DIAMOND:  "bg-violet-400/20 text-violet-300 border border-violet-400/30",
  EMERALD:  "bg-emerald-400/20 text-emerald-300 border border-emerald-400/30",
  LAPIS:    "bg-indigo-400/20 text-indigo-300 border border-indigo-400/30",
  QUARTZ:   "bg-pink-400/20 text-pink-300 border border-pink-400/30",
  SAPHIRE:  "bg-sky-400/20 text-sky-300 border border-sky-400/30",
  OBSIDIAN: "bg-purple-900/40 text-purple-200 border border-purple-500/30",
};

function getRankColorClass(rank: string): string {
  if (!rank || rank === "UNRANKED") return RANK_TIER_COLORS.UNRANKED;
  const tier = rank.split("_")[0];
  return RANK_TIER_COLORS[tier] ?? RANK_TIER_COLORS.UNRANKED;
}

function formatDomain(domain: string): string {
  return domain
    .split("_")
    .map((w) => capitalize(w))
    .join(" ");
}

function formatMonthYear(month: number, year: number): string {
  const months = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec",
  ];
  return `${months[month - 1] ?? ""} ${year}`;
}

function formatIsoDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function getSalaryLabel(rank: string): string {
  return SALARY_RANGES.find((r) => r.value === rank)?.label ?? rank;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ─────────────────────────────────────────────
// LeetCode helpers
// ─────────────────────────────────────────────
const LC_COLORS = { easy: "#00AF9B", medium: "#FFC01E", hard: "#EF4743" };

function buildLCPieData(stats?: LeetCodeStatisticsResponse) {
  const ac = stats?.leetcode?.profile?.submitStatsGlobal?.acSubmissionNum ?? [];
  const map: Record<string, number> = {};
  for (const item of ac) {
    map[item.difficulty.toLowerCase()] = item.count;
  }
  return [
    { name: "Easy",   value: map.easy   ?? 0, fill: LC_COLORS.easy   },
    { name: "Medium", value: map.medium ?? 0, fill: LC_COLORS.medium },
    { name: "Hard",   value: map.hard   ?? 0, fill: LC_COLORS.hard   },
  ].filter((d) => d.value > 0);
}

function getLCTotals(stats?: LeetCodeStatisticsResponse) {
  const ac = stats?.leetcode?.profile?.submitStatsGlobal?.acSubmissionNum ?? [];
  const map = Object.fromEntries(ac.map((i) => [i.difficulty.toLowerCase(), i.count]));
  const easy = map.easy ?? 0;
  const medium = map.medium ?? 0;
  const hard = map.hard ?? 0;
  return { easy, medium, hard, total: easy + medium + hard };
}

// ─────────────────────────────────────────────
// Loading / Error states
// ─────────────────────────────────────────────
function NoUsernameState() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-sm">
        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">No user specified</h2>
        <p className="text-sm text-muted-foreground">
          Provide a{" "}
          <code className="text-xs bg-muted rounded px-1 py-0.5">?username=</code>{" "}
          query parameter to view a Dijkstra certificate.
        </p>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header skeleton */}
      <div className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-start gap-6">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-64" />
              <div className="flex gap-2 pt-1">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

function ErrorState({ username }: { username: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-sm">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Profile not found</h2>
        <p className="text-sm text-muted-foreground">
          Could not load data for{" "}
          <span className="font-medium text-foreground">@{username}</span>. The
          user may not exist or hasn't completed onboarding.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Profile Header
// ─────────────────────────────────────────────
function ProfileHeader({ data }: { data: GetFullUserProfileResponse }) {
  const fullName = [data.first_name, data.middle_name, data.last_name]
    .filter(Boolean)
    .join(" ");
  const displayName = fullName || data.github_user_name;
  const avatarSrc = `https://github.com/${data.github_user_name}.png`;
  const location = [data.location_city, data.location_state, data.location_country]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          {/* Avatar */}
          <Avatar className="h-20 w-20 shrink-0 ring-2 ring-border">
            <AvatarImage src={avatarSrc} alt={displayName} />
            <AvatarFallback className="text-lg">{getInitials(displayName)}</AvatarFallback>
          </Avatar>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold truncate">{displayName}</h1>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getRankColorClass(data.rank)}`}
              >
                {formatRank(data.rank)}
              </span>
              {data.streak != null && data.streak > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/15 border border-orange-500/30 px-2.5 py-0.5 text-xs font-semibold text-orange-400">
                  <Flame className="h-3 w-3" />
                  {data.streak} day streak
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">@{data.github_user_name}</p>

            {data.bio && (
              <p className="text-sm text-foreground/80 mt-2 max-w-xl line-clamp-2">{data.bio}</p>
            )}

            <div className="flex flex-wrap items-center gap-3 mt-3">
              {location && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  {location}
                </span>
              )}
              {data.links.github_link && (
                <a
                  href={data.links.github_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Github className="h-3.5 w-3.5" />
                  GitHub
                </a>
              )}
              {data.links.linkedin_link && (
                <a
                  href={data.links.linkedin_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Linkedin className="h-3.5 w-3.5" />
                  LinkedIn
                </a>
              )}
              {data.links.portfolio_link && (
                <a
                  href={data.links.portfolio_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Globe className="h-3.5 w-3.5" />
                  Portfolio
                </a>
              )}
              {data.links.leetcode_link && (
                <a
                  href={data.links.leetcode_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Code2 className="h-3.5 w-3.5" />
                  LeetCode
                </a>
              )}
            </div>
          </div>

          {/* Dijkstra watermark */}
          <div className="hidden sm:flex flex-col items-end text-xs text-muted-foreground shrink-0">
            <span className="font-semibold text-sm text-foreground/60">Dijkstra</span>
            <span>Verified Profile</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// General Stats Tab
// ─────────────────────────────────────────────
function GeneralStatsTab({
  data,
  lcStats,
}: {
  data: GetFullUserProfileResponse;
  lcStats?: LeetCodeStatisticsResponse;
}) {
  const pieData  = buildLCPieData(lcStats);
  const lcTotals = getLCTotals(lcStats);
  const contestRanking = lcStats?.leetcode?.contestRanking;
  const badges = lcStats?.leetcode?.profile?.badges ?? [];
  const hasPie = pieData.length > 0;
  const hasLC  = !!data.links.leetcode_user_name;

  const totalTools = data.tools_to_learn?.length ?? 0;

  // Summary numbers
  const totalProjects = data.profile.projects.length;
  const totalWorkExp  = data.profile.work_experience.length;
  const totalCerts    = data.profile.certifications.length;
  const totalPubs     = data.profile.publications.length;

  return (
    <div className="space-y-6">
      {/* ── Row 1: Rank / Streak / Dream ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Rank */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <Trophy className="h-3.5 w-3.5" /> Dijkstra Rank
            </CardDescription>
          </CardHeader>
          <CardContent>
            <span className={`inline-flex text-sm font-bold px-3 py-1 rounded-full ${getRankColorClass(data.rank)}`}>
              {formatRank(data.rank)}
            </span>
          </CardContent>
        </Card>

        {/* Streak */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <Flame className="h-3.5 w-3.5 text-orange-400" /> Streak
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tabular-nums">
              {data.streak ?? 0}
              <span className="ml-1 text-sm font-normal text-muted-foreground">days</span>
            </p>
          </CardContent>
        </Card>

        {/* Time Left */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> Time in Program
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tabular-nums">
              {data.time_left}
              <span className="ml-1 text-sm font-normal text-muted-foreground">months</span>
            </p>
          </CardContent>
        </Card>

        {/* Expected Salary */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5" /> Target Salary
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-semibold leading-snug">
              {getSalaryLabel(data.expected_salary_bucket ?? "")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Row 2: Specializations + Dream Company ── */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Specializations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Code2 className="h-4 w-4" /> Specializations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.primary_specialization && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Primary</p>
                <Badge variant="default" className="text-xs">
                  {formatDomain(data.primary_specialization)}
                </Badge>
              </div>
            )}
            {data.secondary_specializations && data.secondary_specializations.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Secondary</p>
                <div className="flex flex-wrap gap-1.5">
                  {data.secondary_specializations.map((s, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {formatDomain(s)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dream Company */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4" /> Dream Role
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.dream_company || data.dream_position ? (
              <div className="flex items-center gap-3">
                {data.dream_company_logo && (
                  <img
                    src={data.dream_company_logo}
                    alt={data.dream_company}
                    className="h-10 w-10 rounded-md border border-border object-contain bg-muted/30 p-1"
                  />
                )}
                <div>
                  {data.dream_company && (
                    <p className="font-semibold text-sm">{data.dream_company}</p>
                  )}
                  {data.dream_position && (
                    <p className="text-xs text-muted-foreground">{data.dream_position}</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Not set</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Row 3: Tools to Learn ── */}
      {data.tools_to_learn && data.tools_to_learn.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FlaskConical className="h-4 w-4" /> Tools to Learn
              <Badge variant="secondary" className="ml-auto text-xs">
                {totalTools} tools
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {data.tools_to_learn.map((tool, i) => (
                <Badge key={i} variant="outline" className="text-xs font-normal">
                  {tool}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Row 4: LeetCode ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Code2 className="h-4 w-4 text-yellow-400" /> LeetCode
          </CardTitle>
          <CardDescription>
            {hasLC
              ? "Solved problems & contest ranking"
              : "LeetCode profile not linked"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!hasLC && (
            <p className="text-sm text-muted-foreground">
              LeetCode username not linked to this profile.
            </p>
          )}
          {hasLC && (
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Donut chart */}
              <div className="flex flex-col items-center gap-3">
                {hasPie ? (
                  <ChartContainer
                    config={{ easy: { label: "Easy", color: LC_COLORS.easy }, medium: { label: "Medium", color: LC_COLORS.medium }, hard: { label: "Hard", color: LC_COLORS.hard } }}
                    className="h-[148px] w-[148px]"
                  >
                    <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={42}
                        outerRadius={56}
                        strokeWidth={2}
                        stroke="var(--card)"
                      >
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                        <Label
                          content={({ viewBox }) => {
                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                              return (
                                <text
                                  x={viewBox.cx}
                                  y={viewBox.cy}
                                  textAnchor="middle"
                                  dominantBaseline="middle"
                                  className="fill-foreground text-lg font-semibold"
                                >
                                  {lcTotals.total}
                                </text>
                              );
                            }
                          }}
                        />
                      </Pie>
                      <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                    </PieChart>
                  </ChartContainer>
                ) : (
                  <div className="flex h-[148px] w-[148px] items-center justify-center rounded-full border-2 border-dashed border-muted">
                    <span className="text-muted-foreground text-sm">0</span>
                  </div>
                )}
                <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center text-xs">
                  {(["easy", "medium", "hard"] as const).map((d) => (
                    <span key={d} className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: LC_COLORS[d] }} />
                      {d.charAt(0).toUpperCase() + d.slice(1)}{" "}
                      <span className="font-semibold tabular-nums">{lcTotals[d]}</span>
                    </span>
                  ))}
                </div>
              </div>

              <Separator orientation="vertical" className="hidden sm:block h-auto self-stretch" />

              {/* Stats */}
              <div className="flex flex-col gap-4 flex-1">
                {contestRanking && (
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                      Contest Ranking
                    </p>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                      {[
                        { label: "Rating", value: contestRanking.rating != null ? Math.round(contestRanking.rating).toLocaleString() : "—" },
                        { label: "Contests", value: contestRanking.attendedContestsCount?.toLocaleString() ?? "—" },
                        { label: "Global Rank", value: contestRanking.globalRanking?.toLocaleString() ?? "—" },
                        { label: "Top", value: contestRanking.topPercentage != null ? `${contestRanking.topPercentage.toFixed(1)}%` : "—" },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <p className="text-xs text-muted-foreground">{label}</p>
                          <p className="font-semibold tabular-nums">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {badges.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                      Badges
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {badges.map((badge, i) => (
                        <img
                          key={i}
                          src={badge.icon.startsWith("http") ? badge.icon : `https://leetcode.com${badge.icon}`}
                          alt={badge.hoverText || badge.name}
                          title={badge.hoverText || badge.name}
                          className="h-9 w-9 rounded object-contain"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Row 5: Profile Summary Counts ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { icon: <Briefcase className="h-4 w-4" />, label: "Work Experience", value: totalWorkExp },
          { icon: <Code2 className="h-4 w-4" />, label: "Projects", value: totalProjects },
          { icon: <Award className="h-4 w-4" />, label: "Certifications", value: totalCerts },
          { icon: <FileText className="h-4 w-4" />, label: "Publications", value: totalPubs },
        ].map(({ icon, label, value }) => (
          <Card key={label} className="text-center">
            <CardContent className="pt-4 pb-3">
              <div className="flex justify-center mb-1 text-muted-foreground">{icon}</div>
              <p className="text-2xl font-bold tabular-nums">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Transcript Tab
// ─────────────────────────────────────────────
function TranscriptTab({ data }: { data: GetFullUserProfileResponse }) {
  const p = data.profile;
  const hasSection = (arr: unknown[]) => arr.length > 0;

  return (
    <div className="space-y-6">
      {/* ── Education ── */}
      {hasSection(p.education) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <GraduationCap className="h-4 w-4" /> Education
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {p.education.map((edu, i) => (
              <div key={i}>
                {i > 0 && <Separator className="mb-5" />}
                <div className="flex items-start gap-3">
                  {edu.school_logo_url && (
                    <img
                      src={edu.school_logo_url}
                      alt={edu.school_name}
                      className="h-10 w-10 rounded-md border border-border object-contain bg-muted/30 p-1 shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-x-4">
                      <div>
                        <p className="font-semibold">{edu.school_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {edu.degree} · {edu.course_field_name}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                        {formatMonthYear(edu.start_date_month, edu.start_date_year)} —{" "}
                        {edu.currently_studying
                          ? "Present"
                          : edu.end_date_month && edu.end_date_year
                          ? formatMonthYear(edu.end_date_month, edu.end_date_year)
                          : "—"}
                      </p>
                    </div>
                    {edu.cgpa != null && (
                      <p className="text-xs text-muted-foreground mt-1">CGPA: {edu.cgpa}</p>
                    )}
                    {edu.description_general && (
                      <p className="text-sm mt-2 text-foreground/80">{edu.description_general}</p>
                    )}
                    {edu.tools_used && edu.tools_used.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {edu.tools_used.map((t, j) => (
                          <Badge key={j} variant="secondary" className="text-xs font-normal">{t}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* ── Work Experience ── */}
      {hasSection(p.work_experience) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Briefcase className="h-4 w-4" /> Work Experience
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {p.work_experience.map((exp, i) => (
              <div key={i}>
                {i > 0 && <Separator className="mb-5" />}
                <div className="flex items-start gap-3">
                  {exp.company_logo && (
                    <img
                      src={exp.company_logo}
                      alt={exp.company_name}
                      className="h-10 w-10 rounded-md border border-border object-contain bg-muted/30 p-1 shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-x-4">
                      <div>
                        <p className="font-semibold">{exp.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {exp.company_name} · {exp.employment_type.replace(/_/g, " ")}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                        {formatMonthYear(exp.start_date_month, exp.start_date_year)} —{" "}
                        {exp.currently_working
                          ? "Present"
                          : exp.end_date_month && exp.end_date_year
                          ? formatMonthYear(exp.end_date_month, exp.end_date_year)
                          : "—"}
                      </p>
                    </div>
                    {exp.location_type && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {exp.location_type.replace(/_/g, " ")}
                      </p>
                    )}
                    {exp.description_general && (
                      <p className="text-sm mt-2 text-foreground/80">{exp.description_general}</p>
                    )}
                    {exp.tools_used && exp.tools_used.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {exp.tools_used.map((t, j) => (
                          <Badge key={j} variant="secondary" className="text-xs font-normal">{t}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* ── Projects ── */}
      {hasSection(p.projects) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Code2 className="h-4 w-4" /> Projects
              <Badge variant="secondary" className="ml-auto text-xs">{p.projects.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {p.projects.map((proj, i) => (
                <div key={i} className="rounded-xl border border-border bg-muted/20 p-4 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {proj.project_organization_logo && (
                        <img
                          src={proj.project_organization_logo}
                          alt={proj.name}
                          className="h-6 w-6 rounded shrink-0 object-contain"
                        />
                      )}
                      <p className="font-semibold text-sm truncate">{proj.name}</p>
                    </div>
                    {proj.landing_page_link && (
                      <a
                        href={proj.landing_page_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{proj.description || proj.github_about}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-auto">
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3" /> {proj.github_stars}
                    </span>
                    <span className="flex items-center gap-1">
                      <GitFork className="h-3 w-3" /> {proj.github_forks}
                    </span>
                    <Badge variant="outline" className="text-xs font-normal ml-auto">
                      {formatDomain(proj.domain)}
                    </Badge>
                  </div>
                  {proj.tools && proj.tools.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {proj.tools.slice(0, 5).map((t, j) => (
                        <Badge key={j} variant="secondary" className="text-[10px] font-normal px-1.5 py-0">{t}</Badge>
                      ))}
                      {proj.tools.length > 5 && (
                        <Badge variant="secondary" className="text-[10px] font-normal px-1.5 py-0">
                          +{proj.tools.length - 5}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Certifications ── */}
      {hasSection(p.certifications) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Award className="h-4 w-4" /> Certifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {p.certifications.map((cert, i) => (
              <div key={i}>
                {i > 0 && <Separator className="mb-4" />}
                <div className="flex items-start gap-3">
                  {cert.issuing_organization_logo && (
                    <img
                      src={cert.issuing_organization_logo}
                      alt={cert.issuing_organization}
                      className="h-9 w-9 rounded-md border border-border object-contain bg-muted/30 p-1 shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-x-4">
                      <div>
                        <p className="font-semibold text-sm">{cert.name}</p>
                        <p className="text-xs text-muted-foreground">{cert.issuing_organization}</p>
                      </div>
                      <div className="flex flex-col items-end text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatIsoDate(cert.issue_date)}
                        </span>
                        {cert.expiry_date && (
                          <span>Expires {formatIsoDate(cert.expiry_date)}</span>
                        )}
                      </div>
                    </div>
                    {cert.credential_url && (
                      <a
                        href={cert.credential_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                      >
                        <ExternalLink className="h-3 w-3" /> View credential
                      </a>
                    )}
                    {cert.tools && cert.tools.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {cert.tools.map((t, j) => (
                          <Badge key={j} variant="secondary" className="text-xs font-normal">{t}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* ── Publications ── */}
      {hasSection(p.publications) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-4 w-4" /> Publications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {p.publications.map((pub, i) => (
              <div key={i}>
                {i > 0 && <Separator className="mb-4" />}
                <div className="flex items-start gap-3">
                  {pub.publisher_logo && (
                    <img
                      src={pub.publisher_logo}
                      alt={pub.publisher}
                      className="h-9 w-9 rounded-md border border-border object-contain bg-muted/30 p-1 shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-x-4">
                      <div>
                        <p className="font-semibold text-sm">{pub.title}</p>
                        <p className="text-xs text-muted-foreground">{pub.publisher}</p>
                      </div>
                      <p className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatIsoDate(pub.publication_date)}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {pub.authors.join(", ")}
                    </p>
                    {pub.description && (
                      <p className="text-sm mt-2 text-foreground/80 line-clamp-3">{pub.description}</p>
                    )}
                    {pub.publication_url && (
                      <a
                        href={pub.publication_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                      >
                        <ExternalLink className="h-3 w-3" /> View publication
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* ── Volunteering ── */}
      {hasSection(p.volunteering) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4" /> Volunteering
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {p.volunteering.map((vol, i) => (
              <div key={i}>
                {i > 0 && <Separator className="mb-4" />}
                <div className="flex items-start gap-3">
                  {vol.organization_logo && (
                    <img
                      src={vol.organization_logo}
                      alt={vol.organization}
                      className="h-9 w-9 rounded-md border border-border object-contain bg-muted/30 p-1 shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-x-4">
                      <div>
                        <p className="font-semibold text-sm">{vol.role}</p>
                        <p className="text-xs text-muted-foreground">
                          {vol.organization} · {formatDomain(vol.cause)}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatIsoDate(vol.start_date)} —{" "}
                        {vol.currently_volunteering ? "Present" : vol.end_date ? formatIsoDate(vol.end_date) : "—"}
                      </p>
                    </div>
                    {vol.description && (
                      <p className="text-sm mt-2 text-foreground/80">{vol.description}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* ── LeetCode Stats (from profile) ── */}
      {p.leetcode && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Code2 className="h-4 w-4 text-yellow-400" /> LeetCode Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: "Total Solved", value: p.leetcode.total_solved },
                { label: "Easy",         value: p.leetcode.easy_solved },
                { label: "Medium",       value: p.leetcode.medium_solved },
                { label: "Hard",         value: p.leetcode.hard_solved },
              ].map(({ label, value }) =>
                value != null ? (
                  <div key={label} className="rounded-lg border bg-muted/20 p-3 text-center">
                    <p className="text-xl font-bold tabular-nums">{value}</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </div>
                ) : null
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty transcript fallback */}
      {!hasSection(p.education) &&
        !hasSection(p.work_experience) &&
        !hasSection(p.projects) &&
        !hasSection(p.certifications) &&
        !hasSection(p.publications) &&
        !hasSection(p.volunteering) && (
          <div className="text-center py-16 text-muted-foreground">
            <FileText className="mx-auto h-10 w-10 mb-3 opacity-40" />
            <p className="text-sm">No transcript data available yet.</p>
          </div>
        )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Export
// ─────────────────────────────────────────────
export function CertificateDashboard() {
  const searchParams = useSearchParams();
  const username = searchParams.get("username")?.trim() ?? "";
  const tabParam = searchParams.get("tab")?.trim() ?? "";
  const defaultTab = tabParam === "transcript" ? "transcript" : "general";

  const {
    data: userData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["certificate-user", username],
    queryFn: () =>
      apiCall<GetFullUserProfileResponse>(
        "dataforge",
        `Dijkstra/v1/u/${encodeURIComponent(username)}?all_data=true`
      ),
    enabled: !!username,
    staleTime: 5 * 60 * 1000,
    gcTime:    10 * 60 * 1000,
    retry: 1,
  });

  const leetcodeUsername = userData?.links?.leetcode_user_name?.trim() ?? "";

  const { data: lcStats } = useQuery({
    queryKey: ["certificate-leetcode", leetcodeUsername],
    queryFn: () =>
      apiCall<LeetCodeStatisticsResponse>(
        "dataforge",
        `Dijkstra/v1/statistics/lc/${encodeURIComponent(leetcodeUsername)}`
      ),
    enabled: !!leetcodeUsername,
    staleTime: 5 * 60 * 1000,
    gcTime:    10 * 60 * 1000,
    retry: 1,
  });

  if (!username)             return <NoUsernameState />;
  if (isLoading)             return <LoadingState />;
  if (error || !userData)    return <ErrorState username={username} />;

  return (
    <div className="min-h-screen bg-background">
      <ProfileHeader data={userData} />

      <div className="max-w-6xl mx-auto px-4 py-6">
        <Tabs defaultValue={defaultTab}>
          <TabsList className="mb-6 w-full sm:w-auto">
            <TabsTrigger value="general" className="flex-1 sm:flex-none">
              General Stats
            </TabsTrigger>
            <TabsTrigger value="transcript" className="flex-1 sm:flex-none">
              Transcript
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <GeneralStatsTab data={userData} lcStats={lcStats} />
          </TabsContent>
          <TabsContent value="transcript">
            <TranscriptTab data={userData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

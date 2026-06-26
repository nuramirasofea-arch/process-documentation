import type { StepKind } from "./types";

export const DOT_COLOR: Record<string, string> = {
  yellow: "var(--dot-yellow)",
  green: "var(--dot-green)",
  orange: "var(--dot-orange)",
};

export const PILL: Partial<Record<StepKind, [string, string]>> = {
  handoff: ["handoff", "Hand-off"],
  pain: ["pain", "Pain"],
  opp: ["opp", "Opp"],
};

export const KTAG: Record<
  StepKind,
  [string, string, string]
> = {
  start: ["#efece2", "#6a665c", "Start"],
  process: ["#eee", "#1c1c1c", "Process"],
  handoff: ["#e4ecfb", "#1f5fd6", "Hand-off"],
  pain: ["#fbe6e5", "#d4302a", "Pain point"],
  opp: ["#e1f4ea", "#1a9e57", "Opportunity"],
  end: ["#e1f4ea", "#1a9e57", "End"],
};

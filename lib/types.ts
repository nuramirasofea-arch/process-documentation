export type StepKind =
  | "start"
  | "process"
  | "handoff"
  | "pain"
  | "opp"
  | "end";

export type DotColor = "yellow" | "green" | "orange";

export interface ProcessStep {
  k: StepKind;
  t: string;
  board?: string;
  dots?: DotColor[];
}

export interface Process {
  id: string;
  seq: string;
  dept: string;
  title: string;
  tag: string;
  steps: ProcessStep[];
  pains?: string;
}

export interface ParkingLotItem {
  id: string;
  t: string;
}

export interface DepartmentConfig {
  slug: string;
  name: string;
  blurb: string;
  variant:
    | "sales"
    | "ops"
    | "commercial"
    | "community"
    | "finance"
    | "hr"
    | "legal"
    | "parking";
  isParkingLot?: boolean;
  processDept?: string;
}

export interface Comment {
  id: string;
  author: string;
  /** Plain text for new rows; legacy rows may still contain HTML until migrated. */
  text: string;
  createdAt: string;
}

export interface DrawerContext {
  stepKey: string;
  proc: { seq: string; title: string };
  step: ProcessStep;
  stepIndex: number;
}

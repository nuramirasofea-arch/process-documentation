import type { DepartmentConfig, ParkingLotItem, Process } from "./types";

/**
 * Hardcoded process flows from the WORQ workshop board.
 *
 * Only documentation and comments live in Supabase. Process structure, step
 * titles, and routing slugs are defined here. `process_key` in Supabase
 * matches `${process.id}.${stepIndex}` (see DepartmentView / ProcessSection).
 */
export const PROCESSES: Process[] = [
  {
    id: "ma",
    seq: "1",
    dept: "sales",
    title: "MA Prep",
    tag: "Sales",
    steps: [
      { k: "start", t: "Client confirm deal", board: "via agents / WhatsApp / email" },
      {
        k: "process",
        t: "Gather Clients Info",
        board:
          "send template · client provides portal · follow up for remaining info",
      },
      {
        k: "pain",
        t: "Outlet prepare MA",
        dots: ["orange"],
        board:
          "email outlet · WhatsApp reminder · wait for outlet with client MA",
      },
      { k: "process", t: "Send MA draft to client" },
      {
        k: "handoff",
        t: "Legal Review / Nego",
        board:
          "client comments routed to reviewer · cc sales · call if unanswered after two reminders",
      },
      { k: "process", t: "Finalise & prepare to sign" },
      { k: "handoff", t: "Outlet send sign request" },
      { k: "end", t: "MA signed" },
    ],
    pains:
      "Clients/agents delay info → little time for MA closure · last-minute changes · unable to receive sign request",
  },
  {
    id: "info",
    seq: "2",
    dept: "sales",
    title: "Info Gathering",
    tag: "Sales",
    steps: [
      { k: "start", t: "Client inquiry" },
      {
        k: "handoff",
        t: "Branch: Customisation → Project",
        board: "parallel track",
      },
      {
        k: "handoff",
        t: "Branch: Service SLA (Outlet / IT)",
        board:
          "parallel track · decision to do or not; many may be new despite common in market",
      },
      {
        k: "handoff",
        t: "Branch: Building / Outlet Info",
        board:
          "parallel track · parking / availability · unavailable from BMS; unsure what to say",
      },
      { k: "process", t: "Seek confirmation from client" },
      {
        k: "pain",
        t: "Multiple rounds of changes in requirements",
        board: "scope hard to track; standard not clearly communicated",
      },
      {
        k: "process",
        t: "Clients confirm to proceed",
        board: "open: which version was promised to go ahead",
      },
      { k: "pain", t: "If not confirmed → Loop back to MA Prep" },
    ],
    pains:
      "Multiple requirement-change rounds · scope hard to track · SLA & building info gaps",
  },
  {
    id: "invsales",
    seq: "3",
    dept: "sales",
    title: "Invoice & Payment",
    tag: "Sales / ORND",
    steps: [
      { k: "start", t: "Client request meeting room" },
      {
        k: "process",
        t: "Raise Invoice in ORND",
        board: "create account for client · teach login · guide payment process",
      },
      { k: "pain", t: "Guide Client to use ORND" },
      { k: "process", t: "Fall back to bank transfer if clients request" },
      {
        k: "handoff",
        t: "Accounts to verify receipt",
        dots: ["orange", "yellow"],
        board:
          "get bank slip · wait few days from Accounts · revert to client · mark confirmed booking in ORND · if cancelled, remove soft block",
      },
      { k: "end", t: "Complete" },
    ],
    pains: "Client onboarding to ORND · waiting on Accounts to verify receipt",
  },
  {
    id: "renew",
    seq: "4",
    dept: "ops",
    title: "Contract Renewal",
    tag: "Ops",
    steps: [
      {
        k: "handoff",
        t: "Owner: Centralized Team vs Outlet team",
        board: "ownership question",
      },
      { k: "process", t: "Send" },
      { k: "process", t: "Follow up" },
      { k: "process", t: "Update" },
      { k: "end", t: "Renew", board: "& collect additional security deposit" },
    ],
    pains: "Manual checking · inconsistent PIC · no proper tracking",
  },
  {
    id: "term",
    seq: "5",
    dept: "ops",
    title: "Early Termination & Eviction",
    tag: "Ops + Legal",
    steps: [
      { k: "start", t: "Early Termination & Eviction of Members" },
      { k: "handoff", t: "Negotiation w/ Members", board: "Ops & Legal" },
      { k: "end", t: "Win-win solution" },
    ],
    pains: "Cross-functional coordination between Ops and Legal",
  },
  {
    id: "fac",
    seq: "6",
    dept: "ops",
    title: "Facilities / IT",
    tag: "Ops",
    steps: [
      { k: "start", t: "Outlet Rounding / Member Complaint" },
      { k: "process", t: "Raise Asana & multiple channels of communication" },
      { k: "handoff", t: "Tech / FM / PM Team" },
      {
        k: "pain",
        t: "Update of status for completion",
        board: "notifies FM/PM, Outlet Team, Members",
      },
      { k: "end", t: "Ticket Close", board: "open: ownership issue" },
    ],
    pains: "Status updates across multiple parties · ownership issue",
  },
  {
    id: "proc",
    seq: "7",
    dept: "ops",
    title: "Procurement",
    tag: "Ops · MANUAL",
    steps: [
      {
        k: "pain",
        t: "1) Manual checking of stock & updating",
        board: "Excel tracking / file processing",
      },
      { k: "pain", t: "2) Par level (manual)" },
      {
        k: "process",
        t: "3) Outlet summary REPORTING",
        board: "monthly & yearly monitoring",
      },
      {
        k: "opp",
        t: "Opportunity: system to track vendor list & pricing",
        dots: ["green"],
      },
    ],
    pains: "Whole process is manual / Excel-based — flagged for automation",
  },
  {
    id: "invcomm",
    seq: "8",
    dept: "commercial",
    title: "Invoicing & Payment",
    tag: "Event",
    steps: [
      { k: "start", t: "Client confirmation" },
      {
        k: "process",
        t: "Raised Invoice",
        board: "create A/c with company details on ORND · open: ownership?",
      },
      {
        k: "pain",
        t: "Check Payment Status (if not yet paid)",
        dots: ["orange"],
        board: "not reflected on the spot",
      },
      {
        k: "pain",
        t: "Chase Payment",
        board: "loops back to status check",
      },
      {
        k: "handoff",
        t: "Verify Payment (if client paid)",
        board: "verify with finance · verify with client",
      },
    ],
    pains:
      "Payment not reflected on the spot → chase loop · account ownership unresolved",
  },
];

export const PARKING_LOT = {
  name: "Parking Lot",
  blurb:
    "Processes not yet mapped. Capture context and discussion here before formal mapping.",
  items: [
    { id: "pl_leads", t: "Leads Inquiry Assignment" },
    { id: "pl_collection", t: "Collection" },
    { id: "pl_escalation", t: "Customer Complaint Escalation" },
    { id: "pl_survey", t: "Customer Survey" },
    { id: "pl_inventory", t: "Inventory Management" },
    { id: "pl_procurement", t: "Ops Procurement" },
  ] as ParkingLotItem[],
  questions:
    "Open questions: who does what · which to prioritise · where to see all outstanding/open tickets.",
};

const DEPARTMENT_CONFIGS: Record<string, DepartmentConfig> = {
  sales: {
    slug: "sales",
    name: "Sales",
    blurb: "Deal prep, info gathering, and member-facing invoicing.",
    variant: "sales",
    processDept: "sales",
  },
  ops: {
    slug: "ops",
    name: "Ops",
    blurb: "Renewals, terminations, facilities, and procurement.",
    variant: "ops",
    processDept: "ops",
  },
  community: {
    slug: "community",
    name: "Event",
    blurb: "Event invoicing and payment verification.",
    variant: "community",
    processDept: "commercial",
  },
  parking: {
    slug: "parking",
    name: "Parking Lot",
    blurb: PARKING_LOT.blurb,
    variant: "parking",
    isParkingLot: true,
  },
};

export const DEPARTMENT_SLUGS = Object.keys(DEPARTMENT_CONFIGS);

export function isValidDepartment(slug: string): boolean {
  return slug in DEPARTMENT_CONFIGS;
}

export function getDepartmentConfig(slug: string): DepartmentConfig {
  return DEPARTMENT_CONFIGS[slug];
}

export function getDepartmentList(): DepartmentConfig[] {
  return DEPARTMENT_SLUGS.map((slug) => DEPARTMENT_CONFIGS[slug]);
}

export function getProcessesForDepartment(slug: string): Process[] {
  const config = getDepartmentConfig(slug);
  if (config.isParkingLot) return [];
  // e.g. `/community` route shows processes tagged `dept: "commercial"`.
  return PROCESSES.filter((p) => p.dept === config.processDept);
}

export function getProcessTitlesForDepartment(slug: string): string[] {
  if (slug === "parking") {
    return PARKING_LOT.items.map((item) => item.t);
  }
  return getProcessesForDepartment(slug).map((p) => p.title);
}

export function getProcessCountForDepartment(slug: string): number {
  if (slug === "parking") return PARKING_LOT.items.length;
  return getProcessesForDepartment(slug).length;
}

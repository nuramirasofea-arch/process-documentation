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
  {
    id: "einvoice",
    seq: "9",
    dept: "finance",
    title: "e-Invoice",
    tag: "Finance · HIGH PRIORITY",
    steps: [
      {
        k: "start",
        t: "ORND Customer Database",
        board: "source: info gathering · determine collection stage / under MA?",
      },
      {
        k: "handoff",
        t: "B2B Business Data",
        dots: ["orange"],
        board: "split: Complete / Incomplete",
      },
      {
        k: "handoff",
        t: "B2C Consumer Data",
        board: "split: Complete / Incomplete",
      },
      { k: "process", t: "Complete → Non-Consol + SFTP", board: "full info" },
      {
        k: "process",
        t: "Incomplete → Consolidated SFTP",
        board:
          "lesser info · lump sum · payment gateway / website sales 100 transaction",
      },
      { k: "handoff", t: "JDME Customer Database", board: "B2B / B2C" },
      {
        k: "pain",
        t: "Incomplete Data → Post-Mortem",
        dots: ["orange"],
        board: "send reminder",
      },
      { k: "end", t: "Submission" },
    ],
    pains:
      "Incomplete customer data · consolidation vs non-consolidation routing · post-mortem reminders",
  },
  {
    id: "accreporting",
    seq: "10",
    dept: "finance",
    title: "Acc & Reporting",
    tag: "Finance · 2 companies",
    steps: [
      {
        k: "start",
        t: "Unresolved items",
        board:
          "credit notes, overpayment receipting + unresolved PO claims · before 1st",
      },
      {
        k: "pain",
        t: "Revenue Reconciliation",
        dots: ["orange"],
        board: "ORND / QBO · manual check · 1st",
      },
      { k: "process", t: "Revenue Share / Deferred Income", board: "3rd / 5th" },
      {
        k: "process",
        t: "Prepayment / Accrual / Fixed Asset / Intercompany Schedules",
        board: "5th–6th · Google Sheets",
      },
      { k: "handoff", t: "SST Submission", board: "7th" },
      { k: "handoff", t: "Withholding Tax", board: "7th" },
      {
        k: "pain",
        t: "Journal Adj → ITSB / WKL",
        dots: ["orange"],
        board: "8th · consolidation of data",
      },
      { k: "process", t: "Consol Mgmt Account", board: "10th" },
      { k: "end", t: "Reporting", board: "11th" },
    ],
    pains:
      "Manual checks · consolidation of data across 2 companies · month-end sequence pressure",
  },
  {
    id: "sourcing",
    seq: "11",
    dept: "finance",
    title: "Procurement & Sourcing",
    tag: "Finance / Ops",
    steps: [
      { k: "start", t: "Sourcing Inquiry", board: "G.Form + WhatsApp" },
      {
        k: "process",
        t: "Petty Cash (non-approval items) → Pay → Submit Claim → Reimburse",
      },
      { k: "process", t: "Credit Card → Pay → Submit Claim" },
      {
        k: "process",
        t: "Quarterly Purchase (inventory approval items) → Set Par Level",
      },
      {
        k: "pain",
        t: "Inventory Check",
        dots: ["orange"],
        board: "re-order · standardize data set",
      },
      { k: "process", t: "Cost Summary → Limit of Authority" },
      {
        k: "handoff",
        t: "PR (non-inventory approval items)",
        board: "tracker design · existing pipeline",
      },
      { k: "process", t: "Purchase Order", board: "QBO" },
      { k: "process", t: "Goods / Service Fulfilment" },
      { k: "end", t: "Supplier Payment" },
    ],
    pains:
      "Multiple entry channels · manual inventory check · non-standardised data",
  },
  {
    id: "recruitment",
    seq: "12",
    dept: "hr",
    title: "Recruitment",
    tag: "HR",
    steps: [
      { k: "start", t: "Competency Framework & Manpower Planning" },
      { k: "process", t: "Hiring Requisition" },
      {
        k: "process",
        t: "Hiring Strategy",
        board: "Budget · JD Scope & Requirement · Sourcing Solution",
      },
      {
        k: "handoff",
        t: "Team Tailor (ATS)",
        board:
          "fed by Job Ads Platform (Jobstreet, LinkedIn) and Referrals (ERBP, Agencies)",
      },
      { k: "process", t: "HR Screening" },
      { k: "handoff", t: "HM Shortlisting" },
      { k: "handoff", t: "Interview → Assignment → 2nd Interview" },
      { k: "process", t: "Background Check" },
      { k: "process", t: "Offer → Accept" },
      { k: "end", t: "Pre-Onboarding" },
      {
        k: "opp",
        t: "Analysis / Dashboard",
        dots: ["green"],
        board:
          "visibility on hiring process · time & stage tracker · dashboard creation",
      },
    ],
    pains: "Visibility on hiring process · time & stage tracking",
  },
  {
    id: "perfmgmt",
    seq: "13",
    dept: "hr",
    title: "Performance Management",
    tag: "HR",
    steps: [
      {
        k: "start",
        t: "Define Dept & Role Scope",
        board: "ongoing · quarterly",
      },
      {
        k: "process",
        t: "Goal Setting",
        board: "Q1–Q4 · target % → 100% · quarterly update",
      },
      {
        k: "process",
        t: "Result Update",
        board: "UI/UX requirements on 1 platform",
      },
      {
        k: "pain",
        t: "Individual Scorecard",
        dots: ["orange"],
        board: "automation on visibility",
      },
      {
        k: "handoff",
        t: "Supervisor Review / Team Member Acknowledge",
        board: "manual tracking",
      },
      { k: "end", t: "Payroll", board: "manual data input into Kakitangan" },
    ],
    pains:
      "Manual tracking · manual data input · automation & visibility needed",
  },
  {
    id: "contractmgmt",
    seq: "14",
    dept: "legal",
    title: "Contract Management & Tracker",
    tag: "Legal",
    steps: [
      {
        k: "start",
        t: "Review Request",
        board:
          "emails / WS · MAs (ORND & g-drive), other agreements (LOU, T&C, NDA, TA, MOU) — no master database",
      },
      {
        k: "handoff",
        t: "Legal",
        board:
          "Review / Drafting new template · no precedents · MOU-community pre-approved excluded (currently bypassed)",
      },
      {
        k: "process",
        t: "Finalization",
        board: "standardization on signee representative",
      },
      { k: "pain", t: "Signing", board: "visibility on signee" },
      {
        k: "pain",
        t: "Storage",
        dots: ["orange"],
        board: "no master database · WS/g-drive · no tracker · archiving",
      },
      { k: "process", t: "Performance" },
      { k: "end", t: "Renewal", board: "many miss renewals" },
    ],
    pains:
      "No master database · no tracker · missed renewals · no precedents for new templates",
  },
  {
    id: "legalenq",
    seq: "15",
    dept: "legal",
    title: "Legal Enquiries (Outlet)",
    tag: "Legal",
    steps: [
      { k: "start", t: "Enquiries / Complaints", board: "FD / AOM" },
      {
        k: "process",
        t: "Facts Gathering",
        board: "SDM / HOD / Legal · report / escalate",
      },
      {
        k: "pain",
        t: "Draft Responses",
        dots: ["orange"],
        board:
          "FD / AOM · responses often not thoughtful · incomplete facts",
      },
      {
        k: "handoff",
        t: "Review Responses",
        board: "Legal / HOD (if required) / SDM / KA",
      },
      { k: "process", t: "Outlet", board: "comms required · visibility" },
      { k: "process", t: "Meeting (if required)" },
      {
        k: "handoff",
        t: "Management (if required)",
        board: "comm. overload · report if required",
      },
      { k: "end", t: "Closure" },
    ],
    pains:
      "No escalation framework · comm. overload · responses not always thoughtful · incomplete facts",
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
  finance: {
    slug: "finance",
    name: "Finance",
    blurb: "e-Invoice, accounting & reporting, and procurement/sourcing.",
    variant: "finance",
    processDept: "finance",
  },
  hr: {
    slug: "hr",
    name: "HR",
    blurb: "Recruitment and performance management.",
    variant: "hr",
    processDept: "hr",
  },
  legal: {
    slug: "legal",
    name: "Legal",
    blurb: "Contract management & tracker and legal enquiries.",
    variant: "legal",
    processDept: "legal",
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

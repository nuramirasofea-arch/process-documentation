import { supabase } from "./supabase";
import { formatSupabaseMessage } from "./supabase-error";

export interface DocumentationRecord {
  id: string;
  department: string;
  process_key: string;
  content: string;
  updated_at: string;
}

export class DocumentationError extends Error {
  readonly cause: unknown;
  readonly department?: string;
  readonly processKey?: string;

  constructor(
    message: string,
    options?: {
      cause?: unknown;
      department?: string;
      processKey?: string;
    },
  ) {
    super(message);
    this.name = "DocumentationError";
    this.cause = options?.cause;
    this.department = options?.department;
    this.processKey = options?.processKey;
  }
}

const DOCUMENTATION_COLUMNS =
  "id, department, process_key, content, updated_at" as const;

function toDocumentationError(
  message: string,
  error: { message: string; code?: string; details?: string },
  context?: { department?: string; processKey?: string },
): DocumentationError {
  return new DocumentationError(`${message}: ${formatSupabaseMessage(error)}`, {
    cause: error,
    ...context,
  });
}

/** Maps Supabase rows to the `process_key → content` shape used by the UI. */
export function documentationToDetails(
  records: DocumentationRecord[],
): Record<string, string> {
  const details: Record<string, string> = {};

  for (const row of records) {
    details[row.process_key] = row.content ?? "";
  }

  return details;
}

export async function getDocumentationByDepartment(
  department: string,
): Promise<{ data: DocumentationRecord[]; error: DocumentationError | null }> {
  if (!department.trim()) {
    return {
      data: [],
      error: new DocumentationError("Department is required to fetch documentation"),
    };
  }

  const { data, error } = await supabase
    .from("documentation")
    .select(DOCUMENTATION_COLUMNS)
    .eq("department", department);

  if (error) {
    return {
      data: [],
      error: toDocumentationError("Failed to fetch documentation", error, {
        department,
      }),
    };
  }

  return { data: (data ?? []) as DocumentationRecord[], error: null };
}

/**
 * Saves documentation for a process step.
 *
 * Upserts on `(department, process_key)` so each step has exactly one row
 * without requiring a prior fetch or risking duplicate records.
 */
export async function saveDocumentation(
  department: string,
  processKey: string,
  content: string,
): Promise<
  | { data: DocumentationRecord; error: null }
  | { data: null; error: DocumentationError }
> {
  if (!department.trim()) {
    return {
      data: null,
      error: new DocumentationError("Department is required to save documentation"),
    };
  }

  if (!processKey.trim()) {
    return {
      data: null,
      error: new DocumentationError("Process key is required to save documentation", {
        department,
      }),
    };
  }

  const { data, error } = await supabase
    .from("documentation")
    .upsert(
      {
        department,
        process_key: processKey,
        content,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "department,process_key" },
    )
    .select(DOCUMENTATION_COLUMNS)
    .single();

  if (error) {
    return {
      data: null,
      error: toDocumentationError("Failed to save documentation", error, {
        department,
        processKey,
      }),
    };
  }

  if (!data) {
    return {
      data: null,
      error: new DocumentationError(
        "Save succeeded but no row was returned from the database",
        { department, processKey },
      ),
    };
  }

  return { data: data as DocumentationRecord, error: null };
}

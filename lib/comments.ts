import { supabase } from "./supabase";
import { formatSupabaseMessage, type SupabaseErrorLike } from "./supabase-error";
import type { Comment } from "./types";

export interface CommentRecord {
  id: string;
  department: string;
  process_key: string;
  author: string;
  comment: string;
  created_at: string;
}

export class CommentError extends Error {
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
    this.name = "CommentError";
    this.cause = options?.cause;
    this.department = options?.department;
    this.processKey = options?.processKey;
  }
}

const COMMENT_COLUMNS =
  "id, department, process_key, author, comment, created_at" as const;

function toCommentError(
  message: string,
  error: SupabaseErrorLike,
  context?: { department?: string; processKey?: string },
): CommentError {
  return new CommentError(`${message}: ${formatSupabaseMessage(error)}`, {
    cause: error,
    ...context,
  });
}

export function toComment(record: CommentRecord): Comment {
  return {
    id: record.id,
    author: record.author,
    html: record.comment,
    createdAt: record.created_at,
    when: new Date(record.created_at).toLocaleString(),
  };
}

export function groupCommentsByProcessKey(
  records: CommentRecord[],
): Record<string, Comment[]> {
  const grouped: Record<string, Comment[]> = {};

  for (const record of records) {
    const list = grouped[record.process_key] ?? [];
    list.push(toComment(record));
    grouped[record.process_key] = list;
  }

  return grouped;
}

async function fetchCommentRecords(
  department: string,
  processKey?: string,
): Promise<{ data: CommentRecord[]; error: CommentError | null }> {
  if (!department.trim()) {
    return {
      data: [],
      error: new CommentError("Department is required to fetch comments"),
    };
  }

  if (processKey !== undefined && !processKey.trim()) {
    return {
      data: [],
      error: new CommentError("Process key is required to fetch comments", {
        department,
      }),
    };
  }

  let query = supabase
    .from("comments")
    .select(COMMENT_COLUMNS)
    .eq("department", department)
    .order("created_at", { ascending: true });

  if (processKey) {
    query = query.eq("process_key", processKey);
  }

  const { data, error } = await query;

  if (error) {
    return {
      data: [],
      error: toCommentError("Failed to fetch comments", error, {
        department,
        processKey,
      }),
    };
  }

  return { data: (data ?? []) as CommentRecord[], error: null };
}

export async function getCommentsByDepartment(department: string) {
  return fetchCommentRecords(department);
}

export async function getCommentsForStep(
  department: string,
  processKey: string,
): Promise<{ data: Comment[]; error: CommentError | null }> {
  const { data, error } = await fetchCommentRecords(department, processKey);

  if (error) {
    return { data: [], error };
  }

  return { data: data.map(toComment), error: null };
}

export async function postComment(
  department: string,
  processKey: string,
  author: string,
  comment: string,
): Promise<{ data: CommentRecord | null; error: CommentError | null }> {
  if (!department.trim()) {
    return {
      data: null,
      error: new CommentError("Department is required to post a comment"),
    };
  }

  if (!processKey.trim()) {
    return {
      data: null,
      error: new CommentError("Process key is required to post a comment", {
        department,
      }),
    };
  }

  if (!author.trim()) {
    return {
      data: null,
      error: new CommentError("Author name is required to post a comment", {
        department,
        processKey,
      }),
    };
  }

  if (!comment.trim()) {
    return {
      data: null,
      error: new CommentError("Comment cannot be empty", {
        department,
        processKey,
      }),
    };
  }

  const { data, error } = await supabase
    .from("comments")
    .insert({
      department,
      process_key: processKey,
      author: author.trim(),
      comment,
      created_at: new Date().toISOString(),
    })
    .select(COMMENT_COLUMNS)
    .single();

  if (error) {
    return {
      data: null,
      error: toCommentError("Failed to post comment", error, {
        department,
        processKey,
      }),
    };
  }

  return { data: data as CommentRecord, error: null };
}

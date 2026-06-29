export type SupabaseErrorLike = {
  message: string;
  code?: string;
  details?: string;
};

/** Prefer Supabase `details` over `message` alone for operator-facing errors. */
export function formatSupabaseMessage(error: SupabaseErrorLike): string {
  return [error.message, error.details].filter(Boolean).join(" — ");
}

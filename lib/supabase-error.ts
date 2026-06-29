export type SupabaseErrorLike = {
  message: string;
  code?: string;
  details?: string;
};

export function formatSupabaseMessage(error: SupabaseErrorLike): string {
  return [error.message, error.details].filter(Boolean).join(" — ");
}

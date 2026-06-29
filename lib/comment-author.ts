const STORAGE_KEY = "commentAuthor";

// TODO: Replace localStorage author name with authenticated user identity when auth is introduced.

/** Returns the display name for comment attribution, persisted across sessions. */
export function getCommentAuthor(): string | null {
  if (typeof window === "undefined") return null;
  const name = localStorage.getItem(STORAGE_KEY)?.trim();
  return name || null;
}

export function setCommentAuthor(name: string): void {
  localStorage.setItem(STORAGE_KEY, name.trim());
}

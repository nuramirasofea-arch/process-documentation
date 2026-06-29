const STORAGE_KEY = "commentAuthor";

export function getCommentAuthor(): string | null {
  if (typeof window === "undefined") return null;
  const name = localStorage.getItem(STORAGE_KEY)?.trim();
  return name || null;
}

export function setCommentAuthor(name: string): void {
  localStorage.setItem(STORAGE_KEY, name.trim());
}

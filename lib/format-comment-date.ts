/**
 * Formats an ISO timestamp for comment display (presentation only).
 * Uses the viewer's local timezone — e.g. "Today • 10:36 AM" or "29 Jun 2026 • 10:36 AM".
 */
export function formatCommentTimestamp(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  const time = date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (isToday) {
    return `Today • ${time}`;
  }

  const day = date.getDate();
  const month = date.toLocaleString(undefined, { month: "short" });
  const year = date.getFullYear();

  return `${day} ${month} ${year} • ${time}`;
}

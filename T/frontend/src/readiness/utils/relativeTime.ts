/** Human-readable relative time (e.g. "2 hours ago") for notification timestamps */
export function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const sec = Math.round((then - now) / 1000);
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  const abs = Math.abs(sec);
  if (abs < 45) return rtf.format(Math.round(sec), "second");
  if (abs < 3600) return rtf.format(Math.round(sec / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(sec / 3600), "hour");
  if (abs < 604800) return rtf.format(Math.round(sec / 86400), "day");
  if (abs < 2628000) return rtf.format(Math.round(sec / 604800), "week");
  return new Date(iso).toLocaleString();
}

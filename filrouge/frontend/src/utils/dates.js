export const DONATION_INTERVAL_DAYS = 120;

export function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function formatRelative(value) {
  if (!value) return "";
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.round(diffMs / 60000);
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
}

// Mirrors the backend rule used by GET /api/auth/eligibility so we can
// derive the same status anywhere we already have a lastDonationDate.
export function computeEligibility(lastDonationDate) {
  if (!lastDonationDate) {
    return { eligible: true, nextDonationDate: null, daysRemaining: 0 };
  }
  const last = new Date(lastDonationDate);
  const next = new Date(last);
  next.setDate(next.getDate() + DONATION_INTERVAL_DAYS);
  const daysRemaining = Math.max(
    0,
    Math.ceil((next.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );
  return { eligible: daysRemaining === 0, nextDonationDate: next, daysRemaining };
}

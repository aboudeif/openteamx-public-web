import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function toValidDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function toRelativeSinceFromLegacyText(raw: string): string | null {
  const normalized = raw.trim().toLowerCase();
  if (!normalized) return null;

  if (normalized.startsWith("since:")) {
    return normalized;
  }

  const cleaned = normalized
    .replace(/^created\s+/i, "")
    .replace(/^left\s*:?/i, "")
    .replace(/\s+ago$/i, "")
    .trim();

  return cleaned ? `since: ${cleaned}` : null;
}

export function formatSince(value: string | Date | null | undefined): string {
  const date = toValidDate(value);

  if (!date && typeof value === "string") {
    return toRelativeSinceFromLegacyText(value) ?? "since: unknown";
  }

  if (!date) {
    return "since: unknown";
  }

  const diffMs = Math.max(0, Date.now() - date.getTime());
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return `since: ${diffSeconds} second${diffSeconds === 1 ? "" : "s"}`;
  }
  if (diffMinutes < 60) {
    return `since: ${diffMinutes} minute${diffMinutes === 1 ? "" : "s"}`;
  }
  if (diffHours < 24) {
    return `since: ${diffHours} hour${diffHours === 1 ? "" : "s"}`;
  }
  if (diffDays < 7) {
    return `since: ${diffDays} day${diffDays === 1 ? "" : "s"}`;
  }

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffDays < 30) {
    return `since: ${diffWeeks} week${diffWeeks === 1 ? "" : "s"}`;
  }

  const diffMonths = Math.floor(diffDays / 30);
  if (diffDays < 365) {
    return `since: ${diffMonths} month${diffMonths === 1 ? "" : "s"}`;
  }

  const diffYears = Math.floor(diffDays / 365);
  return `since: ${diffYears} year${diffYears === 1 ? "" : "s"}`;
}

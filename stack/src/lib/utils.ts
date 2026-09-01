import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Small, dependency-free "X ago" formatter — used for notification
// timestamps and "last seen" online-status text.
export function timeAgo(dateString: string | Date): string {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString();
}

// "Online" or "Last seen X ago" — the standard chat-style presence label.
export function formatPresence(online: boolean, lastActiveAt?: string | Date | null): string {
  if (online) return "Online";
  if (!lastActiveAt) return "Offline";
  return `Last seen ${timeAgo(lastActiveAt)}`;
}

// A fixed palette of solid, white-text-friendly colors — picked deterministically
// from a user's id so the same person always gets the same color everywhere
// (chat, profile, comments, etc.), and two people with the same display name
// are visually distinguishable at a glance instead of being indistinguishable
// gray circles.
const AVATAR_PALETTE = [
  "bg-orange-500",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-teal-500",
  "bg-red-500",
  "bg-indigo-500",
  "bg-cyan-600",
  "bg-fuchsia-500",
];

export function getAvatarColor(id: string): string {
  const key = id || "?";
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0; // keep it a 32-bit int
  }
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

// Up to two letters — first letters of the first two words of a name — so
// "Charlar Sharma" becomes "CS" instead of just "C". Falls back gracefully
// for single-word names or missing data.
export function getInitials(name?: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || "?";
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
// A user counts as "online" if their lastActiveAt is within this window.
// The frontend heartbeats every 20s, so 60s comfortably survives a couple
// of missed beats (slow network, brief tab throttling) without flapping.
export const ONLINE_THRESHOLD_MS = 60 * 1000;

export const isOnline = (lastActiveAt) => {
  if (!lastActiveAt) return false;
  return Date.now() - new Date(lastActiveAt).getTime() <= ONLINE_THRESHOLD_MS;
};
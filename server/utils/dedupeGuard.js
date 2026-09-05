// Defense-in-depth against duplicate message sends — a network hiccup, a
// double-tap on a slow connection, or a client retry can result in two
// nearly-identical requests reaching the server a few hundred milliseconds
// apart even when the frontend has its own guard. This blocks the second
// one at the server, so "click send once" is a guarantee, not just a
// best-effort client-side behavior.
//
// In-memory and per-process by design: it only needs to catch things that
// happen within a couple of seconds of each other, not persist across
// restarts. NOTE: if this app ever runs multiple Node instances/containers
// behind a load balancer, this guard is per-instance only — a duplicate
// split across two instances would not be caught. For a single-instance
// deploy this is not a concern.
const recentSends = new Map(); // key -> timestamp of the last accepted send
const COOLDOWN_MS = 1500;
const MAX_TRACKED_KEYS = 5000;

function cleanup(now) {
  if (recentSends.size <= MAX_TRACKED_KEYS) return;
  for (const [k, t] of recentSends) {
    if (now - t > COOLDOWN_MS) recentSends.delete(k);
  }
}

/**
 * `key` should identify "this exact action" — e.g.
 * `${senderId}:${targetId}:${text || mediaId}` — so two different quick
 * messages from the same person aren't accidentally blocked, only a genuine
 * repeat of the same content within the cooldown. Prefer a real media
 * identifier (upload id/hash) over a generic "MEDIA" literal if you expect
 * a user to send two different attachments back-to-back.
 *
 * Returns true if this exact key was already accepted within COOLDOWN_MS
 * (i.e. this is a duplicate and should be rejected), false if it's new
 * (and the key is now marked as accepted).
 */
export const isDuplicateSend = (key) => {
  const now = Date.now();
  const last = recentSends.get(key);
  if (last && now - last < COOLDOWN_MS) {
    return true;
  }
  recentSends.set(key, now);
  cleanup(now);
  return false;
};

/**
 * Optional: call this if the send you just accepted actually failed
 * downstream (DB write error, validation failure, etc.) so a legitimate,
 * immediate retry by the user isn't blocked as a "duplicate" for the rest
 * of the cooldown window. Safe to skip if you're fine with failed sends
 * just waiting out the 1.5s window before retrying.
 */
export const releaseSend = (key) => {
  recentSends.delete(key);
};
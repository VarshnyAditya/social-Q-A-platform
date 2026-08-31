// Escapes regex metacharacters in user-supplied search text before it's
// used inside a MongoDB $regex query. Without this, a crafted search string
// with a catastrophic-backtracking pattern can make the database spend
// disproportionate time evaluating a single query — a ReDoS. This makes the
// search behave as a literal substring match instead of interpreting the
// user's input as a regex pattern, which is what "search for a name" should
// mean anyway.
export const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
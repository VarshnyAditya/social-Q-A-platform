// Returns a message safe to send back in an API response: the real error
// text in development (useful while building), a generic message in
// production. Raw error text (Mongoose validation strings, driver errors,
// etc.) sent straight to the client is free reconnaissance for an attacker —
// confirming field names, internal structure, or library versions. Callers
// should still console.error the real error themselves for debugging; this
// only controls what goes out over the wire.
export const safeErrorMessage = (error, fallback = "Something went wrong") => {
  if (process.env.NODE_ENV !== "production") {
    return error?.message || fallback;
  }
  return fallback;
};
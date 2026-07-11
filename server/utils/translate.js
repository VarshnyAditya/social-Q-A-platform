// Uses the MyMemory API (https://mymemory.translated.net) — free, no signup,
// no API key, no credit card. Limit is ~500 bytes per request and ~5,000
// words/day per IP (10x more if an email is passed via `de`), so long text
// is chunked and results are cached in memory to avoid repeat calls.

const MYMEMORY_URL = "https://api.mymemory.translated.net/get";
const MAX_CHUNK_LENGTH = 480; // stay safely under MyMemory's 500-byte cap
const CONTACT_EMAIL = process.env.TRANSLATE_CONTACT_EMAIL || "";

// naive in-memory cache: key = `${lang}:${text}` -> translated text.
// Resets on server restart — fine for a project this size, avoids needing Redis.
const cache = new Map();

const chunkText = (text, maxLen) => {
  if (text.length <= maxLen) return [text];
  const chunks = [];
  let remaining = text;
  while (remaining.length > maxLen) {
    // try to break on a sentence/space boundary near the limit
    let breakAt = remaining.lastIndexOf(" ", maxLen);
    if (breakAt <= 0) breakAt = maxLen;
    chunks.push(remaining.slice(0, breakAt));
    remaining = remaining.slice(breakAt).trim();
  }
  if (remaining) chunks.push(remaining);
  return chunks;
};

const translateChunk = async (text, targetLang, sourceLang = "en") => {
  if (!text || !text.trim()) return text;

  const cacheKey = `${sourceLang}|${targetLang}:${text}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const params = new URLSearchParams({
    q: text,
    langpair: `${sourceLang}|${targetLang}`,
  });
  if (CONTACT_EMAIL) params.set("de", CONTACT_EMAIL);

  const response = await fetch(`${MYMEMORY_URL}?${params.toString()}`);
  const data = await response.json();

  if (data.responseStatus !== 200 && data.responseStatus !== "200") {
    throw new Error(data.responseDetails || "Translation request failed");
  }

  const translated = data.responseData.translatedText;
  cache.set(cacheKey, translated);
  return translated;
};

// Translates arbitrary-length text by chunking, translating each piece,
// then rejoining. Safe to call directly with question/answer bodies.
export const translateText = async (text, targetLang, sourceLang = "en") => {
  if (!text || targetLang === sourceLang) return text;

  const chunks = chunkText(text, MAX_CHUNK_LENGTH);
  const translatedChunks = [];
  for (const chunk of chunks) {
    // sequential, not parallel — MyMemory's free tier is easy to rate-limit
    // if hit with a burst of concurrent requests
    const translated = await translateChunk(chunk, targetLang, sourceLang);
    translatedChunks.push(translated);
  }
  return translatedChunks.join(" ");
};

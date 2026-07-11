import { translateText } from "../utils/translate.js";

const SUPPORTED_LANGUAGES = ["en", "es", "hi", "pt", "zh", "fr"];

// Generic endpoint used to translate user-generated content (question/answer
// bodies, titles, comments) on demand for whichever language is active.
// Accepts either a single `text` string or a `texts` array for batching.
export const translateContent = async (req, res) => {
  const { text, texts, targetLanguage } = req.body;

  if (!targetLanguage || !SUPPORTED_LANGUAGES.includes(targetLanguage)) {
    return res.status(400).json({ message: "Unsupported or missing target language." });
  }
  if (!text && !texts) {
    return res.status(400).json({ message: "Provide `text` or `texts` to translate." });
  }

  try {
    if (Array.isArray(texts)) {
      const translated = [];
      for (const t of texts) {
        translated.push(await translateText(t, targetLanguage));
      }
      return res.status(200).json({ translated });
    }

    const translated = await translateText(text, targetLanguage);
    res.status(200).json({ translated });
  } catch (error) {
    console.error("translateContent error:", error.message);
    res.status(500).json({ message: "Translation failed. Please try again." });
  }
};

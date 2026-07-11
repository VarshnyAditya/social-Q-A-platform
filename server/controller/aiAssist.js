const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const SYSTEM_PROMPT =
  "You are a friendly, concise assistant embedded in a Q&A / social coding platform called CodeQuest. " +
  "Help users with general questions and everyday programming questions — explaining concepts, debugging small " +
  "snippets, syntax help, best practices. Keep answers clear and reasonably short. You are a lightweight chat " +
  "helper, not a full autonomous coding agent, so for very large tasks suggest the user break it into smaller " +
  "questions instead of writing huge multi-file solutions.";

// POST /ai/chat
// body: { messages: [{ role: "user" | "assistant", content: string }, ...] }
// The full running conversation is sent by the client each time (session-only, nothing is persisted here).
export const sendMessage = async (req, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ message: "messages array is required" });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error("GROQ_API_KEY is not set in environment variables");
      return res.status(500).json({ message: "AI service is not configured" });
    }

    // Keep the payload small and well-formed: last 20 turns, plain role/content only.
    // Groq uses the standard OpenAI-style role names ("user" / "assistant"), same as our frontend already sends.
    const chatMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.slice(-20).map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: String(m.content || "").slice(0, 4000),
      })),
    ];

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: chatMessages,
        max_tokens: 1024,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq API error:", data);
      return res.status(502).json({
        message: "AI service error. Please try again in a moment.",
      });
    }

    const reply =
      data?.choices?.[0]?.message?.content?.trim() ||
      "Sorry, I couldn't come up with a response for that.";

    res.status(200).json({ reply });
  } catch (error) {
    console.error("AI chat error:", error);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

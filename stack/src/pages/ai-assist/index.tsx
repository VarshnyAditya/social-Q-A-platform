import Seo from "@/components/Seo";
import Mainlayout from "@/layout/Mainlayout";
import axiosInstance from "@/lib/axiosinstance";
import { useAuth } from "@/lib/AuthContext";
import { useLanguage } from "@/lib/LanguageContext";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { Bot, Loader2, RotateCcw, Send, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

const QUICK_PROMPTS = [
  "Explain closures in JavaScript",
  "What's the difference between let and var?",
  "How do I reverse a string in Python?",
];

// Renders the AI's markdown (**bold**, `code`, lists, headings, tables, etc.)
// as actual formatted HTML instead of showing the raw symbols. Sized and
// spaced to sit naturally inside a narrow chat bubble.
const markdownComponents = {
  p: ({ children }: any) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
  strong: ({ children }: any) => <strong className="font-semibold">{children}</strong>,
  em: ({ children }: any) => <em className="italic">{children}</em>,
  a: ({ href, children }: any) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 underline hover:text-blue-700"
    >
      {children}
    </a>
  ),
  ul: ({ children }: any) => (
    <ul className="list-disc pl-5 mb-2 space-y-1 last:mb-0">{children}</ul>
  ),
  ol: ({ children }: any) => (
    <ol className="list-decimal pl-5 mb-2 space-y-1 last:mb-0">{children}</ol>
  ),
  li: ({ children }: any) => <li className="leading-relaxed">{children}</li>,
  h1: ({ children }: any) => (
    <h1 className="text-base font-semibold mt-3 mb-1.5 first:mt-0">{children}</h1>
  ),
  h2: ({ children }: any) => (
    <h2 className="text-[15px] font-semibold mt-3 mb-1.5 first:mt-0">{children}</h2>
  ),
  h3: ({ children }: any) => (
    <h3 className="text-sm font-semibold mt-2.5 mb-1 first:mt-0">{children}</h3>
  ),
  blockquote: ({ children }: any) => (
    <blockquote className="border-l-2 border-gray-300 pl-3 my-2 text-gray-600 italic">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-3 border-gray-300" />,
  table: ({ children }: any) => (
    <div className="overflow-x-auto my-2">
      <table className="min-w-full text-xs border-collapse">{children}</table>
    </div>
  ),
  th: ({ children }: any) => (
    <th className="border border-gray-300 px-2 py-1 bg-gray-50 text-left font-semibold">
      {children}
    </th>
  ),
  td: ({ children }: any) => <td className="border border-gray-300 px-2 py-1">{children}</td>,
  // react-markdown v10 no longer passes an `inline` flag, so inline code is
  // styled as a small pill by default; the `pre` wrapper below strips that
  // styling back off for fenced code blocks so they get the dark block look.
  code: ({ className, children, ...props }: any) => (
    <code
      className={`bg-gray-200/70 text-[0.85em] px-1 py-0.5 rounded font-mono ${className || ""}`}
      {...props}
    >
      {children}
    </code>
  ),
  pre: ({ children }: any) => (
    <pre className="bg-gray-900 text-gray-100 text-xs rounded-lg p-3 overflow-x-auto my-2 [&_code]:bg-transparent [&_code]:p-0 [&_code]:rounded-none [&_code]:text-inherit">
      {children}
    </pre>
  ),
};

export default function AIAssistPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const formatTime = (ts: number) =>
    new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    if (!user) {
      toast.error("Please login to use AI Assist");
      router.push("/auth");
      return;
    }

    const userMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      content: trimmed,
      timestamp: Date.now(),
    };

    const updated = [...messages, userMessage];
    setMessages(updated);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setLoading(true);

    try {
      const res = await axiosInstance.post("/ai/chat", {
        messages: updated.map((m) => ({ role: m.role, content: m.content })),
      });

      const assistantMessage: ChatMessage = {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        content: res.data.reply,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to get a response. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => sendMessage(input);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  };

  const handleNewChat = () => {
    setMessages([]);
    setInput("");
  };

  return (
    <Mainlayout>
      <Seo title="AI Assist — CodeQuest" path="/ai-assist" noindex />
      <div className="p-4 lg:p-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-orange-500" />
            <div>
              <h1 className="text-xl lg:text-2xl font-semibold">{t("nav.aiAssist")}</h1>
              <p className="text-xs text-gray-500">
                {t("pages.aiAssistSubtitle")}
              </p>
            </div>
          </div>
          <button
            onClick={handleNewChat}
            className="flex items-center gap-1 text-sm text-gray-600 hover:bg-gray-100 border border-gray-200 px-3 py-1.5 rounded transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            New Chat
          </button>
        </div>

        {/* Chat window */}
        <div className="border border-gray-200 rounded-xl bg-white flex flex-col h-[65vh]">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center px-4">
                <Bot className="w-10 h-10 text-orange-400 mb-3" />
                <p className="text-gray-700 font-medium mb-1">Hi, I&apos;m your AI Assistant</p>
                <p className="text-sm text-gray-500 mb-4">
                  Ask me anything — general questions or basic programming help.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => sendMessage(prompt)}
                      className="text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex items-end gap-2 ${
                  m.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {m.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-orange-600" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] flex flex-col ${
                    m.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`px-3.5 py-2 rounded-2xl text-sm ${
                      m.role === "user"
                        ? "bg-blue-600 text-white rounded-br-sm whitespace-pre-wrap"
                        : "bg-gray-100 text-gray-800 rounded-bl-sm"
                    }`}
                  >
                    {m.role === "assistant" ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                        {m.content}
                      </ReactMarkdown>
                    ) : (
                      m.content
                    )}
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 px-1">
                    {formatTime(m.timestamp)}
                  </span>
                </div>
                {m.role === "user" && (
                  <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-end gap-2 justify-start">
                <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-orange-600" />
                </div>
                <div className="bg-gray-100 text-gray-500 px-3.5 py-2.5 rounded-2xl rounded-bl-sm flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span className="text-xs">Thinking...</span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-3 flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
              rows={1}
              className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 max-h-32"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2.5 rounded-lg transition shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </Mainlayout>
  );
}
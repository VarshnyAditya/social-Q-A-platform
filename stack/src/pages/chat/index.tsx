import Mainlayout from "@/layout/Mainlayout";
import { useAuth } from "@/lib/AuthContext";
import { useLanguage } from "@/lib/LanguageContext";
import axiosInstance from "@/lib/axiosinstance";
import { formatPresence } from "@/lib/utils";
import { ArrowLeft, Film, Image as ImageIcon, Paperclip, Send, User, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

const MAX_MEDIA_BYTES = 30 * 1024 * 1024; // 30MB, matches the server-side cap

interface ConversationEntry {
  friendId: string;
  name: string;
  online: boolean;
  lastActiveAt: string | null;
  lastMessage: {
    text: string;
    mediaType: string;
    createdAt: string;
    fromMe: boolean;
  } | null;
  unreadCount: number;
}

interface Message {
  _id: string;
  from: string;
  to: string;
  text: string;
  mediaUrl: string;
  mediaType: string;
  createdAt: string;
}

export default function ChatPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [list, setList] = useState<ConversationEntry[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [activeFriend, setActiveFriend] = useState<ConversationEntry | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [text, setText] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState("");
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const activeFriendIdRef = useRef<string | null>(null);
  const autoOpenedRef = useRef(false);

  const fetchList = async () => {
    try {
      const res = await axiosInstance.get("/chat/list");
      setList(res.data.data);
    } catch {
      // silent — polling shouldn't spam toasts
    } finally {
      setLoadingList(false);
    }
  };

  const fetchConversation = async (friendId: string, silent = false) => {
    if (!silent) setLoadingMessages(true);
    try {
      const res = await axiosInstance.get(`/chat/conversation/${friendId}`);
      setMessages(res.data.data);
    } catch (error: any) {
      if (!silent) {
        toast.error(error.response?.data?.message || "Could not load conversation");
      }
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchList();
    const interval = setInterval(() => {
      fetchList();
      if (activeFriendIdRef.current) {
        fetchConversation(activeFriendIdRef.current, true);
      }
    }, 4000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    activeFriendIdRef.current = activeFriend?.friendId || null;
    if (activeFriend) fetchConversation(activeFriend.friendId);
  }, [activeFriend]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const openConversation = (entry: ConversationEntry) => {
    setActiveFriend(entry);
    // Optimistically clear the unread badge for a snappier feel.
    setList((prev) =>
      prev.map((c) => (c.friendId === entry.friendId ? { ...c, unreadCount: 0 } : c))
    );
  };

  // Lets other pages (e.g. a friend's profile "Chat" button) deep-link
  // straight into a conversation via /chat?with=<friendId>.
  useEffect(() => {
    if (autoOpenedRef.current || loadingList) return;
    const withId = router.query.with;
    if (typeof withId !== "string") return;
    const entry = list.find((c) => c.friendId === withId);
    if (entry) {
      autoOpenedRef.current = true;
      openConversation(entry);
    }
  }, [router.query.with, list, loadingList]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      toast.error("Only images and videos can be sent in chat");
      return;
    }
    if (file.size > MAX_MEDIA_BYTES) {
      toast.error("File is too large — max size is 30MB");
      return;
    }
    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
  };

  const clearMedia = () => {
    setMediaFile(null);
    setMediaPreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSend = async () => {
    if (!activeFriend) return;
    if (!text.trim() && !mediaFile) return;

    setSending(true);
    try {
      const formData = new FormData();
      if (text.trim()) formData.append("text", text.trim());
      if (mediaFile) formData.append("media", mediaFile);

      const res = await axiosInstance.post(
        `/chat/send/${activeFriend.friendId}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setMessages((prev) => [...prev, res.data.data]);
      setText("");
      clearMedia();
      fetchList();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Could not send message");
    } finally {
      setSending(false);
    }
  };

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // The header should reflect live online/last-seen status, not just the
  // snapshot taken when the conversation was opened — `list` already
  // refreshes every 4s via polling, so re-derive from it on each render.
  const activeEntry = activeFriend
    ? list.find((c) => c.friendId === activeFriend.friendId) || activeFriend
    : null;

  if (!user) {
    return (
      <Mainlayout>
        <div className="max-w-md mx-auto text-center py-16">
          <p className="text-gray-600">Log in to chat with your friends.</p>
        </div>
      </Mainlayout>
    );
  }

  return (
    <Mainlayout>
      <div className="max-w-5xl mx-auto h-[calc(100vh-53px-3rem)] flex border rounded-lg overflow-hidden bg-white">
        {/* Friend list */}
        <div
          className={`w-full sm:w-72 border-r flex-shrink-0 flex-col ${
            activeFriend ? "hidden sm:flex" : "flex"
          }`}
        >
          <div className="px-4 py-3 border-b">
            <h2 className="font-semibold text-gray-900">{t("nav.chat")}</h2>
            <p className="text-xs text-gray-500 mt-0.5">{t("pages.chatSubtitle")}</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loadingList ? (
              <p className="text-sm text-gray-500 p-4">{t("common.loading")}</p>
            ) : list.length === 0 ? (
              <p className="text-sm text-gray-500 p-4">
                Add some friends from the Social tab to start chatting.
              </p>
            ) : (
              list.map((entry) => (
                <button
                  key={entry.friendId}
                  onClick={() => openConversation(entry)}
                  className={`w-full text-left px-4 py-3 border-b hover:bg-gray-50 transition flex items-center justify-between gap-2 ${
                    activeFriend?.friendId === entry.friendId ? "bg-orange-50" : ""
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate flex items-center gap-1.5">
                      <span
                        className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${
                          entry.online ? "bg-green-500" : "bg-gray-300"
                        }`}
                        aria-label={entry.online ? "Online" : "Offline"}
                        title={formatPresence(entry.online, entry.lastActiveAt)}
                      />
                      {entry.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">                      {entry.lastMessage
                        ? entry.lastMessage.mediaType !== "none" && !entry.lastMessage.text
                          ? entry.lastMessage.fromMe
                            ? `You: sent a ${entry.lastMessage.mediaType}`
                            : `sent a ${entry.lastMessage.mediaType}`
                          : `${entry.lastMessage.fromMe ? "You: " : ""}${entry.lastMessage.text}`
                        : "Say hi 👋"}
                    </p>
                  </div>
                  {entry.unreadCount > 0 && (
                    <span className="flex-shrink-0 bg-orange-500 text-white text-xs font-semibold rounded-full h-5 min-w-5 px-1.5 flex items-center justify-center">
                      {entry.unreadCount}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Conversation */}
        <div className={`flex-1 flex-col min-w-0 ${activeFriend ? "flex" : "hidden sm:flex"}`}>
          {!activeFriend ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              Select a friend to start chatting
            </div>
          ) : (
            <>
              <div className="px-4 py-3 border-b flex items-center gap-2">
                <button
                  className="sm:hidden p-1 -ml-1 rounded hover:bg-gray-100"
                  onClick={() => setActiveFriend(null)}
                  aria-label="Back to friend list"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate flex items-center gap-1.5">
                    <span
                      className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${
                        activeEntry?.online ? "bg-green-500" : "bg-gray-300"
                      }`}
                      aria-hidden="true"
                    />
                    {activeFriend.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatPresence(!!activeEntry?.online, activeEntry?.lastActiveAt)}
                  </p>
                </div>
                <Link
                  href={`/users/${activeFriend.friendId}`}
                  className="flex-shrink-0 flex items-center gap-1 text-xs font-medium text-orange-600 border border-orange-300 hover:bg-orange-50 px-3 py-1.5 rounded-full transition"
                >
                  <User className="w-3.5 h-3.5" /> Profile
                </Link>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {loadingMessages ? (
                  <p className="text-sm text-gray-500">{t("common.loading")}</p>
                ) : messages.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center mt-8">
                    No messages yet — say hi!
                  </p>
                ) : (
                  messages.map((m) => {
                    const mine = m.from === user._id;
                    return (
                      <div key={m._id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                            mine
                              ? "bg-orange-500 text-white rounded-br-sm"
                              : "bg-white border text-gray-800 rounded-bl-sm"
                          }`}
                        >
                          {m.mediaType === "image" && m.mediaUrl && (
                            <img
                              src={m.mediaUrl}
                              alt="attachment"
                              className="rounded-lg mb-1 max-h-64 object-cover"
                            />
                          )}
                          {m.mediaType === "video" && m.mediaUrl && (
                            <video src={m.mediaUrl} controls className="rounded-lg mb-1 max-h-64" />
                          )}
                          {m.text && <p className="whitespace-pre-wrap break-words">{m.text}</p>}
                          <p
                            className={`text-[10px] mt-1 ${
                              mine ? "text-orange-100" : "text-gray-400"
                            }`}
                          >
                            {formatTime(m.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>

              <div className="border-t p-3">
                {mediaPreview && (
                  <div className="mb-2 relative inline-block">
                    {mediaFile?.type.startsWith("video/") ? (
                      <video src={mediaPreview} className="h-20 rounded-lg" />
                    ) : (
                      <img src={mediaPreview} alt="preview" className="h-20 rounded-lg" />
                    )}
                    <button
                      onClick={clearMedia}
                      className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full p-0.5"
                      aria-label="Remove attachment"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 rounded hover:bg-gray-100 text-gray-600 flex-shrink-0"
                    aria-label="Attach image or video"
                    title="Attach an image or video (max 30MB)"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Type a message..."
                    className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                  <button
                    onClick={handleSend}
                    disabled={sending || (!text.trim() && !mediaFile)}
                    className="p-2 rounded-full bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-40 flex-shrink-0"
                    aria-label="Send message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" /> / <Film className="w-3 h-3" /> up to 30MB
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </Mainlayout>
  );
}
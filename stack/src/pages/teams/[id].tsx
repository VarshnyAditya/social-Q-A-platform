import Mainlayout from "@/layout/Mainlayout";
import { useAuth } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import { ArrowLeft, Paperclip, Send, Users2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

const MAX_MEDIA_BYTES = 30 * 1024 * 1024; // 30MB

interface TeamDetail {
  _id: string;
  name: string;
  description: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  members: { _id: string; name: string }[];
}

interface GroupMessage {
  _id: string;
  teamId: string;
  from: string;
  fromName: string;
  text: string;
  mediaUrl: string;
  mediaType: string;
  createdAt: string;
}

export default function TeamDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();

  const [team, setTeam] = useState<TeamDetail | null>(null);
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [text, setText] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState("");
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const isMember = !!(team && user && team.members.some((m) => m._id === user._id));

  const fetchTeam = async () => {
    if (!id) return;
    try {
      const res = await axiosInstance.get(`/team/get/${id}`);
      setTeam(res.data.data);
    } catch {
      toast.error("Team not found");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (silent = false) => {
    if (!id) return;
    try {
      const res = await axiosInstance.get(`/team/${id}/messages`);
      setMessages(res.data.data);
    } catch (error: any) {
      if (!silent) toast.error(error.response?.data?.message || "Could not load chat");
    }
  };

  useEffect(() => {
    fetchTeam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!isMember) return;
    fetchMessages();
    const interval = setInterval(() => fetchMessages(true), 4000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMember, id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleJoin = async () => {
    if (!user) {
      toast.info("Log in to join a team");
      return;
    }
    if (!team) return;
    setJoining(true);
    try {
      await axiosInstance.post(`/team/join/${team._id}`);
      toast.success("You've joined the team");
      fetchTeam();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Could not join team");
    } finally {
      setJoining(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      toast.error("Only images and videos can be sent");
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
    if (!team || (!text.trim() && !mediaFile)) return;
    setSending(true);
    try {
      const formData = new FormData();
      if (text.trim()) formData.append("text", text.trim());
      if (mediaFile) formData.append("media", mediaFile);

      const res = await axiosInstance.post(`/team/${team._id}/send`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessages((prev) => [...prev, res.data.data]);
      setText("");
      clearMedia();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Could not send message");
    } finally {
      setSending(false);
    }
  };

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  if (loading) {
    return (
      <Mainlayout>
        <p className="text-sm text-gray-500 max-w-3xl mx-auto">Loading...</p>
      </Mainlayout>
    );
  }

  if (!team) {
    return (
      <Mainlayout>
        <div className="max-w-3xl mx-auto text-center py-16">
          <p className="text-gray-500 mb-3">This team doesn't exist.</p>
          <Link href="/teams" className="text-orange-600 text-sm font-medium">
            Back to Teams
          </Link>
        </div>
      </Mainlayout>
    );
  }

  return (
    <Mainlayout>
      <div className="max-w-3xl mx-auto h-[calc(100vh-53px-3rem)] flex flex-col border rounded-lg overflow-hidden bg-white">
        {/* Header */}
        <div className="px-4 py-3 border-b flex items-center gap-3">
          <Link href="/teams" className="p-1 -ml-1 rounded hover:bg-gray-100" aria-label="Back to Teams">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-gray-900 truncate">{team.name}</p>
            <p className="text-xs text-gray-400 truncate">
              {team.members.length} {team.members.length === 1 ? "member" : "members"} · Created by{" "}
              {team.createdByName}
            </p>
          </div>
          <button
            onClick={() => setShowMembers((s) => !s)}
            className="flex items-center gap-1 text-xs font-medium text-gray-600 border rounded-full px-3 py-1.5 hover:bg-gray-50 flex-shrink-0"
          >
            <Users2 className="w-3.5 h-3.5" /> Members
          </button>
          {!isMember && (
            <button
              onClick={handleJoin}
              disabled={joining}
              className="flex-shrink-0 bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium px-3 py-1.5 rounded-full transition disabled:opacity-50"
            >
              {joining ? "Joining..." : "Join"}
            </button>
          )}
        </div>

        {/* Members panel — collapsible, WhatsApp "group info" style rather than a big always-on roster */}
        {showMembers && (
          <div className="border-b bg-gray-50 px-4 py-3 max-h-40 overflow-y-auto">
            {team.description && <p className="text-xs text-gray-500 mb-2">{team.description}</p>}
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {team.members.map((m) => (
                <Link
                  key={m._id}
                  href={`/users/${m._id}`}
                  className="text-xs text-gray-700 hover:text-orange-600 hover:underline"
                >
                  {m.name}
                  {m._id === team.createdBy && <span className="text-gray-400"> (creator)</span>}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Thread — fully gated: non-members can't see any messages */}
        {!isMember ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <p className="text-gray-500 text-sm mb-3">Please Join Team to access the chat</p>
            <button
              onClick={handleJoin}
              disabled={joining}
              className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-5 py-2 rounded-full transition disabled:opacity-50"
            >
              {joining ? "Joining..." : "Join"}
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {messages.length === 0 ? (
                <p className="text-sm text-gray-400 text-center mt-8">
                  No messages yet — be the first to say something.
                </p>
              ) : (
                messages.map((m) => {
                  const mine = m.from === user?._id;
                  return (
                    <div key={m._id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                          mine
                            ? "bg-orange-500 text-white rounded-br-sm"
                            : "bg-white border text-gray-800 rounded-bl-sm"
                        }`}
                      >
                        {/* Sender name shown per message, like a WhatsApp group thread */}
                        {!mine && (
                          <p className="text-[11px] font-semibold text-orange-600 mb-0.5">
                            {m.fromName}
                          </p>
                        )}
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
                        <p className={`text-[10px] mt-1 ${mine ? "text-orange-100" : "text-gray-400"}`}>
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
                  placeholder="Message the group..."
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
            </div>
          </>
        )}
      </div>
    </Mainlayout>
  );
}
import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, ChevronDown, MessageCircle, UserPlus, UserCheck, FileText, Heart, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import axiosInstance from "@/lib/axiosinstance";
import { useAuth } from "@/lib/AuthContext";

interface NotificationItem {
  _id: string;
  type:
    | "friend_request"
    | "friend_accept"
    | "article_comment"
    | "chat_message"
    | "answer"
    | "post_like"
    | "post_comment";
  message: string;
  link: string;
  read: boolean;
  createdAt: string;
}

const ICONS: Record<NotificationItem["type"], any> = {
  friend_request: UserPlus,
  friend_accept: UserCheck,
  article_comment: FileText,
  chat_message: MessageCircle,
  answer: MessageSquare,
  post_like: Heart,
  post_comment: MessageSquare,
};

// Small, dependency-free "x minutes/hours/days ago" formatter.
const timeAgo = (dateString: string) => {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString();
};

const POLL_INTERVAL_MS = 15000;

export default function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const fetchUnreadCount = async () => {
    try {
      const res = await axiosInstance.get("/notification/unread-count");
      setUnreadCount(res.data.count || 0);
    } catch {
      // silent — the badge just won't update this cycle
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await axiosInstance.get("/notification");
      setNotifications(res.data.data || []);
    } catch {
      console.log("Could not fetch notifications");
    } finally {
      setLoaded(true);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [user]);

  const handleToggle = () => {
    const next = !open;
    setOpen(next);
    if (next && !loaded) fetchNotifications();
    if (next) fetchNotifications(); // refresh on every open, list is small
  };

  const handleItemClick = async (item: NotificationItem) => {
    if (!item.read) {
      setNotifications((prev) =>
        prev.map((n) => (n._id === item._id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      try {
        await axiosInstance.patch(`/notification/read/${item._id}`);
      } catch {
        console.log("Could not mark notification as read");
      }
    }
    setOpen(false);
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    try {
      await axiosInstance.patch("/notification/read-all");
    } catch {
      console.log("Could not mark all as read");
    }
  };

  if (!user) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={handleToggle}
        className="w-full flex items-center justify-between p-3 lg:p-4"
      >
        <h3 className="font-semibold text-gray-800 text-sm lg:text-base flex items-center gap-1.5">
          <span className="relative">
            <Bell className="w-4 h-4 text-orange-500" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[9px] leading-none rounded-full min-w-[14px] h-[14px] flex items-center justify-center px-[3px]">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </span>
          Notifications
        </h3>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="border-t border-gray-100">
          {notifications.length > 0 && unreadCount > 0 && (
            <div className="flex justify-end px-3 pt-2">
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-orange-600 hover:text-orange-700 font-medium"
              >
                Mark all as read
              </button>
            </div>
          )}
          <div className="max-h-72 overflow-y-auto">
            {!loaded ? (
              <p className="text-xs text-gray-400 text-center py-4">Loading...</p>
            ) : notifications.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">
                You&apos;re all caught up.
              </p>
            ) : (
              notifications.map((item) => {
                const Icon = ICONS[item.type] || Bell;
                return (
                  <Link
                    key={item._id}
                    href={item.link || "#"}
                    onClick={() => handleItemClick(item)}
                    className={`flex items-start gap-2 px-3 py-2.5 text-xs lg:text-sm hover:bg-gray-50 transition border-b border-gray-50 last:border-b-0 ${
                      item.read ? "bg-white" : "bg-orange-50/60"
                    }`}
                  >
                    <Icon className="w-4 h-4 mt-0.5 text-orange-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className={`text-gray-700 ${!item.read ? "font-medium" : ""}`}>
                        {item.message}
                      </p>
                      <p className="text-[10px] lg:text-xs text-gray-400 mt-0.5">
                        {timeAgo(item.createdAt)}
                      </p>
                    </div>
                    {!item.read && (
                      <span className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                    )}
                  </Link>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
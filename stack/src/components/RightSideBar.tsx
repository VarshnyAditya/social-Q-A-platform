import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, Coins, Eye, HelpCircle, TrendingUp, Users2 } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useLanguage } from "@/lib/LanguageContext";
import { cn } from "@/lib/utils";
import axiosInstance from "@/lib/axiosinstance";
import NotificationBell from "@/components/NotificationBell";

interface TrendingTag {
  name: string;
  count: number;
}

const RightSideBar = ({ isopen, isMobile }: any) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const tags: string[] = user?.tags || [];

  const [points, setPoints] = useState<number | null>(null);
  const [trendingTags, setTrendingTags] = useState<TrendingTag[]>([]);

  // Real points balance for the logged-in user (same /points/mystats the profile page uses).
  useEffect(() => {
    if (!user) return;
    axiosInstance
      .get("/points/mystats")
      .then((res) => setPoints(res.data.totalPoints ?? 0))
      .catch(() => {});
  }, [user]);

  // Trending tags computed from live question data — same counting logic as /tags.
  useEffect(() => {
    axiosInstance
      .get("/question/getallquestion")
      .then((res) => {
        const questions = res.data.data || [];
        const tagMap: Record<string, number> = {};
        questions.forEach((q: any) => {
          q.questiontags?.forEach((tag: string) => {
            const clean = tag.trim().toLowerCase();
            if (clean) tagMap[clean] = (tagMap[clean] || 0) + 1;
          });
        });
        const list = Object.entries(tagMap)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 6);
        setTrendingTags(list);
      })
      .catch(() => {});
  }, []);

  return (
    <aside
      className={cn(
        "bg-gray-50 border-l border-gray-200 transition-all duration-300 ease-in-out overflow-hidden",
        isMobile
          ? cn(
              "fixed top-[53px] right-0 h-[calc(100vh-53px)] w-72 z-40",
              isopen ? "translate-x-0" : "translate-x-full"
            )
          : cn(
              "h-full",
              isopen ? "w-72 lg:w-80 opacity-100" : "w-0 opacity-0 pointer-events-none border-l-0"
            )
      )}
    >
      <div className="p-4 lg:p-6 w-72 lg:w-80 h-full overflow-y-auto">
        <div className="space-y-4 lg:space-y-6">
          {/* Notifications — friend requests, article/post comments, chat messages, etc. */}
          {user && <NotificationBell />}

          {/* Your CodeQuest — real points balance instead of a static blog box */}
          <div className="bg-white border border-gray-200 rounded-lg p-3 lg:p-4">
            <h3 className="font-semibold text-gray-800 mb-3 text-sm lg:text-base flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-orange-500" /> Your CodeQuest
            </h3>
            {user ? (
              <>
                <div className="text-2xl font-bold text-gray-900">{points ?? "..."}</div>
                <p className="text-xs text-gray-500 mb-3">points earned</p>
                <Link href={`/users/${user._id}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-orange-600 border-orange-300 hover:bg-orange-50 bg-transparent text-xs lg:text-sm"
                  >
                    View Profile
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <p className="text-xs lg:text-sm text-gray-500 mb-3">
                  Log in to track your points and progress.
                </p>
                <Link href="/auth">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-orange-600 border-orange-300 hover:bg-orange-50 bg-transparent text-xs lg:text-sm"
                  >
                    {t("nav.login")}
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Trending Tags — live community activity instead of static announcements */}
          <div className="bg-white border border-gray-200 rounded-lg p-3 lg:p-4">
            <h3 className="font-semibold text-gray-800 mb-3 text-sm lg:text-base flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-orange-500" /> Trending Tags
            </h3>
            {trendingTags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {trendingTags.map((tag) => (
                  <Link key={tag.name} href={`/questions?tag=${encodeURIComponent(tag.name)}`}>
                    <Badge
                      variant="secondary"
                      className="text-xs bg-orange-100 text-orange-800 hover:bg-orange-200 cursor-pointer"
                    >
                      {tag.name}
                      <span className="text-orange-500 ml-1">×{tag.count}</span>
                    </Badge>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400">No questions yet.</p>
            )}
          </div>

          {/* Quick Actions — direct entry points into the app's actual features */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3 text-sm lg:text-base">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                href="/ask"
                className="flex items-center gap-2 text-xs lg:text-sm text-gray-700 hover:text-orange-600 border border-gray-200 hover:border-orange-300 rounded-md px-3 py-2 transition"
              >
                <HelpCircle className="w-4 h-4" /> Ask a Question
              </Link>
              <Link
                href="/teams/create"
                className="flex items-center gap-2 text-xs lg:text-sm text-gray-700 hover:text-orange-600 border border-gray-200 hover:border-orange-300 rounded-md px-3 py-2 transition"
              >
                <Users2 className="w-4 h-4" /> Create a Team
              </Link>
              <Link
                href="/ai-assist"
                className="flex items-center gap-2 text-xs lg:text-sm text-gray-700 hover:text-orange-600 border border-gray-200 hover:border-orange-300 rounded-md px-3 py-2 transition"
              >
                <Bot className="w-4 h-4" /> Ask AI
              </Link>
            </div>
          </div>

          {/* Watched Tags — unchanged behavior/data, restyled to match the rest of the sidebar */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3 text-sm lg:text-base">
              {t("sidebar.watchedTags")}
            </h3>
            {tags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <Link key={tag} href={`/questions?tag=${encodeURIComponent(tag)}`}>
                    <Badge
                      variant="secondary"
                      className="text-xs bg-orange-100 text-orange-800 hover:bg-orange-200 cursor-pointer"
                    >
                      {tag}
                    </Badge>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-6 lg:py-8">
                <div className="text-center">
                  <Eye className="w-10 h-10 lg:w-12 lg:h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs lg:text-sm text-gray-500 mb-3">
                    {user ? t("sidebar.addTagsPrompt") : t("sidebar.loginTagsPrompt")}
                  </p>
                  <Link href={user ? `/users/${user._id}` : "/auth"}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-orange-600 border-orange-300 hover:bg-orange-50 bg-transparent text-xs lg:text-sm"
                    >
                      {user ? t("sidebar.addTagBtn") : t("nav.login")}
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default RightSideBar;
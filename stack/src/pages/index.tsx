import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Mainlayout from "@/layout/Mainlayout";
import { useAuth } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import { Flame, MessageSquare, Sparkles, ThumbsUp, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const getAnswerNetVotes = (q: any) =>
  (q.answer || []).reduce(
    (sum: number, a: any) => sum + (a.upvote?.length || 0) - (a.downvote?.length || 0),
    0
  );

const getEngagementScore = (q: any) => {
  const qNet = (q.upvote?.length || 0) - (q.downvote?.length || 0);
  const aNet = getAnswerNetVotes(q);
  return qNet + aNet + (q.answer?.length || 0) * 2;
};

const QuestionRow = ({ question, badge }: { question: any; badge?: string }) => (
  <div className="border-b border-gray-200 py-3 last:border-b-0">
    <div className="flex items-start gap-3">
      <div className="flex flex-col items-center text-xs text-gray-600 w-12 shrink-0">
        <div className="font-medium">
          {(question.upvote?.length || 0) -
            (question.downvote?.length || 0) +
            getAnswerNetVotes(question)}
        </div>
        <div>votes</div>
        <div
          className={`mt-1 font-medium ${
            question.answer?.length > 0 ? "text-green-600" : ""
          }`}
        >
          {question.answer?.length || 0}
        </div>
        <div>ans</div>
      </div>
      <div className="min-w-0 flex-1">
        {badge && (
          <Badge variant="secondary" className="mb-1 text-xs bg-orange-100 text-orange-700">
            {badge}
          </Badge>
        )}
        <Link
          href={`/questions/${question._id}`}
          className="block text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          {question.questiontitle}
        </Link>
        <div className="flex flex-wrap gap-1 mt-1.5">
          {(question.questiontags || []).slice(0, 4).map((tag: string) => (
            <Link key={tag} href={`/questions?tag=${encodeURIComponent(tag)}`}>
              <Badge
                variant="secondary"
                className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer"
              >
                {tag}
              </Badge>
            </Link>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default function HomePage() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [userCount, setUserCount] = useState(0);
  const [myPoints, setMyPoints] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [qRes, pRes, uRes] = await Promise.all([
          axiosInstance.get("/question/getallquestion"),
          axiosInstance.get("/social/posts"),
          axiosInstance.get("/user/getalluser"),
        ]);
        setQuestions(qRes.data.data || []);
        setPosts(pRes.data.data || []);
        setUserCount((uRes.data.data || []).length);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  useEffect(() => {
    const fetchMyPoints = async () => {
      if (!user?._id) return;
      try {
        const res = await axiosInstance.get(`/points/user/${user._id}`);
        setMyPoints(res.data.totalPoints ?? 0);
      } catch (error) {
        console.log(error);
      }
    };
    fetchMyPoints();
  }, [user?._id]);

  if (loading) {
    return (
      <Mainlayout>
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </Mainlayout>
    );
  }

  const totalAnswers = questions.reduce((sum, q) => sum + (q.answer?.length || 0), 0);

  const interestingPosts = (() => {
    const userTags = (user?.tags || []).map((t: string) => t.toLowerCase());
    return [...questions]
      .map((q) => ({
        q,
        tagMatches: userTags.length
          ? (q.questiontags || []).filter((t: string) => userTags.includes(t.toLowerCase()))
              .length
          : 0,
        engagement: getEngagementScore(q),
      }))
      .sort((a, b) => b.tagMatches - a.tagMatches || b.engagement - a.engagement)
      .slice(0, 6)
      .map((s) => s.q);
  })();

  const trendingPosts = (() => {
    const now = Date.now();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    let recent = questions.filter((q) => now - new Date(q.askedon).getTime() <= sevenDays);
    if (recent.length < 3) recent = questions;
    return [...recent].sort((a, b) => getEngagementScore(b) - getEngagementScore(a)).slice(0, 5);
  })();

  const recentPosts = [...posts]
    .sort((a, b) => new Date(b.postedon).getTime() - new Date(a.postedon).getTime())
    .slice(0, 3);

  return (
    <Mainlayout>
      <main className="min-w-0 p-4 lg:p-6 space-y-8">
        {/* Hero */}
        <div className="rounded-xl bg-gradient-to-r from-orange-500 to-orange-400 text-white p-6">
          {user ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl lg:text-2xl font-bold">Welcome back, {user.name}</h1>
                <p className="text-sm opacity-90 mt-1">
                  {myPoints !== null ? `${myPoints} reward points` : "Loading your points..."}
                  {" · "}
                  Here's what's happening in the community today.
                </p>
              </div>
              <Link href="/ask">
                <Button className="bg-white text-orange-600 hover:bg-gray-100 whitespace-nowrap">
                  Ask a Question
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl lg:text-2xl font-bold">Welcome to CodeQuest</h1>
                <p className="text-sm opacity-90 mt-1">
                  Join the community to ask questions, share answers, and earn reputation.
                </p>
              </div>
              <Link href="/signup">
                <Button className="bg-white text-orange-600 hover:bg-gray-100 whitespace-nowrap">
                  Join the Community
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Community stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-xl font-bold text-gray-800">{questions.length}</div>
            <div className="text-xs text-gray-500">Questions</div>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-xl font-bold text-gray-800">{totalAnswers}</div>
            <div className="text-xs text-gray-500">Answers</div>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-xl font-bold text-gray-800">{userCount}</div>
            <div className="text-xs text-gray-500">Members</div>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-xl font-bold text-gray-800">{posts.length}</div>
            <div className="text-xs text-gray-500">Community Posts</div>
          </div>
        </div>

        {/* Interesting posts for you */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-semibold text-gray-800">Interesting posts for you</h2>
          </div>
          <p className="text-xs text-gray-500 mb-2">
            {user?.tags?.length
              ? `Matched to your tags: ${user.tags.slice(0, 5).join(", ")}`
              : "Add tags to your profile to personalize this list — showing top community activity for now."}
          </p>
          <div className="border border-gray-200 rounded-lg px-4">
            {interestingPosts.length === 0 ? (
              <p className="text-sm text-gray-500 py-6 text-center">No questions yet.</p>
            ) : (
              interestingPosts.map((q) => <QuestionRow key={q._id} question={q} />)
            )}
          </div>
        </section>

        {/* Trending this week */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-semibold text-gray-800">Trending this week</h2>
          </div>
          <div className="border border-gray-200 rounded-lg px-4">
            {trendingPosts.length === 0 ? (
              <p className="text-sm text-gray-500 py-6 text-center">Nothing trending yet.</p>
            ) : (
              trendingPosts.map((q) => <QuestionRow key={q._id} question={q} badge="🔥 Hot" />)
            )}
          </div>
        </section>

        {/* From the community (social feed preview) */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-semibold text-gray-800">From the community</h2>
            </div>
            <Link href="/social" className="text-sm text-blue-600 hover:underline">
              View all activity →
            </Link>
          </div>
          {recentPosts.length === 0 ? (
            <p className="text-sm text-gray-500 py-6 text-center border border-gray-200 rounded-lg">
              No community posts yet.
            </p>
          ) : (
            <div className="grid sm:grid-cols-3 gap-3">
              {recentPosts.map((post: any) => (
                <div key={post._id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-xs">
                        {post.username?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-gray-800">{post.username}</span>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-3">{post.content}</p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" />
                      {post.likes?.length || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {post.comments?.length || 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </Mainlayout>
  );
}

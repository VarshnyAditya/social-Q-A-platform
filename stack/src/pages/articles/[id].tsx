import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Mainlayout from "@/layout/Mainlayout";
import axiosInstance from "@/lib/axiosinstance";
import { useAuth } from "@/lib/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, Eye, MessageSquare, Share2, Trash } from "lucide-react";
import { toast } from "react-toastify";

export default function ArticleDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();

  const [article, setArticle]           = useState<any>(null);
  const [related, setRelated]           = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);
  const [comment, setComment]           = useState("");
  const [submitting, setSubmitting]     = useState(false);
  const [mounted, setMounted]           = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!id || !mounted) return;
    const fetch = async () => {
      try {
        const res = await axiosInstance.get(`/article/get/${id}`);
        setArticle(res.data.data);

        // Fetch related articles (same tags, exclude current)
        const allRes = await axiosInstance.get("/article/getall");
        const all = allRes.data.data;
        const current = res.data.data;
        const rel = all
          .filter(
            (a: any) =>
              a._id !== current._id &&
              a.tags?.some((t: string) => current.tags?.includes(t))
          )
          .slice(0, 3);
        setRelated(rel);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, mounted]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this article?")) return;
    try {
      await axiosInstance.delete(`/article/delete/${article._id}`);
      toast.success("Article deleted");
      router.push("/articles");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete");
    }
  };

  const handleAddComment = async () => {
    if (!user) {
      toast.info("Please login to comment");
      router.push("/auth");
      return;
    }
    if (!comment.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }
    setSubmitting(true);
    try {
      const res = await axiosInstance.post(`/article/comment/${article._id}`, {
        body: comment.trim(),
        username: user.name,
      });
      setArticle(res.data.data);
      setComment("");
      toast.success("Comment added");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      const res = await axiosInstance.delete(`/article/comment/${article._id}`, {
        data: { commentId },
      });
      setArticle(res.data.data);
      toast.success("Comment deleted");
    } catch (error: any) {
      toast.error("Failed to delete comment");
    }
  };

  const renderContent = (text: string) =>
    text
      .replace(/## (.*)/g, '<h2 class="text-xl font-bold mt-8 mb-3 text-gray-900">$1</h2>')
      .replace(/### (.*)/g, '<h3 class="text-lg font-semibold mt-6 mb-2 text-gray-900">$1</h3>')
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-gray-100 p-4 rounded-lg overflow-x-auto my-4 text-sm"><code>$2</code></pre>')
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1.5 py-0.5 rounded text-sm text-red-600">$1</code>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '</p><p class="mb-4 leading-relaxed">')
      .replace(/^/, '<p class="mb-4 leading-relaxed">')
      .replace(/$/, "</p>");

  if (!mounted || loading) {
    return (
      <Mainlayout>
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 m-6" />
      </Mainlayout>
    );
  }

  if (!article) {
    return (
      <Mainlayout>
        <div className="p-6 text-gray-500">Article not found.</div>
      </Mainlayout>
    );
  }

  return (
    <Mainlayout>
      <Head>
        <title>{article.title} — StackClone</title>
      </Head>
      <div className="p-4 lg:p-6 max-w-4xl">

        {/* Cover image */}
        {article.coverImage ? (
          <div className="rounded-xl overflow-hidden mb-6 h-64 sm:h-80">
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).parentElement!.style.display = "none";
              }}
            />
          </div>
        ) : (
          <div className="rounded-xl h-40 bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-center mb-6">
            <span className="text-white text-6xl font-bold opacity-20">
              {article.title[0]?.toUpperCase()}
            </span>
          </div>
        )}

        {/* Tags */}
        {article.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {article.tags.map((tag: string) => (
              <Link key={tag} href={`/tags/${encodeURIComponent(tag.toLowerCase())}`}>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer text-xs">
                  {tag}
                </Badge>
              </Link>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
          {article.title}
        </h1>

        {/* Meta row */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b">
          <div className="flex items-center gap-3">
            <Avatar className="w-9 h-9">
              <AvatarFallback className="bg-blue-100 text-blue-800 font-bold">
                {article.authorName?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-gray-900">{article.authorName}</p>
              <p className="text-xs text-gray-400">
                {new Date(article.createdAt).toLocaleDateString("en-IN", {
                  year: "numeric", month: "long", day: "numeric",
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" /> {article.readTime} min read
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" /> {article.views} views
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" /> {article.comments?.length || 0} comments
            </span>
            <button
              onClick={handleShare}
              className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
            >
              <Share2 className="w-4 h-4" /> Share
            </button>
            {user?._id === article.authorId && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-1 text-red-500 hover:text-red-700"
              >
                <Trash className="w-4 h-4" /> Delete
              </button>
            )}
          </div>
        </div>

        {/* Article content */}
        <div className="prose max-w-none mb-10">
          <div
            className="text-gray-800 text-base leading-relaxed"
            dangerouslySetInnerHTML={{ __html: renderContent(article.content) }}
          />
        </div>

        {/* Comments Section */}
        <div className="border-t pt-8 mb-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            {article.comments?.length || 0} Comment{article.comments?.length !== 1 ? "s" : ""}
          </h2>

          {/* Add comment */}
          <div className="mb-6">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={user ? "Write a comment..." : "Log in to leave a comment"}
              disabled={!user}
              rows={3}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none disabled:bg-gray-50 disabled:text-gray-400"
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={handleAddComment}
                disabled={submitting || !user || !comment.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2 rounded text-sm font-medium"
              >
                {submitting ? "Posting..." : "Post Comment"}
              </button>
            </div>
          </div>

          {/* Comments list */}
          {article.comments?.length === 0 ? (
            <p className="text-gray-400 text-sm">No comments yet. Be the first to comment!</p>
          ) : (
            <div className="space-y-4">
              {article.comments.map((c: any) => (
                <div key={c._id} className="flex gap-3 p-4 bg-gray-50 rounded-lg">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className="bg-blue-100 text-blue-800 text-xs font-bold">
                      {c.username?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{c.username}</span>
                        <span className="text-xs text-gray-400">
                          {new Date(c.createdAt).toLocaleDateString("en-IN")}
                        </span>
                      </div>
                      {(user?._id === c.userid || user?._id === article.authorId) && (
                        <button
                          onClick={() => handleDeleteComment(c._id)}
                          className="text-red-400 hover:text-red-600"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-gray-700">{c.body}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Related articles */}
        {related.length > 0 && (
          <div className="border-t pt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Related Articles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map((a: any) => (
                <Link key={a._id} href={`/articles/${a._id}`}>
                  <div className="border rounded-lg p-4 hover:shadow-md transition cursor-pointer bg-white h-full flex flex-col">
                    {a.coverImage ? (
                      <div className="h-24 rounded overflow-hidden mb-3">
                        <img src={a.coverImage} alt={a.title} className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }} />
                      </div>
                    ) : (
                      <div className="h-16 rounded bg-gradient-to-r from-blue-400 to-blue-600 mb-3 flex items-center justify-center">
                        <span className="text-white font-bold text-xl opacity-30">{a.title[0]}</span>
                      </div>
                    )}
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2 flex-1">{a.title}</h3>
                    <div className="flex items-center justify-between text-xs text-gray-400 mt-auto">
                      <span>{a.authorName}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {a.readTime} min
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </Mainlayout>
  );
}

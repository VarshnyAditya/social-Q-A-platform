import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Mainlayout from "@/layout/Mainlayout";
import axiosInstance from "@/lib/axiosinstance";
import { useAuth } from "@/lib/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Clock, Eye, MessageSquare, Plus } from "lucide-react";

export default function ArticlesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [articles, setArticles]  = useState<any[]>([]);
  const [filtered, setFiltered]  = useState<any[]>([]);
  const [search, setSearch]      = useState("");
  const [loading, setLoading]    = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axiosInstance.get("/article/getall");
        setArticles(res.data.data);
        setFiltered(res.data.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toLowerCase();
    setSearch(val);
    if (!val) {
      setFiltered(articles);
    } else {
      setFiltered(
        articles.filter(
          (a) =>
            a.title.toLowerCase().includes(val) ||
            a.summary.toLowerCase().includes(val) ||
            a.authorName.toLowerCase().includes(val) ||
            a.tags?.some((t: string) => t.toLowerCase().includes(val))
        )
      );
    }
  };

  if (loading) {
    return (
      <Mainlayout>
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 m-6" />
      </Mainlayout>
    );
  }

  return (
    <Mainlayout>
      <Head>
        <title>Articles — StackClone</title>
      </Head>
      <div className="p-4 lg:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-xl lg:text-2xl font-semibold">Articles</h1>
            <p className="text-sm text-gray-500 mt-1">
              In-depth technical articles written by the community.
            </p>
          </div>
          {user && (
            <button
              onClick={() => router.push("/articles/create")}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium whitespace-nowrap"
            >
              <Plus className="w-4 h-4" /> Write Article
            </button>
          )}
        </div>

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={handleSearch}
          placeholder="Search articles by title, author or tag..."
          className="border rounded px-3 py-2 text-sm w-full max-w-md mb-6 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg mb-2">No articles yet.</p>
            {user ? (
              <button
                onClick={() => router.push("/articles/create")}
                className="mt-2 bg-blue-600 text-white px-4 py-2 rounded text-sm"
              >
                Write the first article
              </button>
            ) : (
              <p className="text-gray-400 text-sm">Log in to write the first article.</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filtered.map((article) => (
              <Link key={article._id} href={`/articles/${article._id}`}>
                <div className="border rounded-xl bg-white hover:shadow-md transition cursor-pointer h-full flex flex-col overflow-hidden">
                  {/* Cover image */}
                  {article.coverImage ? (
                    <div className="h-48 overflow-hidden">
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
                    <div className="h-32 bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                      <span className="text-white text-4xl font-bold opacity-30">
                        {article.title[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}

                  <div className="p-5 flex flex-col flex-1">
                    {/* Tags */}
                    {article.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {article.tags.slice(0, 3).map((tag: string) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs bg-blue-100 text-blue-800"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Title */}
                    <h2 className="font-semibold text-gray-900 text-base mb-2 line-clamp-2">
                      {article.title}
                    </h2>

                    {/* Summary */}
                    <p className="text-sm text-gray-600 line-clamp-3 flex-1 mb-4">
                      {article.summary}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t">
                      <div className="flex items-center gap-1">
                        <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
                          {article.authorName?.[0]?.toUpperCase()}
                        </div>
                        <span>{article.authorName}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {article.readTime} min read
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {article.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {article.comments?.length || 0}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(article.createdAt).toLocaleDateString("en-IN", {
                        year: "numeric", month: "long", day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Mainlayout>
  );
}

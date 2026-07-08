import { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Mainlayout from "@/layout/Mainlayout";
import axiosInstance from "@/lib/axiosinstance";
import { useAuth } from "@/lib/AuthContext";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { toast } from "react-toastify";

export default function CreateArticlePage() {
  const router = useRouter();
  const { user } = useAuth();

  const [title, setTitle]           = useState("");
  const [summary, setSummary]       = useState("");
  const [content, setContent]       = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [tags, setTags]             = useState<string[]>([]);
  const [tagInput, setTagInput]     = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!user) {
    return (
      <Mainlayout>
        <div className="p-6 text-gray-500">Please log in to write an article.</div>
      </Mainlayout>
    );
  }

  const handleAddTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (!t) return;
    if (tags.length >= 5) { toast.error("Maximum 5 tags"); return; }
    if (tags.includes(t)) { toast.error("Tag already added"); return; }
    setTags([...tags, t]);
    setTagInput("");
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("user object:", user);
    if (!title.trim()) { toast.error("Title is required"); return; }
    if (!summary.trim()) { toast.error("Summary is required"); return; }
    if (!content.trim() || content.trim().length < 50) {
      toast.error("Content must be at least 50 characters");
      return;
    }

    setSubmitting(true);
    try {
      const res = await axiosInstance.post("/article/create", {
        title: title.trim(),
        summary: summary.trim(),
        content: content.trim(),
        coverImage: coverImage.trim(),
        tags,
        authorName: user.name,
      });
      toast.success("Article published!");
      router.push(`/articles/${res.data.data._id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to publish");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Mainlayout>
      <Head>
        <title>Write Article — StackClone</title>
      </Head>
      <div className="p-4 lg:p-6 max-w-3xl">
        <h1 className="text-xl lg:text-2xl font-semibold mb-6">Write an Article</h1>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. How to build a REST API with Node.js"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Summary */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Summary *</label>
            <p className="text-xs text-gray-400 mb-1">A short description shown on the articles list (1-2 sentences).</p>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Brief summary of what this article covers..."
              rows={2}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />
          </div>

          {/* Cover Image URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL (optional)</label>
            <input
              type="text"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {coverImage && (
              <div className="mt-2 h-32 rounded overflow-hidden border">
                <img
                  src={coverImage}
                  alt="preview"
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }}
                />
              </div>
            )}
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
            <p className="text-xs text-gray-400 mb-1">
              Supports Markdown: ## Heading, **bold**, *italic*, `code`, ```code block```
            </p>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your article content here..."
              rows={16}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none font-mono"
            />
            <p className="text-xs text-gray-400 mt-1">
              ~{Math.max(1, Math.ceil(content.trim().split(/\s+/).length / 200))} min read
            </p>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (max 5)</label>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="bg-blue-100 text-blue-800 flex items-center gap-1">
                    {tag}
                    <button type="button" onClick={() => setTags(tags.filter((t) => t !== tag))}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            {tags.length < 5 && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddTag(); }}}
                  placeholder="e.g. javascript"
                  className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg text-sm"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg text-sm font-medium"
            >
              {submitting ? "Publishing..." : "Publish Article"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="border px-6 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Mainlayout>
  );
}

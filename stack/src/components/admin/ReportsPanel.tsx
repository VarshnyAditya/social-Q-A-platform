import axiosInstance from "@/lib/axiosinstance";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Check, ExternalLink, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface Report {
  _id: string;
  targetType: "question" | "answer" | "post" | "comment" | "team" | "teammessage";
  targetId: string;
  parentId: string;
  reason: string;
  reportedBy: string;
  reportedByName: string;
  status: "pending" | "resolved" | "dismissed";
  createdAt: string;
}

const STATUS_TABS: { key: "pending" | "resolved" | "dismissed"; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "resolved", label: "Resolved" },
  { key: "dismissed", label: "Dismissed" },
];

const TARGET_LABELS: Record<Report["targetType"], string> = {
  question: "Question",
  answer: "Answer",
  post: "Social Post",
  comment: "Comment",
  team: "Team",
  teammessage: "Team Message",
};

// Best-effort link to the actual content, so an admin can see it in context
// before deciding to remove it.
const contentLink = (r: Report): string | null => {
  switch (r.targetType) {
    case "question":
      return `/questions/${r.targetId}`;
    case "answer":
      return `/questions/${r.parentId}`;
    case "post":
    case "comment":
      return `/social`;
    case "team":
      return `/teams/${r.targetId}`;
    case "teammessage":
      return r.parentId ? `/teams/${r.parentId}` : `/teams`;
    default:
      return null;
  }
};

export default function ReportsPanel() {
  const [tab, setTab] = useState<"pending" | "resolved" | "dismissed">("pending");
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/admin/reports?status=${tab}`);
      setReports(res.data.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Could not load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const setStatus = async (id: string, status: "resolved" | "dismissed") => {
    setActingId(id);
    try {
      await axiosInstance.patch(`/admin/reports/${id}/status`, { status });
      setReports((prev) => prev.filter((r) => r._id !== id));
      toast.success(status === "resolved" ? "Marked resolved" : "Dismissed");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Could not update report");
    } finally {
      setActingId(null);
    }
  };

  const deleteContent = async (r: Report) => {
    if (!confirm(`Permanently delete this ${TARGET_LABELS[r.targetType].toLowerCase()}?`)) return;
    setActingId(r._id);
    try {
      switch (r.targetType) {
        case "question":
          await axiosInstance.delete(`/admin/question/${r.targetId}`);
          break;
        case "answer":
          await axiosInstance.delete(`/admin/answer/${r.parentId}/${r.targetId}`);
          break;
        case "post":
          await axiosInstance.delete(`/admin/post/${r.targetId}`);
          break;
        case "comment":
          await axiosInstance.delete(`/admin/comment/${r.parentId}/${r.targetId}`);
          break;
        case "team":
          await axiosInstance.delete(`/admin/team/${r.targetId}`);
          break;
        case "teammessage":
          await axiosInstance.delete(`/admin/teammessage/${r.targetId}`);
          break;
      }
      // Deleting the content resolves the report — nothing left to review.
      await axiosInstance.patch(`/admin/reports/${r._id}/status`, { status: "resolved" });
      setReports((prev) => prev.filter((rep) => rep._id !== r._id));
      toast.success("Content removed");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Could not delete content");
    } finally {
      setActingId(null);
    }
  };

  return (
    <div>
      <div className="flex gap-2 mb-6 border-b">
        {STATUS_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-2 text-sm font-medium border-b-2 transition ${
              tab === t.key
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : reports.length === 0 ? (
        <div className="text-center py-16 border rounded-lg">
          <AlertTriangle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">No {tab} reports.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => {
            const link = contentLink(r);
            return (
              <div key={r._id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                      {TARGET_LABELS[r.targetType]}
                    </Badge>
                    <span className="text-xs text-gray-400">
                      {new Date(r.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {link && (
                    <Link
                      href={link}
                      target="_blank"
                      className="flex items-center gap-1 text-xs text-orange-600 hover:underline flex-shrink-0"
                    >
                      View <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>

                <p className="text-sm text-gray-800 mb-1">{r.reason}</p>
                <p className="text-xs text-gray-400 mb-3">Reported by {r.reportedByName}</p>

                {r.status === "pending" && (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={actingId === r._id}
                      onClick={() => setStatus(r._id, "dismissed")}
                      className="text-gray-600"
                    >
                      <X className="w-3.5 h-3.5 mr-1" /> Dismiss
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={actingId === r._id}
                      onClick={() => setStatus(r._id, "resolved")}
                      className="text-green-700 border-green-300 hover:bg-green-50"
                    >
                      <Check className="w-3.5 h-3.5 mr-1" /> Mark Resolved
                    </Button>
                    <Button
                      size="sm"
                      disabled={actingId === r._id}
                      onClick={() => deleteContent(r)}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete Content
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
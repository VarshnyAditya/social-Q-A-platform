import axiosInstance from "@/lib/axiosinstance";
import { Badge } from "@/components/ui/badge";
import { History } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface AuditEntry {
  _id: string;
  adminName: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  createdAt: string;
}

// "delete_question" -> "Delete Question"
const formatAction = (action: string) =>
  action
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

export default function AuditLogPanel() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance
      .get("/admin/auditlog")
      .then((res) => setLogs(res.data.data))
      .catch((error: any) => toast.error(error.response?.data?.message || "Could not load audit log"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-gray-500">Loading...</p>;
  if (logs.length === 0)
    return (
      <div className="text-center py-16 border rounded-lg">
        <History className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p className="text-gray-500 text-sm">No moderation actions yet.</p>
      </div>
    );

  return (
    <div className="space-y-2">
      {logs.map((log) => (
        <div key={log._id} className="border rounded-lg p-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Badge variant="secondary" className="bg-gray-100 text-gray-700 text-[10px]">
                {formatAction(log.action)}
              </Badge>
              <span className="text-xs text-gray-400">{log.targetType}</span>
            </div>
            <p className="text-sm text-gray-800">
              <span className="font-medium">{log.adminName}</span>
              {log.details && <span className="text-gray-500"> — {log.details}</span>}
            </p>
          </div>
          <span className="text-xs text-gray-400 flex-shrink-0">
            {new Date(log.createdAt).toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}
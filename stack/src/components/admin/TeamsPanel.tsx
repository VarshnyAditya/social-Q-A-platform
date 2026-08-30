import axiosInstance from "@/lib/axiosinstance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp, Pencil, Trash2, UserMinus, Users2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface TeamSummary {
  _id: string;
  name: string;
  description: string;
  createdBy: string;
  createdByName: string;
  memberCount: number;
  createdAt: string;
}

interface TeamDetail {
  _id: string;
  name: string;
  createdBy: string;
  members: { _id: string; name: string }[];
}

export default function TeamsPanel() {
  const [teams, setTeams] = useState<TeamSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<TeamDetail | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [actingId, setActingId] = useState<string | null>(null);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/team/getall");
      setTeams(res.data.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Could not load teams");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const toggleExpand = async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      setDetail(null);
      return;
    }
    setExpandedId(id);
    try {
      const res = await axiosInstance.get(`/team/get/${id}`);
      setDetail(res.data.data);
    } catch {
      toast.error("Could not load team members");
    }
  };

  const startRename = (t: TeamSummary) => {
    setEditingId(t._id);
    setEditName(t.name);
  };

  const submitRename = async (id: string) => {
    if (!editName.trim()) return;
    setActingId(id);
    try {
      await axiosInstance.patch(`/admin/team/${id}/rename`, { name: editName.trim() });
      setTeams((prev) => prev.map((t) => (t._id === id ? { ...t, name: editName.trim() } : t)));
      toast.success("Team renamed");
      setEditingId(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Could not rename team");
    } finally {
      setActingId(null);
    }
  };

  const deleteTeam = async (t: TeamSummary) => {
    if (!confirm(`Permanently delete "${t.name}" and its chat history?`)) return;
    setActingId(t._id);
    try {
      await axiosInstance.delete(`/admin/team/${t._id}`);
      setTeams((prev) => prev.filter((team) => team._id !== t._id));
      toast.success("Team deleted");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Could not delete team");
    } finally {
      setActingId(null);
    }
  };

  const removeMember = async (teamId: string, userId: string) => {
    if (!confirm("Remove this member from the team?")) return;
    setActingId(userId);
    try {
      await axiosInstance.delete(`/admin/team/${teamId}/member/${userId}`);
      setDetail((prev) =>
        prev ? { ...prev, members: prev.members.filter((m) => m._id !== userId) } : prev
      );
      setTeams((prev) =>
        prev.map((t) => (t._id === teamId ? { ...t, memberCount: t.memberCount - 1 } : t))
      );
      toast.success("Member removed");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Could not remove member");
    } finally {
      setActingId(null);
    }
  };

  if (loading) return <p className="text-sm text-gray-500">Loading...</p>;
  if (teams.length === 0) return <p className="text-sm text-gray-400 text-center py-16">No teams yet.</p>;

  return (
    <div className="space-y-2">
      {teams.map((t) => (
        <div key={t._id} className="border rounded-lg p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              {editingId === t._id ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="h-8 text-sm"
                    maxLength={80}
                  />
                  <Button size="sm" disabled={actingId === t._id} onClick={() => submitRename(t._id)}>
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <>
                  <p className="text-sm font-medium text-gray-900 truncate">{t.name}</p>
                  <p className="text-xs text-gray-400">
                    {t.memberCount} {t.memberCount === 1 ? "member" : "members"} · by{" "}
                    {t.createdByName}
                  </p>
                </>
              )}
            </div>

            {editingId !== t._id && (
              <div className="flex gap-2 flex-shrink-0">
                <Button size="sm" variant="outline" onClick={() => toggleExpand(t._id)}>
                  <Users2 className="w-3.5 h-3.5 mr-1" />
                  {expandedId === t._id ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </Button>
                <Button size="sm" variant="outline" onClick={() => startRename(t)}>
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button
                  size="sm"
                  disabled={actingId === t._id}
                  onClick={() => deleteTeam(t)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          </div>

          {expandedId === t._id && detail && (
            <div className="mt-3 pt-3 border-t space-y-1.5">
              {detail.members.map((m) => (
                <div key={m._id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">
                    {m.name}
                    {m._id === detail.createdBy && (
                      <span className="text-gray-400 text-xs ml-1">(creator)</span>
                    )}
                  </span>
                  {m._id !== detail.createdBy && (
                    <button
                      onClick={() => removeMember(t._id, m._id)}
                      disabled={actingId === m._id}
                      className="text-gray-400 hover:text-red-600"
                      aria-label={`Remove ${m.name}`}
                    >
                      <UserMinus className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
import Mainlayout from "@/layout/Mainlayout";
import { useAuth } from "@/lib/AuthContext";
import { useLanguage } from "@/lib/LanguageContext";
import axiosInstance from "@/lib/axiosinstance";
import { Plus, Users2 } from "lucide-react";
import Link from "next/link";
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

export default function TeamsPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [teams, setTeams] = useState<TeamSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [myTeamIds, setMyTeamIds] = useState<Set<string>>(new Set());

  const fetchTeams = async () => {
    try {
      const res = await axiosInstance.get("/team/getall");
      setTeams(res.data.data);
    } catch {
      toast.error("Failed to load teams");
    } finally {
      setLoading(false);
    }
  };

  const fetchMyTeams = async () => {
    if (!user) {
      setMyTeamIds(new Set());
      return;
    }
    try {
      const res = await axiosInstance.get("/team/mine");
      setMyTeamIds(new Set(res.data.data || []));
    } catch {
      console.log("Could not fetch your teams");
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    fetchMyTeams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleJoin = async (id: string) => {
    if (!user) {
      toast.info("Log in to join a team");
      return;
    }
    setJoiningId(id);
    try {
      await axiosInstance.post(`/team/join/${id}`);
      toast.success("You've joined the team");
      setMyTeamIds((prev) => new Set(prev).add(id));
      fetchTeams();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Could not join team");
    } finally {
      setJoiningId(null);
    }
  };

  return (
    <Mainlayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-semibold text-gray-900">Join Teams to Collaborate</h1>
          <Link
            href="/teams/create"
            className="inline-flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-3 py-2 rounded-md transition"
          >
            <Plus className="w-4 h-4" /> Create Team
          </Link>
        </div>
        <p className="text-sm text-gray-500 mb-6">{t("pages.teamsSubtitle")}</p>

        {loading ? (
          <p className="text-sm text-gray-500">{t("common.loading")}</p>
        ) : teams.length === 0 ? (
          <div className="text-center py-16 border rounded-lg">
            <Users2 className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm mb-3">No teams yet — be the first to start one.</p>
            <Link
              href="/teams/create"
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-md transition"
            >
              Create Team
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {teams.map((team) => (
              <div
                key={team._id}
                className="border rounded-lg p-4 flex items-start justify-between gap-4"
              >
                <div className="min-w-0">
                  <Link
                    href={`/teams/${team._id}`}
                    className="font-medium text-gray-900 hover:text-orange-600 hover:underline"
                  >
                    {team.name}
                  </Link>
                  {team.description && (
                    <p className="text-sm text-gray-600 mt-0.5">{team.description}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1.5">
                    Created by {team.createdByName} · {team.memberCount}{" "}
                    {team.memberCount === 1 ? "member" : "members"}
                  </p>
                </div>
                {user && team.createdBy === user._id ? (
                  <span className="flex-shrink-0 text-sm font-medium text-gray-500 bg-gray-100 px-4 py-1.5 rounded-full select-none">
                    Admin
                  </span>
                ) : user && myTeamIds.has(team._id) ? (
                  <Link
                    href={`/teams/${team._id}`}
                    className="flex-shrink-0 text-sm font-medium text-green-700 bg-green-50 px-4 py-1.5 rounded-full select-none hover:bg-green-100 transition"
                  >
                    Joined
                  </Link>
                ) : (
                  <button
                    onClick={() => handleJoin(team._id)}
                    disabled={joiningId === team._id}
                    className="flex-shrink-0 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 px-4 py-1.5 rounded-full transition disabled:opacity-50"
                  >
                    Join
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Mainlayout>
  );
}
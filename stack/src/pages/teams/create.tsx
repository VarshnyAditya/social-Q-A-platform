import Mainlayout from "@/layout/Mainlayout";
import Seo from "@/components/Seo";
import { useAuth } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const MIN_POINTS_TO_CREATE_TEAM = 15;

export default function CreateTeamPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [points, setPoints] = useState<number | null>(null);
  const [pointsLoading, setPointsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setPointsLoading(false);
      return;
    }
    axiosInstance
      .get("/points/mystats")
      .then((res) => setPoints(res.data.totalPoints ?? 0))
      .catch(() => setPoints(0))
      .finally(() => setPointsLoading(false));
  }, [user]);

  const eligible = (points ?? 0) >= MIN_POINTS_TO_CREATE_TEAM;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.info("Log in to create a team");
      return;
    }
    if (!name.trim()) {
      toast.error("Give your team a name");
      return;
    }

    setSubmitting(true);
    try {
      await axiosInstance.post("/team/create", { name, description });
      toast.success("Team created!");
      router.push("/teams");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Could not create team");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Mainlayout>
      <Seo title="Create a Team — CodeQuest" path="/teams/create" noindex />
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Create a Team</h1>
        <p className="text-sm text-gray-500 mb-6">
          Start a space other CodeQuest members can discover and join.
        </p>

        {/* Points gate — creating a team requires 15+ reward points */}
        {user && !pointsLoading && !eligible && (
          <div className="mb-6 border border-amber-200 bg-amber-50 rounded-lg p-4">
            <p className="text-sm text-amber-800 font-medium">
              You need at least {MIN_POINTS_TO_CREATE_TEAM} points to create a team.
            </p>
            <p className="text-xs text-amber-700 mt-1">
              You currently have {points ?? 0} {points === 1 ? "point" : "points"}. Answer
              questions to earn more.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Team name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. React Performance Enthusiasts"
              maxLength={80}
              disabled={!eligible}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Description <span className="text-gray-400">(optional)</span>
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this team about?"
              rows={4}
              maxLength={500}
              disabled={!eligible}
            />
          </div>
          <Button
            type="submit"
            disabled={submitting || pointsLoading || !eligible}
            className="bg-orange-500 hover:bg-orange-600"
          >
            {submitting ? "Creating..." : "Create Team"}
          </Button>
        </form>
      </div>
    </Mainlayout>
  );
}
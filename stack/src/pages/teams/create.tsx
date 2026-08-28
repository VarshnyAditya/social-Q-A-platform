import Mainlayout from "@/layout/Mainlayout";
import { useAuth } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "react-toastify";

export default function CreateTeamPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Create a Team</h1>
        <p className="text-sm text-gray-500 mb-6">
          Start a space other CodeQuest members can discover and join.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Team name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. React Performance Enthusiasts"
              maxLength={80}
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
            />
          </div>
          <Button type="submit" disabled={submitting} className="bg-orange-500 hover:bg-orange-600">
            {submitting ? "Creating..." : "Create Team"}
          </Button>
        </form>
      </div>
    </Mainlayout>
  );
}
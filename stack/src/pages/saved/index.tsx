import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { Bookmark, X } from "lucide-react";
import Mainlayout from "@/layout/Mainlayout";
import axiosInstance from "@/lib/axiosinstance";
import { useAuth } from "@/lib/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-toastify";

type SavedQuestion = {
  _id: string;
  questiontitle: string;
  questionbody: string;
  questiontags: string[];
  userposted: string;
  userid: string;
  askedon: string;
  noofanswer: number;
  savedOn: string;
};

export default function SavedPage() {
  const { user } = useAuth();
  const [saved, setSaved] = useState<SavedQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const fetchSaved = async () => {
    try {
      const res = await axiosInstance.get("/saved/mine");
      setSaved(res.data.data || []);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load saved questions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchSaved();
    else setLoading(false);
  }, [user]);

  const handleRemove = async (questionId: string) => {
    setRemovingId(questionId);
    try {
      const res = await axiosInstance.post(`/saved/toggle/${questionId}`);
      if (res.data.saved === false) {
        setSaved((prev) => prev.filter((q) => q._id !== questionId));
        toast.success("Removed from saved");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to remove");
    } finally {
      setRemovingId(null);
    }
  };

  if (!user) {
    return (
      <Mainlayout>
        <div className="p-6 text-gray-500">Please log in to view your saved questions.</div>
      </Mainlayout>
    );
  }

  if (loading) {
    return (
      <Mainlayout>
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500" />
      </Mainlayout>
    );
  }

  return (
    <Mainlayout>
      <Head>
        <title>Saved Questions</title>
      </Head>
      <div className="p-4 lg:p-6 max-w-4xl">
        <div className="flex items-center gap-2 mb-6">
          <Bookmark className="w-5 h-5 text-yellow-500" fill="currentColor" />
          <h1 className="text-xl lg:text-2xl font-semibold">Saved Questions</h1>
        </div>

        {saved.length === 0 ? (
          <div className="text-center text-gray-500 py-12 border rounded-xl bg-white">
            <Bookmark className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p>You haven&apos;t saved any questions yet.</p>
            <Link href="/questions" className="text-blue-600 hover:underline text-sm">
              Browse questions
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {saved.map((question) => (
              <div
                key={question._id}
                className="bg-white border rounded-xl p-4 lg:p-5 shadow-sm flex flex-col sm:flex-row gap-4"
              >
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/questions/${question._id}`}
                    className="text-blue-600 hover:text-blue-800 text-base lg:text-lg font-medium mb-2 block"
                  >
                    {question.questiontitle}
                  </Link>
                  <p className="text-gray-700 text-sm mb-3 line-clamp-2">
                    {question.questionbody}
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-1">
                      {(question.questiontags || []).map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs bg-blue-100 text-blue-800"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center text-xs text-gray-600 flex-shrink-0 gap-3">
                      <span
                        className={`font-medium ${
                          question.noofanswer > 0
                            ? "text-green-600 bg-green-100 px-2 py-0.5 rounded"
                            : ""
                        }`}
                      >
                        {question.noofanswer} {question.noofanswer === 1 ? "answer" : "answers"}
                      </span>
                      <Link
                        href={`/users/${question.userid}`}
                        className="flex items-center"
                      >
                        <Avatar className="w-4 h-4 mr-1">
                          <AvatarFallback className="text-xs">
                            {question.userposted?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-blue-600 hover:text-blue-800 mr-1">
                          {question.userposted}
                        </span>
                      </Link>
                      <span>asked {new Date(question.askedon).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex sm:flex-col justify-end sm:justify-start">
                  <button
                    onClick={() => handleRemove(question._id)}
                    disabled={removingId === question._id}
                    className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800 disabled:opacity-50 whitespace-nowrap"
                  >
                    <X className="w-4 h-4" />
                    {removingId === question._id ? "Removing..." : "Remove from Saved"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Mainlayout>
  );
}

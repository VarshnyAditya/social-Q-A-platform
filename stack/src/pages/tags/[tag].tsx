import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Mainlayout from "@/layout/Mainlayout";
import axiosInstance from "@/lib/axiosinstance";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/AuthContext";
import SaveButton from "@/components/SaveButton";

export default function TagDetailPage() {
  const router = useRouter();
  const { tag } = router.query;
  const tagName = Array.isArray(tag) ? tag[0] : tag;
  const { user } = useAuth();

  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [savedIds, setSavedIds]   = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      setSavedIds([]);
      return;
    }
    const fetchSavedIds = async () => {
      try {
        const res = await axiosInstance.get("/saved/ids");
        setSavedIds(res.data.data || []);
      } catch (error) {
        console.log(error);
      }
    };
    fetchSavedIds();
  }, [user]);

  useEffect(() => {
    if (!tagName) return;
    const fetchQuestions = async () => {
      try {
        const res = await axiosInstance.get("/question/getallquestion");
        const all = res.data.data;
        const matched = all.filter((q: any) =>
          q.questiontags?.some(
            (t: string) => t.trim().toLowerCase() === tagName.toLowerCase()
          )
        );
        setQuestions(matched);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [tagName]);

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
        <title>Questions tagged [{tagName}] — StackClone</title>
      </Head>
      <div className="p-4 lg:p-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded">
                {tagName}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {questions.length} {questions.length === 1 ? "question" : "questions"} tagged with this tag
            </p>
          </div>
          <Link
            href="/ask"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium whitespace-nowrap"
          >
            Ask Question
          </Link>
        </div>

        {/* Questions list */}
        {questions.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-lg mb-2">No questions found for this tag.</p>
            <p className="text-sm">Be the first to ask a question tagged with <strong>{tagName}</strong>!</p>
            <Link href="/ask" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded text-sm">
              Ask a Question
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((q: any) => (
              <div key={q._id} className="border-b border-gray-200 pb-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Stats */}
                  <div className="flex sm:flex-col items-center text-sm text-gray-600 sm:w-16 lg:w-20 gap-4 sm:gap-2">
                    <div className="text-center">
                      <div className="font-medium">
                        {(q.upvote?.length || 0) - (q.downvote?.length || 0)}
                      </div>
                      <div className="text-xs">votes</div>
                    </div>
                    <div className="text-center">
                      <div className={`font-medium px-2 py-1 rounded ${
                        q.answer?.length > 0
                          ? "text-green-700 bg-green-100"
                          : "text-gray-600"
                      }`}>
                        {q.answer?.length || 0}
                      </div>
                      <div className="text-xs">
                        {q.answer?.length === 1 ? "answer" : "answers"}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Link
                        href={`/questions/${q._id}`}
                        className="text-blue-600 hover:text-blue-800 text-base font-medium block"
                      >
                        {q.questiontitle}
                      </Link>
                      <SaveButton
                        questionId={q._id}
                        initialSaved={savedIds.includes(q._id)}
                        onToggled={(saved) =>
                          setSavedIds((prev) =>
                            saved ? [...prev, q._id] : prev.filter((id) => id !== q._id)
                          )
                        }
                        className="flex-shrink-0"
                      />
                    </div>
                    <p className="text-gray-700 text-sm mb-3 line-clamp-2">
                      {q.questionbody}
                    </p>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div className="flex flex-wrap gap-1">
                        {q.questiontags.map((t: string) => (
                          <Link key={t} href={`/tags/${encodeURIComponent(t.toLowerCase())}`}>
                            <Badge
                              variant="secondary"
                              className={`text-xs cursor-pointer ${
                                t.toLowerCase() === tagName?.toLowerCase()
                                  ? "bg-blue-200 text-blue-900"
                                  : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                              }`}
                            >
                              {t}
                            </Badge>
                          </Link>
                        ))}
                      </div>
                      <div className="flex items-center text-xs text-gray-600 flex-shrink-0">
                        <Link href={`/users/${q.userid}`} className="flex items-center">
                          <Avatar className="w-4 h-4 mr-1">
                            <AvatarFallback className="text-xs">
                              {q.userposted?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-blue-600 hover:text-blue-800 mr-1">
                            {q.userposted}
                          </span>
                        </Link>
                        <span>asked {new Date(q.askedon).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Mainlayout>
  );
}

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Mainlayout from "@/layout/Mainlayout";
import axiosInstance from "@/lib/axiosinstance";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function QuestionsPage() {
  const [question, setquestion] = useState<any>(null);
  const [loading, setloading] = useState(true);
  const [activeTab, setActiveTab] = useState<"newest" | "active" | "unanswered">("newest");
  const router = useRouter();
  const activeTag = typeof router.query.tag === "string" ? router.query.tag : null;
  useEffect(() => {
    const fetchquestion = async () => {
      try {
        const res = await axiosInstance.get("/question/getallquestion");
        setquestion(res.data.data);
      } catch (error) {
        console.log(error);
      } finally {
        setloading(false);
      }
    };
    fetchquestion();
  }, []);
  if (loading) {
    return (
      <Mainlayout>
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </Mainlayout>
    );
  }
  if (!question || question.length === 0) {
    return (
      <Mainlayout>
        <div className="text-center text-gray-500 mt-4">No question found.</div>
      </Mainlayout>
    );
  }

  // ---- Tab filtering/sorting (Newest / Active / Unanswered) ----
  const getLastActivity = (q: any) => {
    const answerDates = (q.answer || []).map((a: any) => new Date(a.answeredon).getTime());
    return Math.max(new Date(q.askedon).getTime(), ...answerDates, 0);
  };

  const getDisplayedQuestions = () => {
    let list = [...question];
    if (activeTag) {
      list = list.filter((q: any) =>
        (q.questiontags || []).some(
          (t: string) => t.toLowerCase() === activeTag.toLowerCase()
        )
      );
    }
    if (activeTab === "unanswered") {
      return list
        .filter((q: any) => (q.answer?.length || 0) === 0)
        .sort((a: any, b: any) => new Date(b.askedon).getTime() - new Date(a.askedon).getTime());
    }
    if (activeTab === "active") {
      return list.sort((a: any, b: any) => getLastActivity(b) - getLastActivity(a));
    }
    // newest (default)
    return list.sort(
      (a: any, b: any) => new Date(b.askedon).getTime() - new Date(a.askedon).getTime()
    );
  };

  const displayedQuestions = getDisplayedQuestions();

  const tabButtonClass = (tab: string) =>
    `px-2 sm:px-3 py-1 rounded text-xs sm:text-sm ${
      activeTab === tab
        ? "bg-gray-200 text-gray-700 font-medium"
        : "text-gray-600 hover:bg-gray-100"
    }`;

  return (
    <Mainlayout>
      <main className="min-w-0 p-4 lg:p-6 ">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-xl lg:text-2xl font-semibold">
            {activeTag ? `Questions tagged [${activeTag}]` : "Top Questions"}
          </h1>
          <button
            onClick={() => router.push("/ask")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium whitespace-nowrap"
          >
            Ask Question
          </button>
        </div>
        {activeTag && (
          <div className="mb-4 flex items-center gap-2 text-sm">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {activeTag}
            </Badge>
            <button
              onClick={() => router.push("/questions")}
              className="text-blue-600 hover:underline"
            >
              Clear filter
            </button>
          </div>
        )}
        <div className="w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4 text-sm gap-2 sm:gap-4">
            <span className="text-gray-600">{displayedQuestions.length} questions</span>
            <div className="flex flex-wrap gap-1 sm:gap-2">
              <button
                onClick={() => setActiveTab("newest")}
                className={tabButtonClass("newest")}
              >
                Newest
              </button>
              <button
                onClick={() => setActiveTab("active")}
                className={tabButtonClass("active")}
              >
                Active
              </button>
              <button
                onClick={() => setActiveTab("unanswered")}
                className={tabButtonClass("unanswered")}
              >
                Unanswered
              </button>
            </div>
          </div>
          <div className="space-y-4">
            {displayedQuestions.length === 0 ? (
              <div className="text-center text-gray-500 py-8 text-sm">
                No questions match this filter.
              </div>
            ) : (
              displayedQuestions.map((question: any) => (
              <div key={question._id} className="border-b border-gray-200 pb-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex sm:flex-col items-center sm:items-center text-sm text-gray-600 sm:w-16 lg:w-20 gap-4 sm:gap-2">
                    <div className="text-center">
                      <div className="font-medium">
                        {question.answer.reduce(
                          (sum: number, ans: any) =>
                            sum + ((ans.upvote?.length || 0) - (ans.downvote?.length || 0)),
                          0
                        )}
                      </div>
                      <div className="text-xs">votes</div>
                    </div>
                    <div className="text-center">
                      <div
                        className={`font-medium ${
                          question.answer.length > 0
                            ? "text-green-600 bg-green-100 px-2 py-1 rounded"
                            : ""
                        }`}
                      >
                        {question.answer.length}
                      </div>
                      <div className="text-xs">
                        {question.answer.length === 1
                          ? "answer"
                          : "answers"}
                      </div>
                    </div>
                  </div>
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

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div className="flex flex-wrap gap-1">
                        {question.questiontags.map((tag: any) => (
                          <Link key={tag} href={`/questions?tag=${encodeURIComponent(tag)}`}>
                            <Badge
                              variant="secondary"
                              className="text-xs bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer"
                            >
                              {tag}
                            </Badge>
                          </Link>
                        ))}
                      </div>

                      <div className="flex items-center text-xs text-gray-600 flex-shrink-0">
                        <Link
                          href={`/users/${question.userid}`}
                          className="flex items-center"
                        >
                          <Avatar className="w-4 h-4 mr-1">
                            <AvatarFallback className="text-xs">
                              {question.userposted[0]}
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
                </div>
              </div>
            ))
            )}
          </div>
        </div>
      </main>
    </Mainlayout>
  );
}

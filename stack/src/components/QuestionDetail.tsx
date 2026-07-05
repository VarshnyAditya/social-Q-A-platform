import {
  Bookmark,
  ChevronDown,
  ChevronUp,
  Clock,
  Flag,
  History,
  Share,
  Trash,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import axiosInstance from "@/lib/axiosinstance";
import { useAuth } from "@/lib/AuthContext";

const QuestionDetail = ({ questionId }: any) => {
  const router = useRouter();
  const [question, setquestion] = useState<any>(null);
  const [newanswer, setnewAnswer] = useState("");
  const [isSubmitting, setisSubmitting] = useState(false);
  const [loading, setloading] = useState(true);
  const [filter, setFilter] = useState<"newest" | "active" | "unanswered">("newest");
  const { user } = useAuth();

  useEffect(() => {
    const fetchquestion = async () => {
      try {
        const res = await axiosInstance.get("/question/getallquestion");
        const matched = res.data.data.find((u: any) => u._id === questionId);
        setquestion(matched);
      } catch (error) {
        console.log(error);
      } finally {
        setloading(false);
      }
    };
    fetchquestion();
  }, [questionId]);

  if (loading) {
    return (
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500" />
    );
  }
  if (!question) {
    return <div className="text-center text-gray-500 mt-4">No question found.</div>;
  }

  const getFilteredAnswers = () => {
    const answers = [...(question.answer || [])];
    if (filter === "newest") {
      return answers.sort(
        (a, b) => new Date(b.answeredon).getTime() - new Date(a.answeredon).getTime()
      );
    }
    if (filter === "active") {
      return answers.sort(
        (a, b) => (b.upvote?.length || 0) - (a.upvote?.length || 0)
      );
    }
    if (filter === "unanswered") {
      return answers.filter((a) => !a.upvote || a.upvote.length === 0);
    }
    return answers;
  };

  const handleQuestionVote = async (vote: string) => {
    if (!user) {
      toast.info("Please login to continue");
      router.push("/auth");
      return;
    }
    try {
      const res = await axiosInstance.patch(`/question/vote/${question._id}`, {
        value: vote,
        userid: user?._id,
      });
      if (res.data.data) {
        setquestion(res.data.data);
        toast.success("Vote Updated");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to vote");
    }
  };

  const handleAnswerVote = async (answerid: string, vote: string) => {
    if (!user) {
      toast.info("Please login to continue");
      router.push("/auth");
      return;
    }
    try {
      const res = await axiosInstance.patch(`/answer/vote/${question._id}`, {
        answerid,
        userid: user._id,
        value: vote,
      });
      if (res.data.data) {
        setquestion(res.data.data);
        toast.success("Vote Updated");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to vote on answer");
    }
  };

  const handlebookmark = () => {
    setquestion((prev: any) => ({ ...prev, isBookmarked: !prev.isBookmarked }));
  };

  const handleSubmitanswer = async () => {
    if (!user) {
      toast.info("Please login to continue");
      router.push("/auth");
      return;
    }
    if (!newanswer.trim()) return;
    setisSubmitting(true);
    try {
      const res = await axiosInstance.post(`/answer/postanswer/${question?._id}`, {
        answerbody: newanswer,
        useranswered: user.name,
        userid: user._id,
      });
      if (res.data.data) {
        // Trust the server's response — it recalculates noofanswer for us
        setquestion(res.data.data);
        toast.success("Answer posted!");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to post answer");
    } finally {
      setnewAnswer("");
      setisSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!user) {
      toast.info("Please login to continue");
      router.push("/auth");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      const res = await axiosInstance.delete(`/question/delete/${question._id}`);
      if (res.data.message) {
        toast.success(res.data.message);
        router.push("/");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete question");
    }
  };

  const handleDeleteanswer = async (id: string) => {
    if (!user) {
      toast.info("Please login to continue");
      router.push("/auth");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this answer?")) return;
    try {
      const res = await axiosInstance.delete(`/answer/delete/${question._id}`, {
        data: { answerid: id },
      });
      if (res.data.data) {
        // Trust the server's response — it recalculates noofanswer for us
        setquestion(res.data.data);
        toast.success("Deleted successfully");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete answer");
    }
  };

  const renderBody = (text: string) =>
    text
      .replace(/## (.*)/g, '<h3 class="text-lg font-semibold mt-6 mb-3 text-gray-900">$1</h3>')
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-gray-100 p-4 rounded-lg overflow-x-auto my-4"><code class="text-sm">$2</code></pre>')
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-2 py-1 rounded text-sm">$1</code>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/^/, '<p class="mb-4">')
      .replace(/$/, "</p>");

  const filteredAnswers = getFilteredAnswers();

  return (
    <div className="max-w-5xl">
      {/* Question Header */}
      <div className="mb-6">
        <h1 className="text-xl lg:text-2xl font-semibold mb-4 text-gray-900">
          {question.questiontitle}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>Asked {new Date(question.askedon).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Question Card */}
      <Card className="mb-8">
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row">
            {/* Question Voting */}
            <div className="flex sm:flex-col items-center sm:items-center p-4 sm:p-6 border-b sm:border-b-0 sm:border-r border-gray-200">
              <Button
                variant="ghost" size="sm"
                className={`p-2 ${
                  question.upvote.includes(user?._id)
                    ? "text-orange-500"
                    : "text-gray-600 hover:text-orange-500"
                }`}
                onClick={() => handleQuestionVote("upvote")}
              >
                <ChevronUp className="w-6 h-6" />
              </Button>
              <span className="font-medium">
                {question.upvote.length - question.downvote.length}
              </span>
              <Button
                variant="ghost" size="sm"
                className={`p-2 ${
                  question.downvote.includes(user?._id)
                    ? "text-orange-500"
                    : "text-gray-600 hover:text-orange-500"
                }`}
                onClick={() => handleQuestionVote("downvote")}
              >
                <ChevronDown className="w-6 h-6" />
              </Button>
              <div className="flex sm:flex-col gap-2 sm:gap-4 mt-4 sm:mt-6">
                <Button
                  variant="ghost" size="sm"
                  className={`p-2 ${question?.isBookmarked ? "text-yellow-500" : "text-gray-600 hover:text-yellow-500"}`}
                  onClick={handlebookmark}
                >
                  <Bookmark className="w-5 h-5" fill={question?.isBookmarked ? "currentColor" : "none"} />
                </Button>
                <Button variant="ghost" size="sm" className="p-2 text-gray-600 hover:text-gray-800">
                  <History className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Question Body */}
            <div className="flex-1 p-4 sm:p-6">
              <div className="prose max-w-none mb-6">
                <div
                  className="text-gray-800 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: renderBody(question.questionbody) }}
                />
              </div>
              <div className="flex flex-wrap gap-2 mb-6">
                {question.questiontags.map((tag: any) => (
                  <Link key={tag} href={`/tags/${tag}`}>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer">
                      {tag}
                    </Badge>
                  </Link>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
                    <Share className="w-4 h-4 mr-1" /> Share
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
                    <Flag className="w-4 h-4 mr-1" /> Flag
                  </Button>
                  {question.userid === user?._id && (
                    <Button variant="ghost" size="sm" onClick={handleDelete} className="text-red-600 hover:text-red-800">
                      <Trash className="w-4 h-4 mr-1" /> Delete
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">asked {new Date(question.askedon).toLocaleDateString()}</span>
                  <Link href={`/users/${question.userid}`} className="flex items-center gap-2 hover:bg-blue-50 p-2 rounded">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-sm">{question.userposted[0]}</AvatarFallback>
                    </Avatar>
                    <div className="text-blue-600 hover:text-blue-800 font-medium">{question.userposted}</div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Answers Section */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {question.answer.length} Answer{question.answer.length !== 1 ? "s" : ""}
          </h2>
          <div className="flex gap-1 flex-wrap">
            {(["newest", "active", "unanswered"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1 rounded text-sm capitalize ${
                  filter === tab
                    ? "bg-gray-200 text-gray-800 font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {filteredAnswers.length === 0 ? (
            <p className="text-gray-500 text-sm">No answers match this filter.</p>
          ) : (
            filteredAnswers.map((ans: any) => (
              <Card key={ans._id || ans.answeredon}>
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row">
                    {/* Answer Voting */}
                    <div className="flex sm:flex-col items-center p-4 sm:p-6 border-b sm:border-b-0 sm:border-r border-gray-200">
                      <Button
                        variant="ghost" size="sm"
                        className={`p-2 ${
                          ans.upvote?.includes(user?._id)
                            ? "text-orange-500"
                            : "text-gray-600 hover:text-orange-500"
                        }`}
                        onClick={() => handleAnswerVote(ans._id, "upvote")}
                      >
                        <ChevronUp className="w-5 h-5" />
                      </Button>
                      <span className="font-medium text-sm">
                        {(ans.upvote?.length || 0) - (ans.downvote?.length || 0)}
                      </span>
                      <Button
                        variant="ghost" size="sm"
                        className={`p-2 ${
                          ans.downvote?.includes(user?._id)
                            ? "text-orange-500"
                            : "text-gray-600 hover:text-orange-500"
                        }`}
                        onClick={() => handleAnswerVote(ans._id, "downvote")}
                      >
                        <ChevronDown className="w-5 h-5" />
                      </Button>
                    </div>

                    {/* Answer Body */}
                    <div className="flex-1 p-4 sm:p-6">
                      <div className="prose max-w-none mb-6">
                        <div
                          className="text-gray-800 leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: renderBody(ans.answerbody) }}
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
                            <Share className="w-4 h-4 mr-1" /> Share
                          </Button>
                          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
                            <Flag className="w-4 h-4 mr-1" /> Flag
                          </Button>
                          {ans.userid === user?._id && (
                            <Button
                              variant="ghost" size="sm"
                              onClick={() => handleDeleteanswer(ans._id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash className="w-4 h-4 mr-1" /> Delete
                            </Button>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-600">
                            answered {new Date(ans.answeredon).toLocaleDateString()}
                          </span>
                          <Link href={`/users/${ans.userid}`} className="flex items-center gap-2 hover:bg-blue-50 p-2 rounded">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="text-sm">{ans.useranswered[0]}</AvatarFallback>
                            </Avatar>
                            <div className="text-blue-600 hover:text-blue-800 font-medium">
                              {ans.useranswered}
                            </div>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Post Answer */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Your Answer</h3>
          <Textarea
            placeholder="Write your answer here... You can use Markdown formatting."
            value={newanswer}
            onChange={(e) => setnewAnswer(e.target.value)}
            className="min-h-32 mb-4 resize-none"
          />
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <Button
              onClick={handleSubmitanswer}
              disabled={!newanswer.trim() || isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? "Posting..." : "Post Your Answer"}
            </Button>
            <p className="text-sm text-gray-600">
              By posting your answer, you agree to the{" "}
              <Link href="#" className="text-blue-600 hover:underline">privacy policy</Link>{" "}
              and{" "}
              <Link href="#" className="text-blue-600 hover:underline">terms of service</Link>.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuestionDetail;

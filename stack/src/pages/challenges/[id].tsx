import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Mainlayout from "@/layout/Mainlayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getChallengeById, type Difficulty } from "@/lib/challengesData";
import { ArrowLeft, ChevronRight } from "lucide-react";

const DIFFICULTY_STYLE: Record<Difficulty, string> = {
  Easy: "bg-green-100 text-green-700",
  Medium: "bg-orange-100 text-orange-700",
  Hard: "bg-red-100 text-red-700",
};

export default function ChallengeDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const challenge = typeof id === "string" ? getChallengeById(id) : undefined;

  if (router.isFallback || (typeof id !== "string" && id !== undefined)) {
    return (
      <Mainlayout>
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 m-6" />
      </Mainlayout>
    );
  }

  if (!challenge) {
    return (
      <Mainlayout>
        <div className="p-6 text-center text-gray-500">
          <p className="mb-4">Challenge not found.</p>
          <Link href="/challenges" className="text-blue-600 hover:underline text-sm">
            ← Back to Challenges
          </Link>
        </div>
      </Mainlayout>
    );
  }

  return (
    <Mainlayout>
      <Head>
        <title>{challenge.title} — Challenges — CodeQuest</title>
      </Head>
      <div className="max-w-3xl p-4 lg:p-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
          <Link href="/challenges" className="flex items-center gap-1 hover:text-blue-600">
            <ArrowLeft className="w-3.5 h-3.5" />
            Challenges
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-700">{challenge.title}</span>
        </div>

        <Card>
          <CardContent className="p-6">
            {/* Title + difficulty */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">
                {challenge.title}
              </h1>
              <Badge
                variant="secondary"
                className={`text-xs w-fit ${DIFFICULTY_STYLE[challenge.difficulty]}`}
              >
                {challenge.difficulty}
              </Badge>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-6">
              {challenge.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-xs bg-blue-50 text-blue-700"
                >
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Problem statement */}
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-2">
                Problem Statement
              </h2>
              <p className="text-gray-700 text-sm leading-relaxed">
                {challenge.problemStatement}
              </p>
            </div>

            {/* Sample input / output */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Sample Input
                </h3>
                <pre className="bg-gray-100 rounded-lg p-3 text-xs text-gray-800 overflow-x-auto whitespace-pre-wrap">
                  {challenge.sampleInput}
                </pre>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Sample Output
                </h3>
                <pre className="bg-gray-100 rounded-lg p-3 text-xs text-gray-800 overflow-x-auto whitespace-pre-wrap">
                  {challenge.sampleOutput}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Mainlayout>
  );
}

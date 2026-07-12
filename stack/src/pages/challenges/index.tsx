import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import Mainlayout from "@/layout/Mainlayout";
import { Badge } from "@/components/ui/badge";
import { challenges, type Difficulty } from "@/lib/challengesData";
import { useLanguage } from "@/lib/LanguageContext";
import { Trophy } from "lucide-react";

const DIFFICULTY_STYLE: Record<Difficulty, string> = {
  Easy: "bg-green-100 text-green-700",
  Medium: "bg-orange-100 text-orange-700",
  Hard: "bg-red-100 text-red-700",
};

const FILTERS: Array<"All" | Difficulty> = ["All", "Easy", "Medium", "Hard"];

export default function ChallengesPage() {
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<"All" | Difficulty>("All");

  const displayedChallenges =
    activeFilter === "All"
      ? challenges
      : challenges.filter((c) => c.difficulty === activeFilter);

  return (
    <Mainlayout>
      <Head>
        <title>Challenges — CodeQuest</title>
      </Head>
      <div className="p-4 lg:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-orange-500" />
              <h1 className="text-xl lg:text-2xl font-semibold">{t("pages.codingChallenges")}</h1>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {t("pages.challengesSubtitle")}
            </p>
          </div>
        </div>

        {/* Difficulty filter */}
        <div className="flex flex-wrap gap-1 sm:gap-2 mb-6 text-sm">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1 rounded ${
                activeFilter === f
                  ? "bg-gray-200 text-gray-800 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {f}
            </button>
          ))}
          <span className="text-gray-400 ml-1 self-center">
            {displayedChallenges.length} challenge
            {displayedChallenges.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Challenge cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedChallenges.map((challenge) => (
            <div
              key={challenge.id}
              className="border border-gray-200 rounded-xl bg-white hover:shadow-md transition flex flex-col p-5"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h2 className="font-semibold text-gray-900 text-base leading-snug">
                  {challenge.title}
                </h2>
                <Badge
                  variant="secondary"
                  className={`text-xs shrink-0 ${DIFFICULTY_STYLE[challenge.difficulty]}`}
                >
                  {challenge.difficulty}
                </Badge>
              </div>

              <p className="text-sm text-gray-600 flex-1 mb-4">
                {challenge.description}
              </p>

              <div className="flex flex-wrap gap-1 mb-4">
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

              <Link
                href={`/challenges/${challenge.id}`}
                className="mt-auto text-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded transition"
              >
                View Challenge
              </Link>
            </div>
          ))}
        </div>
      </div>
    </Mainlayout>
  );
}

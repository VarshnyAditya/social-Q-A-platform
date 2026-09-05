import QuestionDetail from "@/components/QuestionDetail";
import Mainlayout from "@/layout/Mainlayout";
import Seo from "@/components/Seo";
import { stripHtmlToText, truncate } from "@/lib/seo";
import type { GetServerSideProps } from "next";
import { useRouter } from "next/router";

interface QuestionSeoData {
  title: string;
  description: string;
  tags: string[];
  answerCount: number;
  askedOn: string | null;
}

interface QuestionPageProps {
  questionId: string;
  seo: QuestionSeoData | null;
}

const QuestionPage = ({ questionId, seo }: QuestionPageProps) => {
  const router = useRouter();
  // Fallback for client-side navigations (e.g. clicking a question card)
  // where router.query hasn't resolved yet on first render.
  const { id } = router.query;
  const resolvedId = questionId || (Array.isArray(id) ? id[0] : id) || "";

  const title = seo ? `${seo.title} — CodeQuest` : "Question — CodeQuest";
  const description = seo
    ? seo.description
    : "View this question and its answers on CodeQuest, a community Q&A platform for developers.";

  const jsonLd = seo
    ? {
        "@context": "https://schema.org",
        "@type": "QAPage",
        mainEntity: {
          "@type": "Question",
          name: seo.title,
          text: seo.description,
          answerCount: seo.answerCount,
          dateCreated: seo.askedOn || undefined,
          keywords: seo.tags.join(", ") || undefined,
        },
      }
    : undefined;

  return (
    <Mainlayout>
      <Seo
        title={title}
        description={description}
        path={`/questions/${resolvedId}`}
        type="article"
        jsonLd={jsonLd}
      />
      <div>
        <QuestionDetail questionId={resolvedId} />
      </div>
    </Mainlayout>
  );
};

// Fetches just enough of the question (title/body/tags/answer count) server
// side to render real meta tags and JSON-LD in the initial HTML — the
// interactive QuestionDetail component still does its own client-side fetch
// for everything else, unchanged.
export const getServerSideProps: GetServerSideProps<QuestionPageProps> = async ({ params }) => {
  const questionId = typeof params?.id === "string" ? params.id : "";
  let seo: QuestionSeoData | null = null;

  try {
    const backendUrl = process.env.BACKEND_URL;
    if (backendUrl && questionId) {
      const res = await fetch(`${backendUrl}/question/getallquestion`);
      if (res.ok) {
        const json = await res.json();
        const question = (json?.data || []).find((q: any) => q._id === questionId);
        if (question) {
          seo = {
            title: question.questiontitle || "Question",
            description: truncate(stripHtmlToText(question.questionbody || ""), 160),
            tags: question.questiontags || [],
            answerCount: question.answer?.length || 0,
            askedOn: question.askedon ? new Date(question.askedon).toISOString() : null,
          };
        }
      }
    }
  } catch {
    // Falls back to generic metadata below — the page still renders and
    // QuestionDetail will fetch the full question client-side as usual.
  }

  return { props: { questionId, seo } };
};

export default QuestionPage;

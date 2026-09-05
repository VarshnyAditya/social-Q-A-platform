import type { GetServerSideProps } from "next";
import { absoluteUrl } from "@/lib/seo";
import { challenges } from "@/lib/challengesData";

// Mirrors the slug list in src/pages/companies/index.tsx. Kept as a plain
// array here (rather than importing the page's local data) since that file
// exports a page component, not shared data.
const COMPANY_SLUGS = [
  "google", "microsoft", "amazon", "meta", "apple", "netflix", "adobe",
  "oracle", "ibm", "nvidia", "openai", "salesforce", "uber", "spotify",
  "airbnb", "atlassian", "cisco", "samsung", "tesla",
];

type SitemapUrl = {
  loc: string;
  lastmod?: string;
  changefreq?: "daily" | "weekly" | "monthly";
  priority?: string;
};

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildSitemapXml(urls: SitemapUrl[]): string {
  const body = urls
    .map((u) => {
      const parts = [`    <loc>${xmlEscape(u.loc)}</loc>`];
      if (u.lastmod) parts.push(`    <lastmod>${u.lastmod}</lastmod>`);
      if (u.changefreq) parts.push(`    <changefreq>${u.changefreq}</changefreq>`);
      if (u.priority) parts.push(`    <priority>${u.priority}</priority>`);
      return `  <url>\n${parts.join("\n")}\n  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>`;
}

// Runs server-side only — talks directly to the backend API (never exposed
// to the client bundle) to enumerate public questions/articles/tags.
async function fetchJson(path: string): Promise<any[]> {
  try {
    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) return [];
    const res = await fetch(`${backendUrl}${path}`);
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data || [];
  } catch {
    return [];
  }
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const [questions, articles] = await Promise.all([
    fetchJson("/question/getallquestion"),
    fetchJson("/article/getall"),
  ]);

  const staticUrls: SitemapUrl[] = [
    { loc: absoluteUrl("/"), changefreq: "daily", priority: "1.0" },
    { loc: absoluteUrl("/questions"), changefreq: "daily", priority: "0.9" },
    { loc: absoluteUrl("/tags"), changefreq: "daily", priority: "0.7" },
    { loc: absoluteUrl("/articles"), changefreq: "daily", priority: "0.7" },
    { loc: absoluteUrl("/companies"), changefreq: "weekly", priority: "0.5" },
    { loc: absoluteUrl("/challenges"), changefreq: "weekly", priority: "0.5" },
    { loc: absoluteUrl("/social"), changefreq: "daily", priority: "0.4" },
    { loc: absoluteUrl("/teams"), changefreq: "daily", priority: "0.4" },
  ];

  const questionUrls: SitemapUrl[] = questions
    .filter((q) => q?._id)
    .map((q) => ({
      loc: absoluteUrl(`/questions/${q._id}`),
      lastmod: q.askedon ? new Date(q.askedon).toISOString() : undefined,
      changefreq: "weekly",
      priority: "0.8",
    }));

  const tagSet = new Set<string>();
  questions.forEach((q) => {
    (q.questiontags || []).forEach((tag: string) => {
      const t = tag?.trim().toLowerCase();
      if (t) tagSet.add(t);
    });
  });
  const tagUrls: SitemapUrl[] = Array.from(tagSet).map((tag) => ({
    loc: absoluteUrl(`/tags/${encodeURIComponent(tag)}`),
    changefreq: "weekly",
    priority: "0.6",
  }));

  const articleUrls: SitemapUrl[] = articles
    .filter((a) => a?._id)
    .map((a) => ({
      loc: absoluteUrl(`/articles/${a._id}`),
      lastmod: a.createdAt ? new Date(a.createdAt).toISOString() : undefined,
      changefreq: "weekly",
      priority: "0.6",
    }));

  const companyUrls: SitemapUrl[] = COMPANY_SLUGS.map((slug) => ({
    loc: absoluteUrl(`/companies/${slug}`),
    changefreq: "monthly",
    priority: "0.4",
  }));

  const challengeUrls: SitemapUrl[] = challenges.map((c) => ({
    loc: absoluteUrl(`/challenges/${c.id}`),
    changefreq: "monthly",
    priority: "0.4",
  }));

  const xml = buildSitemapXml([
    ...staticUrls,
    ...questionUrls,
    ...tagUrls,
    ...articleUrls,
    ...companyUrls,
    ...challengeUrls,
  ]);

  res.setHeader("Content-Type", "application/xml");
  res.write(xml);
  res.end();
  return { props: {} };
};

export default function SitemapXml() {
  return null;
}

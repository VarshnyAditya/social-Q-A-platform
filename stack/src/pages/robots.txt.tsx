import type { GetServerSideProps } from "next";
import { SITE_URL } from "@/lib/seo";

// Routes that require login, show account-specific data, or are pure
// action/dashboard pages with no indexable content of their own.
const DISALLOWED_PATHS = [
  "/auth",
  "/signup",
  "/forgot-password",
  "/ask",
  "/articles/create",
  "/teams/create",
  "/chat",
  "/points",
  "/saved",
  "/admin",
  "/subscription",
  "/ai-assist",
  "/users",
  "/api",
];

function buildRobotsTxt(): string {
  const lines = [
    "User-agent: *",
    ...DISALLOWED_PATHS.map((path) => `Disallow: ${path}`),
    "Allow: /",
    "",
    `Sitemap: ${SITE_URL}/sitemap.xml`,
  ];
  return lines.join("\n");
}

// robots.txt has to be served at the site root, so it's generated here via
// getServerSideProps instead of living as a static file in /public — that
// way it always reflects the current SITE_URL and disallow list.
export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  res.setHeader("Content-Type", "text/plain");
  res.write(buildRobotsTxt());
  res.end();
  return { props: {} };
};

export default function RobotsTxt() {
  return null;
}

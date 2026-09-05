import Head from "next/head";
import {
  SITE_NAME,
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  absoluteUrl,
} from "@/lib/seo";

interface SeoProps {
  /** Page title, shown as-is in the <title> tag and og:title. */
  title: string;
  /** Plain-text meta description (no HTML). Falls back to the site default. */
  description?: string;
  /** Site-relative path used to build the canonical URL and og:url, e.g. "/questions/123". */
  path: string;
  /** Absolute image URL for Open Graph / Twitter cards. Falls back to the site logo. */
  image?: string;
  /** Set true for pages that should never appear in search results (auth, dashboards, forms). */
  noindex?: boolean;
  /** Open Graph type — "article" for question/article detail pages, "website" otherwise. */
  type?: "website" | "article";
  /** Optional JSON-LD structured data object(s) to embed for this page. */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

/**
 * Shared SEO head tags for every page: title, description, canonical link,
 * Open Graph/Twitter card data, and an explicit robots directive. Centralizing
 * this here means every page gets a canonical + robots tag instead of some
 * pages silently missing one.
 */
export default function Seo({
  title,
  description = DEFAULT_DESCRIPTION,
  path,
  image = DEFAULT_OG_IMAGE,
  noindex = false,
  type = "website",
  jsonLd,
}: SeoProps) {
  const canonical = absoluteUrl(path);
  const jsonLdList = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      <meta
        name="robots"
        content={noindex ? "noindex, nofollow" : "index, follow"}
      />

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {jsonLdList.map((data, i) => (
        <script
          key={i}
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}
    </Head>
  );
}

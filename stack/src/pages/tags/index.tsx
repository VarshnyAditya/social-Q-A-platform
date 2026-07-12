import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Mainlayout from "@/layout/Mainlayout";
import axiosInstance from "@/lib/axiosinstance";
import { useLanguage } from "@/lib/LanguageContext";

// Built-in descriptions for common tags
const TAG_DESCRIPTIONS: Record<string, string> = {
  javascript: "A lightweight, interpreted programming language with first-class functions, most commonly used for web development.",
  typescript: "A strongly typed superset of JavaScript that compiles to plain JavaScript.",
  react: "A JavaScript library for building user interfaces using components and a virtual DOM.",
  "react.js": "A JavaScript library for building user interfaces using components and a virtual DOM.",
  nextjs: "A React framework for building full-stack web applications with SSR and SSG support.",
  "next.js": "A React framework for building full-stack web applications with SSR and SSG support.",
  nodejs: "A JavaScript runtime built on Chrome's V8 engine for building server-side applications.",
  "node.js": "A JavaScript runtime built on Chrome's V8 engine for building server-side applications.",
  express: "A minimal and flexible Node.js web application framework for building APIs.",
  "express.js": "A minimal and flexible Node.js web application framework for building APIs.",
  python: "A high-level, general-purpose programming language known for its readability and versatility.",
  java: "A class-based, object-oriented programming language designed to run on any platform.",
  "c++": "A general-purpose programming language extending C with object-oriented features.",
  html: "The standard markup language for creating web pages and web applications.",
  css: "A style sheet language used for describing the presentation of HTML documents.",
  mongodb: "A document-oriented NoSQL database that stores data in flexible, JSON-like documents.",
  sql: "A domain-specific language for managing and querying relational databases.",
  mysql: "An open-source relational database management system based on SQL.",
  postgresql: "A powerful, open-source object-relational database system.",
  git: "A distributed version control system for tracking changes in source code.",
  github: "A cloud-based Git repository hosting service for collaboration and version control.",
  docker: "A platform for developing, shipping, and running applications in containers.",
  api: "Application Programming Interface — a set of rules for building and interacting with software.",
  rest: "Representational State Transfer — an architectural style for designing networked applications.",
  graphql: "A query language for APIs and a runtime for executing queries with existing data.",
  authentication: "The process of verifying the identity of a user or system.",
  middleware: "Software that connects different systems or layers in an application.",
  redux: "A predictable state container for JavaScript applications.",
  tailwind: "A utility-first CSS framework for rapidly building custom user interfaces.",
  Mongodb: "A document-oriented NoSQL database that stores data in flexible JSON-like documents.",
  mongoose: "An ODM library for MongoDB and Node.js providing schema-based data modeling.",
  jwt: "JSON Web Token — a compact way to securely transmit information between parties.",
  webpack: "A module bundler for JavaScript applications.",
  vue: "A progressive JavaScript framework for building user interfaces.",
  angular: "A TypeScript-based web application framework developed by Google.",
  php: "A widely-used open-source server-side scripting language for web development.",
  arrays: "A data structure that stores a collection of elements in a sequential manner.",
  string: "A sequence of characters used to represent text in programming.",
  regex: "Regular expressions — patterns used to match character combinations in strings.",
  async: "Asynchronous programming — techniques for handling operations that take time to complete.",
  promises: "Objects representing the eventual completion or failure of an async operation.",
  hooks: "Functions that let you use React state and lifecycle features in function components.",
  forms: "HTML elements used to collect user input in web applications.",
  routing: "The mechanism for determining how an application responds to different URL paths.",
  testing: "The process of evaluating software to ensure it works as expected.",
  deployment: "The process of making software available for use in a production environment.",
  performance: "Techniques and practices for improving application speed and efficiency.",
  security: "Practices for protecting applications from vulnerabilities and attacks.",
  blockchain: "A distributed ledger technology for recording transactions across multiple computers.",
  web3: "A decentralized version of the web built on blockchain technology.",
  machine_learning: "A subset of AI that enables systems to learn from data.",
  algorithms: "Step-by-step procedures for solving computational problems.",
  "data-structures": "Ways of organizing and storing data for efficient access and modification.",
};

const getDescription = (tag: string) =>
  TAG_DESCRIPTIONS[tag.toLowerCase()] ||
  `Questions and answers related to ${tag}. Click to explore.`;

export default function TagsPage() {
  const { t } = useLanguage();
  const [allTags, setAllTags]     = useState<{ name: string; count: number }[]>([]);
  const [filtered, setFiltered]   = useState<{ name: string; count: number }[]>([]);
  const [search, setSearch]       = useState("");
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await axiosInstance.get("/question/getallquestion");
        const questions = res.data.data;

        // Count how many questions use each tag
        const tagMap: Record<string, number> = {};
        questions.forEach((q: any) => {
          q.questiontags?.forEach((tag: string) => {
            const t = tag.trim().toLowerCase();
            if (t) tagMap[t] = (tagMap[t] || 0) + 1;
          });
        });

        // Sort by question count descending
        const tagList = Object.entries(tagMap)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count);

        setAllTags(tagList);
        setFiltered(tagList);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchTags();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toLowerCase();
    setSearch(val);
    if (!val) {
      setFiltered(allTags);
    } else {
      setFiltered(allTags.filter((t) => t.name.includes(val)));
    }
  };

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
        <title>Tags — StackClone</title>
      </Head>
      <div className="p-4 lg:p-6">
        <h1 className="text-xl lg:text-2xl font-semibold mb-2">{t("nav.tags")}</h1>
        <p className="text-sm text-gray-600 mb-6">
          {t("pages.tagsSubtitle")}
        </p>

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={handleSearch}
          placeholder="Filter by tag name..."
          className="border rounded px-3 py-2 text-sm w-full max-w-sm mb-6 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        {filtered.length === 0 ? (
          <p className="text-gray-500 text-sm">No tags found.</p>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">{filtered.length} tags</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((tag) => (
                <Link key={tag.name} href={`/tags/${encodeURIComponent(tag.name)}`}>
                  <div className="border rounded-lg p-4 hover:shadow-md transition cursor-pointer bg-white h-full flex flex-col">
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded mb-3 w-fit">
                      {tag.name}
                    </span>
                    <p className="text-xs text-gray-600 flex-1 line-clamp-3">
                      {getDescription(tag.name)}
                    </p>
                    <p className="text-xs text-gray-400 mt-3 pt-3 border-t">
                      {tag.count} {tag.count === 1 ? "question" : "questions"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </Mainlayout>
  );
}

import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Mainlayout from "@/layout/Mainlayout";
import axiosInstance from "@/lib/axiosinstance";

const COMPANIES = [
  {
    id: "google",
    name: "Google",
    logo: "https://www.google.com/favicon.ico",
    description: "A multinational technology company specializing in internet-related services and products, including search engines, cloud computing, and AI.",
    industry: "Technology",
    headquarters: "Mountain View, California, USA",
    website: "https://careers.google.com",
    tags: ["google", "android", "flutter", "kotlin", "firebase", "golang", "go", "angular", "tensorflow"],
  },
  {
    id: "microsoft",
    name: "Microsoft",
    logo: "https://www.microsoft.com/favicon.ico",
    description: "A global technology corporation producing software, consumer electronics, and cloud services including Windows, Azure, and Office.",
    industry: "Technology",
    headquarters: "Redmond, Washington, USA",
    website: "https://careers.microsoft.com",
    tags: ["microsoft", "azure", "c#", ".net", "typescript", "windows", "dotnet", "powershell", "excel"],
  },
  {
    id: "amazon",
    name: "Amazon",
    logo: "https://www.amazon.com/favicon.ico",
    description: "A multinational technology and e-commerce company, also the world's largest cloud provider through Amazon Web Services (AWS).",
    industry: "E-commerce & Cloud",
    headquarters: "Seattle, Washington, USA",
    website: "https://amazon.jobs",
    tags: ["amazon", "aws", "lambda", "s3", "dynamodb", "ec2", "cloudformation", "serverless"],
  },
  {
    id: "meta",
    name: "Meta",
    logo: "https://www.meta.com/favicon.ico",
    description: "The parent company of Facebook, Instagram, and WhatsApp, focused on social media, AR/VR, and the metaverse.",
    industry: "Social Media & Technology",
    headquarters: "Menlo Park, California, USA",
    website: "https://metacareers.com",
    tags: ["meta", "facebook", "react", "react.js", "react-native", "graphql", "instagram", "whatsapp"],
  },
  {
    id: "apple",
    name: "Apple",
    logo: "https://www.apple.com/favicon.ico",
    description: "A technology company known for the iPhone, Mac, iPad, and software ecosystem including iOS, macOS, and the App Store.",
    industry: "Consumer Electronics",
    headquarters: "Cupertino, California, USA",
    website: "https://apple.com/careers",
    tags: ["apple", "swift", "ios", "macos", "xcode", "objective-c", "swiftui", "iphone"],
  },
  {
    id: "netflix",
    name: "Netflix",
    logo: "https://www.netflix.com/favicon.ico",
    description: "A subscription streaming service and production company known for pioneering cloud-native architecture and open source tools.",
    industry: "Entertainment & Streaming",
    headquarters: "Los Gatos, California, USA",
    website: "https://jobs.netflix.com",
    tags: ["netflix", "streaming", "microservices", "java", "spring", "cassandra"],
  },
  {
    id: "adobe",
    name: "Adobe",
    logo: "https://www.adobe.com/favicon.ico",
    description: "A software company specializing in creative tools, document management, and digital marketing solutions.",
    industry: "Software & Creative Tools",
    headquarters: "San Jose, California, USA",
    website: "https://adobe.com/careers",
    tags: ["adobe", "pdf", "photoshop", "illustrator", "acrobat", "coldfusion"],
  },
  {
    id: "oracle",
    name: "Oracle",
    logo: "https://www.oracle.com/favicon.ico",
    description: "A global technology company offering database management systems, cloud applications, and enterprise software.",
    industry: "Enterprise Software",
    headquarters: "Austin, Texas, USA",
    website: "https://oracle.com/careers",
    tags: ["oracle", "sql", "plsql", "java", "database", "oci", "jdbc"],
  },
  {
    id: "ibm",
    name: "IBM",
    logo: "https://www.ibm.com/favicon.ico",
    description: "One of the world's largest technology and consulting companies, known for AI, cloud services, and enterprise hardware.",
    industry: "Technology & Consulting",
    headquarters: "Armonk, New York, USA",
    website: "https://ibm.com/careers",
    tags: ["ibm", "watson", "db2", "mainframe", "cloud", "blockchain", "cobol"],
  },
  {
    id: "nvidia",
    name: "NVIDIA",
    logo: "https://www.nvidia.com/favicon.ico",
    description: "A technology company known for designing GPUs and system-on-chip units, leading in AI and deep learning hardware.",
    industry: "Semiconductors & AI",
    headquarters: "Santa Clara, California, USA",
    website: "https://nvidia.com/en-us/about-nvidia/careers",
    tags: ["nvidia", "cuda", "gpu", "deep-learning", "machine-learning", "pytorch", "tensorflow"],
  },
  {
    id: "openai",
    name: "OpenAI",
    logo: "https://openai.com/favicon.ico",
    description: "An AI research organization developing advanced artificial intelligence systems including GPT, DALL·E, and ChatGPT.",
    industry: "Artificial Intelligence",
    headquarters: "San Francisco, California, USA",
    website: "https://openai.com/careers",
    tags: ["openai", "chatgpt", "gpt", "ai", "machine-learning", "llm", "prompt"],
  },
  {
    id: "salesforce",
    name: "Salesforce",
    logo: "https://www.salesforce.com/favicon.ico",
    description: "A cloud-based software company providing CRM services and enterprise applications for sales, service, and marketing.",
    industry: "Enterprise CRM",
    headquarters: "San Francisco, California, USA",
    website: "https://salesforce.com/careers",
    tags: ["salesforce", "apex", "crm", "soql", "lightning", "visualforce"],
  },
  {
    id: "uber",
    name: "Uber",
    logo: "https://www.uber.com/favicon.ico",
    description: "A technology company offering ride-hailing, food delivery, and freight services through a global platform.",
    industry: "Transportation & Logistics",
    headquarters: "San Francisco, California, USA",
    website: "https://uber.com/us/en/careers",
    tags: ["uber", "golang", "go", "microservices", "kafka", "geolocation"],
  },
  {
    id: "spotify",
    name: "Spotify",
    logo: "https://www.spotify.com/favicon.ico",
    description: "A digital music streaming service providing access to millions of songs, podcasts, and audiobooks.",
    industry: "Music & Streaming",
    headquarters: "Stockholm, Sweden",
    website: "https://spotify.com/us/jobs",
    tags: ["spotify", "python", "java", "microservices", "kafka", "data-engineering"],
  },
  {
    id: "airbnb",
    name: "Airbnb",
    logo: "https://www.airbnb.com/favicon.ico",
    description: "An online marketplace for short-term homestays and experiences, connecting hosts with travelers worldwide.",
    industry: "Travel & Hospitality",
    headquarters: "San Francisco, California, USA",
    website: "https://careers.airbnb.com",
    tags: ["airbnb", "react", "ruby", "rails", "data-science", "maps"],
  },
  {
    id: "atlassian",
    name: "Atlassian",
    logo: "https://www.atlassian.com/favicon.ico",
    description: "A software company that develops products for software developers and project managers, including Jira and Confluence.",
    industry: "Developer Tools",
    headquarters: "Sydney, Australia",
    website: "https://atlassian.com/company/careers",
    tags: ["atlassian", "jira", "confluence", "bitbucket", "trello", "agile"],
  },
  {
    id: "cisco",
    name: "Cisco",
    logo: "https://www.cisco.com/favicon.ico",
    description: "A worldwide technology leader in networking, cybersecurity, and collaboration solutions.",
    industry: "Networking & Security",
    headquarters: "San Jose, California, USA",
    website: "https://jobs.cisco.com",
    tags: ["cisco", "networking", "security", "python", "devnet", "routing", "firewall"],
  },
  {
    id: "samsung",
    name: "Samsung",
    logo: "https://www.samsung.com/favicon.ico",
    description: "A South Korean multinational conglomerate in consumer electronics, semiconductors, and telecommunications.",
    industry: "Consumer Electronics",
    headquarters: "Seoul, South Korea",
    website: "https://samsung.com/global/business/careers",
    tags: ["samsung", "android", "kotlin", "tizen", "smarttv", "iot"],
  },
  {
    id: "tesla",
    name: "Tesla",
    logo: "https://www.tesla.com/favicon.ico",
    description: "An electric vehicle and clean energy company designing cars, batteries, and solar energy products.",
    industry: "Automotive & Energy",
    headquarters: "Austin, Texas, USA",
    website: "https://tesla.com/careers",
    tags: ["tesla", "python", "c++", "embedded", "autopilot", "robotics", "ev"],
  },
];

export default function CompaniesPage() {
  const [questionCounts, setQuestionCounts]   = useState<Record<string, number>>({});
  const [search, setSearch]                   = useState("");
  const [filter, setFilter]                   = useState("All");
  const [loading, setLoading]                 = useState(true);

  const industries = ["All", ...Array.from(new Set(COMPANIES.map((c) => c.industry))).sort()];

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await axiosInstance.get("/question/getallquestion");
        const questions = res.data.data;

        // For each company, count questions whose tags match any of the company's tags
        const counts: Record<string, number> = {};
        COMPANIES.forEach((company) => {
          counts[company.id] = questions.filter((q: any) =>
            q.questiontags?.some((qt: string) =>
              company.tags.includes(qt.trim().toLowerCase())
            )
          ).length;
        });
        setQuestionCounts(counts);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchCounts();
  }, []);

  const filtered = COMPANIES.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.industry.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || c.industry === filter;
    return matchSearch && matchFilter;
  });

  return (
    <Mainlayout>
      <Head>
        <title>Companies — StackClone</title>
      </Head>
      <div className="p-4 lg:p-6">
        <h1 className="text-xl lg:text-2xl font-semibold mb-2">Companies</h1>
        <p className="text-sm text-gray-600 mb-6">
          Explore top tech companies and find questions related to their technologies.
        </p>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search companies..."
            className="border rounded px-3 py-2 text-sm flex-1 max-w-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {industries.map((ind) => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>
        </div>

        <p className="text-sm text-gray-500 mb-4">{filtered.length} companies</p>

        {/* Company Cards */}
        {filtered.length === 0 ? (
          <p className="text-gray-500 text-sm">No companies match your search.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((company) => (
              <Link key={company.id} href={`/companies/${company.id}`}>
                <div className="border rounded-lg p-5 bg-white hover:shadow-md transition cursor-pointer h-full flex flex-col">
                  {/* Logo + Name */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg border flex items-center justify-center bg-gray-50 flex-shrink-0 overflow-hidden">
                      <img
                        src={company.logo}
                        alt={company.name}
                        className="w-6 h-6 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                          (e.target as HTMLImageElement).parentElement!.innerText =
                            company.name[0];
                        }}
                      />
                    </div>
                    <div>
                      <h2 className="font-semibold text-gray-900 text-base">{company.name}</h2>
                      <span className="text-xs text-gray-500">{company.industry}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-gray-600 line-clamp-3 flex-1 mb-3">
                    {company.description}
                  </p>

                  {/* HQ */}
                  <p className="text-xs text-gray-400 mb-3">
                    📍 {company.headquarters}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <span className="text-xs text-gray-500">
                      {loading ? "..." : questionCounts[company.id] || 0} related questions
                    </span>
                    {company.website && (
                      <span className="text-xs text-blue-600 hover:underline">
                        View jobs →
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Mainlayout>
  );
}

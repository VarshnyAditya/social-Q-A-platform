import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Mainlayout from "@/layout/Mainlayout";
import axiosInstance from "@/lib/axiosinstance";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/AuthContext";
import SaveButton from "@/components/SaveButton";

const COMPANIES: Record<string, any> = {
  google: {
    name: "Google",
    logo: "https://www.google.com/favicon.ico",
    description: "A multinational technology company specializing in internet-related services and products, including search engines, cloud computing, and AI.",
    fullDescription: "Google LLC is an American multinational technology company focusing on online advertising, search engine technology, cloud computing, computer software, quantum computing, e-commerce, artificial intelligence, and consumer electronics. It has been referred to as 'the most powerful company in the world' and one of the world's most valuable brands.",
    industry: "Technology",
    headquarters: "Mountain View, California, USA",
    founded: "1998",
    employees: "180,000+",
    website: "https://careers.google.com",
    tags: ["google", "android", "flutter", "kotlin", "firebase", "golang", "go", "angular", "tensorflow"],
  },
  microsoft: {
    name: "Microsoft",
    logo: "https://www.microsoft.com/favicon.ico",
    description: "A global technology corporation producing software, consumer electronics, and cloud services including Windows, Azure, and Office.",
    fullDescription: "Microsoft Corporation is an American multinational technology conglomerate headquartered in Redmond, Washington. Its products include Windows, Microsoft 365, Azure cloud, Xbox, and LinkedIn. Microsoft is one of the Big Five American information technology companies.",
    industry: "Technology",
    headquarters: "Redmond, Washington, USA",
    founded: "1975",
    employees: "220,000+",
    website: "https://careers.microsoft.com",
    tags: ["microsoft", "azure", "c#", ".net", "typescript", "windows", "dotnet", "powershell", "excel"],
  },
  amazon: {
    name: "Amazon",
    logo: "https://www.amazon.com/favicon.ico",
    description: "A multinational technology and e-commerce company, also the world's largest cloud provider through Amazon Web Services.",
    fullDescription: "Amazon.com, Inc. is an American multinational technology company focusing on e-commerce, cloud computing, online advertising, digital streaming, and artificial intelligence. It is one of the Big Five American information technology companies and is the world's largest online retailer.",
    industry: "E-commerce & Cloud",
    headquarters: "Seattle, Washington, USA",
    founded: "1994",
    employees: "1,500,000+",
    website: "https://amazon.jobs",
    tags: ["amazon", "aws", "lambda", "s3", "dynamodb", "ec2", "cloudformation", "serverless"],
  },
  meta: {
    name: "Meta",
    logo: "https://www.meta.com/favicon.ico",
    description: "The parent company of Facebook, Instagram, and WhatsApp, focused on social media, AR/VR, and the metaverse.",
    fullDescription: "Meta Platforms, Inc. is an American multinational technology conglomerate. It owns and operates Facebook, Instagram, Threads, and WhatsApp, among other products and services. Meta is one of the world's most valuable companies and is considered one of the Big Five American information technology companies.",
    industry: "Social Media & Technology",
    headquarters: "Menlo Park, California, USA",
    founded: "2004",
    employees: "80,000+",
    website: "https://metacareers.com",
    tags: ["meta", "facebook", "react", "react.js", "react-native", "graphql", "instagram", "whatsapp"],
  },
  apple: {
    name: "Apple",
    logo: "https://www.apple.com/favicon.ico",
    description: "A technology company known for the iPhone, Mac, iPad, and software ecosystem including iOS, macOS, and the App Store.",
    fullDescription: "Apple Inc. is an American multinational technology company headquartered in Cupertino, California. Apple is the world's largest technology company by revenue and, as of January 2021, the world's most valuable company. It designs, develops, and sells consumer electronics, computer software, and online services.",
    industry: "Consumer Electronics",
    headquarters: "Cupertino, California, USA",
    founded: "1976",
    employees: "160,000+",
    website: "https://apple.com/careers",
    tags: ["apple", "swift", "ios", "macos", "xcode", "objective-c", "swiftui", "iphone"],
  },
  netflix: {
    name: "Netflix",
    logo: "https://www.netflix.com/favicon.ico",
    description: "A subscription streaming service and production company known for pioneering cloud-native architecture and open source tools.",
    fullDescription: "Netflix, Inc. is an American subscription video on-demand over-the-top streaming service. Netflix is known in the tech industry for its engineering culture and open-source contributions including Hystrix, Eureka, and Chaos Monkey.",
    industry: "Entertainment & Streaming",
    headquarters: "Los Gatos, California, USA",
    founded: "1997",
    employees: "12,000+",
    website: "https://jobs.netflix.com",
    tags: ["netflix", "streaming", "microservices", "java", "spring", "cassandra"],
  },
  adobe: {
    name: "Adobe",
    logo: "https://www.adobe.com/favicon.ico",
    description: "A software company specializing in creative tools, document management, and digital marketing solutions.",
    fullDescription: "Adobe Inc. is an American multinational computer software company. Adobe specializes in software for the creation and publication of a wide range of content, including graphics, photography, illustration, animation, multimedia/video, motion pictures, and print.",
    industry: "Software & Creative Tools",
    headquarters: "San Jose, California, USA",
    founded: "1982",
    employees: "30,000+",
    website: "https://adobe.com/careers",
    tags: ["adobe", "pdf", "photoshop", "illustrator", "acrobat", "coldfusion"],
  },
  oracle: {
    name: "Oracle",
    logo: "https://www.oracle.com/favicon.ico",
    description: "A global technology company offering database management systems, cloud applications, and enterprise software.",
    fullDescription: "Oracle Corporation is an American multinational computer technology company headquartered in Austin, Texas. Oracle sells database software and technology, cloud engineered systems, and enterprise software products.",
    industry: "Enterprise Software",
    headquarters: "Austin, Texas, USA",
    founded: "1977",
    employees: "140,000+",
    website: "https://oracle.com/careers",
    tags: ["oracle", "sql", "plsql", "java", "database", "oci", "jdbc"],
  },
  ibm: {
    name: "IBM",
    logo: "https://www.ibm.com/favicon.ico",
    description: "One of the world's largest technology and consulting companies, known for AI, cloud services, and enterprise hardware.",
    fullDescription: "International Business Machines Corporation is an American multinational technology corporation headquartered in Armonk, New York. IBM produces and sells computer hardware, middleware and software, and provides hosting and consulting services in areas ranging from mainframe computers to nanotechnology.",
    industry: "Technology & Consulting",
    headquarters: "Armonk, New York, USA",
    founded: "1911",
    employees: "250,000+",
    website: "https://ibm.com/careers",
    tags: ["ibm", "watson", "db2", "mainframe", "cloud", "blockchain", "cobol"],
  },
  nvidia: {
    name: "NVIDIA",
    logo: "https://www.nvidia.com/favicon.ico",
    description: "A technology company known for designing GPUs and system-on-chip units, leading in AI and deep learning hardware.",
    fullDescription: "NVIDIA Corporation is an American multinational technology company incorporated in Delaware and based in Santa Clara, California. It designs and supplies graphics processing units (GPUs), application programming interfaces (APIs) for data science and high-performance computing.",
    industry: "Semiconductors & AI",
    headquarters: "Santa Clara, California, USA",
    founded: "1993",
    employees: "26,000+",
    website: "https://nvidia.com/en-us/about-nvidia/careers",
    tags: ["nvidia", "cuda", "gpu", "deep-learning", "machine-learning", "pytorch", "tensorflow"],
  },
  openai: {
    name: "OpenAI",
    logo: "https://openai.com/favicon.ico",
    description: "An AI research organization developing advanced artificial intelligence systems including GPT, DALL·E, and ChatGPT.",
    fullDescription: "OpenAI is an American artificial intelligence (AI) research organization consisting of the non-profit OpenAI, Inc. and its for-profit subsidiary OpenAI Global, LLC. OpenAI researches artificial intelligence with the declared intention of developing 'safe and beneficial' artificial general intelligence.",
    industry: "Artificial Intelligence",
    headquarters: "San Francisco, California, USA",
    founded: "2015",
    employees: "1,500+",
    website: "https://openai.com/careers",
    tags: ["openai", "chatgpt", "gpt", "ai", "machine-learning", "llm", "prompt"],
  },
  salesforce: {
    name: "Salesforce",
    logo: "https://www.salesforce.com/favicon.ico",
    description: "A cloud-based software company providing CRM services and enterprise applications for sales, service, and marketing.",
    fullDescription: "Salesforce, Inc. is an American cloud-based software company headquartered in San Francisco, California. It provides customer relationship management (CRM) software and applications focused on sales, customer service, marketing automation, e-commerce, analytics, and application development.",
    industry: "Enterprise CRM",
    headquarters: "San Francisco, California, USA",
    founded: "1999",
    employees: "70,000+",
    website: "https://salesforce.com/careers",
    tags: ["salesforce", "apex", "crm", "soql", "lightning", "visualforce"],
  },
  uber: {
    name: "Uber",
    logo: "https://www.uber.com/favicon.ico",
    description: "A technology company offering ride-hailing, food delivery, and freight services through a global platform.",
    fullDescription: "Uber Technologies, Inc. is an American multinational transportation company that provides services including ride-hailing, food delivery (Uber Eats), package delivery, couriers, freight transportation, electric bicycle and motorized scooter rental via a partnership with Lime, and ferry transport.",
    industry: "Transportation & Logistics",
    headquarters: "San Francisco, California, USA",
    founded: "2009",
    employees: "32,000+",
    website: "https://uber.com/us/en/careers",
    tags: ["uber", "golang", "go", "microservices", "kafka", "geolocation"],
  },
  spotify: {
    name: "Spotify",
    logo: "https://www.spotify.com/favicon.ico",
    description: "A digital music streaming service providing access to millions of songs, podcasts, and audiobooks.",
    fullDescription: "Spotify Technology S.A. is a Swedish audio streaming and media services provider. Spotify is the world's largest music streaming service provider, with over 600 million monthly active users and 230 million paying subscribers.",
    industry: "Music & Streaming",
    headquarters: "Stockholm, Sweden",
    founded: "2006",
    employees: "9,000+",
    website: "https://spotify.com/us/jobs",
    tags: ["spotify", "python", "java", "microservices", "kafka", "data-engineering"],
  },
  airbnb: {
    name: "Airbnb",
    logo: "https://www.airbnb.com/favicon.ico",
    description: "An online marketplace for short-term homestays and experiences, connecting hosts with travelers worldwide.",
    fullDescription: "Airbnb, Inc. is an American San Francisco-based company operating an online marketplace for short-term homestays and experiences. The company acts as a broker and charges a commission from each booking. Airbnb was founded in 2008 by Brian Chesky, Nathan Blecharczyk, and Joe Gebbia.",
    industry: "Travel & Hospitality",
    headquarters: "San Francisco, California, USA",
    founded: "2008",
    employees: "6,000+",
    website: "https://careers.airbnb.com",
    tags: ["airbnb", "react", "ruby", "rails", "data-science", "maps"],
  },
  atlassian: {
    name: "Atlassian",
    logo: "https://www.atlassian.com/favicon.ico",
    description: "A software company that develops products for software developers and project managers, including Jira and Confluence.",
    fullDescription: "Atlassian Corporation is an Australian software company that develops products for software developers, project managers, and other software development teams. The company is known for issue tracking application Jira, Confluence, Bitbucket, and Trello.",
    industry: "Developer Tools",
    headquarters: "Sydney, Australia",
    founded: "2002",
    employees: "10,000+",
    website: "https://atlassian.com/company/careers",
    tags: ["atlassian", "jira", "confluence", "bitbucket", "trello", "agile"],
  },
  cisco: {
    name: "Cisco",
    logo: "https://www.cisco.com/favicon.ico",
    description: "A worldwide technology leader in networking, cybersecurity, and collaboration solutions.",
    fullDescription: "Cisco Systems, Inc. is an American multinational digital communications technology conglomerate corporation headquartered in San Jose, California. Cisco develops, manufactures, and sells networking hardware, software, telecommunications equipment and other high-technology services and products.",
    industry: "Networking & Security",
    headquarters: "San Jose, California, USA",
    founded: "1984",
    employees: "80,000+",
    website: "https://jobs.cisco.com",
    tags: ["cisco", "networking", "security", "python", "devnet", "routing", "firewall"],
  },
  samsung: {
    name: "Samsung",
    logo: "https://www.samsung.com/favicon.ico",
    description: "A South Korean multinational conglomerate in consumer electronics, semiconductors, and telecommunications.",
    fullDescription: "Samsung Electronics Co., Ltd. is a South Korean multinational manufacturing conglomerate headquartered in Suwon-si, Gyeonggi-do, South Korea. It is the largest consumer electronics maker in the world by revenue.",
    industry: "Consumer Electronics",
    headquarters: "Seoul, South Korea",
    founded: "1969",
    employees: "270,000+",
    website: "https://samsung.com/global/business/careers",
    tags: ["samsung", "android", "kotlin", "tizen", "smarttv", "iot"],
  },
  tesla: {
    name: "Tesla",
    logo: "https://www.tesla.com/favicon.ico",
    description: "An electric vehicle and clean energy company designing cars, batteries, and solar energy products.",
    fullDescription: "Tesla, Inc. is an American multinational automotive and clean energy company headquartered in Austin, Texas. Tesla designs and manufactures electric vehicles, battery energy storage from home to grid-scale, solar panels and solar roof tiles, and related products and services.",
    industry: "Automotive & Energy",
    headquarters: "Austin, Texas, USA",
    founded: "2003",
    employees: "130,000+",
    website: "https://tesla.com/careers",
    tags: ["tesla", "python", "c++", "embedded", "autopilot", "robotics", "ev"],
  },
};

export default function CompanyDetailPage() {
  const router = useRouter();
  const { company: companyId } = router.query;
  const id = Array.isArray(companyId) ? companyId[0] : companyId;
  const company = id ? COMPANIES[id] : null;

  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [savedIds, setSavedIds]   = useState<string[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setSavedIds([]);
      return;
    }
    const fetchSavedIds = async () => {
      try {
        const res = await axiosInstance.get("/saved/ids");
        setSavedIds(res.data.data || []);
      } catch (error) {
        console.log(error);
      }
    };
    fetchSavedIds();
  }, [user]);

  useEffect(() => {
    if (!company) return;
    const fetchQuestions = async () => {
      try {
        const res = await axiosInstance.get("/question/getallquestion");
        const all = res.data.data;
        const matched = all.filter((q: any) =>
          q.questiontags?.some((t: string) =>
            company.tags.includes(t.trim().toLowerCase())
          )
        );
        setQuestions(matched);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [company]);

  if (!company) {
    return (
      <Mainlayout>
        <div className="p-6 text-gray-500">Company not found.</div>
      </Mainlayout>
    );
  }

  return (
    <Mainlayout>
      <Head>
        <title>{company.name} — StackClone</title>
      </Head>
      <div className="p-4 lg:p-6 max-w-5xl">

        {/* Company Header */}
        <div className="bg-white border rounded-xl p-6 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <div className="w-16 h-16 rounded-xl border flex items-center justify-center bg-gray-50 flex-shrink-0 overflow-hidden">
              <img
                src={company.logo}
                alt={company.name}
                className="w-10 h-10 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                  (e.target as HTMLImageElement).parentElement!.innerText = company.name[0];
                }}
              />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {company.industry}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-4">{company.fullDescription}</p>

              {/* Company details grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Headquarters</p>
                  <p className="text-gray-700 font-medium text-xs">{company.headquarters}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Founded</p>
                  <p className="text-gray-700 font-medium">{company.founded}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Employees</p>
                  <p className="text-gray-700 font-medium">{company.employees}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Questions</p>
                  <p className="text-gray-700 font-medium">{loading ? "..." : questions.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Related tags */}
          <div className="mt-4 pt-4 border-t flex flex-wrap gap-2 items-center">
            <span className="text-xs text-gray-500 mr-1">Related tags:</span>
            {company.tags.map((tag: string) => (
              <Link key={tag} href={`/tags/${encodeURIComponent(tag)}`}>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded hover:bg-blue-200 cursor-pointer">
                  {tag}
                </span>
              </Link>
            ))}
          </div>

          {company.website && (
            <div className="mt-4">
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded"
              >
                View Job Openings →
              </a>
            </div>
          )}
        </div>

        {/* Related Questions */}
        <h2 className="text-lg font-semibold mb-4 text-gray-900">
          {loading ? "Loading..." : `${questions.length} Related Question${questions.length !== 1 ? "s" : ""}`}
        </h2>

        {loading ? (
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
        ) : questions.length === 0 ? (
          <div className="text-center py-10 border rounded-lg bg-white">
            <p className="text-gray-500 mb-2">No questions found for {company.name} yet.</p>
            <Link
              href="/ask"
              className="inline-block mt-2 bg-blue-600 text-white px-4 py-2 rounded text-sm"
            >
              Ask the first question
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((q: any) => (
              <div key={q._id} className="border-b border-gray-200 pb-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex sm:flex-col items-center text-sm text-gray-600 sm:w-16 gap-4 sm:gap-2">
                    <div className="text-center">
                      <div className="font-medium">
                        {(q.upvote?.length || 0) - (q.downvote?.length || 0)}
                      </div>
                      <div className="text-xs">votes</div>
                    </div>
                    <div className="text-center">
                      <div className={`font-medium px-2 py-1 rounded ${
                        q.answer?.length > 0 ? "text-green-700 bg-green-100" : "text-gray-600"
                      }`}>
                        {q.answer?.length || 0}
                      </div>
                      <div className="text-xs">answers</div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Link
                        href={`/questions/${q._id}`}
                        className="text-blue-600 hover:text-blue-800 text-base font-medium block"
                      >
                        {q.questiontitle}
                      </Link>
                      <SaveButton
                        questionId={q._id}
                        initialSaved={savedIds.includes(q._id)}
                        onToggled={(saved) =>
                          setSavedIds((prev) =>
                            saved ? [...prev, q._id] : prev.filter((id) => id !== q._id)
                          )
                        }
                        className="flex-shrink-0"
                      />
                    </div>
                    <p className="text-gray-700 text-sm mb-3 line-clamp-2">{q.questionbody}</p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {q.questiontags.map((t: string) => (
                        <Link key={t} href={`/tags/${encodeURIComponent(t.toLowerCase())}`}>
                          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer">
                            {t}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <Link href={`/users/${q.userid}`} className="flex items-center">
                        <Avatar className="w-4 h-4 mr-1">
                          <AvatarFallback className="text-xs">{q.userposted?.[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-blue-600 hover:text-blue-800 mr-1">{q.userposted}</span>
                      </Link>
                      <span>asked {new Date(q.askedon).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Mainlayout>
  );
}

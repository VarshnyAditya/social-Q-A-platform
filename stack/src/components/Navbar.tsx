import { useAuth } from "@/lib/AuthContext";
import { cn } from "@/lib/utils";
import {
  Bookmark,
  Bot,
  Building,
  ChevronDown,
  FileText,
  Menu,
  MessageSquareIcon,
  Search,
  Tag,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

// const User = {
//   _id: "1",
//   name: "Alice Johnson",
// };

const PRODUCT_ITEMS = [
  {
    label: "Ask Questions",
    description: "Ask programming questions and get community answers.",
    href: "/ask",
    icon: MessageSquareIcon,
  },
  {
    label: "Articles",
    description: "Read technical articles and tutorials.",
    href: "/articles",
    icon: FileText,
  },
  {
    label: "AI Assist",
    description: "Chat with an AI assistant for programming help.",
    href: "/ai-assist",
    icon: Bot,
  },
  {
    label: "Challenges",
    description: "Explore sample coding challenges.",
    href: "/challenges",
    icon: Trophy,
  },
  {
    label: "Tags",
    description: "Browse questions by technologies and topics.",
    href: "/tags",
    icon: Tag,
  },
  {
    label: "Companies",
    description: "Discover popular tech companies and related discussions.",
    href: "/companies",
    icon: Building,
  },
  {
    label: "Saves",
    description: "Access your bookmarked questions.",
    href: "#",
    icon: Bookmark,
  },
];

const Navbar = ({ handleslidein }: any) => {
  const { user, Logout } = useAuth();
  const [hasMounted, setHasMounted] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [teamsOpen, setTeamsOpen] = useState(false);
  const productsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Close the Products dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (productsRef.current && !productsRef.current.contains(e.target as Node)) {
        setProductsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlelogout = () => {
    Logout();
  };

  return (
    <div className="relative top-0 z-50 w-full min-h-[53px] bg-white border-t-[3px] border-[#ef8236] shadow-[0_1px_5px_#00000033] flex items-center justify-center">
      <div className="w-[90%] max-w-[1440px] flex items-center justify-between mx-auto py-1">
        <button
          aria-label="Toggle sidebar"
          className="sm:block md:hidden p-2 rounded hover:bg-gray-100 transition"
          onClick={handleslidein}
        >
          <Menu className="w-5 h-5 text-gray-800" />
        </button>
        <div className="flex items-center gap-2 flex-grow">
          <Link href="/" className="px-3 py-1">
            <img src="/logo.png" alt="Logo" className="h-6 w-auto" />
          </Link>

          <div className="hidden sm:flex gap-1 items-center">
            <Link
              href="/"
              className="text-sm text-[#454545] font-medium px-4 py-2 rounded hover:bg-gray-200 transition"
            >
              About
            </Link>

            {/* ---- Products: click-to-open dropdown ---- */}
            <div className="relative" ref={productsRef}>
              <button
                type="button"
                onClick={() => setProductsOpen((s) => !s)}
                className={cn(
                  "flex items-center gap-1 text-sm text-[#454545] font-medium px-4 py-2 rounded hover:bg-gray-200 transition",
                  productsOpen && "bg-gray-200"
                )}
              >
                Products
                <ChevronDown
                  className={cn(
                    "w-3.5 h-3.5 transition-transform duration-200",
                    productsOpen && "rotate-180"
                  )}
                />
              </button>

              <div
                className={cn(
                  "absolute left-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 origin-top transition-all duration-200",
                  productsOpen
                    ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 scale-95 -translate-y-1 pointer-events-none"
                )}
              >
                {PRODUCT_ITEMS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setProductsOpen(false)}
                      className="flex items-start gap-3 px-4 py-2.5 hover:bg-gray-50 transition"
                    >
                      <Icon className="w-4 h-4 mt-0.5 text-orange-500 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">{item.label}</p>
                        <p className="text-xs text-gray-500">{item.description}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* ---- For Teams: hover popover ---- */}
            <div
              className="relative"
              onMouseEnter={() => setTeamsOpen(true)}
              onMouseLeave={() => setTeamsOpen(false)}
            >
              <button
                type="button"
                className="text-sm text-[#454545] font-medium px-4 py-2 rounded hover:bg-gray-200 transition"
              >
                For Teams
              </button>

              {/* Transparent bridge (pt-2) keeps hover alive between button and card */}
              <div
                className={cn(
                  "absolute left-0 top-full w-72 pt-2 origin-top transition-all duration-200",
                  teamsOpen
                    ? "opacity-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 -translate-y-1 pointer-events-none"
                )}
              >
                <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
                  <p className="text-sm font-semibold text-gray-900 mb-1">
                    CodeQuest for Teams
                  </p>
                  <p className="text-xs text-gray-500 mb-3">
                    A private space where teams can ask questions, share knowledge, and
                    collaborate securely.
                  </p>
                  <Link
                    href="/"
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded transition"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <form className="hidden lg:block flex-grow relative px-3">
            <input
              type="text"
              placeholder="Search..."
              className="w-full max-w-[600px] pl-9 pr-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
            <Search className="absolute left-4 top-2.5 h-4 w-4 text-gray-600" />
          </form>
        </div>
        <div className="flex items-center gap-2">
           {!hasMounted ? null : !user ? (
            <Link
              href="/auth"
              className="text-sm font-medium text-[#454545] bg-[#e7f8fe] hover:bg-[#d3e4eb] border border-blue-500 px-4 py-1.5 rounded transition"
            >
              Log in
            </Link>
          ) : (
            <>
              <Link
                href={`/users/${user._id}`}
                className="flex items-center justify-center bg-orange-600 text-white text-sm font-semibold w-9 h-9 rounded-full"
              >
                {user.name?.charAt(0).toUpperCase()}
              </Link>

              <button
                onClick={handlelogout}
                className="text-sm font-medium text-[#454545] bg-[#e7f8fe] hover:bg-[#d3e4eb] border border-blue-500 px-4 py-1.5 rounded transition"
              >
                Log out
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;

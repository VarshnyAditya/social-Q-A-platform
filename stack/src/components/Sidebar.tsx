import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/LanguageContext";
import {
  Bookmark,
  Bot,
  Building,
  CreditCard,
  FileText,
  Home,
  MessageSquare,
  MessageSquareIcon,
  Star,
  Tag,
  Trophy,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { Badge } from "./ui/badge";

const Sidebar = ({ isopen, isMobile, onClose }: any) => {
  const { t } = useLanguage();
  const router = useRouter();

  // "/" only matches the home page itself; every other entry also matches
  // its own nested routes (e.g. /questions/[id] keeps "Questions" active).
  const isActive = (href: string) =>
    href === "/" ? router.pathname === "/" : router.pathname.startsWith(href);

  const navItems = [
    { href: "/", label: t("nav.home"), icon: Home },
    { href: "/questions", label: t("nav.questions"), icon: MessageSquareIcon },
    { href: "/ai-assist", label: t("nav.aiAssist"), icon: Bot, badge: { text: "Labs", className: "" } },
    { href: "/tags", label: t("nav.tags"), icon: Tag },
    { href: "/users", label: t("nav.users"), icon: Users },
    {
      href: "/subscription",
      label: t("nav.subscription"),
      icon: CreditCard,
      badge: { text: "PRO", className: "bg-yellow-100 text-yellow-800" },
    },
    {
      href: "/points",
      label: t("nav.points"),
      icon: Star,
      badge: { text: "NEW", className: "bg-green-100 text-green-700" },
    },
    { href: "/saved", label: t("nav.saved"), icon: Bookmark },
    {
      href: "/challenges",
      label: t("nav.challenges"),
      icon: Trophy,
      badge: { text: "NEW", className: "bg-orange-100 text-orange-800" },
    },
    { href: "/social", label: t("nav.social"), icon: MessageSquare },
    { href: "/articles", label: t("nav.articles"), icon: FileText },
    { href: "/companies", label: t("nav.companies"), icon: Building },
  ];

  return (
    <aside
      className={cn(
        "bg-white shadow-sm border-r transition-all duration-300 ease-in-out overflow-hidden",
        isMobile
          ? cn(
              "fixed top-[53px] left-0 h-[calc(100vh-53px)] w-64 z-40",
              isopen ? "translate-x-0" : "-translate-x-full"
            )
          : cn(
              "h-full",
              isopen ? "w-48 lg:w-64 opacity-100" : "w-0 opacity-0 pointer-events-none border-r-0"
            )
      )}
    >
      <nav className="p-2 lg:p-4 w-48 lg:w-64 h-full overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map(({ href, label, icon: Icon, badge }) => {
            const active = isActive(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center px-2 py-2 rounded text-sm transition-colors",
                    active
                      ? "bg-[#ef8236] text-white hover:bg-[#ef8236]"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Icon className="w-4 h-4 mr-2 lg:mr-3" />
                  {label}
                  {badge && (
                    <Badge
                      variant="secondary"
                      className={cn(
                        "ml-auto text-xs",
                        active ? "bg-white/20 text-white" : badge.className
                      )}
                    >
                      {badge.text}
                    </Badge>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
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
import React from "react";
import { Badge } from "./ui/badge";

const Sidebar = ({ isopen, isMobile, onClose }: any) => {
  const { t } = useLanguage();
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
            <li>
              <Link href="/" onClick={onClose} className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm">
                <Home className="w-4 h-4 mr-2 lg:mr-3" />
                {t("nav.home")}
              </Link>
            </li>
            <li>
              <Link href="/questions" onClick={onClose} className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm">
                <MessageSquareIcon className="w-4 h-4 mr-2 lg:mr-3" />
                {t("nav.questions")}
              </Link>
            </li>
            <li>
              <Link href="/ai-assist" onClick={onClose} className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm">
                <Bot className="w-4 h-4 mr-2 lg:mr-3" />
                {t("nav.aiAssist")}
                <Badge variant="secondary" className="ml-auto text-xs">Labs</Badge>
              </Link>
            </li>
            <li>
              <Link href="/tags" onClick={onClose} className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm">
                <Tag className="w-4 h-4 mr-2 lg:mr-3" />
                {t("nav.tags")}
              </Link>
            </li>
            <li>
              <Link href="/users" onClick={onClose} className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm">
                <Users className="w-4 h-4 mr-2 lg:mr-3" />
                {t("nav.users")}
              </Link>
            </li>
            <li>
              <Link href="/subscription" onClick={onClose} className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm">
                <CreditCard className="w-4 h-4 mr-2 lg:mr-3" />
                {t("nav.subscription")}
                <Badge variant="secondary" className="ml-auto text-xs bg-yellow-100 text-yellow-800">PRO</Badge>
              </Link>
            </li>
            <li>
              <Link href="/points" onClick={onClose} className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm">
                <Star className="w-4 h-4 mr-2 lg:mr-3" />
                {t("nav.points")}
                <Badge variant="secondary" className="ml-auto text-xs bg-green-100 text-green-700">NEW</Badge>
              </Link>
            </li>
            <li>
              <Link href="/saved" onClick={onClose} className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm">
                <Bookmark className="w-4 h-4 mr-2 lg:mr-3" />
                {t("nav.saved")}
              </Link>
            </li>
            <li>
              <Link href="/challenges" onClick={onClose} className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm">
                <Trophy className="w-4 h-4 mr-2 lg:mr-3" />
                {t("nav.challenges")}
                <Badge variant="secondary" className="ml-auto text-xs bg-orange-100 text-orange-800">NEW</Badge>
              </Link>
            </li>
            <li>
              <Link href="/social" onClick={onClose} className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm">
                <MessageSquare className="w-4 h-4 mr-2 lg:mr-3" />
                {t("nav.social")}
              </Link>
            </li>
            <li>
              <Link href="/articles" onClick={onClose} className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm">
                <FileText className="w-4 h-4 mr-2 lg:mr-3" />
                {t("nav.articles")}
              </Link>
            </li>
            <li>
              <Link href="/companies" onClick={onClose} className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm">
              <Building className="w-4 h-4 mr-2 lg:mr-3" />
              {t("nav.companies")}
              </Link>
            </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
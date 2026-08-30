import Mainlayout from "@/layout/Mainlayout";
import { useAuth } from "@/lib/AuthContext";
import { History, ShieldAlert, Users, Users2 } from "lucide-react";
import { useState } from "react";
import ReportsPanel from "@/components/admin/ReportsPanel";
import UsersPanel from "@/components/admin/UsersPanel";
import TeamsPanel from "@/components/admin/TeamsPanel";
import AuditLogPanel from "@/components/admin/AuditLogPanel";

type Section = "reports" | "users" | "teams" | "auditlog";

const SECTIONS: { key: Section; label: string; icon: any }[] = [
  { key: "reports", label: "Reports", icon: ShieldAlert },
  { key: "users", label: "Users", icon: Users },
  { key: "teams", label: "Teams", icon: Users2 },
  { key: "auditlog", label: "Audit Log", icon: History },
];

export default function AdminPage() {
  const { user } = useAuth();
  const [section, setSection] = useState<Section>("reports");

  const isAdmin = user?.role === "admin";

  if (!user) {
    return (
      <Mainlayout>
        <div className="max-w-md mx-auto text-center py-16">
          <p className="text-gray-500">Log in to continue.</p>
        </div>
      </Mainlayout>
    );
  }

  if (!isAdmin) {
    return (
      <Mainlayout>
        <div className="max-w-md mx-auto text-center py-16">
          <ShieldAlert className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">You don't have access to this page.</p>
        </div>
      </Mainlayout>
    );
  }

  return (
    <Mainlayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1 flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-orange-500" /> Admin
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Review reports, manage users and teams, and track moderation activity.
        </p>

        <div className="flex gap-1 mb-6 border-b overflow-x-auto">
          {SECTIONS.map((s) => (
            <button
              key={s.key}
              onClick={() => setSection(s.key)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition ${
                section === s.key
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <s.icon className="w-4 h-4" />
              {s.label}
            </button>
          ))}
        </div>

        {section === "reports" && <ReportsPanel />}
        {section === "users" && <UsersPanel />}
        {section === "teams" && <TeamsPanel />}
        {section === "auditlog" && <AuditLogPanel />}
      </div>
    </Mainlayout>
  );
}
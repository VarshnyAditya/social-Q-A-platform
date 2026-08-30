import { useAuth } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ShieldOff, ShieldCheck, UserX } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  banned: boolean;
  joinDate: string;
}

export default function UsersPanel() {
  const { user: currentUser } = useAuth();
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  const fetchUsers = async (q = "") => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/admin/users${q ? `?search=${encodeURIComponent(q)}` : ""}`);
      setUsers(res.data.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Could not load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(search);
  };

  const act = async (id: string, action: "ban" | "unban" | "promote" | "demote") => {
    setActingId(id);
    try {
      const res = await axiosInstance.patch(`/admin/users/${id}/${action}`);
      setUsers((prev) => prev.map((u) => (u._id === id ? res.data.data : u)));
      toast.success("Updated");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Could not update user");
    } finally {
      setActingId(null);
    }
  };

  return (
    <div>
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email"
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : users.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-16">No users found.</p>
      ) : (
        <div className="space-y-2">
          {users.map((u) => {
            const isSelf = u._id === currentUser?._id;
            return (
              <div
                key={u._id}
                className="border rounded-lg p-3 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-gray-900 truncate">{u.name}</p>
                    {u.role === "admin" && (
                      <Badge className="bg-orange-100 text-orange-800 text-[10px]">Admin</Badge>
                    )}
                    {u.banned && (
                      <Badge className="bg-red-100 text-red-800 text-[10px]">Suspended</Badge>
                    )}
                    {isSelf && (
                      <Badge variant="secondary" className="text-[10px]">
                        You
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">{u.email}</p>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  {u.banned ? (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={actingId === u._id}
                      onClick={() => act(u._id, "unban")}
                      className="text-green-700 border-green-300 hover:bg-green-50"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Unban
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={actingId === u._id || isSelf}
                      onClick={() => act(u._id, "ban")}
                      className="text-red-700 border-red-300 hover:bg-red-50"
                    >
                      <UserX className="w-3.5 h-3.5 mr-1" /> Ban
                    </Button>
                  )}
                  {u.role === "admin" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={actingId === u._id || isSelf}
                      onClick={() => act(u._id, "demote")}
                      className="text-gray-600"
                    >
                      <ShieldOff className="w-3.5 h-3.5 mr-1" /> Demote
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={actingId === u._id}
                      onClick={() => act(u._id, "promote")}
                      className="text-orange-600 border-orange-300 hover:bg-orange-50"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Make Admin
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
import { useEffect, useState } from "react";
import Head from "next/head";
import Mainlayout from "@/layout/Mainlayout";
import axiosInstance from "@/lib/axiosinstance";
import { useAuth } from "@/lib/AuthContext";
import { useLanguage } from "@/lib/LanguageContext";
import { toast } from "react-toastify";

type Transaction = {
  _id: string;
  type: "earned" | "deducted" | "transferred_out" | "transferred_in";
  amount: number;
  reason: string;
  relatedUser: string | null;
  date: string;
};

type SearchedUser = {
  _id: string;
  name: string;
  email: string;
};

const TYPE_STYLE: Record<string, { label: string; color: string; sign: string }> = {
  earned:           { label: "Earned",      color: "text-green-600",  sign: "+" },
  deducted:         { label: "Deducted",    color: "text-red-500",    sign: "-" },
  transferred_out:  { label: "Transferred", color: "text-orange-500", sign: "-" },
  transferred_in:   { label: "Received",    color: "text-blue-500",   sign: "+" },
};

export default function PointsPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [totalPoints, setTotalPoints]       = useState<number>(0);
  const [transactions, setTransactions]     = useState<Transaction[]>([]);
  const [searchName, setSearchName]         = useState("");
  const [searchResults, setSearchResults]   = useState<SearchedUser[]>([]);
  const [selectedUser, setSelectedUser]     = useState<SearchedUser | null>(null);
  const [transferAmount, setTransferAmount] = useState("");
  const [searching, setSearching]           = useState(false);
  const [transferring, setTransferring]     = useState(false);

  const fetchMyStats = async () => {
    try {
      const res = await axiosInstance.get("/points/mystats");
      setTotalPoints(res.data.totalPoints);
      setTransactions(res.data.transactions);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (user) fetchMyStats();
  }, [user]);

  const handleSearch = async () => {
    if (!searchName || searchName.trim().length < 2) {
      toast.error("Enter at least 2 characters to search");
      return;
    }
    setSearching(true);
    setSelectedUser(null);
    try {
      const res = await axiosInstance.get(`/points/search?name=${searchName.trim()}`);
      setSearchResults(res.data.users);
      if (res.data.users.length === 0) toast.info("No users found");
    } catch (error) {
      toast.error("Search failed");
    } finally {
      setSearching(false);
    }
  };

  const handleTransfer = async () => {
    if (!selectedUser) {
      toast.error("Select a user to transfer to");
      return;
    }
    const amt = parseInt(transferAmount);
    if (!amt || amt <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    setTransferring(true);
    try {
      const res = await axiosInstance.post("/points/transfer", {
        toUserid: selectedUser._id,
        amount: amt,
      });
      toast.success(res.data.message);
      setTransferAmount("");
      setSelectedUser(null);
      setSearchResults([]);
      setSearchName("");
      fetchMyStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Transfer failed");
    } finally {
      setTransferring(false);
    }
  };

  if (!user) {
    return (
      <Mainlayout>
        <div className="p-6 text-gray-500">Please log in to view your points.</div>
      </Mainlayout>
    );
  }

  return (
    <Mainlayout>
      <Head>
        <title>My Rewards</title>
      </Head>
      <div className="p-4 lg:p-6 max-w-3xl">

        {/* ---- Balance card ---- */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-400 rounded-xl p-6 text-white mb-6 shadow">
          <p className="text-sm opacity-80 mb-1">{t("pages.pointsBalance")}</p>
          <p className="text-5xl font-bold">{totalPoints}</p>
          <p className="text-sm opacity-80 mt-1">points</p>
        </div>

        {/* ---- Transfer section ---- */}
        <div className="bg-white border rounded-xl p-5 mb-6 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">{t("pages.transferPoints")}</h2>

          {totalPoints <= 10 && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded px-3 py-2 mb-4">
              You need more than 10 points to transfer. Earn more by answering questions!
            </p>
          )}

          {/* Search */}
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="Search user by name..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <button
              onClick={handleSearch}
              disabled={searching}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded text-sm font-medium"
            >
              {searching ? "..." : "Search"}
            </button>
          </div>

          {/* Search results */}
          {searchResults.length > 0 && (
            <div className="border rounded mb-3 divide-y max-h-40 overflow-y-auto">
              {searchResults.map((u) => (
                <div
                  key={u._id}
                  onClick={() => {
                    setSelectedUser(u);
                    setSearchResults([]);
                    setSearchName(u.name);
                  }}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-orange-50 flex justify-between items-center ${
                    selectedUser?._id === u._id ? "bg-orange-50 font-medium" : ""
                  }`}
                >
                  <span>{u.name}</span>
                  <span className="text-gray-400 text-xs">{u.email}</span>
                </div>
              ))}
            </div>
          )}

          {/* Selected user + amount */}
          {selectedUser && (
            <div className="flex gap-2 items-center">
              <div className="flex-1 bg-orange-50 border border-orange-200 rounded px-3 py-2 text-sm text-orange-700 font-medium">
                → {selectedUser.name}
              </div>
              <input
                type="number"
                min={1}
                placeholder="Points"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                className="w-24 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <button
                onClick={handleTransfer}
                disabled={transferring || totalPoints <= 10}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2 rounded text-sm font-medium"
              >
                {transferring ? "..." : "Transfer"}
              </button>
            </div>
          )}
        </div>

        {/* ---- Transaction history ---- */}
        <div className="bg-white border rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">{t("pages.transactionHistory")}</h2>
          {transactions.length === 0 ? (
            <p className="text-sm text-gray-400">
              No transactions yet. Start by answering a question!
            </p>
          ) : (
            <div className="divide-y">
              {transactions.map((t) => {
                const style = TYPE_STYLE[t.type];
                return (
                  <div key={t._id} className="py-3 flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-700">{t.reason}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(t.date).toLocaleString("en-IN", {
                          timeZone: "Asia/Kolkata",
                        })}
                      </p>
                    </div>
                    <span className={`font-bold text-sm ${style.color}`}>
                      {style.sign}{t.amount} pts
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </Mainlayout>
  );
}
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import Mainlayout from "@/layout/Mainlayout";
import axiosInstance from "@/lib/axiosinstance";
import { useAuth } from "@/lib/AuthContext";
import { Calendar, Search, Users } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const UsersPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setusers] = useState<any[]>([]);
  const [loading, setloading] = useState(true);
  const [search, setSearch] = useState("");
  const [myFriends, setMyFriends] = useState<string[]>([]);

  useEffect(() => {
    const fetchuser = async () => {
      try {
        const res = await axiosInstance.get("/user/getalluser");
        setusers(res.data.data);
      } catch (error) {
        console.log(error);
      } finally {
        setloading(false);
      }
    };

    const fetchFriends = async () => {
      if (!currentUser) return;
      try {
        const res = await axiosInstance.get("/social/friend/mydata");
        const friendIds = res.data.data.friends.map((f: any) => f._id);
        setMyFriends(friendIds);
      } catch (error) {
        console.log(error);
      }
    };

    fetchuser();
    fetchFriends();
  }, [currentUser]);

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <Mainlayout>
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </Mainlayout>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="text-center text-gray-500 mt-4">No users found.</div>
    );
  }

  return (
    <Mainlayout>
      <div className="max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl lg:text-2xl font-semibold">Users</h1>
          {currentUser && myFriends.length > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
              <Users className="w-4 h-4 text-blue-500" />
              <span><span className="font-semibold text-blue-600">{myFriends.length}</span> {myFriends.length === 1 ? "friend" : "friends"}</span>
            </div>
          )}
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Filter by user"
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((user: any) => {
            const isFriend = myFriends.includes(user._id);
            const isMe = currentUser && user._id === String(currentUser._id);

            return (
              <Link key={user._id} href={`/users/${user._id}`}>
                <div className="relative border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">

                  {/* Friend / You badge */}
                  {isMe && (
                    <span className="absolute top-3 right-3 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                      You
                    </span>
                  )}
                  {!isMe && isFriend && (
                    <span className="absolute top-3 right-3 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Friend
                    </span>
                  )}

                  <div className="flex items-center mb-3">
                    <Avatar className="w-12 h-12 mr-3">
                      <AvatarFallback className={`text-lg ${isFriend && !isMe ? "bg-green-100 text-green-700" : ""}`}>
                        {user.name
                          .split(" ")
                          .map((n: any) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-blue-600 hover:text-blue-800 truncate">
                        {user.name}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">
                        @{user.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>Joined {new Date(user.joinDate).getFullYear()}</span>
                    </div>
                    {/* Friend count on their card */}
                    {user.friends && user.friends.length > 0 && (
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Users className="w-3 h-3" />
                        <span>{user.friends.length}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </Mainlayout>
  );
};

export default UsersPage;

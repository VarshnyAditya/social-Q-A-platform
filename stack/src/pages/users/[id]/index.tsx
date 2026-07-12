import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Mainlayout from "@/layout/Mainlayout";
import { useAuth } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import { Calendar, Coins, Edit, Monitor, Plus, Smartphone, X } from "lucide-react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
const index = () => {
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const [users, setusers] = useState<any>(null);
  const [loading, setloading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    about: "",
    tags: [] as string[],
    phone: "",
  });
  const [newTag, setNewTag] = useState("");

  // ---- Task 4: reward points (sourced from the real Points collection) ----
  const [profilePoints, setProfilePoints] = useState<number | null>(null);
  const [pointsLoading, setPointsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [transferTarget, setTransferTarget] = useState<any>(null);
  const [transferAmount, setTransferAmount] = useState("");
  const [transferLoading, setTransferLoading] = useState(false);

  // ---- Task 5: login history state (owner-only) ----
  const [loginHistory, setLoginHistory] = useState<any[]>([]);
  const [loginHistoryLoading, setLoginHistoryLoading] = useState(false);

  useEffect(() => {
    const fetchuser = async () => {
      try {
        const res = await axiosInstance.get("/user/getalluser");
        const matcheduser = res.data.data.find((u: any) => u._id === id);
        setusers(matcheduser);
      } catch (error) {
        console.log(error);
      } finally {
        setloading(false);
      }
    };
    fetchuser();
  }, [id]);

  // Whenever the edit dialog opens, snapshot the *current* profile data into
  // the form. editForm previously only ever got its initial values at mount
  // (when `users` was still null), so it always started blank/stale — this
  // fixes that and also seeds the newly-added phone field.
  useEffect(() => {
    if (isEditing && users) {
      setEditForm({
        name: users.name || "",
        about: users.about || "",
        tags: users.tags || [],
        phone: users.phone || "",
      });
    }
  }, [isEditing, users]);

  // Reward points are public — anyone viewing this profile sees this user's total,
  // same as the Reward Tab, since both now read from the same Points collection.
  useEffect(() => {
    const fetchPoints = async () => {
      if (!id) return;
      setPointsLoading(true);
      try {
        const res = await axiosInstance.get(`/points/user/${id}`);
        setProfilePoints(res.data.totalPoints ?? 0);
      } catch (error) {
        console.log(error);
        setProfilePoints(0);
      } finally {
        setPointsLoading(false);
      }
    };
    fetchPoints();
  }, [id]);

  // Debounced search against your real /points/search endpoint (owner only, for transfers)
  useEffect(() => {
    if (!searchTerm || searchTerm.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        const res = await axiosInstance.get("/points/search", {
          params: { name: searchTerm.trim() },
        });
        setSearchResults(res.data.users || []);
      } catch (error) {
        console.log(error);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  useEffect(() => {
    const fetchLoginHistory = async () => {
      if (!user?._id || id !== user._id) return;
      setLoginHistoryLoading(true);
      try {
        const res = await axiosInstance.get(`/user/login-history/${user._id}`);
        setLoginHistory(res.data.data || []);
      } catch (error) {
        console.log(error);
      } finally {
        setLoginHistoryLoading(false);
      }
    };
    fetchLoginHistory();
  }, [id, user?._id]);
  if (loading) {
    return (
      <Mainlayout>
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </Mainlayout>
    );
  }
  if (!users || users.length === 0) {
    return <div className="text-center text-gray-500 mt-4">No user found.</div>;
  }

  const handleSaveProfile = async () => {
    if (editForm.phone && !/^\d{10}$/.test(editForm.phone)) {
      toast.error("Phone number must be exactly 10 digits");
      return;
    }
    try {
      const res = await axiosInstance.patch(`/user/update/${user?._id}`, {
        editForm,
      });
      if (res.data.data) {
        const updatedUser = {
          ...users,
          name: editForm.name,
          about: editForm.about,
          tags: editForm.tags,
          phone: editForm.phone,
        };

        setusers(updatedUser);
        // Keep the navbar avatar, welcome text, etc in sync immediately —
        // otherwise they'd stay stale until the next login.
        updateUser({ name: editForm.name, about: editForm.about, tags: editForm.tags, phone: editForm.phone });
        setIsEditing(false);
        toast.success("Profile updated successfully!");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  const handleTransferPoints = async () => {
    if (!transferTarget) return;
    const amount = parseInt(transferAmount, 10);
    if (!amount || amount <= 0) {
      toast.error("Enter a valid number of points");
      return;
    }
    setTransferLoading(true);
    try {
      const res = await axiosInstance.post("/points/transfer", {
        toUserid: transferTarget._id,
        amount,
      });
      toast.success(res.data.message || "Points transferred!");
      setProfilePoints(res.data.newBalance);
      setTransferTarget(null);
      setSearchTerm("");
      setSearchResults([]);
      setTransferAmount("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Transfer failed");
    } finally {
      setTransferLoading(false);
    }
  };

  const handleAddTag = () => {
    const trimmedTag = newTag.trim();
    if (trimmedTag && !editForm.tags.includes(trimmedTag)) {
      setEditForm({ ...editForm, tags: [...editForm.tags, trimmedTag] });
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setEditForm({
      ...editForm,
      tags: editForm.tags.filter((tag: any) => tag !== tagToRemove),
    });
  };

  const currentUserId = user?._id;
  const isOwnProfile = id === currentUserId;
  return (
    <Mainlayout>
      <div className="max-w-6xl">
        {/* User Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 mb-8">
          <Avatar className="w-24 h-24 lg:w-32 lg:h-32">
            <AvatarFallback className="text-2xl lg:text-3xl">
              {users.name
                .split(" ")
                .map((n: any) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-1">
                  {users.name}
                </h1>
              </div>

              {isOwnProfile && (
                <Dialog open={isEditing} onOpenChange={setIsEditing}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 bg-transparent"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white text-gray-900">
                    <DialogHeader>
                      <DialogTitle>Edit Profile</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                      {/* Basic Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">
                          Basic Information
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="name">Display Name</Label>
                            <Input
                              id="name"
                              value={editForm.name}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  name: e.target.value,
                                })
                              }
                              placeholder="Your display name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                              id="phone"
                              type="tel"
                              value={editForm.phone}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  phone: e.target.value,
                                })
                              }
                              placeholder="10-digit phone number"
                            />
                            <p className="text-xs text-gray-400 mt-1">
                              Required to verify most language switches by SMS OTP.
                            </p>
                          </div>
                        </div>
                      </div>
                      {/* About Section */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">About</h3>
                        <div>
                          <Label htmlFor="about">About Me</Label>
                          <Textarea
                            id="about"
                            value={editForm.about}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                about: e.target.value,
                              })
                            }
                            placeholder="Tell us about yourself, your experience, and interests..."
                            className="min-h-32"
                          />
                        </div>
                      </div>

                      {/* Tags/Skills Section */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">
                          Skills & Technologies
                        </h3>

                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <Input
                              value={newTag}
                              onChange={(e) => setNewTag(e.target.value)}
                              placeholder="Add a skill or technology"
                              onKeyPress={(e) =>
                                e.key === "Enter" && handleAddTag()
                              }
                            />
                            <Button
                              onClick={handleAddTag}
                              variant="outline"
                              size="sm"
                              className="bg-orange-600 text-white"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {editForm.tags.map((tag: any) => {
                              return (
                                <Badge
                                  key={tag}
                                  variant="secondary"
                                  className="bg-orange-100 text-orange-800 flex items-center gap-1"
                                >
                                  {tag}
                                  <button
                                    onClick={() => handleRemoveTag(tag)}
                                    className="ml-1 hover:text-red-600"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button
                          variant="outline"
                          onClick={() => setIsEditing(false)}
                          className="bg-white text-gray-800 hover:text-gray-900"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSaveProfile}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                Member since{" "}
                {new Date(users.joinDate).toISOString().split("T")[0]}
              </div>
            </div>
            <div className="flex flex-wrap items-center space-x-6 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                <span className="font-semibold">5</span>
                <span className="text-gray-600 ml-1">gold badges</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
                <span className="font-semibold">23</span>
                <span className="text-gray-600 ml-1">silver badges</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-amber-600 rounded-full mr-2"></div>
                <span className="font-semibold">45</span>
                <span className="text-gray-600 ml-1">bronze badges</span>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1  gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {users.about}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-yellow-500" />
                  Reward Points
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-800 mb-1">
                  {pointsLoading ? "..." : profilePoints ?? 0}
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Earn 5 points for every answer you post, plus a 5-point
                  bonus every time an answer's upvotes cross a multiple of 5.
                </p>

                {isOwnProfile && (
                  <div className="border-t pt-4 mt-2">
                    <h4 className="text-sm font-semibold mb-2">
                      Transfer Points
                    </h4>
                    {(profilePoints ?? 0) <= 10 ? (
                      <p className="text-xs text-gray-500">
                        You need more than 10 points to transfer points to
                        another user.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        <Input
                          placeholder="Search user by name..."
                          value={searchTerm}
                          onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setTransferTarget(null);
                          }}
                        />
                        {searchTerm && !transferTarget && searchResults.length > 0 && (
                          <div className="border rounded max-h-40 overflow-y-auto bg-white">
                            {searchResults.map((u) => (
                              <button
                                key={u._id}
                                type="button"
                                onClick={() => {
                                  setTransferTarget(u);
                                  setSearchTerm(u.name);
                                  setSearchResults([]);
                                }}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                              >
                                {u.name}
                              </button>
                            ))}
                          </div>
                        )}
                        <Input
                          type="number"
                          min={1}
                          placeholder="Points to transfer"
                          value={transferAmount}
                          onChange={(e) => setTransferAmount(e.target.value)}
                        />
                        <Button
                          onClick={handleTransferPoints}
                          disabled={
                            !transferTarget || !transferAmount || transferLoading
                          }
                          className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                          {transferLoading ? "Sending..." : "Transfer"}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {isOwnProfile && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="w-5 h-5 text-gray-500" />
                    Login History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loginHistoryLoading ? (
                    <p className="text-sm text-gray-500">Loading...</p>
                  ) : loginHistory.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      No login history recorded yet.
                    </p>
                  ) : (
                    <div className="space-y-3 max-h-72 overflow-y-auto">
                      {loginHistory.map((entry: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 text-sm border-b last:border-b-0 pb-3 last:pb-0"
                        >
                          {entry.deviceType === "mobile" ? (
                            <Smartphone className="w-4 h-4 mt-0.5 text-gray-400 shrink-0" />
                          ) : (
                            <Monitor className="w-4 h-4 mt-0.5 text-gray-400 shrink-0" />
                          )}
                          <div className="min-w-0">
                            <div className="font-medium text-gray-800">
                              {entry.browser} on {entry.os} (
                              {entry.deviceType})
                            </div>
                            <div className="text-gray-500 text-xs">
                              IP: {entry.ip}
                            </div>
                            <div className="text-gray-500 text-xs">
                              {new Date(entry.loginAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Top Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {users.tags.map((tag: string) => (
                    <div
                      key={tag}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <Badge
                          variant="secondary"
                          className="bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer"
                        >
                          {tag}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Mainlayout>
  );
};

export default index;

import Mainlayout from "@/layout/Mainlayout";
import { useAuth } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import { Heart, MessageCircle, Share2, UserPlus, Check, Send, ImageVideo, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

interface Comment {
  _id: string;
  userid: string;
  username: string;
  text: string;
  commentedon: string;
}

interface Post {
  _id: string;
  userid: string;
  username: string;
  content: string;
  mediaUrl: string;
  mediaType: string;
  likes: string[];
  comments: Comment[];
  shares: number;
  postedon: string;
}

interface FriendData {
  friends: { _id: string; name: string }[];
  requests: { _id: string; name: string }[];
  friendCount: number;
}

export default function SocialPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [friendData, setFriendData] = useState<FriendData | null>(null);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string>("");
  const [mediaFileType, setMediaFileType] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [commentTexts, setCommentTexts] = useState<{ [key: string]: string }>({});
  const [openComments, setOpenComments] = useState<{ [key: string]: boolean }>({});
  const [allUsers, setAllUsers] = useState<{ _id: string; name: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchPosts = async () => {
    try {
      const res = await axiosInstance.get("/social/posts");
      setPosts(res.data.data);
    } catch {
      toast.error("Failed to load posts");
    }
  };

  const fetchFriendData = async () => {
    if (!user) return;
    try {
      const res = await axiosInstance.get("/social/friend/mydata");
      setFriendData(res.data.data);
    } catch {
      console.log("Could not fetch friend data");
    }
  };

  const fetchAllUsers = async () => {
    try {
      const res = await axiosInstance.get("/user/getalluser");
      setAllUsers(res.data.data);
    } catch {
      console.log("Could not fetch users");
    }
  };

  useEffect(() => {
    const load = async () => {
      if (user) {
        await Promise.all([fetchPosts(), fetchFriendData(), fetchAllUsers()]);
      } else {
        await fetchPosts();
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const getPostLimit = (friendCount: number) => {
    if (friendCount === 0) return 0;
    if (friendCount === 1) return 1;
    if (friendCount === 2) return 2;
    if (friendCount === 3) return 3;
    if (friendCount === 4) return 4;
    if (friendCount === 5) return 5;
    if (friendCount === 6) return 6;
    if (friendCount === 7) return 7;
    if (friendCount === 8) return 8;
    if (friendCount === 9) return 9;
    if (friendCount > 10) return -1;
    return 9;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      toast.error("Only image or video files are allowed");
      return;
    }

    setMediaFile(file);
    setMediaFileType(isVideo ? "video" : "image");
    const previewUrl = URL.createObjectURL(file);
    setMediaPreview(previewUrl);
  };

  const clearMedia = () => {
    setMediaFile(null);
    setMediaPreview("");
    setMediaFileType("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handlePost = async () => {
    if (!user) { toast.error("Please login to post"); return; }
    if (!content.trim()) { toast.error("Post content cannot be empty"); return; }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("content", content);
      if (mediaFile) {
        formData.append("media", mediaFile);
      }

      const res = await axiosInstance.post("/social/post", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setPosts([res.data.data, ...posts]);
      setContent("");
      clearMedia();
      toast.success("Posted successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to post");
    }
    setSubmitting(false);
  };

  const handleLike = async (postId: string) => {
    if (!user) { toast.error("Please login to like"); return; }
    try {
      const res = await axiosInstance.patch(`/social/like/${postId}`);
      setPosts(posts.map((p) => (p._id === postId ? res.data.data : p)));
    } catch {
      toast.error("Failed to like post");
    }
  };

  const handleComment = async (postId: string) => {
    if (!user) { toast.error("Please login to comment"); return; }
    const text = commentTexts[postId];
    if (!text?.trim()) return;
    try {
      const res = await axiosInstance.post(`/social/comment/${postId}`, { text });
      setPosts(posts.map((p) => (p._id === postId ? res.data.data : p)));
      setCommentTexts({ ...commentTexts, [postId]: "" });
    } catch {
      toast.error("Failed to comment");
    }
  };

  const handleShare = async (postId: string) => {
    try {
      const res = await axiosInstance.patch(`/social/share/${postId}`);
      setPosts(posts.map((p) => (p._id === postId ? res.data.data : p)));
      toast.success("Post shared!");
    } catch {
      toast.error("Failed to share");
    }
  };

  const handleSendRequest = async (targetid: string) => {
    if (!user) { toast.error("Please login"); return; }
    try {
      await axiosInstance.post("/social/friend/send", { targetid });
      toast.success("Friend request sent!");
      await fetchFriendData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send request");
    }
  };

  const handleAcceptRequest = async (requesterid: string) => {
    try {
      await axiosInstance.post("/social/friend/accept", { requesterid });
      toast.success("Friend request accepted!");
      await fetchFriendData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to accept");
    }
  };

  const friendCount = friendData?.friendCount ?? 0;
  const postLimit = getPostLimit(friendCount);
  const limitLabel =
    postLimit === 0 ? "0 posts/day — add a friend!"
    : postLimit === -1 ? "Unlimited posts/day"
    : `${postLimit} post(s)/day`;

  const isFriend = (uid: string) =>
    friendData?.friends.some((f) => f._id === uid);

  if (loading) {
    return (
      <Mainlayout>
        <div className="flex justify-center mt-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Mainlayout>
    );
  }

  return (
    <Mainlayout>
      <div className="max-w-2xl mx-auto py-4 px-2">
        <h1 className="text-2xl font-bold mb-1">Community Feed</h1>
        <p className="text-sm text-gray-500 mb-4">Connect, share, and interact with the community</p>

        {/* Friend Requests */}
        {user && friendData && friendData.requests.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h2 className="font-semibold text-blue-800 mb-2">
              Friend Requests ({friendData.requests.length})
            </h2>
            <div className="space-y-2">
              {friendData.requests.map((req) => (
                <div key={req._id} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{req.name}</span>
                  <button
                    onClick={() => handleAcceptRequest(req._id)}
                    className="flex items-center gap-1 text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    <Check className="w-3 h-3" /> Accept
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create Post Box */}
        {user && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-sm">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <span className="font-medium text-sm">{user.name}</span>
              <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                {limitLabel}
              </span>
            </div>

            {postLimit === 0 ? (
              <div className="text-sm text-orange-600 bg-orange-50 border border-orange-200 rounded p-3">
                You need at least <strong>1 friend</strong> to post. Add friends from the list below!
              </div>
            ) : (
              <>
                <textarea
                  className="w-full border border-gray-200 rounded p-2 text-sm mt-1 min-h-[80px] resize-none focus:outline-none focus:ring-1 focus:ring-blue-400"
                  placeholder="What's on your mind?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />

                {/* Media Preview */}
                {mediaPreview && (
                  <div className="relative mt-2 rounded overflow-hidden border border-gray-200">
                    <button
                      onClick={clearMedia}
                      className="absolute top-1 right-1 bg-black bg-opacity-60 text-white rounded-full p-0.5 hover:bg-opacity-90 z-10"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    {mediaFileType === "video" ? (
                      <video src={mediaPreview} controls className="w-full max-h-64 object-cover" />
                    ) : (
                      <img src={mediaPreview} alt="preview" className="w-full max-h-64 object-cover" />
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2 mt-3">
                  {/* File upload button */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1 text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded hover:bg-gray-50"
                    type="button"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Photo / Video
                  </button>

                  <button
                    onClick={handlePost}
                    disabled={submitting}
                    className="ml-auto bg-blue-600 text-white text-xs px-5 py-1.5 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-t border-white"></div>
                        Uploading...
                      </>
                    ) : "Post"}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Feed */}
        {posts.length === 0 ? (
          <div className="text-center text-gray-400 py-10">No posts yet. Be the first to post!</div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => {
              const liked = user && post.likes.includes(String(user._id));
              const isOwn = user && post.userid === String(user._id);
              const alreadyFriend = isFriend(post.userid);

              return (
                <div key={post._id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 pt-4 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-sm">
                        {post.username?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{post.username}</p>
                        <p className="text-xs text-gray-400">{new Date(post.postedon).toLocaleString()}</p>
                      </div>
                    </div>
                    {user && !isOwn && !alreadyFriend && (
                      <button
                        onClick={() => handleSendRequest(post.userid)}
                        className="flex items-center gap-1 text-xs text-blue-600 border border-blue-300 px-2 py-1 rounded hover:bg-blue-50"
                      >
                        <UserPlus className="w-3 h-3" /> Add Friend
                      </button>
                    )}
                    {alreadyFriend && (
                      <span className="text-xs text-green-600 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Friends
                      </span>
                    )}
                  </div>

                  {/* Text */}
                  <div className="px-4 pb-2">
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{post.content}</p>
                  </div>

                  {/* Media from Cloudinary */}
                  {post.mediaUrl && post.mediaType === "image" && (
                    <img
                      src={post.mediaUrl}
                      alt="post"
                      className="w-full max-h-96 object-cover"
                    />
                  )}
                  {post.mediaUrl && post.mediaType === "video" && (
                    <video src={post.mediaUrl} controls className="w-full max-h-80" />
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-4 px-4 py-2 text-xs text-gray-400 border-t border-gray-100">
                    <span>{post.likes.length} {post.likes.length === 1 ? "like" : "likes"}</span>
                    <span>{post.comments.length} {post.comments.length === 1 ? "comment" : "comments"}</span>
                    <span>{post.shares} shares</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center border-t border-gray-100">
                    <button
                      onClick={() => handleLike(post._id)}
                      className={`flex-1 flex items-center justify-center gap-1 py-2 text-sm hover:bg-gray-50 transition ${liked ? "text-red-500" : "text-gray-500"}`}
                    >
                      <Heart className={`w-4 h-4 ${liked ? "fill-red-500" : ""}`} />
                      Like
                    </button>
                    <button
                      onClick={() => setOpenComments({ ...openComments, [post._id]: !openComments[post._id] })}
                      className="flex-1 flex items-center justify-center gap-1 py-2 text-sm text-gray-500 hover:bg-gray-50 transition"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Comment
                    </button>
                    <button
                      onClick={() => handleShare(post._id)}
                      className="flex-1 flex items-center justify-center gap-1 py-2 text-sm text-gray-500 hover:bg-gray-50 transition"
                    >
                      <Share2 className="w-4 h-4" />
                      Share
                    </button>
                  </div>

                  {/* Comments */}
                  {openComments[post._id] && (
                    <div className="px-4 pb-3 bg-gray-50 border-t border-gray-100">
                      <div className="space-y-2 mt-2 max-h-48 overflow-y-auto">
                        {post.comments.length === 0 && (
                          <p className="text-xs text-gray-400">No comments yet.</p>
                        )}
                        {post.comments.map((c) => (
                          <div key={c._id} className="flex gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {c.username?.charAt(0).toUpperCase()}
                            </div>
                            <div className="bg-white rounded px-2 py-1 text-xs flex-1">
                              <span className="font-semibold">{c.username}: </span>
                              {c.text}
                            </div>
                          </div>
                        ))}
                      </div>
                      {user && (
                        <div className="flex gap-2 mt-2">
                          <input
                            className="flex-1 border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-300"
                            placeholder="Write a comment..."
                            value={commentTexts[post._id] || ""}
                            onChange={(e) => setCommentTexts({ ...commentTexts, [post._id]: e.target.value })}
                            onKeyDown={(e) => { if (e.key === "Enter") handleComment(post._id); }}
                          />
                          <button onClick={() => handleComment(post._id)} className="text-blue-600 hover:text-blue-800">
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* People You May Know */}
        {user && allUsers.length > 0 && (
          <div className="mt-6 bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <h2 className="font-semibold text-sm mb-3">People You May Know</h2>
            <div className="space-y-2">
              {allUsers
                .filter((u) => u._id !== String(user._id) && !isFriend(u._id))
                .slice(0, 5)
                .map((u) => (
                  <div key={u._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-bold">
                        {u.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm">{u.name}</span>
                    </div>
                    <button
                      onClick={() => handleSendRequest(u._id)}
                      className="flex items-center gap-1 text-xs text-blue-600 border border-blue-300 px-2 py-1 rounded hover:bg-blue-50"
                    >
                      <UserPlus className="w-3 h-3" /> Add
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </Mainlayout>
  );
}

import { Bookmark } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import axiosInstance from "@/lib/axiosinstance";
import { useAuth } from "@/lib/AuthContext";

interface SaveButtonProps {
  questionId: string;
  initialSaved?: boolean;
  onToggled?: (saved: boolean) => void;
  variant?: "icon" | "full";
  className?: string;
}

const SaveButton = ({
  questionId,
  initialSaved = false,
  onToggled,
  variant = "icon",
  className = "",
}: SaveButtonProps) => {
  const { user } = useAuth();
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [busy, setBusy] = useState(false);

  // Keep in sync if the parent learns the real saved-state after this
  // button has already mounted (e.g. /saved/ids resolves after render).
  useEffect(() => {
    setSaved(initialSaved);
  }, [initialSaved]);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.info("Please login to save questions");
      router.push("/auth");
      return;
    }
    if (busy) return;

    const previous = saved;
    setBusy(true);
    setSaved(!previous); // optimistic update
    try {
      const res = await axiosInstance.post(`/saved/toggle/${questionId}`);
      const nowSaved = res.data.saved;
      setSaved(nowSaved);
      onToggled?.(nowSaved);
      toast.success(nowSaved ? "Question saved" : "Removed from saved");
    } catch (error: any) {
      setSaved(previous); // revert on failure
      toast.error(error.response?.data?.message || "Failed to update saved status");
    } finally {
      setBusy(false);
    }
  };

  if (variant === "full") {
    return (
      <button
        onClick={handleClick}
        disabled={busy}
        className={`flex items-center gap-1 text-sm disabled:opacity-50 ${
          saved ? "text-yellow-600" : "text-gray-600 hover:text-yellow-600"
        } ${className}`}
      >
        <Bookmark className="w-4 h-4" fill={saved ? "currentColor" : "none"} />
        {saved ? "Saved" : "Save"}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={busy}
      title={saved ? "Remove from saved" : "Save question"}
      className={`p-2 rounded disabled:opacity-50 ${
        saved ? "text-yellow-500" : "text-gray-600 hover:text-yellow-500"
      } ${className}`}
    >
      <Bookmark className="w-5 h-5" fill={saved ? "currentColor" : "none"} />
    </button>
  );
};

export default SaveButton;

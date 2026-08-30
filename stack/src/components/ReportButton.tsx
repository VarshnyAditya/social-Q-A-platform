import { useState } from "react";
import { Flag } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import axiosInstance from "@/lib/axiosinstance";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "react-toastify";

const REASONS = [
  "Spam",
  "Harassment or abuse",
  "Inappropriate or explicit content",
  "Misinformation",
  "Other",
];

type TargetType = "question" | "answer" | "post" | "comment" | "team" | "teammessage";

interface ReportButtonProps {
  targetType: TargetType;
  targetId: string;
  // Required for "answer"/"comment" — the question/post they live inside,
  // since those aren't top-level documents on their own.
  parentId?: string;
  className?: string;
  label?: string;
  iconOnly?: boolean;
}

export default function ReportButton({
  targetType,
  targetId,
  parentId,
  className = "text-gray-600 hover:text-gray-800",
  label = "Flag",
  iconOnly = false,
}: ReportButtonProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REASONS[0]);
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleOpen = () => {
    if (!user) {
      toast.info("Log in to report content");
      return;
    }
    setOpen(true);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await axiosInstance.post("/report/create", {
        targetType,
        targetId,
        parentId: parentId || "",
        reason: details.trim() ? `${reason}: ${details.trim()}` : reason,
      });
      toast.success("Thanks — our team will review this.");
      setOpen(false);
      setDetails("");
      setReason(REASONS[0]);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Could not submit report");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button variant="ghost" size="sm" className={className} onClick={handleOpen}>
        <Flag className={iconOnly ? "w-4 h-4" : "w-4 h-4 mr-1"} />
        {!iconOnly && label}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report content</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Reason</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
              >
                {REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Additional details <span className="text-gray-400">(optional)</span>
              </label>
              <Textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Anything that helps us review this faster"
                rows={3}
                maxLength={500}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {submitting ? "Submitting..." : "Submit Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
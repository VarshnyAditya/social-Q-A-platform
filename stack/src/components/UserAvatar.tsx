import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn, getAvatarColor, getInitials } from "@/lib/utils";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

const SIZE_CLASSES: Record<AvatarSize, string> = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-sm",
  md: "w-10 h-10 text-base",
  lg: "w-12 h-12 text-lg",
  xl: "w-24 h-24 lg:w-32 lg:h-32 text-2xl lg:text-3xl",
};

// The presence dot's size doesn't need to track the avatar size 1:1 — it just
// needs to stay visible and proportionate across the range we actually use.
const DOT_SIZE_CLASSES: Record<AvatarSize, string> = {
  xs: "w-1.5 h-1.5",
  sm: "w-2 h-2",
  md: "w-2.5 h-2.5",
  lg: "w-3 h-3",
  xl: "w-5 h-5",
};

interface UserAvatarProps {
  userId: string;
  name?: string | null;
  size?: AvatarSize;
  // Shows a green/gray presence dot on the bottom-right corner. Omit
  // entirely (rather than passing false) when presence isn't relevant to
  // that context (e.g. a static comment author).
  online?: boolean;
  className?: string;
}

// Deterministic colored-initials avatar: the same user always gets the same
// color, and two people who happen to share a display name are still
// visually distinguishable at a glance. Used everywhere a person is shown —
// chat, profiles, the people directory, comments, social posts.
export default function UserAvatar({ userId, name, size = "sm", online, className }: UserAvatarProps) {
  const colorClass = getAvatarColor(userId);
  const initials = getInitials(name);

  return (
    <div className="relative inline-block flex-shrink-0">
      <Avatar className={cn(SIZE_CLASSES[size], className)}>
        <AvatarFallback className={cn(colorClass, "text-white font-semibold")}>
          {initials}
        </AvatarFallback>
      </Avatar>
      {online !== undefined && (
        <span
          className={cn(
            "absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-white",
            DOT_SIZE_CLASSES[size],
            online ? "bg-green-500" : "bg-gray-300"
          )}
          aria-label={online ? "Online" : "Offline"}
        />
      )}
    </div>
  );
}
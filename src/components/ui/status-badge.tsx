import { cn } from "@/lib/utils";
import { Circle, Sparkles, Clock } from "lucide-react";

type StatusType = "active" | "hiring" | "inactive";

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig = {
  active: {
    label: "Active",
    icon: Circle,
    className: "status-active",
  },
  hiring: {
    label: "Hiring Now",
    icon: Sparkles,
    className: "status-hiring",
  },
  inactive: {
    label: "Inactive",
    icon: Clock,
    className: "status-inactive",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span className={cn("status-badge", config.className, className)}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

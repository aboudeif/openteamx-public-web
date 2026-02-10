import { ReactNode, isValidElement } from "react";
import { cn } from "@/lib/utils";
import { LucideIcon, ChevronRight } from "lucide-react";

interface WidgetCardProps {
  title: string;
  icon: LucideIcon | ReactNode;
  action?: string;
  onAction?: () => void;
  headerAction?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function WidgetCard({ title, icon, action, onAction, headerAction, children, className }: WidgetCardProps) {
  const renderIcon = () => {
    if (isValidElement(icon)) return icon;
    if (typeof icon === "function" || (typeof icon === "object" && icon)) {
      const Icon = icon as LucideIcon;
      return <Icon className="w-4 h-4 text-primary" />;
    }
    return icon;
  };

  return (
    <div className={cn("widget-card p-6 rounded-xl", className)}>
      <div className="widget-header">
        <h3 className="widget-title">
          {renderIcon()}
          {title}
        </h3>
        {headerAction}
        {action && !headerAction && (
          <button onClick={onAction} className="widget-action flex items-center gap-1">
            {action}
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

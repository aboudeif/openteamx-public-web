import { WidgetCard } from "@/components/shared/WidgetCard";
import { HardDrive, FileText, FileSpreadsheet, Image, Link, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const files = [
  {
    id: 1,
    name: "Q4 Financial Report.xlsx",
    type: "spreadsheet",
    modifiedBy: "Mike Johnson",
    modifiedAt: "2 hours ago",
  },
  {
    id: 2,
    name: "Brand Guidelines v2.pdf",
    type: "document",
    modifiedBy: "Sarah Chen",
    modifiedAt: "Yesterday",
  },
  {
    id: 3,
    name: "Product Mockups",
    type: "image",
    modifiedBy: "Alex Kim",
    modifiedAt: "Yesterday",
  },
  {
    id: 4,
    name: "API Documentation",
    type: "link",
    modifiedBy: "Emily Davis",
    modifiedAt: "2 days ago",
  },
];

const fileIcons = {
  document: FileText,
  spreadsheet: FileSpreadsheet,
  image: Image,
  link: Link,
};

const fileColors = {
  document: "bg-destructive/10 text-destructive",
  spreadsheet: "bg-success/10 text-success",
  image: "bg-info/10 text-info",
  link: "bg-primary/10 text-primary",
};

export function DriveWidget() {
  const navigate = useNavigate();
  const team = {id: 'team-1'};
  
  return (
    <WidgetCard 
    title="Recent Files" 
    icon={HardDrive} 
    action="Open Drive"
    onAction={() => navigate(`/${team.id}/drive`)}
    >
      <div className="space-y-2">
        {files.map((file) => {
          const Icon = fileIcons[file.type as keyof typeof fileIcons] || FileText;
          const colorClass = fileColors[file.type as keyof typeof fileColors] || "bg-muted text-muted-foreground";

          return (
            <div
              key={file.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
            >
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", colorClass)}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground line-clamp-1">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {file.modifiedBy} · {file.modifiedAt}
                </p>
              </div>
              <button className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-muted text-muted-foreground hover:text-foreground transition-all">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </WidgetCard>
  );
}



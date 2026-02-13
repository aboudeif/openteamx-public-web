import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { WidgetCard } from "@/components/shared/WidgetCard";
import { HardDrive, FileText, FileSpreadsheet, Image, Link, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate, useParams } from "react-router-dom";
import { driveService } from "@/services";

type FileItem = {
  id: string;
  name: string;
  type?: string;
  mimeType?: string;
  modifiedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  modifiedBy?: string;
  uploadedBy?: {
    name?: string;
  };
};

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

function inferType(file: FileItem) {
  const explicitType = (file.type || "").toLowerCase();
  if (explicitType) {
    return explicitType;
  }

  const mime = (file.mimeType || "").toLowerCase();
  if (mime.includes("sheet") || mime.includes("excel") || file.name.endsWith(".xlsx")) {
    return "spreadsheet";
  }
  if (mime.includes("image/")) {
    return "image";
  }
  if (mime.includes("pdf") || mime.includes("text") || file.name.endsWith(".docx")) {
    return "document";
  }
  if (mime.includes("url")) {
    return "link";
  }
  return "document";
}

export function DriveWidget() {
  const navigate = useNavigate();
  const { teamId = "" } = useParams();
  const { data: rawFiles = [], isLoading } = useQuery<FileItem[]>({
    queryKey: ["team-drive-widget", teamId],
    queryFn: async () => {
      const response = await driveService.getFiles(teamId);
      return Array.isArray(response) ? (response as FileItem[]) : [];
    },
    enabled: Boolean(teamId),
  });

  const files = useMemo(() => rawFiles.slice(0, 4), [rawFiles]);
  
  return (
    <WidgetCard 
    title="Recent Files" 
    icon={HardDrive} 
    action="Open Drive"
    onAction={() => navigate(`/${teamId}/drive`)}
    >
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading files...</p>
      ) : files.length === 0 ? (
        <p className="text-sm text-muted-foreground">No recent files.</p>
      ) : (
        <div className="space-y-2">
          {files.map((file) => {
            const normalizedType = inferType(file);
            const Icon = fileIcons[normalizedType as keyof typeof fileIcons] || FileText;
            const colorClass = fileColors[normalizedType as keyof typeof fileColors] || "bg-muted text-muted-foreground";
            const timestamp = file.modifiedAt || file.updatedAt || file.createdAt;

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
                    {file.modifiedBy || file.uploadedBy?.name || "Team member"}
                    {timestamp ? ` · ${new Date(timestamp).toLocaleString()}` : ""}
                  </p>
                </div>
                <button className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-muted text-muted-foreground hover:text-foreground transition-all">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </WidgetCard>
  );
}

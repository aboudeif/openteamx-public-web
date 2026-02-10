import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, FileText, FileSpreadsheet, Link, Image, Folder, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface AttachFileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (file: { name: string; type: string }) => void;
}

const driveFiles = [
  { id: "1", name: "Q4 Financial Report.xlsx", type: "spreadsheet" },
  { id: "2", name: "Brand Guidelines v2.pdf", type: "document" },
  { id: "3", name: "Product Mockups.fig", type: "image" },
  { id: "4", name: "API Documentation", type: "link" },
  { id: "5", name: "Meeting Notes - Jan 28.docx", type: "document" },
  { id: "6", name: "Competitor Analysis", type: "link" },
];

const fileIcons = {
  document: FileText,
  spreadsheet: FileSpreadsheet,
  image: Image,
  link: Link,
  folder: Folder,
};

const fileColors = {
  document: "text-info",
  spreadsheet: "text-success",
  image: "text-primary",
  link: "text-muted-foreground",
  folder: "text-warning",
};

export function AttachFileModal({ open, onOpenChange, onSelect }: AttachFileModalProps) {
  const [search, setSearch] = useState("");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  if (!open) return null;

  const filteredFiles = driveFiles.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAttach = () => {
    const file = driveFiles.find((f) => f.id === selectedFile);
    if (file) {
      onSelect({ name: file.name, type: file.type });
      onOpenChange(false);
      setSelectedFile(null);
      setSearch("");
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold text-lg">Attach from Drive</h3>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onOpenChange(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search files..."
              className="pl-10"
            />
          </div>
        </div>

        <div className="p-2 max-h-64 overflow-y-auto">
          {filteredFiles.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">No files found</p>
          ) : (
            filteredFiles.map((file) => {
              const Icon = fileIcons[file.type as keyof typeof fileIcons] || FileText;
              const colorClass = fileColors[file.type as keyof typeof fileColors] || "text-muted-foreground";

              return (
                <button
                  key={file.id}
                  onClick={() => setSelectedFile(file.id)}
                  className={cn(
                    "flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-colors text-left",
                    selectedFile === file.id
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted"
                  )}
                >
                  <div className={cn("w-8 h-8 rounded-lg bg-muted flex items-center justify-center", colorClass)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium truncate">{file.name}</span>
                </button>
              );
            })
          )}
        </div>

        <div className="p-4 border-t border-border flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleAttach} disabled={!selectedFile}>
            Attach File
          </Button>
        </div>
      </div>
    </div>
  );
}

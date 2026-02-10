import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Link, Cloud, HardDrive } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ExternalFileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ImportSource = "direct" | "google" | "onedrive";

export function ExternalFileModal({ open, onOpenChange }: ExternalFileModalProps) {
  const [source, setSource] = useState<ImportSource>("direct");
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");

  if (!open) return null;

  const handleAdd = () => {
    if (!url.trim()) {
      toast.error("Please enter a URL");
      return;
    }
    toast.success("External file added successfully");
    onOpenChange(false);
    setUrl("");
    setName("");
    setSource("direct");
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold text-lg">Add External File</h3>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onOpenChange(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Source Selection */}
          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">Import From</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setSource("direct")}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                  source === "direct"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                <Link className={cn("w-6 h-6", source === "direct" ? "text-primary" : "text-muted-foreground")} />
                <span className="text-xs font-medium">Direct Link</span>
              </button>
              <button
                onClick={() => setSource("google")}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                  source === "google"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                <Cloud className={cn("w-6 h-6", source === "google" ? "text-primary" : "text-muted-foreground")} />
                <span className="text-xs font-medium">Google Drive</span>
              </button>
              <button
                onClick={() => setSource("onedrive")}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                  source === "onedrive"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                <HardDrive className={cn("w-6 h-6", source === "onedrive" ? "text-primary" : "text-muted-foreground")} />
                <span className="text-xs font-medium">OneDrive</span>
              </button>
            </div>
          </div>

          {source === "direct" ? (
            <>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">File URL</label>
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Display Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter a name for this file"
                />
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                {source === "google" ? (
                  <Cloud className="w-8 h-8 text-muted-foreground" />
                ) : (
                  <HardDrive className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Connect to {source === "google" ? "Google Drive" : "OneDrive"} to import files
              </p>
              <Button variant="outline">
                Connect {source === "google" ? "Google Drive" : "OneDrive"}
              </Button>
              <p className="text-xs text-muted-foreground mt-3">
                Set up the integration in Settings → Integrations
              </p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {source === "direct" && (
            <Button className="flex-1" onClick={handleAdd}>
              Add File
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Link } from "lucide-react";
import { toast } from "sonner";

interface AddLinkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddLinkModal({ open, onOpenChange }: AddLinkModalProps) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");

  if (!open) return null;

  const handleAdd = () => {
    if (!url.trim()) {
      toast.error("Please enter a URL");
      return;
    }
    toast.success("Link added to message");
    onOpenChange(false);
    setUrl("");
    setTitle("");
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Link className="w-5 h-5 text-primary" />
            Add Link
          </h3>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onOpenChange(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">URL</label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Display Text (optional)</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Link text to display"
            />
          </div>
        </div>

        <div className="p-4 border-t border-border flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleAdd}>
            Add Link
          </Button>
        </div>
      </div>
    </div>
  );
}

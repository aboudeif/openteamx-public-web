import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProfileModal({ open, onOpenChange }: EditProfileModalProps) {
  const [formData, setFormData] = useState({
    firstName: "John",
    lastName: "Doe",
    jobTitles: ["Senior Frontend Developer", "UI/UX Designer"],
    languages: ["English (Native)", "Spanish (Fluent)"],
  });

  const [newJobTitle, setNewJobTitle] = useState("");
  const [newLanguage, setNewLanguage] = useState("");

  if (!open) return null;

  const handleSave = () => {
    toast.success("Profile updated successfully");
    onOpenChange(false);
  };

  const addJobTitle = () => {
    if (newJobTitle.trim()) {
      setFormData({ ...formData, jobTitles: [...formData.jobTitles, newJobTitle.trim()] });
      setNewJobTitle("");
    }
  };

  const removeJobTitle = (index: number) => {
    setFormData({ ...formData, jobTitles: formData.jobTitles.filter((_, i) => i !== index) });
  };

  const addLanguage = () => {
    if (newLanguage.trim()) {
      setFormData({ ...formData, languages: [...formData.languages, newLanguage.trim()] });
      setNewLanguage("");
    }
  };

  const removeLanguage = (index: number) => {
    setFormData({ ...formData, languages: formData.languages.filter((_, i) => i !== index) });
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold text-lg">Edit Profile</h3>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onOpenChange(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-1 scrollbar-thin">
          {/* Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">First Name</label>
              <Input
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Last Name</label>
              <Input
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
          </div>

          {/* Job Titles */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Job Titles</label>
            <div className="space-y-2 mb-2">
              {formData.jobTitles.map((title, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input value={title} readOnly className="flex-1 bg-muted/50" />
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive" onClick={() => removeJobTitle(idx)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add job title..."
                value={newJobTitle}
                onChange={(e) => setNewJobTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addJobTitle()}
              />
              <Button variant="outline" onClick={addJobTitle}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Languages */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Languages</label>
            <div className="space-y-2 mb-2">
              {formData.languages.map((lang, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input value={lang} readOnly className="flex-1 bg-muted/50" />
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive" onClick={() => removeLanguage(idx)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add language (e.g., French (Intermediate))..."
                value={newLanguage}
                onChange={(e) => setNewLanguage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addLanguage()}
              />
              <Button variant="outline" onClick={addLanguage}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Read-only info notice */}
          <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
            <p className="font-medium mb-1">Non-editable fields:</p>
            <ul className="list-disc list-inside text-xs space-y-1">
              <li>Join date (March 2024)</li>
              <li>Country (United States)</li>
              <li>Specializations grade</li>
              <li>Talent ID (TLT-2024-00847)</li>
            </ul>
          </div>
        </div>

        <div className="p-4 border-t border-border flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus, Trash2, Briefcase, GraduationCap, Wrench } from "lucide-react";
import { toast } from "sonner";

interface CVItem {
  title: string;
  subtitle: string;
  period: string;
}

interface EditCVModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditCVModal({ open, onOpenChange }: EditCVModalProps) {
  const [experience, setExperience] = useState<CVItem[]>([
    { title: "Senior Frontend Developer", subtitle: "TechVentures Inc.", period: "2023 - Present" },
    { title: "Frontend Developer", subtitle: "StartupX", period: "2021 - 2023" },
  ]);
  const [education, setEducation] = useState<CVItem[]>([
    { title: "M.S. Computer Science", subtitle: "MIT", period: "2019 - 2021" },
    { title: "B.S. Software Engineering", subtitle: "Stanford University", period: "2015 - 2019" },
  ]);
  const [skills, setSkills] = useState<CVItem[]>([
    { title: "React, TypeScript, Next.js", subtitle: "Frontend", period: "" },
    { title: "Figma, Adobe XD", subtitle: "Design Tools", period: "" },
  ]);

  const [activeSection, setActiveSection] = useState<"experience" | "education" | "skills">("experience");

  if (!open) return null;

  const handleSave = () => {
    toast.success("CV updated successfully");
    onOpenChange(false);
  };

  const addItem = () => {
    const newItem = { title: "", subtitle: "", period: "" };
    if (activeSection === "experience") setExperience([...experience, newItem]);
    if (activeSection === "education") setEducation([...education, newItem]);
    if (activeSection === "skills") setSkills([...skills, newItem]);
  };

  const removeItem = (index: number) => {
    if (activeSection === "experience") setExperience(experience.filter((_, i) => i !== index));
    if (activeSection === "education") setEducation(education.filter((_, i) => i !== index));
    if (activeSection === "skills") setSkills(skills.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof CVItem, value: string) => {
    const updateFn = (items: CVItem[]) =>
      items.map((item, i) => (i === index ? { ...item, [field]: value } : item));

    if (activeSection === "experience") setExperience(updateFn(experience));
    if (activeSection === "education") setEducation(updateFn(education));
    if (activeSection === "skills") setSkills(updateFn(skills));
  };

  const currentItems = activeSection === "experience" ? experience : activeSection === "education" ? education : skills;
  const SectionIcon = activeSection === "experience" ? Briefcase : activeSection === "education" ? GraduationCap : Wrench;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold text-lg">Edit CV</h3>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onOpenChange(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Section Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveSection("experience")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeSection === "experience"
                ? "text-primary border-b-2 border-primary bg-primary/5"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Briefcase className="w-4 h-4 inline mr-2" />
            Experience
          </button>
          <button
            onClick={() => setActiveSection("education")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeSection === "education"
                ? "text-primary border-b-2 border-primary bg-primary/5"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <GraduationCap className="w-4 h-4 inline mr-2" />
            Education
          </button>
          <button
            onClick={() => setActiveSection("skills")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeSection === "skills"
                ? "text-primary border-b-2 border-primary bg-primary/5"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Wrench className="w-4 h-4 inline mr-2" />
            Skills
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto flex-1 scrollbar-thin">
          {currentItems.map((item, idx) => (
            <div key={idx} className="p-4 rounded-lg border border-border space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SectionIcon className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Entry {idx + 1}</span>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeItem(idx)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid gap-3">
                <Input
                  placeholder={activeSection === "skills" ? "Skills (e.g., React, TypeScript)" : "Title/Degree"}
                  value={item.title}
                  onChange={(e) => updateItem(idx, "title", e.target.value)}
                />
                <Input
                  placeholder={activeSection === "skills" ? "Category" : "Company/Institution"}
                  value={item.subtitle}
                  onChange={(e) => updateItem(idx, "subtitle", e.target.value)}
                />
                {activeSection !== "skills" && (
                  <Input
                    placeholder="Period (e.g., 2021 - 2023)"
                    value={item.period}
                    onChange={(e) => updateItem(idx, "period", e.target.value)}
                  />
                )}
              </div>
            </div>
          ))}

          <Button variant="outline" className="w-full" onClick={addItem}>
            <Plus className="w-4 h-4 mr-2" />
            Add {activeSection === "experience" ? "Experience" : activeSection === "education" ? "Education" : "Skill"}
          </Button>
        </div>

        <div className="p-4 border-t border-border flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleSave}>
            Save CV
          </Button>
        </div>
      </div>
    </div>
  );
}

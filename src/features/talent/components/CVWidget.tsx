import { useState } from "react";
import { WidgetCard } from "@/components/shared/WidgetCard";
import { FileText, Briefcase, GraduationCap, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditCVModal } from "./EditCVModal";
import { ViewCVModal } from "./ViewCVModal";
import { ScrollArea } from "@/components/ui/scroll-area";

const cvSections = [
  {
    id: "experience",
    icon: Briefcase,
    title: "Experience",
    items: [
      { title: "Senior Frontend Developer", subtitle: "TechVentures Inc.", period: "2023 - Present" },
      { title: "Frontend Developer", subtitle: "StartupX", period: "2021 - 2023" },
    ],
  },
  {
    id: "education",
    icon: GraduationCap,
    title: "Education",
    items: [
      { title: "M.S. Computer Science", subtitle: "MIT", period: "2019 - 2021" },
      { title: "B.S. Software Engineering", subtitle: "Stanford University", period: "2015 - 2019" },
    ],
  },
  {
    id: "skills",
    icon: Wrench,
    title: "Skills",
    items: [
      { title: "React, TypeScript, Next.js", subtitle: "Frontend", period: "" },
      { title: "Figma, Adobe XD", subtitle: "Design Tools", period: "" },
    ],
  },
];

export function CVWidget() {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  return (
    <>
      <WidgetCard 
        title="CV Summary" 
        icon={FileText} 
        action="Edit CV"
        onAction={() => setShowEditModal(true)}
      >
        <ScrollArea className="h-[280px]">
          <div className="space-y-4 pr-2">
            {cvSections.map((section) => (
              <div key={section.id}>
                <div className="flex items-center gap-2 mb-2">
                  <section.icon className="w-4 h-4 text-primary" />
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {section.title}
                  </p>
                </div>
                <div className="space-y-2 pl-6">
                  {section.items.map((item, idx) => (
                    <div key={idx} className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                      </div>
                      {item.period && (
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{item.period}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <Button 
              variant="outline" 
              className="w-full" 
              size="sm"
              onClick={() => setShowViewModal(true)}
            >
              View Full CV
            </Button>
          </div>
        </ScrollArea>
      </WidgetCard>

      <EditCVModal open={showEditModal} onOpenChange={setShowEditModal} />
      <ViewCVModal open={showViewModal} onOpenChange={setShowViewModal} />
    </>
  );
}

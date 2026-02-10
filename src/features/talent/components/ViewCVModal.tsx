import { Button } from "@/components/ui/button";
import { X, Briefcase, GraduationCap, Wrench, Download, Mail, Phone, MapPin, Globe } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ViewCVModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const cvData = {
  name: "John Doe",
  title: "Senior Frontend Developer & UI/UX Designer",
  email: "john.doe@email.com",
  phone: "+1 (555) 123-4567",
  location: "San Francisco, CA",
  website: "johndoe.dev",
  summary: "Experienced frontend developer with 8+ years of expertise in building scalable web applications. Passionate about creating intuitive user experiences and writing clean, maintainable code.",
  experience: [
    {
      title: "Senior Frontend Developer",
      company: "TechVentures Inc.",
      period: "2023 - Present",
      description: "Leading the frontend team in developing a next-generation collaboration platform. Implemented design system, improved performance by 40%.",
    },
    {
      title: "Frontend Developer",
      company: "StartupX",
      period: "2021 - 2023",
      description: "Built and maintained multiple React applications. Led migration from JavaScript to TypeScript.",
    },
    {
      title: "Junior Frontend Developer",
      company: "WebAgency Co.",
      period: "2018 - 2021",
      description: "Developed responsive websites for clients across various industries. Worked with Vue.js and React.",
    },
  ],
  education: [
    {
      degree: "M.S. Computer Science",
      school: "Massachusetts Institute of Technology",
      period: "2019 - 2021",
      description: "Specialization in Human-Computer Interaction",
    },
    {
      degree: "B.S. Software Engineering",
      school: "Stanford University",
      period: "2015 - 2019",
      description: "Dean's List, GPA: 3.9/4.0",
    },
  ],
  skills: [
    { category: "Frontend", items: ["React", "TypeScript", "Next.js", "Vue.js", "Tailwind CSS"] },
    { category: "Design", items: ["Figma", "Adobe XD", "Sketch", "UI/UX Design"] },
    { category: "Tools", items: ["Git", "Docker", "CI/CD", "Jest", "Playwright"] },
    { category: "Soft Skills", items: ["Team Leadership", "Agile/Scrum", "Technical Writing"] },
  ],
};

export function ViewCVModal({ open, onOpenChange }: ViewCVModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold text-lg">Full CV</h3>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onOpenChange(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1 p-8">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8 pb-6 border-b border-border">
              <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center text-4xl font-bold text-primary-foreground mx-auto mb-4">
                JD
              </div>
              <h1 className="text-3xl font-bold mb-2">{cvData.name}</h1>
              <p className="text-lg text-primary mb-4">{cvData.title}</p>
              <div className="flex items-center justify-center flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {cvData.email}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  {cvData.phone}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {cvData.location}
                </span>
                <span className="flex items-center gap-1">
                  <Globe className="w-4 h-4" />
                  {cvData.website}
                </span>
              </div>
            </div>

            {/* Summary */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-3">Professional Summary</h2>
              <p className="text-muted-foreground leading-relaxed">{cvData.summary}</p>
            </div>

            {/* Experience */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" />
                Experience
              </h2>
              <div className="space-y-6">
                {cvData.experience.map((exp, idx) => (
                  <div key={idx} className="relative pl-6 border-l-2 border-primary/20">
                    <div className="absolute left-[-5px] top-0 w-2 h-2 rounded-full bg-primary" />
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <h3 className="font-semibold">{exp.title}</h3>
                        <p className="text-sm text-primary">{exp.company}</p>
                      </div>
                      <span className="text-sm text-muted-foreground whitespace-nowrap">{exp.period}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Education */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" />
                Education
              </h2>
              <div className="space-y-6">
                {cvData.education.map((edu, idx) => (
                  <div key={idx} className="relative pl-6 border-l-2 border-primary/20">
                    <div className="absolute left-[-5px] top-0 w-2 h-2 rounded-full bg-primary" />
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <h3 className="font-semibold">{edu.degree}</h3>
                        <p className="text-sm text-primary">{edu.school}</p>
                      </div>
                      <span className="text-sm text-muted-foreground whitespace-nowrap">{edu.period}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{edu.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-primary" />
                Skills
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {cvData.skills.map((skillGroup, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-muted/30">
                    <p className="text-sm font-medium mb-2">{skillGroup.category}</p>
                    <div className="flex flex-wrap gap-2">
                      {skillGroup.items.map((skill, i) => (
                        <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-border">
          <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

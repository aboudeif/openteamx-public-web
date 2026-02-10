import { useNavigate } from "react-router-dom";
import { WidgetCard } from "@/components/shared/WidgetCard";
import { FileText, Clock, User } from "lucide-react";

const notes = [
  {
    id: 1,
    title: "Sprint 12 Retrospective",
    date: "Yesterday",
    author: "Sarah Chen",
    preview: "Key takeaways: Improved deployment pipeline, need better QA process...",
  },
  {
    id: 2,
    title: "Client Feedback Session",
    date: "Jan 26, 2026",
    author: "Mike Johnson",
    preview: "Client requested mobile-first approach for the new dashboard...",
  },
];

export function MeetingNotesWidget() {
  const navigate = useNavigate();
  const URL = "/notes-2/notes"
  return (
    <WidgetCard 
    title="Meeting Notes" 
    icon={FileText} 
    action="All notes"
    onAction={() => navigate(URL, {replace: true})}
    >
      <div className="space-y-3">
        {notes.map((note) => (
          <div
            key={note.id}
            className="p-3 rounded-lg border border-border hover:border-primary/30 hover:bg-muted/30 transition-colors cursor-pointer"
          >
            <h4 className="text-sm font-medium text-foreground mb-1 line-clamp-1">
              {note.title}
            </h4>
            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{note.preview}</p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {note.date}
              </span>
              <span className="inline-flex items-center gap-1">
                <User className="w-3 h-3" />
                {note.author}
              </span>
            </div>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}

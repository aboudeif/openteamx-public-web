import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { WidgetCard } from "@/components/shared/WidgetCard";
import { FileText, Clock } from "lucide-react";
import { meetingNotesService } from "@/services";

type MeetingNoteItem = {
  id: string;
  title?: string;
  content?: string;
  createdAt?: string;
  updatedAt?: string;
};

function extractNotes(payload: unknown): MeetingNoteItem[] {
  if (Array.isArray(payload)) {
    return payload as MeetingNoteItem[];
  }

  if (payload && typeof payload === "object") {
    const candidate = payload as { items?: unknown; data?: unknown };
    if (Array.isArray(candidate.items)) {
      return candidate.items as MeetingNoteItem[];
    }
    if (Array.isArray(candidate.data)) {
      return candidate.data as MeetingNoteItem[];
    }
  }

  return [];
}

export function MeetingNotesWidget() {
  const navigate = useNavigate();
  const { teamId = "" } = useParams();
  const URL = `/${teamId}/notes`;
  const { data: rawNotes = [], isLoading } = useQuery<MeetingNoteItem[]>({
    queryKey: ["team-notes-widget", teamId],
    queryFn: async () => {
      const response = await meetingNotesService.getNotes(teamId);
      return extractNotes(response);
    },
    enabled: Boolean(teamId),
  });

  const notes = useMemo(() => rawNotes.slice(0, 3), [rawNotes]);

  return (
    <WidgetCard 
    title="Meeting Notes" 
    icon={FileText} 
    action="All notes"
    onAction={() => navigate(URL, {replace: true})}
    >
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading notes...</p>
      ) : notes.length === 0 ? (
        <p className="text-sm text-muted-foreground">No meeting notes yet.</p>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className="p-3 rounded-lg border border-border hover:border-primary/30 hover:bg-muted/30 transition-colors cursor-pointer"
              onClick={() => navigate(`/${teamId}/notes/${note.id}`)}
            >
              <h4 className="text-sm font-medium text-foreground mb-1 line-clamp-1">
                {note.title || "Untitled note"}
              </h4>
              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                {note.content || "No content preview."}
              </p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {note.updatedAt
                    ? new Date(note.updatedAt).toLocaleString()
                    : note.createdAt
                      ? new Date(note.createdAt).toLocaleString()
                      : "Unknown date"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </WidgetCard>
  );
}

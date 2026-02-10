import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate, useParams } from "react-router-dom";
import {
  Search,
  FileText,
  Calendar,
  Clock,
  Users,
  ChevronRight,
} from "lucide-react";

const meetingNotes = [
  {
    id: "note-1",
    title: "Sprint Planning - Q1 2026",
    meetingDate: "Feb 3, 2026",
    meetingTime: "10:00 AM",
    attendees: ["Sarah Chen", "Mike Johnson", "Alex Kim"],
    preview: "Discussed roadmap priorities for Q1. Key focus areas include improving user onboarding flow, implementing new analytics dashboard, and...",
    updatedAt: "2 hours ago",
  },
  {
    id: "note-2",
    title: "Design Review - Mobile App",
    meetingDate: "Feb 1, 2026",
    meetingTime: "2:00 PM",
    attendees: ["Emily Davis", "Sarah Chen"],
    preview: "Reviewed the new mobile app designs. Emily presented the updated navigation patterns. Team agreed on implementing bottom tab navigation with...",
    updatedAt: "2 days ago",
  },
  {
    id: "note-3",
    title: "Weekly Standup",
    meetingDate: "Jan 30, 2026",
    meetingTime: "9:00 AM",
    attendees: ["All Team"],
    preview: "Regular weekly standup. Updates from each team member on current tasks. Blockers discussed: API rate limiting issue needs attention from...",
    updatedAt: "5 days ago",
  },
  {
    id: "note-4",
    title: "Client Feedback Session",
    meetingDate: "Jan 28, 2026",
    meetingTime: "3:30 PM",
    attendees: ["Mike Johnson", "Client Team"],
    preview: "Collected feedback from client on the latest release. Overall positive reception. Specific requests: darker theme option, export to PDF...",
    updatedAt: "1 week ago",
  },
];

export default function TeamMeetingNotes() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedNote, setExpandedNote] = useState<string | null>(null);
  const navigate = useNavigate();
  const { teamId } = useParams();

  const filteredNotes = meetingNotes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="flex flex-col h-[calc(100vh-120px)]">
        {/* Header - Fixed */}
        <header className="sticky top-0 z-10 bg-background border-b border-border px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Meeting Notes</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Notes from team meetings and discussions
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="pl-9"
              aria-label="Search meeting notes"
            />
          </div>
        </header>

        {/* Notes List */}
        <ScrollArea className="flex-1 px-6">
          <div className="py-4 space-y-3">
            {filteredNotes.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No notes found</h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? "Try a different search term" : "Meeting notes will appear here"}
                </p>
              </div>
            ) : (
              filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className="p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <button
                        onClick={() => navigate(`/${teamId}/notes/${note.id}`)}
                        className="text-left w-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
                        aria-label={`View ${note.title}`}
                      >
                        <h3 className="font-semibold text-foreground flex items-center gap-2 hover:text-primary transition-colors">
                          <FileText className="w-4 h-4 text-primary" />
                          {note.title}
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </h3>
                      </button>

                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          {note.meetingDate}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          {note.meetingTime}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users className="w-4 h-4" />
                          {note.attendees.length} attendees
                        </span>
                      </div>

                      <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                        {note.preview}
                      </p>

                      {expandedNote === note.id && (
                        <div className="mt-3 pt-3 border-t border-border">
                          <p className="text-sm text-foreground">{note.preview}</p>
                        </div>
                      )}

                      <button
                        onClick={() => setExpandedNote(expandedNote === note.id ? null : note.id)}
                        className="text-sm text-primary hover:underline mt-2 focus:outline-none focus:ring-2 focus:ring-ring rounded"
                      >
                        {expandedNote === note.id ? "Show less" : "Show more"}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-border text-xs text-muted-foreground">
                    <span>Updated {note.updatedAt}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/${teamId}/notes/${note.id}`)}
                    >
                      View Full Note
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </MainLayout>
  );
}

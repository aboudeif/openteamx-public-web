import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CreateMeetingModal } from "@/features/meetings/components/CreateMeetingModal";
import { useNavigate, useParams } from "react-router-dom";
import {
  Search,
  Plus,
  Video,
  Calendar,
  Clock,
  Users,
  ExternalLink,
  Play,
} from "lucide-react";

const meetings = [
  {
    id: "meeting-1",
    title: "Weekly Standup",
    description: "Regular weekly team standup to sync on progress",
    date: "Feb 5, 2026",
    time: "9:00 AM",
    duration: "30 min",
    tool: "Google Meet",
    toolColor: "bg-success",
    project: null,
    attendees: ["SC", "MJ", "AK", "ED"],
    isRecurring: true,
    recurringDays: ["Mon", "Wed", "Fri"],
    status: "upcoming",
  },
  {
    id: "meeting-2",
    title: "Sprint Planning",
    description: "Q1 sprint planning and roadmap discussion",
    date: "Feb 10, 2026",
    time: "10:00 AM",
    duration: "2 hours",
    tool: "Zoom",
    toolColor: "bg-blue-500",
    project: "Mobile App Redesign",
    attendees: ["SC", "MJ", "AK"],
    isRecurring: false,
    status: "upcoming",
  },
  {
    id: "meeting-3",
    title: "Design Review",
    description: "Review new UI mockups for approval",
    date: "Feb 4, 2026",
    time: "2:00 PM",
    duration: "1 hour",
    tool: "Microsoft Teams",
    toolColor: "bg-purple-500",
    project: "Website Revamp",
    attendees: ["ED", "SC"],
    isRecurring: false,
    status: "in-progress",
  },
  {
    id: "meeting-4",
    title: "Client Sync",
    description: "Monthly sync with client team",
    date: "Feb 1, 2026",
    time: "3:00 PM",
    duration: "45 min",
    tool: "Cisco Webex",
    toolColor: "bg-green-500",
    project: "Backend API",
    attendees: ["MJ", "External"],
    isRecurring: true,
    recurringDays: ["1st of month"],
    status: "completed",
  },
];

export default function TeamMeetings() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { teamId } = useParams();

  const filteredMeetings = meetings.filter((meeting) =>
    meeting.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in-progress":
        return <Badge className="bg-success text-success-foreground">In Progress</Badge>;
      case "completed":
        return <Badge variant="secondary">Completed</Badge>;
      default:
        return <Badge variant="outline">Upcoming</Badge>;
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-col h-[calc(100vh-120px)]">
        {/* Header - Fixed */}
        <header className="sticky top-0 z-10 bg-background border-b border-border px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Meetings</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Schedule and manage team meetings
              </p>
            </div>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Meeting
            </Button>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search meetings..."
              className="pl-9"
              aria-label="Search meetings"
            />
          </div>
        </header>

        {/* Meetings List */}
        <ScrollArea className="flex-1 px-6">
          <div className="py-4 space-y-3">
            {filteredMeetings.length === 0 ? (
              <div className="text-center py-12">
                <Video className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No meetings found</h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? "Try a different search term" : "Schedule your first meeting"}
                </p>
              </div>
            ) : (
              filteredMeetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg ${meeting.toolColor} flex items-center justify-center`}>
                        <Video className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{meeting.title}</h3>
                        <p className="text-sm text-muted-foreground">{meeting.tool}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {meeting.project && (
                        <Badge variant="default">{meeting.project}</Badge>
                      )}
                      {!meeting.project && (
                        <Badge variant="secondary">Default</Badge>
                      )}
                      {getStatusBadge(meeting.status)}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">{meeting.description}</p>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {meeting.date}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {meeting.time} ({meeting.duration})
                    </span>
                    {meeting.isRecurring && (
                      <span className="text-primary">
                        Repeats: {meeting.recurringDays?.join(", ")}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <div className="flex -space-x-2">
                        {meeting.attendees.slice(0, 4).map((avatar, i) => (
                          <div
                            key={i}
                            className="w-7 h-7 rounded-full bg-primary/20 border-2 border-card flex items-center justify-center text-[10px] font-medium text-primary"
                          >
                            {avatar}
                          </div>
                        ))}
                        {meeting.attendees.length > 4 && (
                          <div className="w-7 h-7 rounded-full bg-muted border-2 border-card flex items-center justify-center text-[10px] font-medium text-muted-foreground">
                            +{meeting.attendees.length - 4}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {meeting.status === "in-progress" && (
                        <Button size="sm" className="bg-success hover:bg-success/90">
                          <Play className="w-4 h-4 mr-1" />
                          Join Now
                        </Button>
                      )}
                      {meeting.status === "upcoming" && (
                        <Button size="sm" variant="outline">
                          <ExternalLink className="w-4 h-4 mr-1" />
                          Open Meeting
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      <CreateMeetingModal open={showCreateModal} onOpenChange={setShowCreateModal} />
    </MainLayout>
  );
}

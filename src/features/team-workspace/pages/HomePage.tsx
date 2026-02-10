import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { ActivityWidget } from "@/features/team-workspace/components/ActivityWidget";
import { CalendarWidget } from "@/features/meetings/components/CalendarWidget";
import { MeetingsWidget } from "@/features/meetings/components/MeetingsWidget";
import { MeetingNotesWidget } from "@/features/meetings/components/MeetingNotesWidget";
import { MailWidget } from "@/features/mail/components/MailWidget";
import { ChatWidget } from "@/features/chat/components/ChatWidget";
import { TasksWidget } from "@/features/projects/components/TasksWidget";
import { DriveWidget } from "@/features/drive/components/DriveWidget";
import { JoinRequestsWidget } from "@/features/team-workspace/components/JoinRequestsWidget";
import { TeamSettingsModal } from "@/features/team-workspace/components/TeamSettingsModal";
import { Button } from "@/components/ui/button";
import { Settings, Users, Calendar, Tag, MapPin } from "lucide-react";

export default function TeamHome() {
  const [showSettings, setShowSettings] = useState(false);
  const isTeamLeader = true; // Mock: would come from auth context

  return (
    <MainLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Team Header */}
        <div className="mb-8">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-2xl font-bold text-primary-foreground">
              TV
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-semibold text-foreground">TechVentures Studio</h1>
                <span className="status-badge status-hiring">
                  <span className="w-1.5 h-1.5 rounded-full bg-warning" />
                  Hiring Now
                </span>
              </div>
              <p className="text-muted-foreground mb-3">
                A forward-thinking startup building next-gen AI tools for productivity and automation.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  12 members
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  Created 2 years ago
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  San Francisco, USA
                </span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {["React", "AI/ML", "TypeScript", "Node.js", "Python"].map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-sm font-medium text-secondary-foreground"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Widgets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <ActivityWidget />
          <CalendarWidget />
          <MeetingsWidget />
          <MailWidget />
          <ChatWidget />
          <TasksWidget />
          <MeetingNotesWidget />
          <DriveWidget />
          {isTeamLeader && <JoinRequestsWidget />}
        </div>
      </div>

      <TeamSettingsModal open={showSettings} onOpenChange={setShowSettings} />
    </MainLayout>
  );
}

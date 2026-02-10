import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Video,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  attendees: string[];
  description?: string;
  location?: string;
  meetingLink?: string;
  color: string;
}

const events: CalendarEvent[] = [
  {
    id: "1",
    title: "Sprint Planning",
    date: "2026-01-29",
    startTime: "09:00",
    endTime: "10:30",
    attendees: ["SC", "MJ", "AK", "ED", "JD"],
    description: "Plan tasks for Sprint 13",
    meetingLink: "https://meet.google.com/abc-xyz",
    color: "bg-primary",
  },
  {
    id: "2",
    title: "Design Review",
    date: "2026-01-29",
    startTime: "14:00",
    endTime: "15:00",
    attendees: ["SC", "MJ"],
    description: "Review new dashboard designs",
    meetingLink: "https://zoom.us/j/123456",
    color: "bg-info",
  },
  {
    id: "3",
    title: "Client Call",
    date: "2026-01-30",
    startTime: "11:00",
    endTime: "12:00",
    attendees: ["JD", "SC"],
    description: "Monthly progress update",
    location: "Conference Room A",
    color: "bg-warning",
  },
  {
    id: "4",
    title: "Team Standup",
    date: "2026-01-31",
    startTime: "09:30",
    endTime: "09:45",
    attendees: ["SC", "MJ", "AK", "ED"],
    meetingLink: "https://meet.google.com/standup",
    color: "bg-success",
  },
  {
    id: "5",
    title: "Product Demo",
    date: "2026-02-03",
    startTime: "15:00",
    endTime: "16:30",
    attendees: ["JD", "SC", "MJ", "AK", "ED"],
    description: "Demo new features to stakeholders",
    location: "Main Auditorium",
    color: "bg-destructive",
  },
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function TeamCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 29));
  const [view, setView] = useState<"month" | "week">("month");
  const [isCreating, setIsCreating] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const today = () => {
    setCurrentDate(new Date(2026, 0, 29));
  };

  const getEventsForDate = (date: string) => {
    return events.filter((e) => e.date === date);
  };

  const formatDate = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  };

  // Generate calendar grid
  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  const isToday = (day: number) => {
    return year === 2026 && month === 0 && day === 29;
  };

  return (
    <MainLayout>
      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prevMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={nextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <h1 className="text-xl font-semibold text-foreground">
              {months[month]} {year}
            </h1>
            <Button variant="outline" size="sm" onClick={today}>
              Today
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button
                onClick={() => setView("month")}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium transition-colors",
                  view === "month" ? "bg-primary text-primary-foreground" : "bg-card text-foreground hover:bg-muted"
                )}
              >
                Month
              </button>
              <button
                onClick={() => setView("week")}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium transition-colors",
                  view === "week" ? "bg-primary text-primary-foreground" : "bg-card text-foreground hover:bg-muted"
                )}
              >
                Week
              </button>
            </div>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-auto">
          {/* Days of week header */}
          <div className="grid grid-cols-7 border-b border-border bg-muted/30">
            {daysOfWeek.map((day) => (
              <div
                key={day}
                className="py-3 text-center text-sm font-medium text-muted-foreground"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar cells */}
          <div className="grid grid-cols-7 flex-1">
            {calendarDays.map((day, index) => {
              const dateStr = day ? formatDate(day) : "";
              const dayEvents = day ? getEventsForDate(dateStr) : [];

              return (
                <div
                  key={index}
                  className={cn(
                    "min-h-[120px] border-b border-r border-border p-2 transition-colors",
                    day ? "bg-card hover:bg-muted/30 cursor-pointer" : "bg-muted/20",
                    index % 7 === 0 && "border-l"
                  )}
                >
                  {day && (
                    <>
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={cn(
                            "inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium",
                            isToday(day)
                              ? "bg-primary text-primary-foreground"
                              : "text-foreground"
                          )}
                        >
                          {day}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 3).map((event) => (
                          <button
                            key={event.id}
                            onClick={() => setSelectedEvent(event)}
                            className={cn(
                              "calendar-event w-full text-left",
                              event.color,
                              "text-primary-foreground"
                            )}
                          >
                            {event.startTime} {event.title}
                          </button>
                        ))}
                        {dayEvents.length > 3 && (
                          <p className="text-xs text-muted-foreground px-2">
                            +{dayEvents.length - 3} more
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Event Detail Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-xl shadow-lg w-full max-w-md">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className={cn("w-3 h-3 rounded-full", selectedEvent.color)} />
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedEvent(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-semibold text-foreground mb-4">{selectedEvent.title}</h3>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{selectedEvent.startTime} - {selectedEvent.endTime}</span>
                  </div>

                  {selectedEvent.location && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{selectedEvent.location}</span>
                    </div>
                  )}

                  {selectedEvent.meetingLink && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Video className="w-4 h-4" />
                      <a href={selectedEvent.meetingLink} className="text-primary hover:underline">
                        Join meeting
                      </a>
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <div className="flex -space-x-2">
                      {selectedEvent.attendees.map((attendee, i) => (
                        <div
                          key={i}
                          className="w-7 h-7 rounded-full bg-primary/20 border-2 border-card flex items-center justify-center text-[10px] font-medium text-primary"
                        >
                          {attendee}
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedEvent.description && (
                    <p className="text-foreground pt-3 border-t border-border">
                      {selectedEvent.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="p-4 border-t border-border flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setSelectedEvent(null)}>
                  Close
                </Button>
                <Button className="flex-1">
                  Edit Event
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Create Event Modal */}
        {isCreating && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-xl shadow-lg w-full max-w-md">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold">Create Event</h3>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsCreating(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Title</label>
                  <Input placeholder="Event title" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Date</label>
                    <Input type="date" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Time</label>
                    <div className="flex gap-2">
                      <Input type="time" placeholder="Start" />
                      <Input type="time" placeholder="End" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Attendees</label>
                  <Input placeholder="@name, @name..." />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Location / Meeting Link</label>
                  <Input placeholder="Add location or meeting link" />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Description</label>
                  <textarea
                    className="w-full h-20 px-3 py-2 rounded-lg border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Add description..."
                  />
                </div>
              </div>

              <div className="p-4 border-t border-border flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
                <Button className="flex-1">
                  Create Event
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

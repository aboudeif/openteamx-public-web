import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, Clock, MapPin, Plus, Video, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

type CalendarView = "month" | "week" | "day";

interface CalendarAttendee {
  id: string;
  userName?: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  location?: string;
  videoUrl?: string;
  type?: string;
  startTime: string;
  endTime: string;
  attendees?: CalendarAttendee[];
}

interface CalendarEventPayload {
  title: string;
  description?: string;
  location?: string;
  videoUrl?: string;
  type?: string;
  startTime: string;
  endTime: string;
  timezone: string;
  isAllDay: boolean;
}

interface EventFormState {
  title: string;
  description: string;
  location: string;
  videoUrl: string;
  type: string;
  startLocal: string;
  endLocal: string;
}

const HOUR_HEIGHT = 64;
const HOURS_IN_DAY = 24;
const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function extractCalendarEvents(payload: unknown): CalendarEvent[] {
  if (Array.isArray(payload)) {
    return payload as CalendarEvent[];
  }

  if (payload && typeof payload === "object") {
    const candidate = payload as { items?: unknown; data?: unknown };
    if (Array.isArray(candidate.items)) {
      return candidate.items as CalendarEvent[];
    }
    if (Array.isArray(candidate.data)) {
      return candidate.data as CalendarEvent[];
    }
  }

  return [];
}

function startOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function endOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(23, 59, 59, 999);
  return value;
}

function startOfWeek(date: Date) {
  const value = startOfDay(date);
  value.setDate(value.getDate() - value.getDay());
  return value;
}

function endOfWeek(date: Date) {
  const value = startOfWeek(date);
  value.setDate(value.getDate() + 6);
  return endOfDay(value);
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function addDays(date: Date, amount: number) {
  const value = new Date(date);
  value.setDate(value.getDate() + amount);
  return value;
}

function addMonths(date: Date, amount: number) {
  const value = new Date(date);
  value.setMonth(value.getMonth() + amount);
  return value;
}

function isSameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function formatHour(hour: number) {
  const d = new Date();
  d.setHours(hour, 0, 0, 0);
  return d.toLocaleTimeString([], { hour: "numeric" });
}

function formatDayHeader(date: Date) {
  return date.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function getEventSegmentForDay(event: CalendarEvent, dayDate: Date) {
  const dayStart = startOfDay(dayDate).getTime();
  const dayEnd = dayStart + 24 * 60 * 60 * 1000;
  const eventStart = new Date(event.startTime).getTime();
  const eventEnd = new Date(event.endTime).getTime();

  if (Number.isNaN(eventStart) || Number.isNaN(eventEnd) || eventEnd <= eventStart) {
    return null;
  }

  const overlapStart = Math.max(dayStart, eventStart);
  const overlapEnd = Math.min(dayEnd, eventEnd);

  if (overlapEnd <= overlapStart) {
    return null;
  }

  const minutesFromStart = (overlapStart - dayStart) / (1000 * 60);
  const durationMinutes = (overlapEnd - overlapStart) / (1000 * 60);

  return {
    top: (minutesFromStart / 60) * HOUR_HEIGHT,
    height: Math.max((durationMinutes / 60) * HOUR_HEIGHT, 18),
  };
}

function eventOverlapsDate(event: CalendarEvent, day: Date) {
  return getEventSegmentForDay(event, day) !== null;
}

function toLocalInputValue(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function roundToNextHour(baseDate: Date) {
  const value = new Date(baseDate);
  value.setMinutes(0, 0, 0);
  value.setHours(value.getHours() + 1);
  return value;
}

function buildDefaultForm(baseDate: Date): EventFormState {
  const start = roundToNextHour(baseDate);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  return {
    title: "",
    description: "",
    location: "",
    videoUrl: "",
    type: "MEETING",
    startLocal: toLocalInputValue(start),
    endLocal: toLocalInputValue(end),
  };
}

function eventToFormState(event: CalendarEvent): EventFormState {
  return {
    title: event.title ?? "",
    description: event.description ?? "",
    location: event.location ?? "",
    videoUrl: event.videoUrl ?? "",
    type: event.type || "MEETING",
    startLocal: toLocalInputValue(new Date(event.startTime)),
    endLocal: toLocalInputValue(new Date(event.endTime)),
  };
}

function formToPayload(form: EventFormState): CalendarEventPayload {
  return {
    title: form.title.trim(),
    description: form.description.trim() || undefined,
    location: form.location.trim() || undefined,
    videoUrl: form.videoUrl.trim() || undefined,
    type: form.type || "MEETING",
    startTime: new Date(form.startLocal).toISOString(),
    endTime: new Date(form.endLocal).toISOString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    isAllDay: false,
  };
}

export default function TeamCalendar() {
  const { teamId = "" } = useParams();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [view, setView] = useState<CalendarView>("month");
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formState, setFormState] = useState<EventFormState>(() => buildDefaultForm(new Date()));

  const monthGridDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const firstVisible = startOfWeek(monthStart);
    return Array.from({ length: 42 }, (_, index) => addDays(firstVisible, index));
  }, [currentDate]);

  const visibleDays = useMemo(() => {
    if (view === "day") {
      return [startOfDay(currentDate)];
    }
    if (view === "week") {
      const weekStart = startOfWeek(currentDate);
      return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
    }
    return monthGridDays;
  }, [currentDate, view, monthGridDays]);

  const rangeStart = useMemo(() => startOfDay(visibleDays[0]).toISOString(), [visibleDays]);
  const rangeEnd = useMemo(() => endOfDay(visibleDays[visibleDays.length - 1]).toISOString(), [visibleDays]);

  const { data: rawEvents = [], isLoading, isError } = useQuery<CalendarEvent[]>({
    queryKey: ["team-calendar-page", teamId, view, rangeStart, rangeEnd],
    queryFn: async () => {
      const response = await api.get<unknown>(
        `/teams/${teamId}/calendar?from=${encodeURIComponent(rangeStart)}&to=${encodeURIComponent(rangeEnd)}`
      );
      return extractCalendarEvents(response);
    },
    enabled: Boolean(teamId),
    retry: false,
  });

  const events = useMemo(
    () =>
      rawEvents
        .filter(
          (event) =>
            !Number.isNaN(new Date(event.startTime).getTime()) &&
            !Number.isNaN(new Date(event.endTime).getTime())
        )
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()),
    [rawEvents]
  );

  const createMutation = useMutation({
    mutationFn: (payload: CalendarEventPayload) =>
      api.post(`/teams/${teamId}/calendar`, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["team-calendar-page"] });
      void queryClient.invalidateQueries({ queryKey: ["team-calendar-widget"] });
      toast({ title: "Event created" });
      setIsFormOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create event", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ eventId, payload }: { eventId: string; payload: CalendarEventPayload }) =>
      api.patch(`/teams/${teamId}/calendar/${eventId}`, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["team-calendar-page"] });
      void queryClient.invalidateQueries({ queryKey: ["team-calendar-widget"] });
      toast({ title: "Event updated" });
      setSelectedEvent(null);
      setIsFormOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update event", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (eventId: string) => api.delete(`/teams/${teamId}/calendar/${eventId}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["team-calendar-page"] });
      void queryClient.invalidateQueries({ queryKey: ["team-calendar-widget"] });
      toast({ title: "Event deleted" });
      setSelectedEvent(null);
      setIsFormOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete event", description: error.message, variant: "destructive" });
    },
  });

  const hours = useMemo(() => Array.from({ length: HOURS_IN_DAY }, (_, hour) => hour), []);
  const weekDays = useMemo(
    () => (view === "week" ? visibleDays : view === "day" ? [visibleDays[0]] : []),
    [view, visibleDays]
  );

  const openCreateModal = (seedDate?: Date) => {
    setFormMode("create");
    setEditingEventId(null);
    setFormState(buildDefaultForm(seedDate || currentDate));
    setIsFormOpen(true);
  };

  const openEditModal = (event: CalendarEvent) => {
    setFormMode("edit");
    setEditingEventId(event.id);
    setFormState(eventToFormState(event));
    setIsFormOpen(true);
  };

  const goToPrevious = () => {
    setCurrentDate((prev) => {
      if (view === "day") return addDays(prev, -1);
      if (view === "week") return addDays(prev, -7);
      return addMonths(prev, -1);
    });
  };

  const goToNext = () => {
    setCurrentDate((prev) => {
      if (view === "day") return addDays(prev, 1);
      if (view === "week") return addDays(prev, 7);
      return addMonths(prev, 1);
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const title = useMemo(() => {
    if (view === "day") {
      return currentDate.toLocaleDateString([], {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }
    if (view === "week") {
      const start = startOfWeek(currentDate);
      const end = addDays(start, 6);
      const startLabel = start.toLocaleDateString([], { month: "short", day: "numeric" });
      const endLabel = end.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
      return `${startLabel} - ${endLabel}`;
    }
    return currentDate.toLocaleDateString([], { month: "long", year: "numeric" });
  }, [currentDate, view]);

  const isMutating = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  const submitForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formState.title.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }

    const start = new Date(formState.startLocal);
    const end = new Date(formState.endLocal);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
      toast({
        title: "Invalid date range",
        description: "End time must be later than start time.",
        variant: "destructive",
      });
      return;
    }

    const payload = formToPayload(formState);
    if (formMode === "create") {
      createMutation.mutate(payload);
      return;
    }

    if (editingEventId) {
      updateMutation.mutate({ eventId: editingEventId, payload });
    }
  };

  const renderMonthView = () => (
    <div className="flex-1 overflow-auto bg-card">
      <div className="grid grid-cols-7 border-b border-border bg-muted/30">
        {DAYS_OF_WEEK.map((day) => (
          <div key={day} className="py-3 text-center text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {monthGridDays.map((day) => {
          const dayEvents = events.filter((event) => eventOverlapsDate(event, day));
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          const isTodayCell = isSameDay(day, new Date());

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => openCreateModal(day)}
              className={cn(
                "min-h-[130px] border-r border-b border-border p-2 text-left align-top transition-colors",
                "hover:bg-muted/30",
                isCurrentMonth ? "bg-card" : "bg-muted/20"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={cn(
                    "inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium",
                    isTodayCell ? "bg-primary text-primary-foreground" : "text-foreground"
                  )}
                >
                  {day.getDate()}
                </span>
                <Plus className="w-3.5 h-3.5 text-muted-foreground" />
              </div>

              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((eventItem) => (
                  <button
                    key={`${eventItem.id}-${day.toISOString()}`}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEvent(eventItem);
                    }}
                    className="w-full rounded px-2 py-1 text-left text-[11px] bg-primary/10 text-foreground hover:bg-primary/15"
                  >
                    {new Date(eventItem.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} {eventItem.title}
                  </button>
                ))}
                {dayEvents.length > 3 && (
                  <p className="px-1 text-[11px] text-muted-foreground">+{dayEvents.length - 3} more</p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderWeekDayView = () => (
    <div className="flex-1 overflow-auto bg-card">
      <div className={cn("min-h-full", view === "week" ? "min-w-[1080px]" : "min-w-0")}>
        <div
          className={cn(
            "grid sticky top-0 z-10 bg-card border-b border-border",
            view === "day"
              ? "grid-cols-[72px_minmax(0,1fr)]"
              : "grid-cols-[72px_repeat(7,minmax(140px,1fr))]"
          )}
        >
          <div className="border-r border-border" />
          {weekDays.map((day) => (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => openCreateModal(day)}
              className={cn(
                "px-3 py-2 border-r border-border text-sm font-medium text-left hover:bg-muted/20",
                isSameDay(day, new Date()) && "text-primary"
              )}
            >
              {formatDayHeader(day)}
            </button>
          ))}
        </div>

        <div
          className={cn(
            "grid",
            view === "day"
              ? "grid-cols-[72px_minmax(0,1fr)]"
              : "grid-cols-[72px_repeat(7,minmax(140px,1fr))]"
          )}
        >
          <div className="border-r border-border bg-muted/20">
            {hours.map((hour) => (
              <div
                key={hour}
                className="h-16 border-b border-border/70 px-2 text-[11px] text-muted-foreground flex items-start justify-end pt-1"
              >
                {formatHour(hour)}
              </div>
            ))}
          </div>

          {weekDays.map((day) => {
            const daySegments = events
              .map((event) => ({
                event,
                segment: getEventSegmentForDay(event, day),
              }))
              .filter(
                (
                  candidate
                ): candidate is { event: CalendarEvent; segment: { top: number; height: number } } =>
                  candidate.segment !== null
              );

            return (
              <div
                key={day.toISOString()}
                className="relative border-r border-border"
                onDoubleClick={() => openCreateModal(day)}
              >
                <div className="absolute inset-0">
                  {hours.map((hour) => (
                    <div key={hour} className="h-16 border-b border-border/70" />
                  ))}
                </div>

                <div className="relative" style={{ height: `${HOURS_IN_DAY * HOUR_HEIGHT}px` }}>
                  {daySegments.map(({ event, segment }) => (
                    <button
                      key={`${event.id}-${day.toISOString()}`}
                      type="button"
                      onClick={() => setSelectedEvent(event)}
                      className="absolute left-1 right-1 rounded-md border border-primary/30 bg-primary/10 hover:bg-primary/15 p-2 text-left"
                      style={{
                        top: `${segment.top}px`,
                        height: `${segment.height}px`,
                      }}
                    >
                      <p className="text-xs font-semibold text-foreground truncate">{event.title}</p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {new Date(event.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
                        {new Date(event.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <MainLayout>
      <div className="flex flex-col h-[calc(100vh-120px)]">
        <div className="flex items-center justify-between p-4 border-b border-border bg-card">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goToPrevious}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goToNext}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <h1 className="text-xl font-semibold text-foreground">{title}</h1>
            <Button variant="outline" size="sm" onClick={goToToday}>
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
              <button
                onClick={() => setView("day")}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium transition-colors",
                  view === "day" ? "bg-primary text-primary-foreground" : "bg-card text-foreground hover:bg-muted"
                )}
              >
                Day
              </button>
            </div>
            <Button onClick={() => openCreateModal()}>
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="p-4 text-sm text-muted-foreground">Loading events...</div>
        ) : isError ? (
          <div className="p-4 text-sm text-muted-foreground">Failed to load calendar events.</div>
        ) : view === "month" ? (
          renderMonthView()
        ) : (
          renderWeekDayView()
        )}

        {selectedEvent && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-xl shadow-lg w-full max-w-md">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold text-foreground">{selectedEvent.title}</h3>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedEvent(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="p-6">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>
                      {new Date(selectedEvent.startTime).toLocaleString()} - {new Date(selectedEvent.endTime).toLocaleString()}
                    </span>
                  </div>

                  {selectedEvent.location && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{selectedEvent.location}</span>
                    </div>
                  )}

                  {selectedEvent.videoUrl && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Video className="w-4 h-4" />
                      <a href={selectedEvent.videoUrl} className="text-primary hover:underline">
                        Join meeting
                      </a>
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    {selectedEvent.attendees && selectedEvent.attendees.length > 0 ? (
                      <div className="flex -space-x-2">
                        {selectedEvent.attendees.slice(0, 6).map((attendee) => (
                          <div
                            key={attendee.id}
                            className="w-7 h-7 rounded-full bg-primary/20 border-2 border-card flex items-center justify-center text-[10px] font-medium text-primary"
                          >
                            {getInitials(attendee.userName || "U")}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span>No attendees</span>
                    )}
                  </div>

                  {selectedEvent.description && (
                    <p className="text-foreground pt-3 border-t border-border">{selectedEvent.description}</p>
                  )}
                </div>
              </div>

              <div className="p-4 border-t border-border flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setSelectedEvent(null)}>
                  Close
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => openEditModal(selectedEvent)}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  disabled={deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate(selectedEvent.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}

        {isFormOpen && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-xl shadow-lg w-full max-w-lg">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold">{formMode === "create" ? "Create Event" : "Edit Event"}</h3>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsFormOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <form className="p-6 space-y-4" onSubmit={submitForm}>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Title</label>
                  <Input
                    required
                    value={formState.title}
                    onChange={(event) => setFormState((prev) => ({ ...prev, title: event.target.value }))}
                    placeholder="Event title"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Type</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formState.type}
                    onChange={(event) => setFormState((prev) => ({ ...prev, type: event.target.value }))}
                  >
                    <option value="MEETING">Meeting</option>
                    <option value="DEADLINE">Deadline</option>
                    <option value="INTERVIEW">Interview</option>
                    <option value="REVIEW">Review</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Start</label>
                    <Input
                      type="datetime-local"
                      required
                      value={formState.startLocal}
                      onChange={(event) => setFormState((prev) => ({ ...prev, startLocal: event.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">End</label>
                    <Input
                      type="datetime-local"
                      required
                      value={formState.endLocal}
                      onChange={(event) => setFormState((prev) => ({ ...prev, endLocal: event.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Location</label>
                  <Input
                    value={formState.location}
                    onChange={(event) => setFormState((prev) => ({ ...prev, location: event.target.value }))}
                    placeholder="Conference room, office, etc."
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Meeting Link</label>
                  <Input
                    value={formState.videoUrl}
                    onChange={(event) => setFormState((prev) => ({ ...prev, videoUrl: event.target.value }))}
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Description</label>
                  <Textarea
                    value={formState.description}
                    onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
                    placeholder="Add description..."
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setIsFormOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isMutating}>
                    {formMode === "create" ? "Create Event" : "Save Changes"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

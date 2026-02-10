import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Video, Users, Clock, Calendar, Repeat } from "lucide-react";

interface CreateMeetingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const meetingTools = [
  { id: "zoom", name: "Zoom" },
  { id: "google-meet", name: "Google Meet" },
  { id: "teams", name: "Microsoft Teams" },
  { id: "webex", name: "Cisco Webex" },
  { id: "skype", name: "Skype" },
  { id: "slack", name: "Slack (Huddles)" },
  { id: "goto", name: "GoTo Meeting" },
  { id: "bluejeans", name: "BlueJeans" },
  { id: "jitsi", name: "Jitsi" },
  { id: "whereby", name: "Whereby" },
];

const mockProjects = [
  { id: "default", name: "Default (No Project)" },
  { id: "project-1", name: "Mobile App Redesign" },
  { id: "project-2", name: "Backend API" },
  { id: "project-3", name: "Website Revamp" },
];

const teamMembers = [
  { id: "user-1", name: "Sarah Chen", avatar: "SC" },
  { id: "user-2", name: "Mike Johnson", avatar: "MJ" },
  { id: "user-3", name: "Alex Kim", avatar: "AK" },
  { id: "user-4", name: "Emily Davis", avatar: "ED" },
];

const repeatOptions = [
  { id: "none", name: "Does not repeat" },
  { id: "daily", name: "Daily" },
  { id: "weekly", name: "Weekly" },
  { id: "monthly", name: "Monthly" },
  { id: "yearly", name: "Yearly" },
];

const weekDays = [
  { id: "sun", name: "Sun" },
  { id: "mon", name: "Mon" },
  { id: "tue", name: "Tue" },
  { id: "wed", name: "Wed" },
  { id: "thu", name: "Thu" },
  { id: "fri", name: "Fri" },
  { id: "sat", name: "Sat" },
];

export function CreateMeetingModal({ open, onOpenChange }: CreateMeetingModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [meetingTool, setMeetingTool] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  const [duration, setDuration] = useState("60");
  const [project, setProject] = useState("default");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [repeatType, setRepeatType] = useState("none");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const toggleMember = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const toggleDay = (dayId: string) => {
    setSelectedDays((prev) =>
      prev.includes(dayId)
        ? prev.filter((id) => id !== dayId)
        : [...prev, dayId]
    );
  };

  const handleCreate = () => {
    // Mock create action
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setMeetingTool("");
    setMeetingDate("");
    setMeetingTime("");
    setDuration("60");
    setProject("default");
    setSelectedMembers([]);
    setRepeatType("none");
    setSelectedDays([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto" aria-describedby="create-meeting-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="w-5 h-5 text-primary" />
            Create New Meeting
          </DialogTitle>
        </DialogHeader>

        <p id="create-meeting-description" className="sr-only">
          Schedule a new team meeting
        </p>

        <div className="space-y-4 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Meeting Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter meeting title"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Meeting description..."
              rows={3}
            />
          </div>

          {/* Meeting Tool */}
          <div className="space-y-2">
            <Label htmlFor="tool">Meeting Tool</Label>
            <Select value={meetingTool} onValueChange={setMeetingTool}>
              <SelectTrigger id="tool">
                <SelectValue placeholder="Select meeting platform" />
              </SelectTrigger>
              <SelectContent>
                {meetingTools.map((tool) => (
                  <SelectItem key={tool.id} value={tool.id}>
                    {tool.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={meetingTime}
                onChange={(e) => setMeetingTime(e.target.value)}
              />
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger id="duration">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="90">1.5 hours</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Project */}
          <div className="space-y-2">
            <Label htmlFor="project">Assign to Project</Label>
            <Select value={project} onValueChange={setProject}>
              <SelectTrigger id="project">
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {mockProjects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Participants */}
          <div className="space-y-2">
            <Label>Participants</Label>
            <div className="flex flex-wrap gap-2 p-3 rounded-lg border border-border">
              {teamMembers.map((member) => (
                <button
                  key={member.id}
                  onClick={() => toggleMember(member.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors ${
                    selectedMembers.includes(member.id)
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                  aria-label={`${selectedMembers.includes(member.id) ? "Remove" : "Add"} ${member.name}`}
                >
                  <div className="w-5 h-5 rounded-full bg-background/20 flex items-center justify-center text-xs font-medium">
                    {member.avatar}
                  </div>
                  {member.name}
                </button>
              ))}
            </div>
          </div>

          {/* Repeat */}
          <div className="space-y-2">
            <Label htmlFor="repeat">Repeat</Label>
            <Select value={repeatType} onValueChange={setRepeatType}>
              <SelectTrigger id="repeat">
                <SelectValue placeholder="Select repeat option" />
              </SelectTrigger>
              <SelectContent>
                {repeatOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Week Days (shown if weekly) */}
          {repeatType === "weekly" && (
            <div className="space-y-2">
              <Label>Repeat on Days</Label>
              <div className="flex gap-2">
                {weekDays.map((day) => (
                  <button
                    key={day.id}
                    onClick={() => toggleDay(day.id)}
                    className={`w-10 h-10 rounded-full text-sm font-medium transition-colors ${
                      selectedDays.includes(day.id)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                    aria-label={day.name}
                  >
                    {day.name.charAt(0)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!title || !meetingTool}>
            Create Meeting
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

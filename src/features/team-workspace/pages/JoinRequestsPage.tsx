import { useState } from "react";
import { useParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Settings,
  UserPlus,
  Check,
  X,
  Video,
  Eye,
  Mail,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface JoinRequest {
  id: string;
  name: string;
  initials: string;
  email: string;
  role: string;
  specializations: string[];
  experience: string;
  appliedAt: string;
  status: "pending" | "interviewing" | "accepted" | "rejected";
}

const mockRequests: JoinRequest[] = [
  { id: "1", name: "Ahmed Hassan", initials: "AH", email: "ahmed@example.com", role: "Frontend Developer", specializations: ["React", "TypeScript"], experience: "5 years", appliedAt: "2 hours ago", status: "pending" },
  { id: "2", name: "Sara Mohamed", initials: "SM", email: "sara@example.com", role: "UI/UX Designer", specializations: ["Figma", "User Research"], experience: "3 years", appliedAt: "5 hours ago", status: "pending" },
  { id: "3", name: "Omar Ali", initials: "OA", email: "omar@example.com", role: "Backend Developer", specializations: ["Node.js", "Python"], experience: "4 years", appliedAt: "1 day ago", status: "interviewing" },
  { id: "4", name: "Layla Ibrahim", initials: "LI", email: "layla@example.com", role: "Product Manager", specializations: ["Agile", "Scrum"], experience: "6 years", appliedAt: "2 days ago", status: "pending" },
  { id: "5", name: "Youssef Karim", initials: "YK", email: "youssef@example.com", role: "DevOps Engineer", specializations: ["AWS", "Docker"], experience: "4 years", appliedAt: "3 days ago", status: "pending" },
];

export default function TeamJoinRequests() {
  const { teamId } = useParams();
  const [requests, setRequests] = useState(mockRequests);
  const [searchQuery, setSearchQuery] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<JoinRequest | null>(null);
  const [loadedCount, setLoadedCount] = useState(10);

  // Interview invitation settings
  const [inviteMessage, setInviteMessage] = useState(
    "Dear {name},\n\nWe are pleased to invite you to an interview for the {role} position at our team.\n\nPlease join us at the following time and link.\n\nBest regards,\nTeam Leader"
  );
  const [meetingLink, setMeetingLink] = useState("https://meet.google.com/abc-xyz-123");
  const [interviewTime, setInterviewTime] = useState("");

  const handleInviteToInterview = (request: JoinRequest) => {
    setSelectedRequest(request);
    setShowInviteModal(true);
  };

  const handleAccept = (id: string) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: "accepted" } : r));
  };

  const handleReject = (id: string) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: "rejected" } : r));
  };

  const sendInvitation = () => {
    if (selectedRequest) {
      setRequests(prev => prev.map(r => r.id === selectedRequest.id ? { ...r, status: "interviewing" } : r));
      setShowInviteModal(false);
      setSelectedRequest(null);
    }
  };

  const filteredRequests = requests.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayedRequests = filteredRequests.slice(0, loadedCount);

  return (
    <MainLayout>
      <div className="h-[calc(100vh-120px)] overflow-auto p-6 lg:p-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Join Requests</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {requests.filter(r => r.status === "pending").length} pending requests
            </p>
          </div>
          <Button variant="outline" onClick={() => setShowSettingsModal(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Interview Settings
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search requests..."
            className="pl-9"
          />
        </div>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-24 h-24 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <UserPlus className="w-12 h-12 text-muted-foreground/50" />
            </div>
            <p className="text-lg font-medium text-foreground mb-1">No join requests</p>
            <p className="text-sm text-muted-foreground">New requests will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedRequests.map((request) => (
              <div
                key={request.id}
                className={cn(
                  "p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors",
                  request.status === "accepted" && "bg-success/5 border-success/30",
                  request.status === "rejected" && "bg-destructive/5 border-destructive/30 opacity-60"
                )}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary flex-shrink-0">
                    {request.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{request.name}</h3>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-medium uppercase",
                        request.status === "pending" && "bg-warning/10 text-warning",
                        request.status === "interviewing" && "bg-info/10 text-info",
                        request.status === "accepted" && "bg-success/10 text-success",
                        request.status === "rejected" && "bg-destructive/10 text-destructive"
                      )}>
                        {request.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{request.role} • {request.experience}</p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {request.specializations.map((spec) => (
                        <span key={spec} className="px-2 py-0.5 rounded bg-muted text-xs text-muted-foreground">
                          {spec}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">Applied {request.appliedAt}</p>
                  </div>
                  {request.status === "pending" && (
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleInviteToInterview(request)}>
                        <Video className="w-4 h-4 mr-1" />
                        Interview
                      </Button>
                      <Button variant="default" size="sm" onClick={() => handleAccept(request.id)}>
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleReject(request.id)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  {request.status === "interviewing" && (
                    <div className="flex items-center gap-2">
                      <Button variant="default" size="sm" onClick={() => handleAccept(request.id)}>
                        <Check className="w-4 h-4 mr-1" />
                        Accept
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleReject(request.id)}>
                        <X className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loadedCount < filteredRequests.length && (
              <div className="flex justify-center pt-4">
                <Button variant="outline" onClick={() => setLoadedCount(prev => prev + 10)}>
                  Load more
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Interview Invitation Modal */}
      <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Invite to Interview</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedRequest && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary">
                  {selectedRequest.initials}
                </div>
                <div>
                  <p className="font-medium">{selectedRequest.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedRequest.role}</p>
                </div>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Meeting Link</label>
              <Input
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                placeholder="https://meet.google.com/..."
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Interview Time</label>
              <Input
                type="datetime-local"
                value={interviewTime}
                onChange={(e) => setInterviewTime(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Invitation Message</label>
              <textarea
                value={inviteMessage.replace("{name}", selectedRequest?.name || "").replace("{role}", selectedRequest?.role || "")}
                onChange={(e) => setInviteMessage(e.target.value)}
                className="w-full h-32 px-3 py-2 rounded-lg border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteModal(false)}>Cancel</Button>
            <Button onClick={sendInvitation}>
              <Mail className="w-4 h-4 mr-2" />
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Interview Settings Modal */}
      <Dialog open={showSettingsModal} onOpenChange={setShowSettingsModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Interview Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Default Meeting Link</label>
              <Input
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                placeholder="https://meet.google.com/..."
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Invitation Message Template</label>
              <textarea
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                className="w-full h-40 px-3 py-2 rounded-lg border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Use {name} and {role} as placeholders"
              />
              <p className="text-xs text-muted-foreground mt-1">Use {"{name}"} and {"{role}"} as placeholders</p>
            </div>
            <Collapsible>
              <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-foreground">
                <ChevronDown className="w-4 h-4" />
                Interview Requirements
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-3 space-y-3">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Required Documents</label>
                  <Input placeholder="e.g., Portfolio, CV, Cover Letter" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Interview Duration</label>
                  <Input placeholder="e.g., 30 minutes" />
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettingsModal(false)}>Cancel</Button>
            <Button onClick={() => setShowSettingsModal(false)}>Save Settings</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}

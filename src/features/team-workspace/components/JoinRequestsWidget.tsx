import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { WidgetCard } from "@/components/shared/WidgetCard";
import { UserPlus, Check, X, Video, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface JoinRequest {
  id: string;
  name: string;
  initials: string;
  role: string;
  appliedAt: string;
}

const mockRequests: JoinRequest[] = [
  { id: "1", name: "Ahmed Hassan", initials: "AH", role: "Frontend Developer", appliedAt: "2 hours ago" },
  { id: "2", name: "Sara Mohamed", initials: "SM", role: "UI/UX Designer", appliedAt: "5 hours ago" },
  { id: "3", name: "Omar Ali", initials: "OA", role: "Backend Developer", appliedAt: "1 day ago" },
  { id: "4", name: "Layla Ibrahim", initials: "LI", role: "Product Manager", appliedAt: "2 days ago" },
  { id: "5", name: "Youssef Karim", initials: "YK", role: "DevOps Engineer", appliedAt: "3 days ago" },
];

export function JoinRequestsWidget() {
  const { teamId = "team-1" } = useParams();
  const navigate = useNavigate();
  const [requests, setRequests] = useState(mockRequests.slice(0, 5));
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<JoinRequest | null>(null);
  const [meetingLink, setMeetingLink] = useState("https://meet.google.com/abc-xyz-123");

  const handleInvite = (request: JoinRequest) => {
    setSelectedRequest(request);
    setShowInviteModal(true);
  };

  const handleAccept = (id: string) => {
    setRequests(prev => prev.filter(r => r.id !== id));
  };

  const handleReject = (id: string) => {
    setRequests(prev => prev.filter(r => r.id !== id));
  };

  return (
    <>
      <WidgetCard
        title="Join Requests"
        icon={UserPlus}
        headerAction={
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-primary hover:text-primary"
            onClick={() => navigate(`/${teamId}/requests`)}
          >
            View all
            <ChevronRight className="w-3 h-3 ml-1" />
          </Button>
        }
      >
        <div className="space-y-2 max-h-[280px] overflow-y-auto scrollbar-thin">
          {requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <UserPlus className="w-8 h-8 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">No pending requests</p>
            </div>
          ) : (
            requests.map((request) => (
              <div
                key={request.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary flex-shrink-0">
                  {request.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{request.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{request.role}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleInvite(request)}
                    className="p-1.5 rounded-lg hover:bg-info/10 text-muted-foreground hover:text-info transition-colors"
                    title="Invite to interview"
                  >
                    <Video className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleAccept(request.id)}
                    className="p-1.5 rounded-lg hover:bg-success/10 text-muted-foreground hover:text-success transition-colors"
                    title="Accept"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleReject(request.id)}
                    className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    title="Reject"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </WidgetCard>

      {/* Interview Invitation Modal */}
      <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
        <DialogContent className="max-w-md">
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
              <Input type="datetime-local" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Message</label>
              <textarea
                className="w-full h-24 px-3 py-2 rounded-lg border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                defaultValue={`Dear ${selectedRequest?.name},\n\nWe'd like to invite you to an interview for the ${selectedRequest?.role} position.\n\nBest regards`}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteModal(false)}>Cancel</Button>
            <Button onClick={() => { setShowInviteModal(false); }}>Send Invitation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { WidgetCard } from "@/components/shared/WidgetCard";
import { UserPlus, Check, X, Video, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ApiTeamService } from "@/services/api/ApiTeamService";

interface JoinRequest {
  id: string;
  name: string;
  initials: string;
  role: string;
  appliedAt?: string;
}

type JoinRequestPayload = {
  id?: string;
  role?: string;
  requestedRole?: string;
  name?: string;
  createdAt?: string;
  userName?: string;
  user?: {
    name?: string;
  };
};

const teamService = new ApiTeamService();

function toInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function normalizeJoinRequests(payload: unknown): JoinRequest[] {
  const list = Array.isArray(payload)
    ? (payload as JoinRequestPayload[])
    : payload && typeof payload === "object" && Array.isArray((payload as { items?: unknown }).items)
      ? ((payload as { items: JoinRequestPayload[] }).items ?? [])
      : [];

  return list
    .filter((item) => Boolean(item?.id))
    .map((item) => {
      const name = item.name || item.userName || item.user?.name || "Candidate";
      const appliedAt = item.createdAt ? new Date(item.createdAt).toLocaleString() : undefined;

      return {
        id: item.id as string,
        name,
        initials: toInitials(name) || "U",
        role: item.role || item.requestedRole || "Team Member",
        appliedAt,
      };
    });
}

export function JoinRequestsWidget() {
  const { teamId = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<JoinRequest | null>(null);
  const [meetingLink, setMeetingLink] = useState("https://meet.google.com/abc-xyz-123");

  const { isLoading } = useQuery<JoinRequest[]>({
    queryKey: ["team-join-requests-widget", teamId],
    queryFn: async () => {
      const response = await teamService.getJoinRequests(teamId);
      const normalized = normalizeJoinRequests(response).slice(0, 5);
      setRequests(normalized);
      return normalized;
    },
    enabled: Boolean(teamId),
    retry: false,
  });

  const { mutate: acceptRequest } = useMutation({
    mutationFn: (requestId: string) => teamService.acceptJoinRequest(teamId, requestId),
    onSuccess: (_response, requestId) => {
      setRequests((prev) => prev.filter((request) => request.id !== requestId));
      queryClient.invalidateQueries({ queryKey: ["team-join-requests-widget", teamId] });
    },
  });

  const { mutate: rejectRequest } = useMutation({
    mutationFn: (requestId: string) => teamService.rejectJoinRequest(teamId, requestId),
    onSuccess: (_response, requestId) => {
      setRequests((prev) => prev.filter((request) => request.id !== requestId));
      queryClient.invalidateQueries({ queryKey: ["team-join-requests-widget", teamId] });
    },
  });

  const handleInvite = (request: JoinRequest) => {
    setSelectedRequest(request);
    setShowInviteModal(true);
  };

  const handleAccept = (id: string) => {
    acceptRequest(id, {
      onError: () => {
        setRequests((prev) => prev.filter((request) => request.id !== id));
      },
    });
  };

  const handleReject = (id: string) => {
    rejectRequest(id, {
      onError: () => {
        setRequests((prev) => prev.filter((request) => request.id !== id));
      },
    });
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
          {isLoading ? (
            <p className="text-sm text-muted-foreground py-4">Loading requests...</p>
          ) : requests.length === 0 ? (
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
                  <p className="text-xs text-muted-foreground truncate">
                    {request.role}
                    {request.appliedAt ? ` · ${request.appliedAt}` : ""}
                  </p>
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

import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Inbox,
  Send as SendIcon,
  File,
  Star,
  Trash2,
  Archive,
  MoreHorizontal,
  Paperclip,
  Bold,
  Italic,
  Underline,
  Link,
  Smile,
  AtSign,
  Circle,
  Reply,
  Forward,
  X,
  ArrowLeft,
  Check,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ApiTeamService } from "@/services/api/ApiTeamService";
import { mailService } from "@/services";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type ViewMode = "list" | "detail" | "compose" | "reply" | "forward";

type TeamMemberCandidate = {
  id?: string;
  userId?: string;
  user?: {
    id?: string;
    name?: string;
  };
  userName?: string;
};

type RecipientOption = {
  id: string;
  name: string;
};

type MailParticipantLike = {
  userId?: string;
  userName?: string;
  user?: { id?: string; name?: string };
};

type MailThreadLike = {
  id: string;
  subject?: string;
  unreadCount?: number;
  isStarred?: boolean;
  lastMessageAt?: string;
  createdAt?: string;
  createdByName?: string;
  lastMessagePreview?: string;
  participants?: MailParticipantLike[];
};

type MailMessageLike = {
  id: string;
  authorId?: string;
  authorName?: string;
  body?: string;
  bodyPlain?: string;
  createdAt?: string;
};

const folders = [
  { id: "inbox", label: "Inbox", icon: Inbox },
  { id: "sent", label: "Sent", icon: SendIcon },
  { id: "drafts", label: "Drafts", icon: File },
  { id: "starred", label: "Starred", icon: Star },
  { id: "archive", label: "Archive", icon: Archive },
  { id: "trash", label: "Trash", icon: Trash2 },
];

const teamService = new ApiTeamService();

function extractTeamMembers(payload: unknown): TeamMemberCandidate[] {
  if (Array.isArray(payload)) {
    return payload as TeamMemberCandidate[];
  }

  if (
    payload &&
    typeof payload === "object" &&
    "members" in payload &&
    Array.isArray((payload as { members?: unknown }).members)
  ) {
    return (payload as { members: TeamMemberCandidate[] }).members;
  }

  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    Array.isArray((payload as { data?: unknown }).data)
  ) {
    return (payload as { data: TeamMemberCandidate[] }).data;
  }

  return [];
}

function extractThreads(payload: unknown): MailThreadLike[] {
  if (Array.isArray(payload)) {
    return payload as MailThreadLike[];
  }

  if (
    payload &&
    typeof payload === "object" &&
    "items" in payload &&
    Array.isArray((payload as { items?: unknown }).items)
  ) {
    return (payload as { items: MailThreadLike[] }).items;
  }

  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    Array.isArray((payload as { data?: unknown }).data)
  ) {
    return (payload as { data: MailThreadLike[] }).data;
  }

  return [];
}

function extractMessages(payload: unknown): MailMessageLike[] {
  if (Array.isArray(payload)) {
    return payload as MailMessageLike[];
  }

  if (
    payload &&
    typeof payload === "object" &&
    "items" in payload &&
    Array.isArray((payload as { items?: unknown }).items)
  ) {
    return (payload as { items: MailMessageLike[] }).items;
  }

  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    Array.isArray((payload as { data?: unknown }).data)
  ) {
    return (payload as { data: MailMessageLike[] }).data;
  }

  return [];
}

function formatDate(value?: string): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function participantName(participant: MailParticipantLike): string {
  return participant.userName || participant.user?.name || "Member";
}

function threadFromLabel(thread: MailThreadLike): string {
  if (Array.isArray(thread.participants) && thread.participants.length > 0) {
    const names = thread.participants.map(participantName).slice(0, 2);
    return names.join(", ");
  }

  return thread.createdByName || "Team member";
}

export default function TeamMail() {
  const { teamId = "" } = useParams<{ teamId: string }>();

  const [selectedFolder, setSelectedFolder] = useState("inbox");
  const [selectedThread, setSelectedThread] = useState<MailThreadLike | null>(null);
  const [threadMessages, setThreadMessages] = useState<MailMessageLike[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [teamRecipients, setTeamRecipients] = useState<RecipientOption[]>([]);
  const [isLoadingRecipients, setIsLoadingRecipients] = useState(false);
  const [threads, setThreads] = useState<MailThreadLike[]>([]);
  const [isLoadingThreads, setIsLoadingThreads] = useState(false);
  const [isLoadingThreadDetails, setIsLoadingThreadDetails] = useState(false);
  const [recipientPickerOpen, setRecipientPickerOpen] = useState(false);
  const [recipientQuery, setRecipientQuery] = useState("");

  const [composeRecipientIds, setComposeRecipientIds] = useState<string[]>([]);
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");

  useEffect(() => {
    if (!teamId) {
      return;
    }

    const loadRecipients = async () => {
      setIsLoadingRecipients(true);
      try {
        const response = await teamService.getTeamMembers(teamId);
        const members = extractTeamMembers(response);
        const normalized = members
          .map((member) => ({
            id: member.userId || member.user?.id || member.id,
            name: member.user?.name || member.userName || "Unknown member",
          }))
          .filter((member): member is RecipientOption => Boolean(member.id && member.name))
          .filter(
            (member, index, list) => list.findIndex((item) => item.id === member.id) === index,
          );
        setTeamRecipients(normalized);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load team members";
        toast.error(message);
      } finally {
        setIsLoadingRecipients(false);
      }
    };

    void loadRecipients();
  }, [teamId]);

  useEffect(() => {
    if (!teamId) {
      return;
    }

    const loadThreads = async () => {
      setIsLoadingThreads(true);
      try {
        const filter =
          selectedFolder === "starred"
            ? "starred"
            : selectedFolder === "archive"
              ? "archived"
              : "all";

        const response = await mailService.listThreads(teamId, {
          filter,
          search: searchQuery.trim() || undefined,
          page: 1,
          limit: 50,
        });

        setThreads(extractThreads(response));
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load mail threads";
        toast.error(message);
        setThreads([]);
      } finally {
        setIsLoadingThreads(false);
      }
    };

    void loadThreads();
  }, [teamId, selectedFolder, searchQuery]);

  const selectedRecipients = useMemo(
    () => teamRecipients.filter((recipient) => composeRecipientIds.includes(recipient.id)),
    [teamRecipients, composeRecipientIds],
  );

  const filteredRecipientOptions = useMemo(() => {
    const q = recipientQuery.trim().toLowerCase();
    if (!q) {
      return teamRecipients;
    }

    return teamRecipients.filter((recipient) => recipient.name.toLowerCase().includes(q));
  }, [teamRecipients, recipientQuery]);

  const handleSelectThread = async (thread: MailThreadLike) => {
    if (!teamId) return;
    setSelectedThread(thread);
    setViewMode("detail");
    setIsLoadingThreadDetails(true);

    try {
      const [threadResponse, messagesResponse] = await Promise.all([
        mailService.getThread(teamId, thread.id),
        mailService.getMessages(teamId, thread.id, 1, 100),
      ]);

      setSelectedThread((threadResponse as MailThreadLike) || thread);
      setThreadMessages(extractMessages(messagesResponse));
      await mailService.markAsRead(teamId, thread.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load thread details";
      toast.error(message);
      setThreadMessages([]);
    } finally {
      setIsLoadingThreadDetails(false);
    }
  };

  const handleCompose = () => {
    setComposeRecipientIds([]);
    setComposeSubject("");
    setComposeBody("");
    setRecipientQuery("");
    setViewMode("compose");
  };

  const handleReply = () => {
    if (!selectedThread) return;
    setComposeSubject(`RE: ${selectedThread.subject || "No Subject"}`);
    setComposeRecipientIds([]);
    setComposeBody("");
    setViewMode("reply");
  };

  const handleForward = () => {
    if (!selectedThread) return;
    const lastMessage = threadMessages[threadMessages.length - 1];
    setComposeRecipientIds([]);
    setComposeSubject(`FW: ${selectedThread.subject || "No Subject"}`);
    setComposeBody(
      `\n\n---\nForwarded message:\nFrom: ${lastMessage?.authorName || "Team member"}\nDate: ${formatDate(lastMessage?.createdAt)}\n\n${lastMessage?.body || ""}`,
    );
    setViewMode("forward");
  };

  const handleSend = async () => {
    if (!teamId) return;

    if (composeRecipientIds.length === 0) {
      toast.error("Choose at least one member.");
      return;
    }
    if (!composeSubject.trim()) {
      toast.error("Please add a subject.");
      return;
    }
    if (!composeBody.trim()) {
      toast.error("Please write a message.");
      return;
    }

    try {
      if (viewMode === "reply" && selectedThread) {
        await mailService.sendMessage(teamId, selectedThread.id, {
          body: composeBody.trim(),
        });
      } else {
        await mailService.createThread(teamId, {
          subject: composeSubject.trim(),
          body: composeBody.trim(),
          participantIds: composeRecipientIds,
        });
      }

      toast.success("Message sent.");
      setViewMode("list");
      setSelectedThread(null);
      setThreadMessages([]);
      setSearchQuery("");
      const refreshed = await mailService.listThreads(teamId, { filter: "all", page: 1, limit: 50 });
      setThreads(extractThreads(refreshed));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to send message";
      toast.error(message);
    }
  };

  const handleBack = () => {
    if (viewMode === "reply" || viewMode === "forward") {
      setViewMode("detail");
    } else {
      setViewMode("list");
      setSelectedThread(null);
      setThreadMessages([]);
    }
  };

  const toggleRecipient = (recipientId: string) => {
    setComposeRecipientIds((prev) =>
      prev.includes(recipientId)
        ? prev.filter((id) => id !== recipientId)
        : [...prev, recipientId],
    );
  };

  const renderSecondPane = () => {
    if (viewMode === "compose" || viewMode === "reply" || viewMode === "forward") {
      return (
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h2 className="font-semibold">
                {viewMode === "compose" ? "New Message" : viewMode === "reply" ? "Reply" : "Forward"}
              </h2>
            </div>
            <Button onClick={handleSend}>
              <SendIcon className="w-4 h-4 mr-2" />
              Send
            </Button>
          </div>

          <div className="flex-1 overflow-auto p-4">
            <div className="space-y-4">
              <div className="flex items-start gap-2 border-b border-border pb-3">
                <span className="text-sm text-muted-foreground w-16 pt-2">To:</span>
                <div className="flex-1 space-y-2">
                  {selectedRecipients.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedRecipients.map((recipient) => (
                        <span
                          key={recipient.id}
                          className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs text-primary"
                        >
                          {recipient.name}
                          <button
                            type="button"
                            onClick={() => toggleRecipient(recipient.id)}
                            className="rounded-full hover:bg-primary/20"
                            aria-label={`Remove ${recipient.name}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <Popover open={recipientPickerOpen} onOpenChange={setRecipientPickerOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="h-9 justify-between min-w-56">
                        Add members
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-2">
                      <Input
                        value={recipientQuery}
                        onChange={(event) => setRecipientQuery(event.target.value)}
                        placeholder="Search members..."
                        className="mb-2"
                      />
                      <ScrollArea className="h-52">
                        <div className="space-y-1">
                          {isLoadingRecipients && (
                            <p className="text-sm text-muted-foreground px-2 py-1">Loading members...</p>
                          )}
                          {!isLoadingRecipients && filteredRecipientOptions.length === 0 && (
                            <p className="text-sm text-muted-foreground px-2 py-1">No members found.</p>
                          )}
                          {filteredRecipientOptions.map((recipient) => {
                            const selected = composeRecipientIds.includes(recipient.id);
                            return (
                              <button
                                key={recipient.id}
                                type="button"
                                onClick={() => toggleRecipient(recipient.id)}
                                className={cn(
                                  "w-full flex items-center justify-between rounded-md px-2 py-1.5 text-sm text-left hover:bg-muted",
                                  selected && "bg-muted",
                                )}
                              >
                                <span>{recipient.name}</span>
                                {selected && <Check className="h-4 w-4 text-primary" />}
                              </button>
                            );
                          })}
                        </div>
                      </ScrollArea>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="flex items-center gap-2 border-b border-border pb-3">
                <span className="text-sm text-muted-foreground w-16">Subject:</span>
                <Input
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  placeholder="Subject"
                  className="flex-1 border-0 bg-transparent px-0 focus-visible:ring-0"
                />
              </div>

              <textarea
                value={composeBody}
                onChange={(e) => setComposeBody(e.target.value)}
                placeholder="Write your message..."
                className="w-full min-h-[400px] resize-none bg-transparent text-sm focus:outline-none"
              />

              <div className="flex items-center gap-1 pt-4 border-t border-border">
                <Button variant="ghost" size="icon" className="h-8 w-8"><Bold className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8"><Italic className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8"><Underline className="w-4 h-4" /></Button>
                <div className="w-px h-4 bg-border mx-1" />
                <Button variant="ghost" size="icon" className="h-8 w-8"><Link className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8"><Smile className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8"><AtSign className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8"><Paperclip className="w-4 h-4" /></Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (viewMode === "detail" && selectedThread) {
      return (
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-border">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <h2 className="text-xl font-semibold text-foreground">{selectedThread.subject || "No Subject"}</h2>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Star className={cn("w-4 h-4", selectedThread.isStarred && "fill-warning text-warning")} />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8"><Archive className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8"><Trash2 className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary">
                {(threadFromLabel(selectedThread).charAt(0) || "T").toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{threadFromLabel(selectedThread)}</p>
                <p className="text-xs text-muted-foreground">{formatDate(selectedThread.lastMessageAt || selectedThread.createdAt)}</p>
              </div>
            </div>
          </div>

          <ScrollArea className="flex-1 p-6">
            <div className="max-w-3xl space-y-4">
              {isLoadingThreadDetails && <p className="text-sm text-muted-foreground">Loading messages...</p>}
              {!isLoadingThreadDetails && threadMessages.length === 0 && (
                <p className="text-sm text-muted-foreground">No messages yet.</p>
              )}
              {threadMessages.map((message) => (
                <div key={message.id} className="rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-foreground">{message.authorName || "Team member"}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(message.createdAt)}</p>
                  </div>
                  <pre className="whitespace-pre-wrap font-sans text-sm text-foreground leading-relaxed">
                    {message.body || message.bodyPlain || ""}
                  </pre>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-4 border-t border-border flex gap-2">
            <Button variant="outline" className="flex-1" onClick={handleReply}>
              <Reply className="w-4 h-4 mr-2" />
              Reply
            </Button>
            <Button variant="outline" className="flex-1" onClick={handleForward}>
              <Forward className="w-4 h-4 mr-2" />
              Forward
            </Button>
          </div>
        </div>
      );
    }

    return (
      <ScrollArea className="flex-1">
        <div className="divide-y divide-border">
          {isLoadingThreads && <p className="p-4 text-sm text-muted-foreground">Loading mail...</p>}
          {!isLoadingThreads && threads.length === 0 && (
            <p className="p-4 text-sm text-muted-foreground">No messages found.</p>
          )}
          {threads.map((thread) => (
            <div
              key={thread.id}
              onClick={() => void handleSelectThread(thread)}
              className={cn(
                "p-4 cursor-pointer transition-colors hover:bg-muted/50",
                (thread.unreadCount || 0) > 0 && "bg-primary/5",
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                {(thread.unreadCount || 0) > 0 && (
                  <Circle className="w-2 h-2 fill-primary text-primary flex-shrink-0" />
                )}
                <span
                  className={cn(
                    "text-sm flex-1 truncate",
                    (thread.unreadCount || 0) > 0 ? "font-semibold" : "font-medium",
                  )}
                >
                  {threadFromLabel(thread)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(thread.lastMessageAt || thread.createdAt)}
                </span>
              </div>
              <p className={cn("text-sm mb-1 truncate", (thread.unreadCount || 0) > 0 && "font-medium")}>
                {thread.subject || "No Subject"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {thread.lastMessagePreview || "Open thread to read messages"}
              </p>
            </div>
          ))}
        </div>
      </ScrollArea>
    );
  };

  return (
    <MainLayout>
      <div className="flex h-screen">
        <div className="w-56 border-r border-border bg-card p-4 flex flex-col">
          <Button className="mb-4 w-full" onClick={handleCompose}>
            Compose
          </Button>

          <nav className="space-y-1">
            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => {
                  setSelectedFolder(folder.id);
                  setViewMode("list");
                  setSelectedThread(null);
                  setThreadMessages([]);
                }}
                className={cn(
                  "flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  selectedFolder === folder.id
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <folder.icon className="w-4 h-4" />
                <span className="flex-1 text-left">{folder.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1 flex flex-col bg-background">
          {viewMode === "list" && (
            <div className="p-3 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search mail..."
                  className="pl-9 h-9 bg-muted/50 border-0"
                />
              </div>
            </div>
          )}

          {renderSecondPane()}
        </div>
      </div>
    </MainLayout>
  );
}

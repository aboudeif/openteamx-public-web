import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Archive,
  ArrowLeft,
  AtSign,
  Bold,
  Check,
  ChevronDown,
  File,
  Forward,
  Inbox,
  Italic,
  Link2,
  MailOpen,
  Paperclip,
  Reply,
  Search,
  Send as SendIcon,
  Smile,
  Star,
  Trash2,
  Underline,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { ApiTeamService } from "@/services/api/ApiTeamService";
import { driveService, mailService } from "@/services";
import { DriveItem } from "@/shared/types";
import { DriveItemType } from "@/shared/enums";

type ViewMode = "list" | "detail" | "compose" | "reply" | "forward";

type TeamMemberCandidate = {
  id?: string;
  userId?: string;
  user?: { id?: string; name?: string };
  userName?: string;
};

type RecipientOption = { id: string; name: string };

type MailParticipantLike = {
  userId?: string;
  userName?: string;
  user?: { id?: string; name?: string };
};

type MailThreadLike = {
  id: string;
  type?: string;
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
  authorName?: string;
  body?: string;
  bodyPlain?: string;
  createdAt?: string;
};

type DraftMessage = {
  id: string;
  subject: string;
  bodyHtml: string;
  recipientIds: string[];
  attachmentIds: string[];
  updatedAt: string;
};

const folders = [
  { id: "inbox", label: "Inbox", icon: Inbox },
  { id: "sent", label: "Sent", icon: SendIcon },
  { id: "drafts", label: "Drafts", icon: File },
  { id: "starred", label: "Starred", icon: Star },
  { id: "archive", label: "Archive", icon: Archive },
  { id: "trash", label: "Trash", icon: Trash2 },
] as const;

const teamService = new ApiTeamService();

function extractTeamMembers(payload: unknown): TeamMemberCandidate[] {
  if (Array.isArray(payload)) return payload as TeamMemberCandidate[];
  if (payload && typeof payload === "object" && "members" in payload && Array.isArray((payload as { members?: unknown }).members)) {
    return (payload as { members: TeamMemberCandidate[] }).members;
  }
  if (payload && typeof payload === "object" && "data" in payload && Array.isArray((payload as { data?: unknown }).data)) {
    return (payload as { data: TeamMemberCandidate[] }).data;
  }
  return [];
}

function extractThreads(payload: unknown): MailThreadLike[] {
  if (Array.isArray(payload)) return payload as MailThreadLike[];
  if (payload && typeof payload === "object" && "items" in payload && Array.isArray((payload as { items?: unknown }).items)) {
    return (payload as { items: MailThreadLike[] }).items;
  }
  if (payload && typeof payload === "object" && "data" in payload && Array.isArray((payload as { data?: unknown }).data)) {
    return (payload as { data: MailThreadLike[] }).data;
  }
  return [];
}

function extractMessages(payload: unknown): MailMessageLike[] {
  if (Array.isArray(payload)) return payload as MailMessageLike[];
  if (payload && typeof payload === "object" && "items" in payload && Array.isArray((payload as { items?: unknown }).items)) {
    return (payload as { items: MailMessageLike[] }).items;
  }
  if (payload && typeof payload === "object" && "data" in payload && Array.isArray((payload as { data?: unknown }).data)) {
    return (payload as { data: MailMessageLike[] }).data;
  }
  return [];
}

function formatDate(value?: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(date);
}

function threadFromLabel(thread: MailThreadLike): string {
  if (Array.isArray(thread.participants) && thread.participants.length > 0) {
    const names = thread.participants
      .map((p) => p.userName || p.user?.name || "Member")
      .slice(0, 2);
    return names.join(", ");
  }
  return thread.createdByName || "Team member";
}

function plainTextFromHtml(value: string): string {
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(div|p)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function toOneLinePreview(text?: string): string {
  if (!text) return "";
  return text.replace(/\s+/g, " ").trim();
}

export default function TeamMail() {
  const { teamId = "" } = useParams<{ teamId: string }>();

  const [selectedFolder, setSelectedFolder] = useState<(typeof folders)[number]["id"]>("inbox");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [searchQuery, setSearchQuery] = useState("");

  const [teamRecipients, setTeamRecipients] = useState<RecipientOption[]>([]);
  const [isLoadingRecipients, setIsLoadingRecipients] = useState(false);

  const [threads, setThreads] = useState<MailThreadLike[]>([]);
  const [deletedThreadIds, setDeletedThreadIds] = useState<string[]>([]);
  const [isLoadingThreads, setIsLoadingThreads] = useState(false);
  const [selectedThread, setSelectedThread] = useState<MailThreadLike | null>(null);
  const [threadMessages, setThreadMessages] = useState<MailMessageLike[]>([]);
  const [isLoadingThreadDetails, setIsLoadingThreadDetails] = useState(false);

  const [drafts, setDrafts] = useState<DraftMessage[]>([]);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);

  const [folderCounts, setFolderCounts] = useState<Record<string, number>>({
    inbox: 0,
    sent: 0,
    drafts: 0,
    starred: 0,
    archive: 0,
    trash: 0,
  });

  const [composeRecipientIds, setComposeRecipientIds] = useState<string[]>([]);
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBodyHtml, setComposeBodyHtml] = useState("");
  const [attachmentIds, setAttachmentIds] = useState<string[]>([]);
  const composeBodyRef = useRef<HTMLDivElement | null>(null);

  const [recipientPickerOpen, setRecipientPickerOpen] = useState(false);
  const [recipientQuery, setRecipientQuery] = useState("");
  const [mentionPickerOpen, setMentionPickerOpen] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [attachmentPickerOpen, setAttachmentPickerOpen] = useState(false);
  const [teamDriveFiles, setTeamDriveFiles] = useState<DriveItem[]>([]);
  const [isLoadingDriveFiles, setIsLoadingDriveFiles] = useState(false);
  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);
  const [linkText, setLinkText] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  useEffect(() => {
    if (!teamId) return;
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
          .filter((member, index, list) => list.findIndex((item) => item.id === member.id) === index);
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
    if (!teamId) return;
    const loadThreads = async () => {
      setIsLoadingThreads(true);
      try {
        const filter = selectedFolder === "starred" ? "starred" : selectedFolder === "archive" ? "archived" : "all";
        const response = await mailService.listThreads(teamId, {
          filter,
          search: searchQuery.trim() || undefined,
          page: 1,
          limit: 100,
        });
        const loaded = extractThreads(response).filter((thread) => thread.type !== "SYSTEM");
        setThreads(loaded);
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

  useEffect(() => {
    if (!teamId || viewMode === "list") return;
    const loadDriveFiles = async () => {
      setIsLoadingDriveFiles(true);
      try {
        const files = await driveService.getFiles(teamId);
        setTeamDriveFiles(files.filter((file) => file.type !== DriveItemType.Folder));
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load team drive files";
        toast.error(message);
      } finally {
        setIsLoadingDriveFiles(false);
      }
    };
    void loadDriveFiles();
  }, [teamId, viewMode]);

  const visibleThreads = useMemo(() => {
    const nonDeleted = threads.filter((thread) => !deletedThreadIds.includes(thread.id));
    if (selectedFolder === "trash") return threads.filter((thread) => deletedThreadIds.includes(thread.id));
    if (selectedFolder === "starred") return nonDeleted.filter((thread) => Boolean(thread.isStarred));
    if (selectedFolder === "drafts") return [];
    return nonDeleted;
  }, [threads, deletedThreadIds, selectedFolder]);

  useEffect(() => {
    const unreadTotal = visibleThreads.reduce((sum, thread) => sum + (thread.unreadCount || 0), 0);
    setFolderCounts({
      inbox: unreadTotal,
      sent: 0,
      drafts: drafts.length,
      starred: threads.filter((thread) => Boolean(thread.isStarred) && !deletedThreadIds.includes(thread.id)).length,
      archive: threads.filter((thread) => !deletedThreadIds.includes(thread.id)).length,
      trash: deletedThreadIds.length,
    });
  }, [visibleThreads, drafts.length, threads, deletedThreadIds]);

  const selectedRecipients = useMemo(
    () => teamRecipients.filter((recipient) => composeRecipientIds.includes(recipient.id)),
    [teamRecipients, composeRecipientIds],
  );

  const filteredRecipientOptions = useMemo(() => {
    const q = recipientQuery.trim().toLowerCase();
    if (!q) return teamRecipients;
    return teamRecipients.filter((recipient) => recipient.name.toLowerCase().includes(q));
  }, [teamRecipients, recipientQuery]);

  const filteredMentionOptions = useMemo(() => {
    const q = mentionQuery.trim().toLowerCase();
    if (!q) return teamRecipients;
    return teamRecipients.filter((recipient) => recipient.name.toLowerCase().includes(q));
  }, [teamRecipients, mentionQuery]);

  const selectedAttachments = useMemo(
    () => teamDriveFiles.filter((file) => attachmentIds.includes(file.id)),
    [teamDriveFiles, attachmentIds],
  );

  const generateDraftId = () => `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const clearComposer = () => {
    setComposeRecipientIds([]);
    setComposeSubject("");
    setComposeBodyHtml("");
    setAttachmentIds([]);
    setCurrentDraftId(null);
    setRecipientQuery("");
    setMentionQuery("");
    setLinkText("");
    setLinkUrl("");
  };

  const upsertDraft = () => {
    const bodyPlain = plainTextFromHtml(composeBodyHtml);
    if (!composeSubject.trim() && !bodyPlain && composeRecipientIds.length === 0 && attachmentIds.length === 0) {
      return;
    }

    const draftId = currentDraftId || generateDraftId();
    const draft: DraftMessage = {
      id: draftId,
      subject: composeSubject,
      bodyHtml: composeBodyHtml,
      recipientIds: composeRecipientIds,
      attachmentIds,
      updatedAt: new Date().toISOString(),
    };

    setDrafts((prev) => {
      const index = prev.findIndex((item) => item.id === draftId);
      if (index === -1) return [draft, ...prev];
      const copy = [...prev];
      copy[index] = draft;
      return copy;
    });
    setCurrentDraftId(draftId);
  };

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
      if ((thread.unreadCount || 0) > 0) {
        await mailService.markAsRead(teamId, thread.id);
        setThreads((prev) => prev.map((item) => (item.id === thread.id ? { ...item, unreadCount: 0 } : item)));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load thread details";
      toast.error(message);
      setThreadMessages([]);
    } finally {
      setIsLoadingThreadDetails(false);
    }
  };

  const handleCompose = () => {
    clearComposer();
    setViewMode("compose");
  };

  const handleOpenDraft = (draft: DraftMessage) => {
    setCurrentDraftId(draft.id);
    setComposeSubject(draft.subject);
    setComposeBodyHtml(draft.bodyHtml);
    setComposeRecipientIds(draft.recipientIds);
    setAttachmentIds(draft.attachmentIds);
    setViewMode("compose");
  };

  const handleReply = () => {
    if (!selectedThread) return;
    setComposeSubject(`RE: ${selectedThread.subject || "No Subject"}`);
    setComposeRecipientIds([]);
    setComposeBodyHtml("");
    setAttachmentIds([]);
    setCurrentDraftId(null);
    setViewMode("reply");
  };

  const handleForward = () => {
    if (!selectedThread) return;
    const lastMessage = threadMessages[threadMessages.length - 1];
    const body = `\n\n---\nForwarded message:\nFrom: ${lastMessage?.authorName || "Team member"}\nDate: ${formatDate(lastMessage?.createdAt)}\n\n${lastMessage?.body || ""}`;
    setComposeSubject(`FW: ${selectedThread.subject || "No Subject"}`);
    setComposeRecipientIds([]);
    setComposeBodyHtml(body.replaceAll("\n", "<br>"));
    setAttachmentIds([]);
    setCurrentDraftId(null);
    setViewMode("forward");
  };

  const applyFormat = (command: "bold" | "italic" | "underline") => {
    const editor = composeBodyRef.current;
    if (!editor) return;
    editor.focus();
    document.execCommand(command, false);
    setComposeBodyHtml(editor.innerHTML);
  };

  const insertPlainTextAtCursor = (value: string) => {
    const editor = composeBodyRef.current;
    if (!editor) return;
    editor.focus();
    document.execCommand("insertText", false, value);
    setComposeBodyHtml(editor.innerHTML);
  };

  const applyInsertLink = () => {
    const editor = composeBodyRef.current;
    if (!editor) return;
    const url = linkUrl.trim();
    if (!url) {
      toast.error("Enter a valid URL.");
      return;
    }
    const text = linkText.trim() || url;
    editor.focus();
    document.execCommand("insertHTML", false, `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`);
    setComposeBodyHtml(editor.innerHTML);
    setLinkText("");
    setLinkUrl("");
    setLinkPopoverOpen(false);
  };

  const handleToggleStar = async (thread: MailThreadLike, event: { stopPropagation: () => void }) => {
    event.stopPropagation();
    if (!teamId) return;
    try {
      const starred = !thread.isStarred;
      await mailService.setStarred(teamId, thread.id, starred);
      setThreads((prev) => prev.map((item) => (item.id === thread.id ? { ...item, isStarred: starred } : item)));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update star";
      toast.error(message);
    }
  };

  const handleArchive = async (thread: MailThreadLike, event: { stopPropagation: () => void }) => {
    event.stopPropagation();
    if (!teamId) return;
    try {
      await mailService.archiveThread(teamId, thread.id);
      setThreads((prev) => prev.filter((item) => item.id !== thread.id));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to archive thread";
      toast.error(message);
    }
  };

  const handleToggleRead = async (thread: MailThreadLike, event: { stopPropagation: () => void }) => {
    event.stopPropagation();
    if (!teamId) return;
    try {
      const unread = (thread.unreadCount || 0) === 0;
      if (unread) {
        await mailService.markAsUnread(teamId, thread.id);
      } else {
        await mailService.markAsRead(teamId, thread.id);
      }
      setThreads((prev) => prev.map((item) => (item.id === thread.id ? { ...item, unreadCount: unread ? 1 : 0 } : item)));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update read state";
      toast.error(message);
    }
  };

  const handleDelete = async (thread: MailThreadLike, event: { stopPropagation: () => void }) => {
    event.stopPropagation();
    if (!teamId) return;
    try {
      await mailService.leaveThread(teamId, thread.id);
      setDeletedThreadIds((prev) => (prev.includes(thread.id) ? prev : [...prev, thread.id]));
      if (selectedThread?.id === thread.id) {
        setSelectedThread(null);
        setThreadMessages([]);
        setViewMode("list");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete thread";
      toast.error(message);
    }
  };

  const handleSend = async () => {
    if (!teamId) return;
    const bodyPlain = plainTextFromHtml(composeBodyHtml);
    if (viewMode !== "reply" && composeRecipientIds.length === 0) {
      toast.error("Choose at least one member.");
      return;
    }
    if (!composeSubject.trim()) {
      toast.error("Please add a subject.");
      return;
    }
    if (!bodyPlain) {
      toast.error("Please write a message.");
      return;
    }
    try {
      if (viewMode === "reply" && selectedThread) {
        await mailService.sendMessage(teamId, selectedThread.id, { body: composeBodyHtml, attachmentIds });
      } else {
        await mailService.createThread(teamId, {
          subject: composeSubject.trim(),
          body: composeBodyHtml,
          participantIds: composeRecipientIds,
          attachmentIds,
        });
      }

      if (currentDraftId) {
        setDrafts((prev) => prev.filter((draft) => draft.id !== currentDraftId));
      }
      clearComposer();
      setViewMode("list");

      const refreshed = await mailService.listThreads(teamId, { filter: "all", page: 1, limit: 100 });
      setThreads(extractThreads(refreshed).filter((thread) => thread.type !== "SYSTEM"));
      toast.success("Message sent.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to send message";
      toast.error(message);
    }
  };

  const handleBack = () => {
    if (viewMode === "compose" || viewMode === "reply" || viewMode === "forward") {
      upsertDraft();
      setViewMode("list");
      return;
    }
    setViewMode("list");
    setSelectedThread(null);
    setThreadMessages([]);
  };

  const toggleRecipient = (recipientId: string) => {
    setComposeRecipientIds((prev) => (prev.includes(recipientId) ? prev.filter((id) => id !== recipientId) : [...prev, recipientId]));
  };

  const renderCompose = () => (
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
                    <span key={recipient.id} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                      {recipient.name}
                      <button type="button" onClick={() => toggleRecipient(recipient.id)} className="rounded-full hover:bg-primary/20">
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
                  <Input value={recipientQuery} onChange={(event) => setRecipientQuery(event.target.value)} placeholder="Search members..." className="mb-2" />
                  <ScrollArea className="h-52">
                    <div className="space-y-1">
                      {isLoadingRecipients && <p className="text-sm text-muted-foreground px-2 py-1">Loading members...</p>}
                      {!isLoadingRecipients &&
                        filteredRecipientOptions.map((recipient) => {
                          const selected = composeRecipientIds.includes(recipient.id);
                          return (
                            <button
                              key={recipient.id}
                              type="button"
                              onClick={() => toggleRecipient(recipient.id)}
                              className={cn("w-full flex items-center justify-between rounded-md px-2 py-1.5 text-sm text-left hover:bg-muted", selected && "bg-muted")}
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
            <Input value={composeSubject} onChange={(e) => setComposeSubject(e.target.value)} placeholder="Subject" className="flex-1 border-0 bg-transparent px-0 focus-visible:ring-0" />
          </div>

          <div
            ref={composeBodyRef}
            dir="ltr"
            contentEditable
            suppressContentEditableWarning
            onInput={(event) => setComposeBodyHtml((event.currentTarget as HTMLDivElement).innerHTML)}
            className="w-full min-h-[400px] rounded-md border border-border p-3 bg-transparent text-sm text-left focus:outline-none"
            dangerouslySetInnerHTML={{ __html: composeBodyHtml }}
          />
          {!composeBodyHtml && <p className="text-xs text-muted-foreground">Write your message...</p>}

          {selectedAttachments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedAttachments.map((file) => (
                <span key={file.id} className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs">
                  <Paperclip className="h-3 w-3" />
                  {file.name}
                  <button type="button" onClick={() => setAttachmentIds((prev) => prev.filter((id) => id !== file.id))} className="rounded-full hover:bg-muted-foreground/20">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-1 pt-4 border-t border-border">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => applyFormat("bold")}><Bold className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => applyFormat("italic")}><Italic className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => applyFormat("underline")}><Underline className="w-4 h-4" /></Button>
            <div className="w-px h-4 bg-border mx-1" />

            <Popover open={linkPopoverOpen} onOpenChange={setLinkPopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8"><Link2 className="w-4 h-4" /></Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-2">
                <Input value={linkText} onChange={(event) => setLinkText(event.target.value)} placeholder="Link text" className="mb-2" />
                <Input value={linkUrl} onChange={(event) => setLinkUrl(event.target.value)} placeholder="https://..." className="mb-2" />
                <Button size="sm" onClick={applyInsertLink}>Insert link</Button>
              </PopoverContent>
            </Popover>

            <Popover open={emojiPickerOpen} onOpenChange={setEmojiPickerOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8"><Smile className="w-4 h-4" /></Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2">
                <div className="grid grid-cols-6 gap-1">
                  {["😀", "😂", "😍", "🤔", "👍", "🎉", "🔥", "✨", "🚀", "💡", "❤️", "🙌"].map((emoji) => (
                    <button key={emoji} type="button" className="rounded p-1 hover:bg-muted" onClick={() => insertPlainTextAtCursor(emoji)}>
                      {emoji}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <Popover open={mentionPickerOpen} onOpenChange={setMentionPickerOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8"><AtSign className="w-4 h-4" /></Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-2">
                <Input value={mentionQuery} onChange={(event) => setMentionQuery(event.target.value)} placeholder="Search member..." className="mb-2" />
                <ScrollArea className="h-44">
                  <div className="space-y-1">
                    {filteredMentionOptions.map((member) => (
                      <button key={member.id} type="button" className="w-full text-left rounded-md px-2 py-1.5 text-sm hover:bg-muted" onClick={() => insertPlainTextAtCursor(`@${member.name.replace(/\s+/g, "")} `)}>
                        {member.name}
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </PopoverContent>
            </Popover>

            <Popover open={attachmentPickerOpen} onOpenChange={setAttachmentPickerOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8"><Paperclip className="w-4 h-4" /></Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-2">
                <p className="text-xs text-muted-foreground mb-2">Attach from Team Drive</p>
                <ScrollArea className="h-48">
                  <div className="space-y-1">
                    {isLoadingDriveFiles && <p className="text-sm text-muted-foreground px-2 py-1">Loading files...</p>}
                    {!isLoadingDriveFiles &&
                      teamDriveFiles.map((file) => {
                        const attached = attachmentIds.includes(file.id);
                        return (
                          <button
                            key={file.id}
                            type="button"
                            className={cn("w-full flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-muted", attached && "bg-muted")}
                            onClick={() =>
                              setAttachmentIds((prev) => (prev.includes(file.id) ? prev.filter((id) => id !== file.id) : [...prev, file.id]))
                            }
                          >
                            <span className="truncate pr-2">{file.name}</span>
                            {attached && <Check className="h-4 w-4 text-primary" />}
                          </button>
                        );
                      })}
                  </div>
                </ScrollArea>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDetail = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <Button variant="ghost" size="icon" onClick={handleBack}><ArrowLeft className="w-4 h-4" /></Button>
          {selectedThread && (
            <>
              <Button variant="ghost" size="icon" onClick={(event) => void handleArchive(selectedThread, event)}><Archive className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" onClick={(event) => void handleToggleRead(selectedThread, event)}><MailOpen className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" onClick={(event) => void handleDelete(selectedThread, event)}><Trash2 className="w-4 h-4" /></Button>
            </>
          )}
        </div>
        <h2 className="text-lg font-semibold">{selectedThread?.subject || "No Subject"}</h2>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {isLoadingThreadDetails && <p className="text-sm text-muted-foreground">Loading messages...</p>}
          {!isLoadingThreadDetails && threadMessages.length === 0 && <p className="text-sm text-muted-foreground">No messages yet.</p>}
          {threadMessages.map((message) => (
            <div key={message.id} className="rounded-lg border border-border p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">{message.authorName || "Team member"}</p>
                <p className="text-xs text-muted-foreground">{formatDate(message.createdAt)}</p>
              </div>
              <pre className="whitespace-pre-wrap font-sans text-sm">{message.body || message.bodyPlain || ""}</pre>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border flex gap-2">
        <Button variant="outline" className="flex-1" onClick={handleReply}><Reply className="w-4 h-4 mr-2" />Reply</Button>
        <Button variant="outline" className="flex-1" onClick={handleForward}><Forward className="w-4 h-4 mr-2" />Forward</Button>
      </div>
    </div>
  );

  const renderList = () => {
    const title = folders.find((folder) => folder.id === selectedFolder)?.label || "Messages";
    return (
      <div className="flex flex-col h-full">
        <div className="px-4 py-2 border-b border-border text-sm text-muted-foreground">
          {title} ({folderCounts[selectedFolder] || 0})
        </div>
        <ScrollArea className="flex-1">
          <div className="divide-y divide-border">
            {selectedFolder === "drafts" && drafts.map((draft) => (
              <div key={draft.id} onClick={() => handleOpenDraft(draft)} className="group px-4 py-3 cursor-pointer hover:bg-muted/40">
                <p className="text-sm truncate">
                  <span className="font-medium">Draft</span>
                  <span className="text-muted-foreground"> - {draft.subject || "(No subject)"} - {toOneLinePreview(plainTextFromHtml(draft.bodyHtml)) || "Empty draft"}</span>
                </p>
              </div>
            ))}
            {selectedFolder !== "drafts" && isLoadingThreads && <p className="p-4 text-sm text-muted-foreground">Loading mail...</p>}
            {selectedFolder !== "drafts" && !isLoadingThreads && visibleThreads.length === 0 && <p className="p-4 text-sm text-muted-foreground">No messages found.</p>}
            {selectedFolder !== "drafts" && visibleThreads.map((thread) => (
              <div
                key={thread.id}
                onClick={() => void handleSelectThread(thread)}
                className={cn("group px-4 py-3 cursor-pointer hover:bg-muted/40", (thread.unreadCount || 0) > 0 && "bg-primary/5")}
              >
                <div className="flex items-center gap-2">
                  <p className={cn("text-sm truncate flex-1 pr-2", (thread.unreadCount || 0) > 0 ? "font-semibold" : "font-medium")}>
                    {threadFromLabel(thread)} - {thread.subject || "No Subject"} - {toOneLinePreview(thread.lastMessagePreview) || "Open thread to read messages"}
                  </p>
                  <div className="hidden group-hover:flex items-center gap-1" onClick={(event) => event.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(event) => void handleToggleStar(thread, event)}><Star className={cn("h-4 w-4", thread.isStarred && "fill-warning text-warning")} /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(event) => void handleArchive(thread, event)}><Archive className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(event) => void handleToggleRead(thread, event)}><MailOpen className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(event) => void handleDelete(thread, event)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                  <span className="text-xs text-muted-foreground w-28 text-right group-hover:hidden">{formatDate(thread.lastMessageAt || thread.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="flex h-screen">
        <div className="w-56 border-r border-border bg-card p-4 flex flex-col">
          <Button className="mb-4 w-full" onClick={handleCompose}>Compose</Button>
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
                  selectedFolder === folder.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <folder.icon className="w-4 h-4" />
                <span className="flex-1 text-left">{folder.label}</span>
                {folderCounts[folder.id] > 0 && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-destructive text-destructive-foreground">{folderCounts[folder.id]}</span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1 flex flex-col bg-background">
          {viewMode === "list" && (
            <div className="p-3 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search mail..." className="pl-9 h-9 bg-muted/50 border-0" />
              </div>
            </div>
          )}
          {(viewMode === "compose" || viewMode === "reply" || viewMode === "forward") && renderCompose()}
          {viewMode === "detail" && renderDetail()}
          {viewMode === "list" && renderList()}
        </div>
      </div>
    </MainLayout>
  );
}

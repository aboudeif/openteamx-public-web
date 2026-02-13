import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Hash,
  Search,
  Plus,
  Settings,
  Send,
  Smile,
  AtSign,
  Paperclip,
  Bold,
  Italic,
  Link,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  X,
  Pencil,
  Trash2,
  Check,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { chatService } from "@/services";
import { ChatMessage, ChatWorkspace, User } from "@/shared/types";

// Types
interface DriveFile {
  id: string;
  name: string;
  type: "document" | "spreadsheet" | "link";
}

const driveFiles: DriveFile[] = [
  { id: "f1", name: "Project Brief.docx", type: "document" },
  { id: "f2", name: "Budget 2026.xlsx", type: "spreadsheet" },
  { id: "f3", name: "API Documentation", type: "link" },
  { id: "f4", name: "Design System", type: "link" },
];

const emojis = ["😀", "😂", "😍", "🤔", "👍", "👎", "🎉", "🔥", "💯", "❤️", "✨", "🚀", "💡", "⭐", "🙌", "👏"];

export default function TeamChat() {
  const { teamId = "" } = useParams<{ teamId: string }>();
  const [selectedWorkspace, setSelectedWorkspace] = useState("general");
  const [workspaceList, setWorkspaceList] = useState<ChatWorkspace[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [workspacesExpanded, setWorkspacesExpanded] = useState(true);
  const [projectsExpanded, setProjectsExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!teamId) {
      return;
    }

    const fetchWorkspacesAndMembers = async () => {
      const [ws, members] = await Promise.all([
        chatService.getWorkspaces(teamId),
        chatService.getTeamMembers(teamId),
      ]);
      setWorkspaceList(ws);
      setTeamMembers(members);

      if (ws.length > 0) {
        setSelectedWorkspace((current) =>
          ws.some((workspace) => workspace.id === current) ? current : ws[0].id
        );
      }
    };
    void fetchWorkspacesAndMembers();
  }, [teamId]);

  useEffect(() => {
    if (!teamId || !selectedWorkspace) {
      return;
    }

    const fetchMessages = async () => {
      const msgs = await chatService.getMessages(selectedWorkspace);
      setMessages(msgs);
    };

    void fetchMessages();
  }, [teamId, selectedWorkspace]);

  // Modals
  const [showAddWorkspace, setShowAddWorkspace] = useState(false);
  const [showAddLink, setShowAddLink] = useState(false);
  const [showAttachFile, setShowAttachFile] = useState(false);
  const [showEditWorkspace, setShowEditWorkspace] = useState(false);
  const [showEditMessage, setShowEditMessage] = useState(false);
  
  // Edit states
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [editingWorkspace, setEditingWorkspace] = useState<ChatWorkspace | null>(null);
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTitle, setLinkTitle] = useState("");

  // Mention and emoji panels
  const [showMentionPanel, setShowMentionPanel] = useState(false);
  const [showEmojiPanel, setShowEmojiPanel] = useState(false);
  const [mentionFilter, setMentionFilter] = useState("");

  const inputRef = useRef<HTMLTextAreaElement>(null);

  const generalWorkspaces = workspaceList.filter((w) => !w.isProject);
  const projectWorkspaces = workspaceList.filter((w) => w.isProject);

  const filteredMessages = searchQuery
    ? messages.filter(m => m.message.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

  const filteredMembers = mentionFilter
    ? teamMembers.filter(m => m.name.toLowerCase().includes(mentionFilter.toLowerCase()))
    : teamMembers;

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;
    const newMessage = await chatService.sendMessage(selectedWorkspace, messageInput);
    setMessages([...messages, newMessage]);
    setMessageInput("");
  };

  const handleAddWorkspace = () => {
    if (!newWorkspaceName.trim()) return;
    const newWs: ChatWorkspace = {
      id: newWorkspaceName.toLowerCase().replace(/\s/g, "-"),
      name: newWorkspaceName,
      unread: 0,
    };
    setWorkspaceList([...workspaceList, newWs]);
    setNewWorkspaceName("");
    setShowAddWorkspace(false);
  };

  const handleEditWorkspace = () => {
    if (!editingWorkspace || !newWorkspaceName.trim()) return;
    setWorkspaceList(prev => prev.map(w => 
      w.id === editingWorkspace.id ? { ...w, name: newWorkspaceName } : w
    ));
    setShowEditWorkspace(false);
    setEditingWorkspace(null);
    setNewWorkspaceName("");
  };

  const handleDeleteWorkspace = (id: string) => {
    if (workspaceList.find(w => w.id === id)?.isDefault) return;
    setWorkspaceList(prev => prev.filter(w => w.id !== id));
    if (selectedWorkspace === id) setSelectedWorkspace("general");
  };

  const handleEditMessage = () => {
    if (!editingMessage) return;
    setMessages(prev => prev.map(m => 
      m.id === editingMessage.id ? { ...editingMessage, isEdited: true } : m
    ));
    setShowEditMessage(false);
    setEditingMessage(null);
  };

  const handleDeleteMessage = (id: number | string) => {
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  const insertMention = (name: string) => {
    setMessageInput(prev => prev + `@${name.replace(/\s/g, "")} `);
    setShowMentionPanel(false);
    setMentionFilter("");
    inputRef.current?.focus();
  };

  const insertEmoji = (emoji: string) => {
    setMessageInput(prev => prev + emoji);
    setShowEmojiPanel(false);
    inputRef.current?.focus();
  };

  const insertLink = () => {
    if (!linkUrl) return;
    const linkText = linkTitle || linkUrl;
    setMessageInput(prev => prev + `[${linkText}](${linkUrl})`);
    setShowAddLink(false);
    setLinkUrl("");
    setLinkTitle("");
  };

  const attachFile = (file: DriveFile) => {
    setMessageInput(prev => prev + `📎 ${file.name} `);
    setShowAttachFile(false);
  };

  return (
    <MainLayout>
      <div className="flex h-screen">
        {/* Workspaces Sidebar */}
        <div className="w-60 border-r border-border bg-card flex flex-col">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setIsSearching(!!e.target.value); }}
                className="pl-9 h-9 bg-muted/50 border-0"
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(""); setIsSearching(false); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>

          <ScrollArea className="flex-1 p-2">
            {/* Workspaces */}
            <div className="mb-4">
              <button
                onClick={() => setWorkspacesExpanded(!workspacesExpanded)}
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider w-full hover:text-foreground"
              >
                {workspacesExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                Workspaces
              </button>
              {workspacesExpanded && (
                <div className="mt-1 space-y-0.5">
                  {generalWorkspaces.map((workspace) => (
                    <div key={workspace.id} className="group relative">
                      <button
                        onClick={() => setSelectedWorkspace(workspace.id)}
                        className={cn(
                          "flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-colors",
                          selectedWorkspace === workspace.id
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-foreground hover:bg-muted"
                        )}
                      >
                        <Hash className="w-4 h-4 text-muted-foreground" />
                        <span className="flex-1 text-left truncate">{workspace.name}</span>
                        {workspace.unread > 0 && (
                          <span className="px-2 rounded-full bg-destructive text-primary-foreground text-[10px] font-medium">
                            {workspace.unread}
                          </span>
                        )}
                      </button>
                      {!workspace.isDefault && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-muted">
                              <MoreHorizontal className="w-3 h-3" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setEditingWorkspace(workspace); setNewWorkspaceName(workspace.name); setShowEditWorkspace(true); }}>
                              <Pencil className="w-4 h-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteWorkspace(workspace.id)}>
                              <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Projects */}
            <div>
              <button
                onClick={() => setProjectsExpanded(!projectsExpanded)}
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider w-full hover:text-foreground"
              >
                {projectsExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                Projects
              </button>
              {projectsExpanded && (
                <div className="mt-1 space-y-0.5">
                  {projectWorkspaces.map((workspace) => (
                    <div key={workspace.id} className="group relative">
                      <button
                        onClick={() => setSelectedWorkspace(workspace.id)}
                        className={cn(
                          "flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-colors",
                          selectedWorkspace === workspace.id
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-foreground hover:bg-muted"
                        )}
                      >
                        <Hash className="w-4 h-4 text-muted-foreground" />
                        <span className="flex-1 text-left truncate">{workspace.name}</span>
                        {workspace.unread > 0 && (
                          <span className="px-2 rounded-full bg-destructive text-primary-foreground text-[10px] font-medium">
                            {workspace.unread}
                          </span>
                        )}
                      </button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-muted">
                            <MoreHorizontal className="w-3 h-3" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setEditingWorkspace(workspace); setNewWorkspaceName(workspace.name); setShowEditWorkspace(true); }}>
                            <Pencil className="w-4 h-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteWorkspace(workspace.id)}>
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                  <button
                    onClick={() => setShowAddWorkspace(true)}
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add workspace
                  </button>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-background">
          {/* Chat Header */}
          <div className="h-14 px-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Hash className="w-5 h-5 text-muted-foreground" />
              <h2 className="font-semibold text-foreground">
                {workspaceList.find((w) => w.id === selectedWorkspace)?.name}
              </h2>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsSearching(!isSearching)}>
                <Search className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {filteredMessages.map((msg) => (
                <div key={msg.id} className="chat-message group">
                  <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary flex-shrink-0">
                    {msg.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-foreground">{msg.user}</span>
                      <span className="text-xs text-muted-foreground">{msg.time}</span>
                      {msg.isEdited && <span className="text-xs text-muted-foreground">(edited)</span>}
                    </div>
                    <div className="text-sm text-foreground whitespace-pre-wrap">
                      {msg.message.split(/(@\w+)/g).map((part, i) =>
                        part.startsWith("@") ? (
                          <span key={i} className="text-primary font-medium">{part}</span>
                        ) : (
                          <span key={i}>{part}</span>
                        )
                      )}
                    </div>
                    {msg.reactions.length > 0 && (
                      <div className="flex items-center gap-1 mt-2">
                        {msg.reactions.map((reaction, i) => (
                          <button key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-xs hover:bg-muted/80">
                            {reaction.emoji} {reaction.count}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-muted text-muted-foreground hover:text-foreground transition-all">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setEditingMessage(msg); setShowEditMessage(true); }}>
                        <Pencil className="w-4 h-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteMessage(msg.id)}>
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="p-4 border-t border-border">
            <div className="bg-muted/50 rounded-xl border border-border focus-within:border-primary/50 transition-colors">
              <div className="p-3">
                <textarea
                  ref={inputRef}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                  placeholder={`Message #${workspaceList.find((w) => w.id === selectedWorkspace)?.name}...`}
                  className="w-full bg-transparent text-sm resize-none focus:outline-none min-h-[60px]"
                  rows={2}
                />
              </div>
              <div className="px-3 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-0.5">
                  <Button variant="ghost" size="icon" className="h-8 w-8"><Bold className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8"><Italic className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowAddLink(true)}><Link className="w-4 h-4" /></Button>
                  <div className="w-px h-4 bg-border mx-1" />
                  <Popover open={showMentionPanel} onOpenChange={setShowMentionPanel}>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><AtSign className="w-4 h-4" /></Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56 p-2" align="start">
                      <Input
                        placeholder="Search members..."
                        value={mentionFilter}
                        onChange={(e) => setMentionFilter(e.target.value)}
                        className="mb-2 h-8"
                      />
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {filteredMembers.map((member) => (
                          <button
                            key={member.name}
                            onClick={() => insertMention(member.name)}
                            className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg hover:bg-muted text-sm"
                          >
                            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-medium text-primary">
                              {member.initials}
                            </div>
                            {member.name}
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Popover open={showEmojiPanel} onOpenChange={setShowEmojiPanel}>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Smile className="w-4 h-4" /></Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-2" align="start">
                      <div className="grid grid-cols-8 gap-1">
                        {emojis.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => insertEmoji(emoji)}
                            className="p-2 rounded hover:bg-muted text-lg"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowAttachFile(true)}><Paperclip className="w-4 h-4" /></Button>
                </div>
                <Button size="sm" disabled={!messageInput.trim()} onClick={handleSendMessage}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Members Sidebar */}
        <div className="w-56 border-l border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Team Members</h3>
          <div className="space-y-2">
            {teamMembers.map((member) => (
              <div key={member.name} className="flex items-center gap-2 py-1">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
                    {member.initials}
                  </div>
                  <div className={cn(
                    "absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-card",
                    member.status === "online" ? "bg-success" : member.status === "away" ? "bg-warning" : "bg-muted-foreground"
                  )} />
                </div>
                <span className="text-sm text-foreground truncate">{member.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Workspace Modal */}
      <Dialog open={showAddWorkspace} onOpenChange={setShowAddWorkspace}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Workspace</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">Workspace Name</label>
            <Input
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
              placeholder="e.g., Marketing"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddWorkspace(false)}>Cancel</Button>
            <Button onClick={handleAddWorkspace}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Workspace Modal */}
      <Dialog open={showEditWorkspace} onOpenChange={setShowEditWorkspace}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Workspace</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">Workspace Name</label>
            <Input
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditWorkspace(false)}>Cancel</Button>
            <Button onClick={handleEditWorkspace}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Message Modal */}
      <Dialog open={showEditMessage} onOpenChange={setShowEditMessage}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Message</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <textarea
              value={editingMessage?.message || ""}
              onChange={(e) => setEditingMessage(prev => prev ? { ...prev, message: e.target.value } : null)}
              className="w-full h-24 px-3 py-2 rounded-lg border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditMessage(false)}>Cancel</Button>
            <Button onClick={handleEditMessage}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Link Panel */}
      <Dialog open={showAddLink} onOpenChange={setShowAddLink}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Link</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">URL</label>
              <Input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Title (optional)</label>
              <Input
                value={linkTitle}
                onChange={(e) => setLinkTitle(e.target.value)}
                placeholder="Link title"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddLink(false)}>Cancel</Button>
            <Button onClick={insertLink}>Add Link</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Attach File Modal */}
      <Dialog open={showAttachFile} onOpenChange={setShowAttachFile}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Attach File from Drive</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              {driveFiles.map((file) => (
                <button
                  key={file.id}
                  onClick={() => attachFile(file)}
                  className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-muted text-left"
                >
                  <Paperclip className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{file.name}</span>
                </button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAttachFile(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}

import { useState } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Email {
  id: number;
  from: string;
  to: string[];
  subject: string;
  preview: string;
  body: string;
  attachments: { name: string; type: string }[];
  date: string;
  unread: boolean;
  starred: boolean;
}

const folders = [
  { id: "inbox", label: "Inbox", icon: Inbox, count: 12 },
  { id: "sent", label: "Sent", icon: SendIcon, count: 0 },
  { id: "drafts", label: "Drafts", icon: File, count: 2 },
  { id: "starred", label: "Starred", icon: Star, count: 5 },
  { id: "archive", label: "Archive", icon: Archive, count: 0 },
  { id: "trash", label: "Trash", icon: Trash2, count: 0 },
];

const emails: Email[] = [
  {
    id: 1,
    from: "Marketing Team",
    to: ["@john", "@sarah", "@mike"],
    subject: "Q1 Campaign Assets Review",
    preview: "Please review the attached assets for the upcoming Q1 marketing campaign.",
    body: `Hi Team,

Please review the attached assets for the upcoming Q1 marketing campaign. We need feedback by EOD Friday.

Key deliverables:
- Banner ads (3 sizes)
- Social media posts
- Email templates

Let me know if you have any questions.

Best,
Marketing Team`,
    attachments: [
      { name: "Campaign_Brief.pdf", type: "link" },
      { name: "Brand_Assets.zip", type: "file" },
    ],
    date: "10:30 AM",
    unread: true,
    starred: false,
  },
  {
    id: 2,
    from: "HR Department",
    to: ["@all"],
    subject: "Team Building Event - Save the Date",
    preview: "We're excited to announce our annual team building event scheduled for March 15th.",
    body: `Hello Everyone,

We're excited to announce our annual team building event scheduled for March 15th.

Details:
- Date: March 15th, 2026
- Time: 10:00 AM - 6:00 PM
- Location: TBD

Please RSVP by February 28th.

Cheers,
HR Department`,
    attachments: [],
    date: "Yesterday",
    unread: true,
    starred: true,
  },
  {
    id: 3,
    from: "Alex Kim",
    to: ["@john"],
    subject: "RE: Project Timeline Update",
    preview: "Thanks for the update. I've reviewed the new timeline and everything looks good.",
    body: `Thanks for the update. I've reviewed the new timeline and everything looks good.

I'll sync with the dev team tomorrow to make sure we're all aligned.

Best,
Alex`,
    attachments: [],
    date: "Yesterday",
    unread: false,
    starred: false,
  },
  {
    id: 4,
    from: "Sarah Chen",
    to: ["@john", "@alex"],
    subject: "Design System Updates",
    preview: "I've finished the design system updates we discussed.",
    body: `Hi John and Alex,

I've finished the design system updates we discussed in our last meeting. The main changes include:

1. Updated color palette with better accessibility scores
2. New component variants for buttons and cards
3. Improved spacing tokens

Please review the Figma file and let me know your thoughts.

Thanks,
Sarah`,
    attachments: [{ name: "Figma Design File", type: "link" }],
    date: "Jan 27",
    unread: false,
    starred: true,
  },
];

type ViewMode = "list" | "detail" | "compose" | "reply" | "forward";

export default function TeamMail() {
  const [selectedFolder, setSelectedFolder] = useState("inbox");
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  // Compose state
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");

  const handleSelectEmail = (email: Email) => {
    setSelectedEmail(email);
    setViewMode("detail");
  };

  const handleCompose = () => {
    setComposeTo("");
    setComposeSubject("");
    setComposeBody("");
    setViewMode("compose");
  };

  const handleReply = () => {
    if (!selectedEmail) return;
    setComposeTo(selectedEmail.from);
    setComposeSubject(`RE: ${selectedEmail.subject}`);
    setComposeBody(`\n\n---\nOn ${selectedEmail.date}, ${selectedEmail.from} wrote:\n${selectedEmail.body}`);
    setViewMode("reply");
  };

  const handleForward = () => {
    if (!selectedEmail) return;
    setComposeTo("");
    setComposeSubject(`FW: ${selectedEmail.subject}`);
    setComposeBody(`\n\n---\nForwarded message:\nFrom: ${selectedEmail.from}\nDate: ${selectedEmail.date}\nSubject: ${selectedEmail.subject}\n\n${selectedEmail.body}`);
    setViewMode("forward");
  };

  const handleSend = () => {
    // Mock send
    setViewMode("list");
    setSelectedEmail(null);
  };

  const handleBack = () => {
    if (viewMode === "reply" || viewMode === "forward") {
      setViewMode("detail");
    } else {
      setViewMode("list");
      setSelectedEmail(null);
    }
  };

  const renderSecondPane = () => {
    // Compose / Reply / Forward
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

          <div className="flex-1 overflow-auto p-6">
            <div className="max-w-3xl mx-auto space-y-4">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <span className="text-sm text-muted-foreground w-16">To:</span>
                <Input
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                  placeholder="@name, @name..."
                  className="flex-1 border-0 bg-transparent px-0 focus-visible:ring-0"
                />
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

    // Email Detail
    if (viewMode === "detail" && selectedEmail) {
      return (
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-border">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <h2 className="text-xl font-semibold text-foreground">{selectedEmail.subject}</h2>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Star className={cn("w-4 h-4", selectedEmail.starred && "fill-warning text-warning")} />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8"><Archive className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8"><Trash2 className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary">
                {selectedEmail.from.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{selectedEmail.from}</p>
                <p className="text-xs text-muted-foreground">To: {selectedEmail.to.join(", ")}</p>
              </div>
              <span className="text-sm text-muted-foreground">{selectedEmail.date}</span>
            </div>
          </div>

          <ScrollArea className="flex-1 p-6">
            <div className="max-w-3xl">
              <pre className="whitespace-pre-wrap font-sans text-sm text-foreground leading-relaxed">
                {selectedEmail.body}
              </pre>

              {selectedEmail.attachments.length > 0 && (
                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-sm font-medium text-foreground mb-3">
                    Attachments ({selectedEmail.attachments.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedEmail.attachments.map((attachment, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted text-sm cursor-pointer hover:bg-muted/80"
                      >
                        {attachment.type === "link" ? (
                          <Link className="w-4 h-4 text-primary" />
                        ) : (
                          <File className="w-4 h-4 text-muted-foreground" />
                        )}
                        {attachment.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
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

    // Email List (default)
    return (
      <ScrollArea className="flex-1">
        <div className="divide-y divide-border">
          {emails.map((email) => (
            <div
              key={email.id}
              onClick={() => handleSelectEmail(email)}
              className={cn(
                "p-4 cursor-pointer transition-colors hover:bg-muted/50",
                email.unread && "bg-primary/5"
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                {email.unread && <Circle className="w-2 h-2 fill-primary text-primary flex-shrink-0" />}
                <span className={cn("text-sm flex-1 truncate", email.unread ? "font-semibold" : "font-medium")}>
                  {email.from}
                </span>
                <span className="text-xs text-muted-foreground">{email.date}</span>
              </div>
              <p className={cn("text-sm mb-1 truncate", email.unread && "font-medium")}>{email.subject}</p>
              <p className="text-xs text-muted-foreground truncate">{email.preview}</p>
              {email.attachments.length > 0 && (
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                  <Paperclip className="w-3 h-3" />
                  {email.attachments.length} attachment{email.attachments.length > 1 ? "s" : ""}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    );
  };

  return (
    <MainLayout>
      <div className="flex h-screen">
        {/* Sidebar - Folders */}
        <div className="w-56 border-r border-border bg-card p-4 flex flex-col">
          <Button className="mb-4 w-full" onClick={handleCompose}>
            Compose
          </Button>

          <nav className="space-y-1">
            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => { setSelectedFolder(folder.id); setViewMode("list"); setSelectedEmail(null); }}
                className={cn(
                  "flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  selectedFolder === folder.id
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <folder.icon className="w-4 h-4" />
                <span className="flex-1 text-left">{folder.label}</span>
                {folder.count > 0 && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-destructive text-destructive-foreground">
                    {folder.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content - Two pane layout */}
        <div className="flex-1 flex flex-col bg-background">
          {/* Search Bar */}
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

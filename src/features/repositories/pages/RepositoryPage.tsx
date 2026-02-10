import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  GitBranch,
  Clock,
  Star,
  Eye,
  GitFork,
  Code,
  FileText,
  GitCommit,
  Users,
  Settings,
  Search,
  ChevronDown,
  Folder,
  File,
  History,
} from "lucide-react";
import { cn } from "@/lib/utils";

const repoData = {
  name: "frontend-app",
  description: "React frontend application for the main product",
  tool: "github",
  stars: 42,
  watchers: 12,
  forks: 8,
  language: "TypeScript",
  lastCommit: "2 hours ago",
  branch: "main",
  branches: ["main", "develop", "feature/auth", "feature/dashboard"],
};

const files = [
  { type: "folder", name: "src", lastCommit: "feat: add new components", date: "2 hours ago" },
  { type: "folder", name: "public", lastCommit: "chore: update favicon", date: "5 days ago" },
  { type: "folder", name: "tests", lastCommit: "test: add unit tests", date: "1 day ago" },
  { type: "file", name: ".gitignore", lastCommit: "chore: update gitignore", date: "2 weeks ago" },
  { type: "file", name: "package.json", lastCommit: "chore: bump dependencies", date: "3 days ago" },
  { type: "file", name: "README.md", lastCommit: "docs: update readme", date: "1 week ago" },
  { type: "file", name: "tsconfig.json", lastCommit: "chore: strict mode", date: "2 weeks ago" },
  { type: "file", name: "vite.config.ts", lastCommit: "feat: add plugins", date: "4 days ago" },
];

const commits = [
  {
    id: "abc123",
    message: "feat: add new authentication flow",
    author: "Sarah Chen",
    authorAvatar: "SC",
    date: "2 hours ago",
    sha: "abc1234",
  },
  {
    id: "def456",
    message: "fix: resolve navigation issue on mobile",
    author: "Mike Johnson",
    authorAvatar: "MJ",
    date: "5 hours ago",
    sha: "def4567",
  },
  {
    id: "ghi789",
    message: "chore: update dependencies to latest versions",
    author: "Alex Kim",
    authorAvatar: "AK",
    date: "1 day ago",
    sha: "ghi7890",
  },
  {
    id: "jkl012",
    message: "docs: improve API documentation",
    author: "Emily Davis",
    authorAvatar: "ED",
    date: "2 days ago",
    sha: "jkl0123",
  },
];

const contributors = [
  { name: "Sarah Chen", avatar: "SC", commits: 245, additions: 12450, deletions: 3200 },
  { name: "Mike Johnson", avatar: "MJ", commits: 189, additions: 8900, deletions: 2100 },
  { name: "Alex Kim", avatar: "AK", commits: 156, additions: 6700, deletions: 1800 },
  { name: "Emily Davis", avatar: "ED", commits: 98, additions: 4200, deletions: 980 },
];

export default function TeamRepository() {
  const [activeTab, setActiveTab] = useState("code");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { teamId } = useParams();

  return (
    <MainLayout>
      <div className="flex flex-col h-[calc(100vh-120px)]">
        {/* Header - Fixed */}
        <header className="sticky top-0 z-10 bg-background border-b border-border px-6 py-4">
          <div className="flex items-center gap-3 mb-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(`/${teamId}/repositories`)}
              aria-label="Back to repositories"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-primary" />
                {repoData.name}
              </h1>
              <p className="text-sm text-muted-foreground">{repoData.description}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <button className="flex items-center gap-1.5 hover:text-foreground transition-colors" aria-label="Star repository">
              <Star className="w-4 h-4" />
              <span>{repoData.stars}</span>
            </button>
            <button className="flex items-center gap-1.5 hover:text-foreground transition-colors" aria-label="Watch repository">
              <Eye className="w-4 h-4" />
              <span>{repoData.watchers}</span>
            </button>
            <button className="flex items-center gap-1.5 hover:text-foreground transition-colors" aria-label="Fork repository">
              <GitFork className="w-4 h-4" />
              <span>{repoData.forks}</span>
            </button>
            <Badge variant="secondary">{repoData.language}</Badge>
          </div>
        </header>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="border-b border-border px-6">
            <TabsList className="h-12 bg-transparent border-0 p-0">
              <TabsTrigger 
                value="code" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                <Code className="w-4 h-4 mr-2" />
                Code
              </TabsTrigger>
              <TabsTrigger 
                value="commits"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                <GitCommit className="w-4 h-4 mr-2" />
                Commits
              </TabsTrigger>
              <TabsTrigger 
                value="contributors"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                <Users className="w-4 h-4 mr-2" />
                Contributors
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1">
            {/* Code Tab */}
            <TabsContent value="code" className="m-0 p-6">
              {/* Branch Selector */}
              <div className="flex items-center gap-3 mb-4">
                <Button variant="outline" size="sm" className="gap-2">
                  <GitBranch className="w-4 h-4" />
                  {repoData.branch}
                  <ChevronDown className="w-3 h-3" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  {repoData.branches.length} branches
                </span>
              </div>

              {/* File List */}
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="bg-muted/50 px-4 py-3 border-b border-border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <History className="w-4 h-4" />
                    <span>Last commit: {repoData.lastCommit}</span>
                  </div>
                </div>
                <div className="divide-y divide-border">
                  {files.map((file) => (
                    <button
                      key={file.name}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left focus:outline-none focus:bg-muted/50"
                      aria-label={`Open ${file.name}`}
                    >
                      {file.type === "folder" ? (
                        <Folder className="w-4 h-4 text-primary" />
                      ) : (
                        <File className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className="font-medium text-foreground min-w-[150px]">{file.name}</span>
                      <span className="text-sm text-muted-foreground flex-1 truncate">{file.lastCommit}</span>
                      <span className="text-sm text-muted-foreground">{file.date}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* README */}
              <div className="mt-6 border border-border rounded-lg overflow-hidden">
                <div className="bg-muted/50 px-4 py-3 border-b border-border flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span className="font-medium">README.md</span>
                </div>
                <div className="p-6 prose prose-sm max-w-none dark:prose-invert">
                  <h1>Frontend App</h1>
                  <p>A React-based frontend application for the main product.</p>
                  <h2>Getting Started</h2>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                    <code>npm install{"\n"}npm run dev</code>
                  </pre>
                  <h2>Features</h2>
                  <ul>
                    <li>Modern React with TypeScript</li>
                    <li>Tailwind CSS for styling</li>
                    <li>Vite for fast development</li>
                  </ul>
                </div>
              </div>
            </TabsContent>

            {/* Commits Tab */}
            <TabsContent value="commits" className="m-0 p-6">
              <div className="relative max-w-md mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search commits..."
                  className="pl-9"
                  aria-label="Search commits"
                />
              </div>

              <div className="space-y-3">
                {commits.map((commit) => (
                  <div
                    key={commit.id}
                    className="p-4 border border-border rounded-lg hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
                          {commit.authorAvatar}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{commit.message}</p>
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <span>{commit.author}</span>
                            <span>•</span>
                            <span>{commit.date}</span>
                          </div>
                        </div>
                      </div>
                      <code className="text-xs bg-muted px-2 py-1 rounded font-mono text-muted-foreground">
                        {commit.sha}
                      </code>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Contributors Tab */}
            <TabsContent value="contributors" className="m-0 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contributors.map((contributor) => (
                  <div
                    key={contributor.name}
                    className="p-4 border border-border rounded-lg"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary">
                        {contributor.avatar}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{contributor.name}</p>
                        <p className="text-sm text-muted-foreground">{contributor.commits} commits</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-success">+{contributor.additions.toLocaleString()}</span>
                      <span className="text-destructive">-{contributor.deletions.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>
    </MainLayout>
  );
}

import { useEffect, useMemo, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useParams } from "react-router-dom";
import { repositoryService } from "@/services";
import {
  ArrowLeft,
  GitBranch,
  Code,
  FileText,
  GitCommit,
  Users,
  Search,
  ChevronDown,
  Folder,
  File,
  History,
} from "lucide-react";

type RepoDetails = {
  id: string;
  name: string;
  defaultBranch?: string;
  provider?: string;
  private?: boolean;
  url?: string | null;
};

type BranchItem = {
  name: string;
  isDefault?: boolean;
};

type TreeItem = {
  type: "dir" | "file" | string;
  name: string;
  path: string;
};

type TreeResponse = {
  items?: TreeItem[];
};

type CommitItem = {
  id: string;
  message: string;
  author?: string;
  timestamp?: string;
};

type ContributorItem = {
  id: string;
  name: string;
  commits: number;
};

type BlobResponse = {
  content?: string | null;
  encoding?: string;
};

function formatRelativeTime(iso?: string): string {
  if (!iso) return "recently";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "recently";
  const diffMs = Date.now() - d.getTime();
  const minutes = Math.floor(diffMs / (1000 * 60));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getInitials(name?: string): string {
  if (!name) return "NA";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "NA";
}

export default function TeamRepository() {
  const [activeTab, setActiveTab] = useState("code");
  const [searchQuery, setSearchQuery] = useState("");
  const [repo, setRepo] = useState<RepoDetails | null>(null);
  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [selectedBranch, setSelectedBranch] = useState("main");
  const [files, setFiles] = useState<TreeItem[]>([]);
  const [commits, setCommits] = useState<CommitItem[]>([]);
  const [contributors, setContributors] = useState<ContributorItem[]>([]);
  const [readmeContent, setReadmeContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { teamId, repositoryId } = useParams();

  useEffect(() => {
    const loadRepository = async () => {
      if (!teamId || !repositoryId) {
        setError("Missing repository context");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const [details, branchList] = await Promise.all([
          repositoryService.getRepositoryDetails(teamId, repositoryId) as Promise<RepoDetails>,
          repositoryService.getBranches(teamId, repositoryId) as Promise<BranchItem[]>,
        ]);
        setRepo(details);
        const resolvedBranches = Array.isArray(branchList) ? branchList : [];
        setBranches(resolvedBranches);
        const defaultBranch =
          resolvedBranches.find((branch) => branch.isDefault)?.name ||
          details.defaultBranch ||
          resolvedBranches[0]?.name ||
          "main";
        setSelectedBranch(defaultBranch);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load repository";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    void loadRepository();
  }, [repositoryId, teamId]);

  useEffect(() => {
    const loadRepositoryContent = async () => {
      if (!teamId || !repositoryId || !selectedBranch) return;
      try {
        const [tree, commitList, contributorList] = await Promise.all([
          repositoryService.getRepositoryTree(teamId, repositoryId, "", selectedBranch) as Promise<TreeResponse>,
          repositoryService.getCommits(teamId, repositoryId, selectedBranch) as Promise<CommitItem[]>,
          repositoryService.getContributors(teamId, repositoryId) as Promise<ContributorItem[]>,
        ]);

        const treeItems = Array.isArray(tree?.items) ? tree.items : [];
        setFiles(treeItems);
        setCommits(Array.isArray(commitList) ? commitList : []);
        setContributors(Array.isArray(contributorList) ? contributorList : []);

        const readmeItem = treeItems.find((item) => item.type === "file" && item.name.toLowerCase() === "readme.md");
        if (readmeItem) {
          try {
            const blob = (await repositoryService.getFileContent(
              teamId,
              repositoryId,
              readmeItem.path,
              selectedBranch
            )) as BlobResponse;
            if (blob.content && blob.encoding === "base64") {
              setReadmeContent(atob(blob.content.replace(/\n/g, "")));
            } else {
              setReadmeContent("");
            }
          } catch {
            setReadmeContent("");
          }
        } else {
          setReadmeContent("");
        }
      } catch {
        setFiles([]);
        setCommits([]);
        setContributors([]);
        setReadmeContent("");
      }
    };

    void loadRepositoryContent();
  }, [repositoryId, selectedBranch, teamId]);

  const filteredCommits = useMemo(
    () => commits.filter((commit) => commit.message.toLowerCase().includes(searchQuery.toLowerCase())),
    [commits, searchQuery]
  );

  if (loading) {
    return (
      <MainLayout>
        <div className="p-6 text-sm text-muted-foreground">Loading repository...</div>
      </MainLayout>
    );
  }

  if (error || !repo) {
    return (
      <MainLayout>
        <div className="p-6">
          <p className="text-sm text-destructive mb-4">{error || "Repository not found"}</p>
          <Button variant="outline" onClick={() => navigate(`/${teamId}/repositories`)}>
            Back to repositories
          </Button>
        </div>
      </MainLayout>
    );
  }

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
                {repo.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                {repo.url ? (
                  <a href={repo.url} target="_blank" rel="noreferrer" className="underline underline-offset-2">
                    {repo.url}
                  </a>
                ) : (
                  "Connected repository"
                )}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Badge variant="secondary">{repo.provider || "GITHUB"}</Badge>
            <Badge variant="outline">{repo.private ? "Private" : "Public"}</Badge>
            <span>{contributors.length} contributors</span>
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
                  {selectedBranch}
                  <ChevronDown className="w-3 h-3" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  {branches.length} branches
                </span>
              </div>

              {/* File List */}
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="bg-muted/50 px-4 py-3 border-b border-border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <History className="w-4 h-4" />
                    <span>Last commit: {formatRelativeTime(commits[0]?.timestamp)}</span>
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
                      <span className="text-sm text-muted-foreground flex-1 truncate">{file.path}</span>
                      <span className="text-sm text-muted-foreground">{file.type}</span>
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
                  {readmeContent ? (
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
                      <code>{readmeContent}</code>
                    </pre>
                  ) : (
                    <p>No README found in this branch.</p>
                  )}
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
                {filteredCommits.map((commit) => (
                  <div
                    key={commit.id}
                    className="p-4 border border-border rounded-lg hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
                          {getInitials(commit.author)}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{commit.message}</p>
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <span>{commit.author || "Unknown"}</span>
                            <span>•</span>
                            <span>{formatRelativeTime(commit.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                      <code className="text-xs bg-muted px-2 py-1 rounded font-mono text-muted-foreground">
                        {commit.id.slice(0, 7)}
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
                    key={contributor.id}
                    className="p-4 border border-border rounded-lg"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary">
                        {getInitials(contributor.name)}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{contributor.name}</p>
                        <p className="text-sm text-muted-foreground">{contributor.commits} commits</p>
                      </div>
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

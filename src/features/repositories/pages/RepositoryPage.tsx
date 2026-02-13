import { useEffect, useMemo, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate, useParams } from "react-router-dom";
import { repositoryService } from "@/services";
import {
  ArrowLeft,
  GitBranch,
  ChevronRight,
  Code,
  FileText,
  GitCommit,
  Users,
  Search,
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

type PreviewType = "none" | "text" | "image" | "pdf" | "unsupported";

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

function getFileExtension(path: string): string {
  const match = path.toLowerCase().match(/\.([a-z0-9]+)$/);
  return match?.[1] || "";
}

function resolvePreviewType(path: string): PreviewType {
  const ext = getFileExtension(path);
  const imageExt = new Set(["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp"]);
  const textExt = new Set([
    "txt", "md", "json", "js", "jsx", "ts", "tsx", "css", "scss", "html", "yml", "yaml",
    "xml", "sh", "env", "gitignore", "py", "go", "java", "c", "cpp", "h", "hpp", "rs"
  ]);
  if (ext === "pdf") return "pdf";
  if (imageExt.has(ext)) return "image";
  if (textExt.has(ext) || !ext) return "text";
  return "unsupported";
}

function resolveImageMime(path: string): string {
  const ext = getFileExtension(path);
  switch (ext) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "gif":
      return "image/gif";
    case "webp":
      return "image/webp";
    case "svg":
      return "image/svg+xml";
    case "bmp":
      return "image/bmp";
    default:
      return "image/png";
  }
}

export default function TeamRepository() {
  const [activeTab, setActiveTab] = useState("code");
  const [searchQuery, setSearchQuery] = useState("");
  const [repo, setRepo] = useState<RepoDetails | null>(null);
  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [selectedBranch, setSelectedBranch] = useState("main");
  const [currentPath, setCurrentPath] = useState("");
  const [files, setFiles] = useState<TreeItem[]>([]);
  const [commits, setCommits] = useState<CommitItem[]>([]);
  const [contributors, setContributors] = useState<ContributorItem[]>([]);
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [selectedFileContent, setSelectedFileContent] = useState<string>("");
  const [selectedFileBase64, setSelectedFileBase64] = useState<string>("");
  const [selectedFilePreviewType, setSelectedFilePreviewType] = useState<PreviewType>("none");
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const [isLoadingFile, setIsLoadingFile] = useState(false);
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
        setCurrentPath("");
        setSelectedFilePath(null);
        setSelectedFileContent("");
        setSelectedFileBase64("");
        setSelectedFilePreviewType("none");
        setSelectedFileName("");
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
          repositoryService.getRepositoryTree(teamId, repositoryId, currentPath, selectedBranch) as Promise<TreeResponse>,
          repositoryService.getCommits(teamId, repositoryId, selectedBranch) as Promise<CommitItem[]>,
          repositoryService.getContributors(teamId, repositoryId) as Promise<ContributorItem[]>,
        ]);

        const treeItems = Array.isArray(tree?.items) ? tree.items : [];
        const ordered = [...treeItems].sort((a, b) => {
          const aDir = a.type === "dir" ? 0 : 1;
          const bDir = b.type === "dir" ? 0 : 1;
          if (aDir !== bDir) return aDir - bDir;
          return a.name.localeCompare(b.name);
        });
        setFiles(ordered);
        setCommits(Array.isArray(commitList) ? commitList : []);
        setContributors(Array.isArray(contributorList) ? contributorList : []);
      } catch {
        setFiles([]);
        setCommits([]);
        setContributors([]);
      }
    };

    void loadRepositoryContent();
  }, [currentPath, repositoryId, selectedBranch, teamId]);

  const openFile = async (item: TreeItem) => {
    if (!teamId || !repositoryId || !selectedBranch) return;
    setIsLoadingFile(true);
    const previewType = resolvePreviewType(item.path);
    try {
      const blob = (await repositoryService.getFileContent(
        teamId,
        repositoryId,
        item.path,
        selectedBranch
      )) as BlobResponse;
      if (blob.content && blob.encoding === "base64") {
        const base64 = blob.content.replace(/\n/g, "");
        setSelectedFileBase64(base64);
        if (previewType === "text") {
          setSelectedFileContent(atob(base64));
        } else {
          setSelectedFileContent("");
        }
      } else {
        setSelectedFileContent("");
        setSelectedFileBase64("");
      }
      setSelectedFilePath(item.path);
      setSelectedFileName(item.name);
      setSelectedFilePreviewType(previewType);
    } catch {
      setSelectedFileContent("");
      setSelectedFileBase64("");
      setSelectedFilePath(item.path);
      setSelectedFileName(item.name);
      setSelectedFilePreviewType("unsupported");
    } finally {
      setIsLoadingFile(false);
    }
  };

  const handleOpenTreeItem = (item: TreeItem) => {
    if (item.type === "dir") {
      setCurrentPath(item.path);
      setSelectedFilePath(null);
      setSelectedFileName("");
      setSelectedFileContent("");
      setSelectedFileBase64("");
      setSelectedFilePreviewType("none");
      return;
    }
    void openFile(item);
  };

  const pathSegments = useMemo(
    () => currentPath.split("/").filter(Boolean),
    [currentPath]
  );

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
                <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                  <SelectTrigger className="w-[220px] h-9">
                    <div className="inline-flex items-center gap-2">
                      <GitBranch className="w-4 h-4" />
                      <SelectValue placeholder="Select branch" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch.name} value={branch.name}>
                        {branch.name}
                        {branch.isDefault ? " (default)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">
                  {branches.length} branches
                </span>
              </div>

              <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground flex-wrap">
                <button
                  className="underline underline-offset-2 hover:text-foreground"
                  onClick={() => setCurrentPath("")}
                >
                  root
                </button>
                {pathSegments.map((segment, index) => {
                  const segmentPath = pathSegments.slice(0, index + 1).join("/");
                  return (
                    <div key={segmentPath} className="inline-flex items-center gap-2">
                      <ChevronRight className="w-3.5 h-3.5" />
                      <button
                        className="underline underline-offset-2 hover:text-foreground"
                        onClick={() => setCurrentPath(segmentPath)}
                      >
                        {segment}
                      </button>
                    </div>
                  );
                })}
                {currentPath ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => {
                      const parts = currentPath.split("/").filter(Boolean);
                      const parent = parts.slice(0, -1).join("/");
                      setCurrentPath(parent);
                      setSelectedFilePath(null);
                      setSelectedFileName("");
                      setSelectedFileContent("");
                      setSelectedFileBase64("");
                      setSelectedFilePreviewType("none");
                    }}
                  >
                    Up
                  </Button>
                ) : null}
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
                      key={file.path}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left focus:outline-none focus:bg-muted/50"
                      aria-label={file.type === "dir" ? `Open folder ${file.name}` : `Open file ${file.name}`}
                      onClick={() => handleOpenTreeItem(file)}
                    >
                      {file.type === "dir" ? (
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
                  <span className="font-medium">{selectedFileName || "File Preview"}</span>
                </div>
                <div className="p-6 prose prose-sm max-w-none dark:prose-invert">
                  {isLoadingFile ? (
                    <p>Loading file...</p>
                  ) : selectedFilePath && selectedFilePreviewType === "text" && selectedFileContent ? (
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
                      <code>{selectedFileContent}</code>
                    </pre>
                  ) : selectedFilePath && selectedFilePreviewType === "image" && selectedFileBase64 ? (
                    <img
                      src={`data:${resolveImageMime(selectedFilePath)};base64,${selectedFileBase64}`}
                      alt={selectedFileName || "Preview"}
                      className="max-w-full h-auto rounded border border-border"
                    />
                  ) : selectedFilePath && selectedFilePreviewType === "pdf" && selectedFileBase64 ? (
                    <iframe
                      title={selectedFileName || "PDF Preview"}
                      src={`data:application/pdf;base64,${selectedFileBase64}`}
                      className="w-full min-h-[70vh] border border-border rounded"
                    />
                  ) : selectedFilePath && selectedFilePreviewType === "unsupported" ? (
                    <p>Preview is not supported for this file type.</p>
                  ) : (
                    <p>Select a file to preview its content.</p>
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

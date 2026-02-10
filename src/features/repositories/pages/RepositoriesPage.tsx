import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CreateRepoModal } from "@/features/repositories/components/CreateRepoModal";
import { useNavigate, useParams } from "react-router-dom";
import {
  Search,
  Plus,
  GitBranch,
  Clock,
  ExternalLink,
  Github,
  GitlabIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// SVG icons for git tools
const BitbucketIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M.778 1.213a.768.768 0 00-.768.892l3.263 19.81c.084.5.515.868 1.022.873H19.95a.772.772 0 00.77-.646l3.27-20.03a.768.768 0 00-.768-.891zM14.52 15.53H9.522L8.17 8.466h7.561z" />
  </svg>
);

const AzureDevOpsIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M0 8.877L2.247 5.91l8.405-3.416V.022l7.37 5.393L2.966 8.338v8.225L0 15.707zm24-4.45v14.651l-5.753 4.9-9.303-3.057v3.056l-5.978-7.416 15.057 1.204V5.415z" />
  </svg>
);

const GitToolIcon = ({ tool }: { tool: string }) => {
  switch (tool) {
    case "github":
      return <Github className="w-5 h-5" />;
    case "gitlab":
      return <GitlabIcon className="w-5 h-5" />;
    case "bitbucket":
      return <BitbucketIcon />;
    case "azure-devops":
      return <AzureDevOpsIcon />;
    default:
      return <GitBranch className="w-5 h-5" />;
  }
};

const repositories = [
  {
    id: "repo-1",
    name: "frontend-app",
    tool: "github",
    toolName: "GitHub",
    project: "Mobile App Redesign",
    lastUpdate: "2 hours ago",
    branch: "main",
    commits: 1234,
  },
  {
    id: "repo-2",
    name: "backend-api",
    tool: "github",
    toolName: "GitHub",
    project: null,
    lastUpdate: "5 hours ago",
    branch: "develop",
    commits: 892,
  },
  {
    id: "repo-3",
    name: "design-system",
    tool: "gitlab",
    toolName: "GitLab",
    project: "Website Revamp",
    lastUpdate: "1 day ago",
    branch: "main",
    commits: 456,
  },
  {
    id: "repo-4",
    name: "mobile-app",
    tool: "bitbucket",
    toolName: "Bitbucket",
    project: "Mobile App Redesign",
    lastUpdate: "3 days ago",
    branch: "feature/auth",
    commits: 234,
  },
  {
    id: "repo-5",
    name: "devops-scripts",
    tool: "azure-devops",
    toolName: "Azure DevOps",
    project: null,
    lastUpdate: "1 week ago",
    branch: "main",
    commits: 78,
  },
];

export default function TeamRepositories() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { teamId } = useParams();

  const filteredRepos = repositories.filter((repo) =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="flex flex-col h-[calc(100vh-120px)]">
        {/* Header - Fixed */}
        <header className="sticky top-0 z-10 bg-background border-b border-border px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Repositories</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your team's code repositories
              </p>
            </div>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Repository
            </Button>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search repositories..."
              className="pl-9"
              aria-label="Search repositories"
            />
          </div>
        </header>

        {/* Repository List */}
        <ScrollArea className="flex-1 px-6">
          <div className="py-4 space-y-3">
            {filteredRepos.length === 0 ? (
              <div className="text-center py-12">
                <GitBranch className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No repositories found</h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? "Try a different search term" : "Add your first repository to get started"}
                </p>
              </div>
            ) : (
              filteredRepos.map((repo) => (
                <button
                  key={repo.id}
                  onClick={() => navigate(`/${teamId}/repository/${repo.id}`)}
                  className="w-full text-left p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  aria-label={`Open ${repo.name} repository`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        repo.tool === "github" && "bg-foreground text-background",
                        repo.tool === "gitlab" && "bg-warning text-warning-foreground",
                        repo.tool === "bitbucket" && "bg-primary text-primary-foreground",
                        repo.tool === "azure-devops" && "bg-info text-info-foreground"
                      )}>
                        <GitToolIcon tool={repo.tool} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground flex items-center gap-2">
                          {repo.name}
                          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                        </h3>
                        <p className="text-sm text-muted-foreground">{repo.toolName}</p>
                      </div>
                    </div>

                    <Badge variant={repo.project ? "default" : "secondary"}>
                      {repo.project || "Default"}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <GitBranch className="w-4 h-4" />
                      {repo.branch}
                    </span>
                    <span>{repo.commits} commits</span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {repo.lastUpdate}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      <CreateRepoModal open={showCreateModal} onOpenChange={setShowCreateModal} />
    </MainLayout>
  );
}

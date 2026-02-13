import { useCallback, useEffect, useMemo, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CreateRepoModal } from "@/features/repositories/components/CreateRepoModal";
import { useNavigate, useParams } from "react-router-dom";
import { integrationService, repositoryService } from "@/services";
import { ApiError } from "@/lib/api";
import {
  Search,
  Plus,
  GitBranch,
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

type ApiRepositoryItem = {
  id: string;
  provider?: string;
  name: string;
  defaultBranch?: string;
  private?: boolean;
  url?: string | null;
};

type ApiRepositoryListResponse = {
  items?: ApiRepositoryItem[];
};

type RepositoryCard = {
  id: string;
  name: string;
  tool: string;
  toolName: string;
  branch: string;
  isPrivate: boolean;
  url: string | null;
};

type ConnectedIntegration = {
  provider?: string;
  category?: string;
  status?: string;
};

const providerLabels: Record<string, string> = {
  github: "GitHub",
  gitlab: "GitLab",
  bitbucket: "Bitbucket",
  "azure-devops": "Azure DevOps",
};

function normalizeProvider(provider?: string): string {
  const value = (provider || "GITHUB").toLowerCase().replace(/_/g, "-");
  if (value === "azuredevops") {
    return "azure-devops";
  }
  return value;
}

function mapRepositoryToCard(repository: ApiRepositoryItem): RepositoryCard {
  const tool = normalizeProvider(repository.provider);
  return {
    id: repository.id,
    name: repository.name,
    tool,
    toolName: providerLabels[tool] || repository.provider || "Unknown",
    branch: repository.defaultBranch || "main",
    isPrivate: Boolean(repository.private),
    url: repository.url || null,
  };
}

function isNoRepositoriesState(error: unknown): boolean {
  if (!(error instanceof ApiError)) {
    return false;
  }

  if (error.status === 404) {
    return true;
  }

  const message = error.message.toLowerCase();
  return message.includes("no active integration found");
}

export default function TeamRepositories() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [repositories, setRepositories] = useState<RepositoryCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasActiveVersionControlIntegration, setHasActiveVersionControlIntegration] = useState(false);
  const [isCheckingIntegrations, setIsCheckingIntegrations] = useState(true);
  const navigate = useNavigate();
  const { teamId } = useParams();

  const hasConnectedVersionControlIntegration = (integrations: ConnectedIntegration[]): boolean => {
    return integrations.some((item) => {
      const category = (item.category || "").toUpperCase();
      const status = (item.status || "").toUpperCase();
      const provider = (item.provider || "").toUpperCase();
      const isVersionControlProvider = ["GITHUB", "GITLAB", "BITBUCKET", "AZURE_DEVOPS"].includes(provider);
      const isConnected = status !== "DISCONNECTED";
      return isConnected && (category === "VERSION_CONTROL" || isVersionControlProvider);
    });
  };

  const loadIntegrationState = useCallback(async () => {
    if (!teamId) {
      setHasActiveVersionControlIntegration(false);
      setIsCheckingIntegrations(false);
      return;
    }

    setIsCheckingIntegrations(true);
    try {
      const connectedByTeam = await integrationService.getConnectedIntegrations(teamId);
      const teamList = Array.isArray(connectedByTeam) ? connectedByTeam as ConnectedIntegration[] : [];
      const candidateProviders = Array.from(
        new Set(
          teamList
            .filter(hasConnectedVersionControlIntegration)
            .map((item) => String(item.provider || "").toLowerCase().replace(/_/g, "-"))
            .filter(Boolean),
        ),
      );

      if (candidateProviders.length === 0) {
        const connectedByUser = await integrationService.getConnectedIntegrations();
        const userList = Array.isArray(connectedByUser) ? connectedByUser as ConnectedIntegration[] : [];
        setHasActiveVersionControlIntegration(hasConnectedVersionControlIntegration(userList));
      } else {
        const statusChecks = await Promise.allSettled(
          candidateProviders.map((provider) => integrationService.getIntegrationStatus(provider, teamId)),
        );
        const hasUserScopedActive = statusChecks.some((result) => {
          if (result.status !== "fulfilled") return false;
          const status = String(result.value?.status || "").toUpperCase();
          return status !== "DISCONNECTED";
        });
        if (hasUserScopedActive) {
          setHasActiveVersionControlIntegration(true);
        } else {
          const connectedByUser = await integrationService.getConnectedIntegrations();
          const userList = Array.isArray(connectedByUser) ? connectedByUser as ConnectedIntegration[] : [];
          setHasActiveVersionControlIntegration(hasConnectedVersionControlIntegration(userList));
        }
      }
    } catch {
      setHasActiveVersionControlIntegration(false);
    } finally {
      setIsCheckingIntegrations(false);
    }
  }, [teamId]);

  const loadRepositories = useCallback(async () => {
    if (!teamId) {
      setRepositories([]);
      setErrorMessage("Team context is missing in URL.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = (await repositoryService.getRepositories(teamId)) as
        | ApiRepositoryItem[]
        | ApiRepositoryListResponse;

      const items = Array.isArray(response)
        ? response
        : Array.isArray(response?.items)
          ? response.items
          : [];

      setRepositories(items.map(mapRepositoryToCard));
    } catch (error) {
      setRepositories([]);

      if (isNoRepositoriesState(error)) {
        setErrorMessage(null);
      } else {
        const message = error instanceof Error ? error.message : "Failed to load repositories";
        setErrorMessage(message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    void loadRepositories();
  }, [loadRepositories]);

  useEffect(() => {
    void loadIntegrationState();
  }, [loadIntegrationState]);

  const filteredRepos = useMemo(
    () => repositories.filter((repo) => repo.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [repositories, searchQuery]
  );

  const handleCreateModalChange = (open: boolean) => {
    setShowCreateModal(open);
    if (!open) {
      void loadRepositories();
      void loadIntegrationState();
    }
  };

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
            <Button
              onClick={() => setShowCreateModal(true)}
              disabled={isCheckingIntegrations || !hasActiveVersionControlIntegration}
              title={
                hasActiveVersionControlIntegration
                  ? "Add repository"
                  : "Connect an active version control integration first"
              }
            >
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
            {isLoading ? (
              <div className="text-center py-12">
                <GitBranch className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Loading repositories...</h3>
              </div>
            ) : errorMessage ? (
              <div className="text-center py-12">
                <GitBranch className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Failed to load repositories</h3>
                <p className="text-sm text-muted-foreground mb-4">{errorMessage}</p>
                <Button variant="outline" onClick={() => void loadRepositories()}>
                  Retry
                </Button>
              </div>
            ) : filteredRepos.length === 0 ? (
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

                    <Badge variant="secondary">
                      {repo.isPrivate ? "Private" : "Public"}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <GitBranch className="w-4 h-4" />
                      {repo.branch}
                    </span>
                    {repo.url ? <span className="truncate">Open in provider</span> : null}
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      <CreateRepoModal open={showCreateModal} onOpenChange={handleCreateModalChange} teamId={teamId} />
    </MainLayout>
  );
}

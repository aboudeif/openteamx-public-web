import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExternalLink, GitBranch } from "lucide-react";
import { integrationService, projectService, repositoryService } from "@/services";
import { Project } from "@/shared/types";
import { toast } from "sonner";

interface CreateRepoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamId?: string;
}

type ConnectedIntegration = {
  provider?: string;
  category?: string;
  status?: string;
};

type ProviderOption = {
  id: string;
  name: string;
};

type ProviderRepo = {
  id: string;
  name: string;
  defaultBranch?: string;
  url?: string | null;
};

type RepoListResponse = {
  items?: ProviderRepo[];
};

const providerNames: Record<string, string> = {
  github: "GitHub",
  gitlab: "GitLab",
  bitbucket: "Bitbucket",
  "azure-devops": "Azure DevOps",
};

function normalizeProvider(provider?: string): string {
  return String(provider || "")
    .toLowerCase()
    .replace(/_/g, "-");
}

function getProviderName(provider: string): string {
  return providerNames[provider] || provider.toUpperCase();
}

function isConnectedVersionControlIntegration(item: ConnectedIntegration): boolean {
  const provider = normalizeProvider(item.provider);
  const category = String(item.category || "").toUpperCase();
  const status = String(item.status || "").toUpperCase();
  const isVersionControlProvider = ["github", "gitlab", "bitbucket", "azure-devops"].includes(provider);
  return status !== "DISCONNECTED" && (category === "VERSION_CONTROL" || isVersionControlProvider);
}

export function CreateRepoModal({ open, onOpenChange, teamId }: CreateRepoModalProps) {
  const [selectedTool, setSelectedTool] = useState("");
  const [selectedRepo, setSelectedRepo] = useState("");
  const [manualRepoName, setManualRepoName] = useState("");
  const [selectedProject, setSelectedProject] = useState("default");
  const [providerOptions, setProviderOptions] = useState<ProviderOption[]>([]);
  const [availableRepos, setAvailableRepos] = useState<ProviderRepo[]>([]);
  const [teamProjects, setTeamProjects] = useState<Project[]>([]);
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const projectOptions = useMemo(
    () => [{ id: "default", name: "Default (No Project)" }, ...teamProjects.map((project) => ({ id: project.id, name: project.title }))],
    [teamProjects]
  );

  const resetForm = () => {
    onOpenChange(false);
    setSelectedTool("");
    setSelectedRepo("");
    setManualRepoName("");
    setSelectedProject("default");
    setAvailableRepos([]);
  };

  const bootstrapModalData = useCallback(async () => {
    if (!teamId) {
      setProviderOptions([]);
      setTeamProjects([]);
      return;
    }

    setIsBootstrapping(true);
    try {
      const [connectedByTeamResult, connectedByUserResult, projectsResult] = await Promise.allSettled([
        integrationService.getConnectedIntegrations(teamId),
        integrationService.getConnectedIntegrations(),
        projectService.getProjects(teamId),
      ]);

      const connectedByTeam =
        connectedByTeamResult.status === "fulfilled" && Array.isArray(connectedByTeamResult.value)
          ? (connectedByTeamResult.value as ConnectedIntegration[])
          : [];

      const connectedByUser =
        connectedByUserResult.status === "fulfilled" && Array.isArray(connectedByUserResult.value)
          ? (connectedByUserResult.value as ConnectedIntegration[])
          : [];

      const mergedConnected = [...connectedByTeam, ...connectedByUser];
      const uniqueProviders = new Set(
        mergedConnected
          .filter(isConnectedVersionControlIntegration)
          .map((item) => normalizeProvider(item.provider))
          .filter(Boolean),
      );

      const providers = Array.from(uniqueProviders).map((provider) => ({
        id: provider,
        name: getProviderName(provider),
      }));

      const providerStatusChecks = await Promise.allSettled(
        providers.map(async (provider) => {
          const status = await integrationService.getIntegrationStatus(provider.id, teamId);
          const normalizedStatus = String(status?.status || "").toUpperCase();
          const isConnected = normalizedStatus !== "DISCONNECTED";
          return { provider, isConnected };
        }),
      );

      const userScopedProviders = providerStatusChecks
        .filter((result): result is PromiseFulfilledResult<{ provider: ProviderOption; isConnected: boolean }> => result.status === "fulfilled")
        .filter((result) => result.value.isConnected)
        .map((result) => result.value.provider);

      const fallbackUserProviders = Array.from(
        new Set(
          connectedByUser
            .filter(isConnectedVersionControlIntegration)
            .map((item) => normalizeProvider(item.provider))
            .filter(Boolean),
        ),
      ).map((provider) => ({
        id: provider,
        name: getProviderName(provider),
      }));

      const effectiveProviders = userScopedProviders.length > 0 ? userScopedProviders : fallbackUserProviders;

      const projects =
        projectsResult.status === "fulfilled" && Array.isArray(projectsResult.value)
          ? (projectsResult.value as Project[])
          : [];

      setProviderOptions(effectiveProviders);
      setTeamProjects(projects);
      setSelectedTool((prev) => (prev && effectiveProviders.some((provider) => provider.id === prev) ? prev : ""));
      setSelectedRepo("");
      setManualRepoName("");
      setAvailableRepos([]);

      if (effectiveProviders.length === 0) {
        toast.error("No active Git provider found for your account");
      }

      if (projectsResult.status === "rejected") {
        console.error("Failed to load team projects", projectsResult.reason);
      }
    } catch (error) {
      console.error("Failed to load create repository modal data", error);
      setProviderOptions([]);
      setTeamProjects([]);
      toast.error("Failed to load integrations");
    } finally {
      setIsBootstrapping(false);
    }
  }, [teamId]);

  useEffect(() => {
    if (!open) return;
    void bootstrapModalData();
  }, [open, bootstrapModalData]);

  useEffect(() => {
    if (!open || !selectedTool || !teamId) {
      setAvailableRepos([]);
      setSelectedRepo("");
      return;
    }

    const loadProviderRepos = async () => {
      setIsLoadingRepos(true);
      setSelectedRepo("");
      setManualRepoName("");
      try {
        const response = (await repositoryService.getAvailableRepos(selectedTool, teamId)) as ProviderRepo[] | RepoListResponse;
        const items = Array.isArray(response)
          ? response
          : Array.isArray(response?.items)
            ? response.items
            : [];
        setAvailableRepos(items);
      } catch (error) {
        console.error("Failed to load provider repositories", error);
        setAvailableRepos([]);
        toast.error("Failed to load repositories for selected provider");
      } finally {
        setIsLoadingRepos(false);
      }
    };

    void loadProviderRepos();
  }, [open, selectedTool, teamId]);

  const selectedRepository = useMemo(
    () => availableRepos.find((repo) => repo.id === selectedRepo),
    [availableRepos, selectedRepo]
  );

  const canUseManualRepoInput = Boolean(selectedTool);
  const hasManualRepoInput = manualRepoName.trim().length > 0;
  const manualName = manualRepoName.trim();
  const isOwnerRepoFormat = /^[^/\s]+\/[^/\s]+$/.test(manualName);
  const isSimpleRepoName = /^[a-zA-Z0-9._-]+$/.test(manualName);
  const canCreateRepoOnProvider = selectedTool === "github" && hasManualRepoInput && !isOwnerRepoFormat && isSimpleRepoName;
  const hasValidManualRepoInput = hasManualRepoInput
    ? (selectedTool === "github" ? isOwnerRepoFormat || isSimpleRepoName : isOwnerRepoFormat)
    : false;

  const openGitHubIntegrationPopup = () => {
    const width = 1100;
    const height = 760;
    const left = window.screenX + Math.max(0, Math.floor((window.outerWidth - width) / 2));
    const top = window.screenY + Math.max(0, Math.floor((window.outerHeight - height) / 2));
    const popup = window.open(
      "https://github.com/settings/installations",
      `github_integration_repos_${Date.now()}`,
      `popup=yes,width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`,
    );

    if (!popup) {
      window.location.href = "https://github.com/settings/installations";
    }
  };

  const handleCreate = async () => {
    if (!teamId || !selectedTool) {
      return;
    }

    if (hasManualRepoInput && !hasValidManualRepoInput) {
      toast.error(
        selectedTool === "github"
          ? "Use repo-name أو owner/repo"
          : "Use owner/repo format",
      );
      return;
    }

    const payload = hasManualRepoInput
      ? {
          provider: selectedTool,
          name: manualName,
          ...(canCreateRepoOnProvider
            ? {
                createOnProvider: true,
                private: true,
              }
            : isOwnerRepoFormat
            ? {}
            : {}),
          ...(selectedProject !== "default" ? { projectId: selectedProject } : {}),
        }
      : selectedRepo && selectedRepository
        ? {
            provider: selectedTool,
            name: selectedRepository.name,
            externalId: selectedRepository.id,
            defaultBranch: selectedRepository.defaultBranch || "main",
            url: selectedRepository.url || undefined,
            ...(selectedProject !== "default" ? { projectId: selectedProject } : {}),
          }
        : null;

    if (!payload) {
      return;
    }

    setIsSubmitting(true);
    try {
      await repositoryService.addRepository(teamId, payload);
      toast.success("Repository added");
      resetForm();
    } catch (error) {
      console.error("Failed to add repository", error);
      const message = error instanceof Error ? error.message : "Failed to add repository";
      if (message.toLowerCase().includes("no active integration found for this user")) {
        toast.error("This provider is not connected for your user in this team. Reconnect from Integrations page.");
      } else {
        toast.error(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" aria-describedby="create-repo-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-primary" />
            Add Repository
          </DialogTitle>
        </DialogHeader>
        
        <p id="create-repo-description" className="sr-only">
          Connect a repository from your integrated Git provider
        </p>

        <div className="space-y-4 py-4">
          {/* Git Tool Selection */}
          <div className="space-y-2">
            <Label htmlFor="git-tool">Git Provider</Label>
            <Select
              value={selectedTool}
              onValueChange={(value) => {
                setSelectedTool(value);
                setSelectedRepo("");
              }}
              disabled={isBootstrapping || providerOptions.length === 0}
            >
              <SelectTrigger id="git-tool">
                <SelectValue
                  placeholder={providerOptions.length === 0 ? "No connected Git providers" : "Select a Git provider"}
                />
              </SelectTrigger>
              <SelectContent>
                {providerOptions.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id}>
                    {provider.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Repository Selection */}
          <div className="space-y-2">
            <Label htmlFor="repository">Repository</Label>
            <Select
              value={selectedRepo}
              onValueChange={setSelectedRepo}
              disabled={!selectedTool || isLoadingRepos || availableRepos.length === 0 || hasManualRepoInput}
            >
              <SelectTrigger id="repository">
                <SelectValue
                  placeholder={
                    !selectedTool
                      ? "Select a Git provider first"
                      : isLoadingRepos
                        ? "Loading repositories..."
                        : availableRepos.length === 0
                          ? "No repositories available"
                          : "Select a repository"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {availableRepos.map((repo) => (
                  <SelectItem key={repo.id} value={repo.id}>
                    {repo.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {canUseManualRepoInput && (
            <div className="space-y-2">
              <Label htmlFor="manual-repo">Repository Name (or owner/repo)</Label>
              <Input
                id="manual-repo"
                value={manualRepoName}
                onChange={(event) => setManualRepoName(event.target.value)}
                placeholder="e.g. my-project-repo or octocat/Hello-World"
              />
              <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                <span>
                  {selectedTool === "github"
                    ? "GitHub: repo-name creates new repo, owner/repo links existing."
                    : "Use owner/repo to link existing repository."}
                </span>
                {selectedTool === "github" ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={openGitHubIntegrationPopup}
                  >
                    Open GitHub Integration
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                ) : null}
              </div>
              {hasManualRepoInput && !hasValidManualRepoInput ? (
                <p className="text-xs text-destructive">
                  {selectedTool === "github"
                    ? "Invalid format. Use repo-name or owner/repo."
                    : "Invalid format. Use owner/repo."}
                </p>
              ) : null}
            </div>
          )}

          {/* Project Assignment */}
          <div className="space-y-2">
            <Label htmlFor="project">Assign to Project</Label>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger id="project">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projectOptions.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={
              !teamId ||
              isSubmitting ||
              !selectedTool ||
              (!hasManualRepoInput && !selectedRepo) ||
              (hasManualRepoInput && !hasValidManualRepoInput)
            }
          >
            {isSubmitting ? "Adding..." : "Add Repository"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

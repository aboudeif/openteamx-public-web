import { useState } from "react";
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
import { AlertTriangle, GitBranch } from "lucide-react";

interface CreateRepoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const gitTools = [
  { id: "github", name: "GitHub", enabled: true, hasWarning: false },
  { id: "gitlab", name: "GitLab", enabled: true, hasWarning: false },
  { id: "bitbucket", name: "Bitbucket", enabled: true, hasWarning: false },
  { id: "azure-devops", name: "Azure DevOps", enabled: true, hasWarning: false },
  { id: "aws-codecommit", name: "AWS CodeCommit", enabled: false, hasWarning: true },
  { id: "sourceforge", name: "SourceForge", enabled: false, hasWarning: true },
  { id: "gitea", name: "Gitea", enabled: false, hasWarning: true },
  { id: "gogs", name: "Gogs", enabled: false, hasWarning: true },
  { id: "phabricator", name: "Phabricator", enabled: false, hasWarning: true },
  { id: "helix-core", name: "Helix Core", enabled: false, hasWarning: true },
];

const mockProjects = [
  { id: "default", name: "Default (No Project)" },
  { id: "project-1", name: "Mobile App Redesign" },
  { id: "project-2", name: "Backend API" },
  { id: "project-3", name: "Website Revamp" },
];

const mockRepos = [
  { id: "repo-1", name: "frontend-app" },
  { id: "repo-2", name: "backend-api" },
  { id: "repo-3", name: "mobile-app" },
];

export function CreateRepoModal({ open, onOpenChange }: CreateRepoModalProps) {
  const [selectedTool, setSelectedTool] = useState("");
  const [selectedRepo, setSelectedRepo] = useState("");
  const [selectedProject, setSelectedProject] = useState("default");

  const selectedToolData = gitTools.find(t => t.id === selectedTool);
  const showWarning = selectedToolData?.hasWarning;

  const handleCreate = () => {
    // Mock create action
    onOpenChange(false);
    setSelectedTool("");
    setSelectedRepo("");
    setSelectedProject("default");
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
            <Select value={selectedTool} onValueChange={setSelectedTool}>
              <SelectTrigger id="git-tool">
                <SelectValue placeholder="Select a Git provider" />
              </SelectTrigger>
              <SelectContent>
                {gitTools.map((tool) => (
                  <SelectItem 
                    key={tool.id} 
                    value={tool.id}
                    disabled={!tool.enabled}
                    className={!tool.enabled ? "opacity-50" : ""}
                  >
                    <div className="flex items-center gap-2">
                      <span>{tool.name}</span>
                      {!tool.enabled && (
                        <span className="text-xs text-muted-foreground">(Not integrated)</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Warning Message */}
          {showWarning && (
            <div 
              className="flex items-start gap-3 p-3 rounded-lg bg-warning/10 border border-warning/30"
              role="alert"
            >
              <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <p className="text-sm text-warning">
                <strong>Limited Integration:</strong> OpenTeamX cannot provide insights to companies for this repository due to integration limitations with {selectedToolData?.name}.
              </p>
            </div>
          )}

          {/* Repository Selection (only show when tool is selected and enabled) */}
          {selectedTool && selectedToolData?.enabled && (
            <div className="space-y-2">
              <Label htmlFor="repository">Repository</Label>
              <Select value={selectedRepo} onValueChange={setSelectedRepo}>
                <SelectTrigger id="repository">
                  <SelectValue placeholder="Select a repository" />
                </SelectTrigger>
                <SelectContent>
                  {mockRepos.map((repo) => (
                    <SelectItem key={repo.id} value={repo.id}>
                      {repo.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                {mockProjects.map((project) => (
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
            disabled={!selectedTool || (selectedToolData?.enabled && !selectedRepo)}
          >
            Add Repository
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

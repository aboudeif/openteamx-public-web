import { useState } from "react";
import { WorkspaceLayout } from "@/components/layout/WorkspaceLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Puzzle, 
  Key, 
  Plus, 
  Copy, 
  Trash2, 
  Check,
  ExternalLink,
  Shield,
} from "lucide-react";
import { toast } from "sonner";

const integrations = [
  { id: 1, name: "Google Workspace", icon: "🔵", description: "Connect Gmail, Drive, Calendar", connected: true, provider: "google" },
  { id: 2, name: "Slack", icon: "💬", description: "Team messaging and notifications", connected: true, provider: "slack" },
  { id: 3, name: "GitHub", icon: "🐙", description: "Code repositories and version control", connected: false, provider: "github" },
  { id: 4, name: "Jira", icon: "📋", description: "Project and issue tracking", connected: false, provider: "jira" },
  { id: 5, name: "Notion", icon: "📝", description: "Documentation and wikis", connected: false, provider: "notion" },
  { id: 6, name: "Figma", icon: "🎨", description: "Design collaboration", connected: true, provider: "figma" },
];

const apiKeys = [
  { id: 1, name: "Production API Key", key: "tlnt_prod_xxxxxxxxxxxx", created: "Jan 15, 2026", lastUsed: "2 hours ago" },
  { id: 2, name: "Development Key", key: "tlnt_dev_xxxxxxxxxxxx", created: "Dec 3, 2025", lastUsed: "1 day ago" },
];

export default function TalentIntegrations() {
  const [copiedKey, setCopiedKey] = useState<number | null>(null);

  const copyApiKey = (id: number, key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(id);
    toast.success("API key copied to clipboard");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleIntegration = (id: number, connected: boolean) => {
    toast.success(connected ? "Integration disconnected" : "Integration connected");
  };

  return (
    <WorkspaceLayout>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Puzzle className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-semibold text-foreground">Integrations & APIs</h1>
          </div>
          <p className="text-muted-foreground">Connect external apps and manage API access</p>
        </div>

        <Tabs defaultValue="integrations">
          <TabsList className="mb-6">
            <TabsTrigger value="integrations" className="gap-2">
              <Puzzle className="w-4 h-4" />
              App Integrations
            </TabsTrigger>
            <TabsTrigger value="api" className="gap-2">
              <Key className="w-4 h-4" />
              API Access
            </TabsTrigger>
          </TabsList>

          <TabsContent value="integrations">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {integrations.map((integration) => (
                <div
                  key={integration.id}
                  className="p-4 rounded-xl border border-border bg-card flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-2xl">
                      {integration.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold">{integration.name}</h3>
                      <p className="text-sm text-muted-foreground">{integration.description}</p>
                    </div>
                  </div>
                  <Button
                    variant={integration.connected ? "outline" : "default"}
                    size="sm"
                    onClick={() => toggleIntegration(integration.id, integration.connected)}
                  >
                    {integration.connected ? "Disconnect" : "Connect"}
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="api">
            <div className="space-y-6">
              {/* Security Notice */}
              <div className="p-4 rounded-xl bg-warning/10 border border-warning/20 flex items-start gap-3">
                <Shield className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-warning">Keep your API keys secure</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Never share your API keys publicly or commit them to version control.
                  </p>
                </div>
              </div>

              {/* Create New Key */}
              <div className="flex items-center gap-3">
                <Input placeholder="New API key name..." className="max-w-xs" />
                <Button>
                  <Plus className="w-4 h-4 mr-1" />
                  Create Key
                </Button>
              </div>

              {/* API Keys List */}
              <div className="space-y-3">
                {apiKeys.map((apiKey) => (
                  <div
                    key={apiKey.id}
                    className="p-4 rounded-xl border border-border bg-card"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{apiKey.name}</h3>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyApiKey(apiKey.id, apiKey.key)}
                        >
                          {copiedKey === apiKey.id ? (
                            <Check className="w-4 h-4 text-success" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-muted font-mono text-sm">
                      <span className="text-muted-foreground">{apiKey.key}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span>Created: {apiKey.created}</span>
                      <span>•</span>
                      <span>Last used: {apiKey.lastUsed}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* API Documentation Link */}
              <div className="p-4 rounded-xl border border-border bg-card flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">API Documentation</h3>
                  <p className="text-sm text-muted-foreground">Learn how to use the TalentHub API</p>
                </div>
                <Button variant="outline" size="sm">
                  View Docs
                  <ExternalLink className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </WorkspaceLayout>
  );
}

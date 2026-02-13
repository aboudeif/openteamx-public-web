import { useEffect, useMemo, useState } from "react";
import { WorkspaceLayout } from "@/components/layout/WorkspaceLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Puzzle,
  Key,
  ExternalLink,
  Shield,
  Copy,
  RotateCw,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { apiKeysService, integrationService } from "@/services";
import type { ApiKeyItem } from "@/services/api/ApiApiKeysService";
import { useParams } from "react-router-dom";

interface IntegrationItem {
  id: string;
  provider: string;
  status: string;
  externalName?: string | null;
  connectionMode?: "OAUTH" | "API" | "WEBHOOK" | "UNKNOWN";
}

const REQUIRED_PROVIDERS = [
  "GITHUB",
  "GITLAB",
  "BITBUCKET",
  "AZURE_DEVOPS",
  "GOOGLE",
  "MICROSOFT_TEAMS",
  "WEBEX",
  "SKYPE",
  "GOTO_MEETING",
  "BLUEJEANS",
  "JITSI",
  "WHEREBY",
  "OUTLOOK",
  "FIGMA",
] as const;

const providerMeta: Record<string, { icon: string; description: string; name: string }> = {
  GOOGLE: { icon: "🟢", description: "Google account OAuth integration", name: "Google" },
  GITHUB: { icon: "🐙", description: "Version control and repositories", name: "GitHub" },
  GITLAB: { icon: "🦊", description: "DevOps platform and repositories", name: "GitLab" },
  BITBUCKET: { icon: "🪣", description: "Git repository hosting", name: "Bitbucket" },
  AZURE_DEVOPS: { icon: "🔷", description: "Planning, repos, and pipelines", name: "Azure DevOps" },
  MICROSOFT_TEAMS: { icon: "👥", description: "Team collaboration and meetings", name: "Microsoft Teams" },
  WEBEX: { icon: "📡", description: "Cisco Webex meetings integration", name: "Webex" },
  SKYPE: { icon: "📞", description: "Skype integration", name: "Skype" },
  GOTO_MEETING: { icon: "🧭", description: "GoTo Meeting integration", name: "GoTo Meeting" },
  BLUEJEANS: { icon: "💙", description: "BlueJeans meetings integration", name: "BlueJeans" },
  JITSI: { icon: "📞", description: "Open-source video meetings", name: "Jitsi" },
  WHEREBY: { icon: "🌐", description: "Whereby meetings integration", name: "Whereby" },
  OUTLOOK: { icon: "📨", description: "Outlook account integration", name: "Outlook" },
  FIGMA: { icon: "🎨", description: "Design collaboration", name: "Figma" },
};

function normalizeProviderKey(provider: string): string {
  const normalized = String(provider || "").toUpperCase().replace(/-/g, "_");
  if (normalized === "GOOGLE_CALENDAR" || normalized === "GOOGLE_DRIVE") {
    return "GOOGLE";
  }
  return normalized;
}

function toReadableProvider(provider: string): string {
  return provider
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function TalentIntegrations() {
  const { teamId } = useParams();
  const [loading, setLoading] = useState(true);
  const [busyProvider, setBusyProvider] = useState<string | null>(null);
  const [connected, setConnected] = useState<IntegrationItem[]>([]);

  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([]);
  const [creatingKey, setCreatingKey] = useState(false);
  const [keyActionId, setKeyActionId] = useState<string | null>(null);
  const [keyName, setKeyName] = useState("");
  const [keyProvider, setKeyProvider] = useState<string>("GITHUB");
  const [latestSecret, setLatestSecret] = useState<string | null>(null);

  const connectedMap = useMemo(
    () => {
      const map = new Map<string, IntegrationItem>();
      for (const item of connected) {
        map.set(normalizeProviderKey(item.provider), item);
      }
      return map;
    },
    [connected],
  );

  const apiKeyProviderSet = useMemo(
    () =>
      new Set(
        apiKeys
          .map((key) => normalizeProviderKey(key.provider || ""))
          .filter((provider) => provider.length > 0),
      ),
    [apiKeys],
  );

  const loadData = async () => {
    setLoading(true);
    try {
      const [connectedRes, apiKeysRes] = await Promise.all([
        integrationService.getConnectedIntegrations(),
        apiKeysService.list(),
      ]);
      setConnected(Array.isArray(connectedRes) ? connectedRes : []);
      setApiKeys(Array.isArray(apiKeysRes) ? apiKeysRes : []);
    } catch (error) {
      console.error("Failed to load integrations", error);
      toast.error("Failed to load integrations data");
      setConnected([]);
      setApiKeys([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const providers = useMemo(() => {
    return REQUIRED_PROVIDERS.map((provider) => {
      const meta = providerMeta[provider];
      const connectedItem = connectedMap.get(provider);
      const isConnected = !!connectedItem && connectedItem.status !== "DISCONNECTED";
      const connectionMode = connectedItem?.connectionMode || "UNKNOWN";
      const hasApiKey = apiKeyProviderSet.has(provider);

      const oauthBlockedReason =
        !isConnected && hasApiKey
          ? "Blocked by API/Webhook setup"
          : !isConnected && connectedItem && connectionMode !== "OAUTH"
            ? "Blocked by API/Webhook setup"
            : null;

      const apiBlockedReason =
        isConnected && connectionMode === "OAUTH"
          ? "Blocked by OAuth setup"
          : null;

      return {
        provider,
        name: meta?.name ?? toReadableProvider(provider),
        icon: meta?.icon ?? "🔌",
        description: meta?.description ?? `Connect with ${toReadableProvider(provider)}`,
        connected: isConnected,
        connectionMode,
        oauthBlockedReason,
        apiBlockedReason,
      };
    });
  }, [apiKeyProviderSet, connectedMap]);

  useEffect(() => {
    if (!providers.length) return;
    if (!providers.some((provider) => provider.provider === keyProvider)) {
      setKeyProvider(providers[0].provider);
    }
  }, [providers, keyProvider]);

  const openFloatingOAuthWindow = (redirectUrl: string, provider: string) => {
    const width = 620;
    const height = 760;
    const left = window.screenX + Math.max(0, Math.floor((window.outerWidth - width) / 2));
    const top = window.screenY + Math.max(0, Math.floor((window.outerHeight - height) / 2));
    const popup = window.open(
      redirectUrl,
      `integration_oauth_${provider}_${Date.now()}`,
      `popup=yes,width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`,
    );

    if (!popup) {
      window.location.href = redirectUrl;
      return;
    }

    const pollTimer = window.setInterval(() => {
      if (!popup.closed) return;
      window.clearInterval(pollTimer);
      void loadData();
    }, 700);
  };

  const handleToggleIntegration = async (
    provider: string,
    isConnected: boolean,
    oauthBlockedReason?: string | null,
  ) => {
    if (!isConnected && oauthBlockedReason) {
      toast.error(`${toReadableProvider(provider)} ${oauthBlockedReason}`);
      return;
    }

    setBusyProvider(provider);
    try {
      if (isConnected) {
        const confirmed = window.confirm("Disconnect this integration?");
        if (!confirmed) {
          return;
        }
        await integrationService.disconnectIntegration(provider, teamId);
        toast.success("Integration disconnected");
        await loadData();
      } else {
        const redirectUrl = integrationService.getConnectUrl(provider, teamId);
        openFloatingOAuthWindow(redirectUrl, provider);
      }
    } catch (error) {
      console.error("Failed to update integration", error);
      toast.error("Failed to update integration");
    } finally {
      setBusyProvider(null);
    }
  };

  const handleCreateKey = async () => {
    if (!keyName.trim()) {
      toast.error("Enter API key name");
      return;
    }

    setCreatingKey(true);
    try {
      const created = await apiKeysService.create({
        name: keyName.trim(),
        provider: keyProvider,
        scopes: ["read:basic"],
      });

      setLatestSecret(created.secret);
      setKeyName("");
      toast.success("API key created");
      await loadData();
    } catch (error) {
      console.error("Failed to create API key", error);
      toast.error("Failed to create API key");
    } finally {
      setCreatingKey(false);
    }
  };

  const selectedProvider = providers.find((provider) => provider.provider === keyProvider) || null;

  const handleRotateKey = async (keyId: string) => {
    setKeyActionId(keyId);
    try {
      const rotated = await apiKeysService.rotate(keyId);
      setLatestSecret(rotated.secret);
      toast.success("API key rotated");
      await loadData();
    } catch (error) {
      console.error("Failed to rotate API key", error);
      toast.error("Failed to rotate API key");
    } finally {
      setKeyActionId(null);
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    const confirmed = window.confirm("Revoke this API key?");
    if (!confirmed) return;

    setKeyActionId(keyId);
    try {
      await apiKeysService.revoke(keyId);
      toast.success("API key revoked");
      await loadData();
    } catch (error) {
      console.error("Failed to revoke API key", error);
      toast.error("Failed to revoke API key");
    } finally {
      setKeyActionId(null);
    }
  };

  const copyText = async (value: string, label: string) => {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copied`);
  };

  return (
    <WorkspaceLayout>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Puzzle className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-semibold text-foreground">Integrations & APIs</h1>
          </div>
          <p className="text-muted-foreground">Connect apps with OAuth and manage API keys</p>
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
            {loading ? (
              <div className="p-6 rounded-xl border border-border bg-card text-muted-foreground">Loading integrations...</div>
            ) : providers.length === 0 ? (
              <div className="p-6 rounded-xl border border-border bg-card text-muted-foreground">No integrations available yet.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {providers.map((integration) => (
                  <div key={integration.provider} className="p-4 rounded-xl border border-border bg-card/90">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-lg bg-muted flex items-center justify-center text-2xl">{integration.icon}</div>
                        <div className="min-w-0">
                          <h3 className="font-semibold truncate">{integration.name}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">{integration.description}</p>
                        </div>
                      </div>
                      {integration.connected && <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Connected</Badge>}
                      {!integration.connected && integration.oauthBlockedReason && (
                        <Badge variant="outline" className="text-amber-700 border-amber-300">
                          {integration.oauthBlockedReason}
                        </Badge>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        variant={integration.connected ? "outline" : "default"}
                        disabled={busyProvider === integration.provider || (!integration.connected && !!integration.oauthBlockedReason)}
                        onClick={() =>
                          handleToggleIntegration(
                            integration.provider,
                            integration.connected,
                            integration.oauthBlockedReason,
                          )
                        }
                      >
                        {busyProvider === integration.provider
                          ? integration.connected
                            ? "Disconnecting..."
                            : "Connecting..."
                          : integration.connected
                            ? "Disconnect"
                            : "Connect"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="api">
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-warning/10 border border-warning/20 flex items-start gap-3">
                <Shield className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-warning">Keep your API keys secure</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    API secret is shown once. Copy it immediately and never commit it to source control.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-border bg-card space-y-4">
                <Input
                  placeholder="API key name"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                />

                <div>
                  <p className="text-sm font-medium mb-2">Integration Provider</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {providers.map((provider) => (
                      <button
                        key={provider.provider}
                        type="button"
                        disabled={!!provider.apiBlockedReason}
                        onClick={() => setKeyProvider(provider.provider)}
                        className={`text-left p-3 rounded-lg border transition-colors ${
                          keyProvider === provider.provider
                            ? "border-primary bg-primary/10"
                            : "border-border bg-background hover:border-primary/40"
                        } ${provider.apiBlockedReason ? "opacity-60 cursor-not-allowed hover:border-border" : ""}`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className="text-xl leading-none">{provider.icon}</span>
                          {provider.connected ? (
                            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Connected</Badge>
                          ) : (
                            <Badge variant="outline">Not connected</Badge>
                          )}
                        </div>
                        <p className="font-medium text-sm">{provider.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{provider.description}</p>
                        {provider.apiBlockedReason && (
                          <p className="text-xs text-amber-700 mt-1">{provider.apiBlockedReason}</p>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleCreateKey}
                    disabled={
                      creatingKey ||
                      providers.length === 0 ||
                      !keyProvider ||
                      !!selectedProvider?.apiBlockedReason
                    }
                  >
                    {creatingKey ? "Creating..." : "Create Key"}
                  </Button>
                </div>
              </div>

              {providers.length > 0 && !providers.some((provider) => provider.connected && provider.provider === keyProvider) && (
                <div className="p-3 rounded-lg border border-amber-200 bg-amber-50 text-sm text-amber-800">
                  Selected provider is not connected yet. You can still create a key, but connect first for full integration flow.
                </div>
              )}
              {selectedProvider?.apiBlockedReason && (
                <div className="p-3 rounded-lg border border-amber-200 bg-amber-50 text-sm text-amber-800">
                  {selectedProvider.name} {selectedProvider.apiBlockedReason}
                </div>
              )}

              {latestSecret && (
                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/80">
                  <p className="text-sm font-medium text-emerald-700 mb-2">New API Secret (shown once)</p>
                  <div className="flex items-center justify-between gap-2 p-2 rounded-md bg-white border border-emerald-200">
                    <code className="text-xs sm:text-sm break-all">{latestSecret}</code>
                    <Button size="sm" variant="outline" onClick={() => copyText(latestSecret, "Secret")}>Copy</Button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {apiKeys.map((apiKey) => (
                  <div key={apiKey.id} className="p-4 rounded-xl border border-border bg-card">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold truncate">{apiKey.name}</h3>
                          {apiKey.provider && <Badge variant="secondary">{toReadableProvider(apiKey.provider)}</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Prefix: {apiKey.prefix}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" disabled={keyActionId === apiKey.id} onClick={() => copyText(apiKey.prefix, "Key prefix")}>
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" disabled={keyActionId === apiKey.id} onClick={() => handleRotateKey(apiKey.id)}>
                          <RotateCw className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-destructive" disabled={keyActionId === apiKey.id} onClick={() => handleDeleteKey(apiKey.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {!loading && apiKeys.length === 0 && (
                  <div className="p-6 rounded-xl border border-border bg-card text-muted-foreground">No API keys created yet.</div>
                )}
              </div>

              <div className="p-4 rounded-xl border border-border bg-card flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">API Documentation</h3>
                  <p className="text-sm text-muted-foreground">Learn how to use the OpenTeamX API</p>
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

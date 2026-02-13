import { useState, useEffect, type MouseEvent, type PointerEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Plus,
  Folder,
  FileText,
  FileSpreadsheet,
  Link,
  Image,
  MoreHorizontal,
  Grid,
  List,
  Share2,
  Trash2,
  Download,
  FolderOpen,
  Pin,
  Upload,
  Pencil,
  Palette,
  ArrowLeft,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ExternalFileModal } from "@/features/drive/components/ExternalFileModal";
import { ManageAccessModal } from "@/features/drive/components/ManageAccessModal";
import { driveService } from "@/services";
import { DriveItem } from "@/shared/types";
import { DriveItemType } from "@/shared/enums";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const fileIcons = {
  [DriveItemType.Folder]: Folder,
  [DriveItemType.Document]: FileText,
  [DriveItemType.Spreadsheet]: FileSpreadsheet,
  [DriveItemType.Image]: Image,
  [DriveItemType.Link]: Link,
};

const fileColors: Record<string, string> = {
  [DriveItemType.Folder]: "text-warning",
  [DriveItemType.Document]: "text-info",
  [DriveItemType.Spreadsheet]: "text-success",
  [DriveItemType.Image]: "text-primary",
  [DriveItemType.Link]: "text-muted-foreground",
};

const tabs = [
  { id: "all", label: "All Files" },
  { id: "recent", label: "Recent" },
  { id: "pinned", label: "Pinned" },
  { id: "shared", label: "Shared with me" },
];

const ITEM_COLOR_CHOICES = ["#f97316", "#0ea5e9", "#22c55e", "#eab308", "#ef4444"];

const resolveApiBaseUrl = () => {
  const raw = import.meta.env.VITE_API_URL?.trim();
  if (!raw) return "/api/v1";
  const base = raw.replace(/\/+$/, "");
  if (base.endsWith("/api/v1")) return base;
  if (base.endsWith("/api")) return `${base}/v1`;
  if (base.startsWith("http://") || base.startsWith("https://")) return `${base}/api/v1`;
  if (base === "/api") return "/api/v1";
  return base;
};

export default function TeamDrive() {
  const { teamId = "" } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [showExternalFile, setShowExternalFile] = useState(false);
  const [showManageAccess, setShowManageAccess] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DriveItem | null>(null);
  const [displayItems, setDisplayItems] = useState<DriveItem[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [renameTarget, setRenameTarget] = useState<DriveItem | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [colorTarget, setColorTarget] = useState<DriveItem | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>("");

  useEffect(() => {
    if (!teamId) {
      return;
    }

    const fetchFiles = async () => {
      const folderId = currentPath.length > 0 ? currentPath[currentPath.length - 1] : undefined;
      const items = await driveService.getFiles(teamId, folderId);
      
      let filteredItems = items;
      
      // Only filter by tab if we are at root
      if (!folderId) {
        switch (activeTab) {
          case "pinned":
            filteredItems = items.filter(f => f.pinned);
            break;
          case "shared":
            filteredItems = items.filter(f => f.shared);
            break;
          case "recent":
            filteredItems = [...items].sort((a, b) => a.modifiedAt.localeCompare(b.modifiedAt));
            break;
          default:
            // "all" - verify if we need to filter out shared items in "all"? 
            // The original logic was: "all" -> folders + files. "shared" -> sharedWithMe.
            // If MockDriveService returns everything when root, we might need to filter.
            // But MockDriveService returns [...folders, ...files, ...sharedWithMe].
            // Original logic for "all": [...folders, ...files].
            // So we should filter out shared items if they are not meant to be in "all" or if "all" means everything.
            // Original logic: "all" used `folders` + `files`. `shared` used `sharedWithMe`.
            // MockDriveService returns merged list.
            // To mimic exactly: filter out shared=true unless activeTab is shared?
            // Actually `shared` property exists on `DriveItem`.
            if (activeTab === "all") {
                 // Try to filter out items that are strictly "sharedWithMe" if they are distinguishable.
                 // In my mock data, sharedWithMe items have `shared: true`.
                 // But `d4` (API Docs) in `files` also has `shared: true`.
                 // Original `folders` and `files` arrays were separate from `sharedWithMe`.
                 // I'll rely on the mock service behavior being close enough or filter if needed.
                 // For now, I'll just use what the service returns.
                 filteredItems = items; 
            }
            break;
        }
      }

      if (searchQuery) {
        filteredItems = filteredItems.filter((item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      setDisplayItems(filteredItems);
    };
    
    fetchFiles();
  }, [teamId, currentPath, activeTab, searchQuery, refreshKey]);

  const toggleSelect = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleCreateDocument = () => {
    navigate(`/${teamId}/drive/editor`);
  };

  const handleCreateSpreadsheet = () => {
    navigate(`/${teamId}/drive/spreadsheet`);
  };

  const handleOpenFolder = (folderName: string) => {
    setCurrentPath([...currentPath, folderName]);
  };

  const handleOpenItem = (item: DriveItem) => {
    if (item.type === DriveItemType.Folder) {
      handleOpenFolder(item.name);
      return;
    }

    if (item.type === DriveItemType.Document) {
      navigate(`/${teamId}/drive/editor/${item.id}`);
      return;
    }

    if (item.type === DriveItemType.Spreadsheet) {
      navigate(`/${teamId}/drive/spreadsheet/${item.id}`);
      return;
    }

    if (item.type === DriveItemType.Link && item.url) {
      window.open(item.url, "_blank");
    }
  };

  const handleBack = () => {
    setCurrentPath(currentPath.slice(0, -1));
  };

  const handleShare = (item: DriveItem) => {
    setSelectedItem(item);
    setShowManageAccess(true);
  };

  const openRenamePanel = (item: DriveItem) => {
    setRenameTarget(item);
    setRenameValue(item.name);
  };

  const submitRename = async () => {
    if (!renameTarget || !teamId) return;
    const nextName = renameValue.trim();
    if (!nextName || nextName === renameTarget.name) {
      setRenameTarget(null);
      return;
    }

    const driveServiceWithRename = driveService as typeof driveService & {
      renameFile?: (teamId: string, fileId: string, name: string) => Promise<void>;
    };
    if (!driveServiceWithRename.renameFile) {
      toast.error("Rename API is unavailable");
      return;
    }

    try {
      await driveServiceWithRename.renameFile(teamId, renameTarget.id, nextName);
      setRenameTarget(null);
      setRefreshKey((prev) => prev + 1);
      toast.success("Renamed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to rename");
    }
  };

  const openColorPanel = (item: DriveItem) => {
    setColorTarget(item);
    setSelectedColor(item.color || ITEM_COLOR_CHOICES[0]);
  };

  const submitColor = async () => {
    if (!colorTarget || !teamId || !selectedColor) return;
    const driveWithPreferences = driveService as typeof driveService & {
      updateFilePreferences?: (
        teamId: string,
        fileId: string,
        preferences: { pinned?: boolean; color?: string },
      ) => Promise<{ fileId: string; pinned: boolean; color: string | null }>;
    };

    if (!driveWithPreferences.updateFilePreferences) {
      toast.error("Color API is unavailable");
      return;
    }

    try {
      await driveWithPreferences.updateFilePreferences(teamId, colorTarget.id, { color: selectedColor });
      setColorTarget(null);
      setRefreshKey((prev) => prev + 1);
      toast.success("Color updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update color");
    }
  };

  const handleTogglePin = async (item: DriveItem) => {
    if (!teamId) return;
    const driveWithPreferences = driveService as typeof driveService & {
      updateFilePreferences?: (
        teamId: string,
        fileId: string,
        preferences: { pinned?: boolean; color?: string },
      ) => Promise<{ fileId: string; pinned: boolean; color: string | null }>;
    };

    if (!driveWithPreferences.updateFilePreferences) {
      toast.error("Pin API is unavailable");
      return;
    }

    try {
      await driveWithPreferences.updateFilePreferences(teamId, item.id, { pinned: !item.pinned });
      setRefreshKey((prev) => prev + 1);
      toast.success(item.pinned ? "Unpinned" : "Pinned");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update pin");
    }
  };

  const handleDownload = async (item: DriveItem) => {
    if (!teamId) return;
    if (item.type === DriveItemType.Link && item.url) {
      window.open(item.url, "_blank", "noopener,noreferrer");
      return;
    }

    try {
      const apiBase = resolveApiBaseUrl();
      const streamUrl = `${apiBase}/teams/${teamId}/drive/files/${item.id}/download`;
      const response = await fetch(streamUrl, { credentials: "include" });
      if (!response.ok) {
        throw new Error("Failed to download file");
      }

      const blob = await response.blob();
      const disposition = response.headers.get("content-disposition") || "";
      const filenameMatch = disposition.match(/filename=\"?([^"]+)\"?/i);
      const filename = filenameMatch?.[1] || item.name || "download";
      const href = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = href;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(href);
      toast.success("Download started");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Download failed");
    }
  };

  const handleDelete = async (item: DriveItem) => {
    const confirmed = window.confirm(`Delete "${item.name}"?`);
    if (!confirmed) return;

    try {
      await driveService.deleteItem(item.id, teamId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete");
      return;
    }

    setSelectedItems((prev) => prev.filter((id) => id !== item.id));
    setRefreshKey((prev) => prev + 1);
    toast.success("Deleted");
  };

  const stopClickPropagation = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
  };

  const stopPointerPropagation = (event: PointerEvent<HTMLElement>) => {
    event.stopPropagation();
  };

  return (
    <MainLayout>
      <div className="flex flex-col h-[calc(100vh-120px)]">
        {/* Header */}
        <div className="p-4 border-b border-border bg-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {currentPath.length > 0 && (
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              )}
              <h1 className="text-xl font-semibold text-foreground">
                {currentPath.length > 0 ? currentPath[currentPath.length - 1] : "Team Drive"}
              </h1>
              {currentPath.length > 1 && (
                <span className="text-sm text-muted-foreground">
                  in {currentPath.slice(0, -1).join(" / ")}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    New
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Folder className="w-4 h-4 mr-2" />
                    New Folder
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleCreateDocument}>
                    <FileText className="w-4 h-4 mr-2" />
                    Text Document
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleCreateSpreadsheet}>
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Spreadsheet
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowExternalFile(true)}>
                    <Link className="w-4 h-4 mr-2" />
                    External File
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload File
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search files..."
                  className="pl-9 h-9 bg-muted/50 border-0"
                />
              </div>
              <div className="flex rounded-lg border border-border overflow-hidden">
                <button
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "p-2 transition-colors",
                    viewMode === "list" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"
                  )}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "p-2 transition-colors",
                    viewMode === "grid" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Grid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          {viewMode === "list" ? (
            <div className="divide-y divide-border">
              {/* Header Row */}
              <div className="flex items-center gap-4 px-4 py-2 bg-muted/30 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <div className="w-6" />
                <span className="flex-1">Name</span>
                <span className="w-32">Modified</span>
                <span className="w-32">Modified by</span>
                <span className="w-20">Size</span>
                <div className="w-8" />
              </div>

              {displayItems.map((item) => {
                const Icon = fileIcons[item.type as DriveItemType] || FileText;
                const colorClass = fileColors[item.type] || "text-muted-foreground";
                const isSelected = selectedItems.includes(item.id);

                return (
                  <div
                    key={item.id}
                    className={cn(
                      "drive-item px-4",
                      isSelected && "drive-item-selected bg-primary/5"
                    )}
                    onClick={() => handleOpenItem(item)}
                  >
                    <div className="w-6 flex items-center">
                      {item.pinned && <Pin className="w-3 h-3 text-warning" />}
                    </div>
                    <div
                      className={cn("w-12 h-12 rounded-xl bg-muted flex items-center justify-center", colorClass)}
                      style={item.color ? { color: item.color } : undefined}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0 flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground truncate">{item.name}</span>
                      {item.shared && <Share2 className="w-3 h-3 text-muted-foreground" />}
                    </div>
                    <span className="w-32 text-sm text-muted-foreground">{item.modifiedAt}</span>
                    <span className="w-32 text-sm text-muted-foreground truncate">{item.modifiedBy}</span>
                    <span className="w-20 text-sm text-muted-foreground">{item.size || "—"}</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          onClick={stopClickPropagation}
                          onPointerDown={stopPointerPropagation}
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" onClick={stopClickPropagation}>
                        {item.type === DriveItemType.Link && item.url && (
                          <DropdownMenuItem onClick={() => window.open(item.url, "_blank")}>
                            <Link className="w-4 h-4 mr-2" />
                            Open Link
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleShare(item)}>
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openRenamePanel(item)}>
                          <Pencil className="w-4 h-4 mr-2" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openColorPanel(item)}>
                          <Palette className="w-4 h-4 mr-2" />
                          Change Color
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => void handleTogglePin(item)}>
                          <Pin className="w-4 h-4 mr-2" />
                          {item.pinned ? "Unpin" : "Pin"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => void handleDownload(item)}>
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => void handleDelete(item)}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                );
              })}

              {displayItems.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-24 h-24 rounded-2xl bg-muted flex items-center justify-center mb-4">
                    <FolderOpen className="w-12 h-12 text-muted-foreground/50" />
                  </div>
                  <p className="text-lg font-medium text-foreground mb-1">No files found</p>
                  <p className="text-sm text-muted-foreground">
                    {searchQuery ? "Try a different search term" : "Upload files or create new documents"}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {displayItems.map((item) => {
                const Icon = fileIcons[item.type as DriveItemType] || FileText;
                const colorClass = fileColors[item.type] || "text-muted-foreground";

                return (
                  <div
                    key={item.id}
                    className="group p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => handleOpenItem(item)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className={cn("w-14 h-14 rounded-xl bg-muted flex items-center justify-center", colorClass)}
                        style={item.color ? { color: item.color } : undefined}
                      >
                        <Icon className="w-7 h-7" />
                      </div>
                      <div className="flex items-center gap-1">
                        {item.pinned && <Pin className="w-3 h-3 text-warning" />}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                              onClick={stopClickPropagation}
                              onPointerDown={stopPointerPropagation}
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" onClick={stopClickPropagation}>
                            {item.type === DriveItemType.Link && item.url && (
                              <DropdownMenuItem onClick={() => window.open(item.url, "_blank", "noopener,noreferrer")}>
                                <Link className="w-4 h-4 mr-2" />
                                Open Link
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleShare(item)}>
                              <Share2 className="w-4 h-4 mr-2" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openRenamePanel(item)}>
                              <Pencil className="w-4 h-4 mr-2" />
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openColorPanel(item)}>
                              <Palette className="w-4 h-4 mr-2" />
                              Change Color
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => void handleTogglePin(item)}>
                              <Pin className="w-4 h-4 mr-2" />
                              {item.pinned ? "Unpin" : "Pin"}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => void handleDownload(item)}>
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={() => void handleDelete(item)}>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-foreground truncate mb-1">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.modifiedAt}</p>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <ExternalFileModal open={showExternalFile} onOpenChange={setShowExternalFile} />
        <ManageAccessModal 
          open={showManageAccess} 
          onOpenChange={setShowManageAccess} 
          itemId={selectedItem?.id}
          itemName={selectedItem?.name || ""}
          itemType={selectedItem?.type === DriveItemType.Folder ? "folder" : "file"}
          teamId={teamId}
        />

        <Dialog open={!!renameTarget} onOpenChange={(open) => !open && setRenameTarget(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rename file</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input value={renameValue} onChange={(event) => setRenameValue(event.target.value)} placeholder="File name" />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setRenameTarget(null)}>Cancel</Button>
                <Button onClick={() => void submitRename()}>Save</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={!!colorTarget} onOpenChange={(open) => !open && setColorTarget(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change file color</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-5 gap-3">
                {ITEM_COLOR_CHOICES.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={cn(
                      "h-10 w-10 rounded-full border-2 transition-all",
                      selectedColor === color ? "border-foreground scale-105" : "border-transparent",
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setColorTarget(null)}>Cancel</Button>
                <Button onClick={() => void submitColor()} disabled={!selectedColor}>Apply</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}

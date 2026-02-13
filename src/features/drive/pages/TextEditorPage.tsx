import { MouseEvent, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FileText,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link2,
  Table,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Save,
  Share2,
  MoreHorizontal,
  Plus,
  Palette,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ManageAccessModal } from "@/features/drive/components/ManageAccessModal";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { driveService } from "@/services";

const PAGE_BREAK_MARKER = "<!--OTX_PAGE_BREAK-->";
const DEFAULT_PAGE_HTML = `
  <h1>Welcome to the Text Editor</h1>
  <p>Start typing to create your document. This editor supports:</p>
  <ul>
    <li><strong>Bold</strong>, <em>italic</em>, and <u>underlined</u> text</li>
    <li>Multiple heading levels</li>
    <li>Bullet and numbered lists</li>
    <li>Links, tables, and text colors</li>
  </ul>
  <p>Use the toolbar above to format your content.</p>
`;

const deserializePages = (content: string) => {
  const raw = (content || "").trim();
  if (!raw) return [DEFAULT_PAGE_HTML];

  const pages = raw.includes(PAGE_BREAK_MARKER)
    ? raw.split(PAGE_BREAK_MARKER).map((part) => part.trim())
    : [raw];

  const nonEmptyPages = pages.filter((page) => page.length > 0);
  return nonEmptyPages.length > 0 ? nonEmptyPages : [DEFAULT_PAGE_HTML];
};

const serializePages = (pages: string[]) => pages.join(PAGE_BREAK_MARKER);

const normalizeLink = (url: string) => {
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export default function TextEditor() {
  const { teamId = "", fileId } = useParams<{ teamId: string; fileId?: string }>();
  const navigate = useNavigate();

  const pageRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const savedRangeRef = useRef<Range | null>(null);
  const activePageIndexRef = useRef(0);

  const [title, setTitle] = useState("Untitled Document");
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [pages, setPages] = useState<string[]>([DEFAULT_PAGE_HTML]);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [isLinkPopoverOpen, setIsLinkPopoverOpen] = useState(false);

  const [tableRows, setTableRows] = useState(2);
  const [tableCols, setTableCols] = useState(2);
  const [isTablePopoverOpen, setIsTablePopoverOpen] = useState(false);

  const [selectedColor, setSelectedColor] = useState("#111827");
  const [isColorPopoverOpen, setIsColorPopoverOpen] = useState(false);

  useEffect(() => {
    if (!teamId || !fileId) {
      setPages([DEFAULT_PAGE_HTML]);
      setTitle("Untitled Document");
      setActivePageIndex(0);
      activePageIndexRef.current = 0;
      return;
    }

    setIsLoading(true);

    driveService
      .getDocumentContent(teamId, fileId)
      .then((document) => {
        const payload = document as { title?: string; name?: string; content?: string };
        const loadedTitle = (payload.title || payload.name || "").trim() || "Untitled Document";
        const loadedContent = typeof payload.content === "string" ? payload.content : "";
        setTitle(loadedTitle);
        setPages(deserializePages(loadedContent));
        setActivePageIndex(0);
        activePageIndexRef.current = 0;
      })
      .catch(() => {
        toast.error("Failed to load document");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [teamId, fileId]);

  const isNodeInsideAnyEditorPage = (node: Node | null) => {
    if (!node) return false;
    return Object.values(pageRefs.current).some((pageNode) => pageNode?.contains(node));
  };

  const saveCurrentSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    if (!isNodeInsideAnyEditorPage(range.commonAncestorContainer)) return;

    savedRangeRef.current = range.cloneRange();
  };

  const restoreSelection = () => {
    const selection = window.getSelection();
    const activePageNode = pageRefs.current[activePageIndexRef.current];
    if (!selection || !activePageNode) return;

    activePageNode.focus();

    if (savedRangeRef.current && isNodeInsideAnyEditorPage(savedRangeRef.current.commonAncestorContainer)) {
      selection.removeAllRanges();
      selection.addRange(savedRangeRef.current);
      return;
    }

    const fallbackRange = document.createRange();
    fallbackRange.selectNodeContents(activePageNode);
    fallbackRange.collapse(false);
    selection.removeAllRanges();
    selection.addRange(fallbackRange);
  };

  const syncPageHtmlFromDom = (pageIndex: number) => {
    const pageNode = pageRefs.current[pageIndex];
    if (!pageNode) return;

    setPages((prevPages) => {
      if (!prevPages[pageIndex]) return prevPages;
      const nextPages = [...prevPages];
      nextPages[pageIndex] = pageNode.innerHTML;
      return nextPages;
    });
  };

  const runCommand = (command: string, value?: string) => {
    restoreSelection();
    document.execCommand(command, false, value);
    saveCurrentSelection();
  };

  const applyHeading = (level: 1 | 2 | 3) => {
    restoreSelection();
    const tag = `h${level}`;
    const succeeded = document.execCommand("formatBlock", false, `<${tag}>`);
    if (!succeeded) {
      document.execCommand("formatBlock", false, tag);
    }
    saveCurrentSelection();
  };

  const insertLink = () => {
    const url = linkUrl.trim();
    if (!url) {
      toast.error("Please enter a link URL");
      return;
    }

    const safeUrl = normalizeLink(url);
    restoreSelection();

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      toast.error("Place the cursor in the document first");
      return;
    }

    const range = selection.getRangeAt(0);
    const selectedText = selection.toString().trim();
    const text = linkText.trim() || selectedText || safeUrl;
    const linkHtml = `<a href="${escapeHtml(safeUrl)}" target="_blank" rel="noopener noreferrer" style="color:#2563eb;text-decoration:underline;">${escapeHtml(text)}</a>`;
    document.execCommand("insertHTML", false, linkHtml);

    saveCurrentSelection();
    setIsLinkPopoverOpen(false);
    setLinkUrl("");
    setLinkText("");
  };

  const insertTable = () => {
    const rows = Math.max(1, Math.min(20, Number(tableRows) || 2));
    const cols = Math.max(1, Math.min(12, Number(tableCols) || 2));

    const rowHtml = `<tr>${new Array(cols).fill('<td style="border: 1px solid #d4d4d8; padding: 8px;">&nbsp;</td>').join("")}</tr>`;
    const tableHtml = `
      <table style="border-collapse: collapse; width: 100%; margin: 12px 0;">
        <tbody>
          ${new Array(rows).fill(rowHtml).join("")}
        </tbody>
      </table>
      <p><br/></p>
    `;

    runCommand("insertHTML", tableHtml);
    setIsTablePopoverOpen(false);
  };

  const addNewPage = () => {
    setPages((prevPages) => {
      const nextPages = [...prevPages, "<p></p>"];
      const newIndex = nextPages.length - 1;
      setActivePageIndex(newIndex);
      activePageIndexRef.current = newIndex;
      setTimeout(() => {
        pageRefs.current[newIndex]?.focus();
      }, 0);
      return nextPages;
    });
  };

  const handleToolbarAction = (action: string) => {
    switch (action) {
      case "undo":
        runCommand("undo");
        break;
      case "redo":
        runCommand("redo");
        break;
      case "h1":
        applyHeading(1);
        break;
      case "h2":
        applyHeading(2);
        break;
      case "h3":
        applyHeading(3);
        break;
      case "bold":
        runCommand("bold");
        break;
      case "italic":
        runCommand("italic");
        break;
      case "underline":
        runCommand("underline");
        break;
      case "align-left":
        runCommand("justifyLeft");
        break;
      case "align-center":
        runCommand("justifyCenter");
        break;
      case "align-right":
        runCommand("justifyRight");
        break;
      case "ul":
        runCommand("insertUnorderedList");
        break;
      case "ol":
        runCommand("insertOrderedList");
        break;
      default:
        break;
    }
  };

  const handleEditorClick = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement | null;
    if (!target) return;

    const anchor = target.closest("a");
    if (!anchor) return;

    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      window.open(anchor.getAttribute("href") || "", "_blank", "noopener,noreferrer");
    }
  };

  const handleSave = async () => {
    if (!teamId) return;

    setIsSaving(true);
    const content = serializePages(
      pages.map((page, index) => pageRefs.current[index]?.innerHTML ?? page)
    );

    try {
      if (fileId) {
        await driveService.saveDocumentContent(teamId, fileId, title, content);
      } else {
        const createdDocument = await driveService.createTextDocument(teamId, title, content);
        navigate(`/${teamId}/drive/editor/${createdDocument.id}`, { replace: true });
      }
      toast.success("Document saved successfully");
    } catch (error) {
      toast.error("Failed to save document");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-col h-[calc(100vh-120px)]">
        <div className="flex items-center justify-between p-4 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <Input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="border-0 p-0 h-auto text-lg font-semibold focus-visible:ring-0 bg-transparent"
              />
              <p className="text-xs text-muted-foreground">
                {isSaving ? "Saving..." : isLoading ? "Loading..." : "Ready"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowAccessModal(true)}>
              <Share2 className="w-4 h-4 mr-1" />
              Share
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving || isLoading}>
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-1 p-2 border-b border-border bg-card flex-wrap sticky top-0 z-10">
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Undo" onClick={() => handleToolbarAction("undo")}>
            <Undo className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Redo" onClick={() => handleToolbarAction("redo")}>
            <Redo className="w-4 h-4" />
          </Button>
          <Separator orientation="vertical" className="h-6 mx-1" />
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Heading 1" onClick={() => handleToolbarAction("h1")}>
            <Heading1 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Heading 2" onClick={() => handleToolbarAction("h2")}>
            <Heading2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Heading 3" onClick={() => handleToolbarAction("h3")}>
            <Heading3 className="w-4 h-4" />
          </Button>
          <Separator orientation="vertical" className="h-6 mx-1" />
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Bold" onClick={() => handleToolbarAction("bold")}>
            <Bold className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Italic" onClick={() => handleToolbarAction("italic")}>
            <Italic className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Underline" onClick={() => handleToolbarAction("underline")}>
            <Underline className="w-4 h-4" />
          </Button>
          <Separator orientation="vertical" className="h-6 mx-1" />
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Align Left" onClick={() => handleToolbarAction("align-left")}>
            <AlignLeft className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Align Center" onClick={() => handleToolbarAction("align-center")}>
            <AlignCenter className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Align Right" onClick={() => handleToolbarAction("align-right")}>
            <AlignRight className="w-4 h-4" />
          </Button>
          <Separator orientation="vertical" className="h-6 mx-1" />
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Bullet List" onClick={() => handleToolbarAction("ul")}>
            <List className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Numbered List" onClick={() => handleToolbarAction("ol")}>
            <ListOrdered className="w-4 h-4" />
          </Button>
          <Separator orientation="vertical" className="h-6 mx-1" />

          <Popover open={isLinkPopoverOpen} onOpenChange={setIsLinkPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" title="Insert Link">
                <Link2 className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-80 space-y-3">
              <div className="space-y-2">
                <Label htmlFor="link-url">Link URL</Label>
                <Input
                  id="link-url"
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(event) => setLinkUrl(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="link-text">Display text (optional)</Label>
                <Input
                  id="link-text"
                  placeholder="Open TeamX"
                  value={linkText}
                  onChange={(event) => setLinkText(event.target.value)}
                />
              </div>
              <div className="flex justify-end">
                <Button size="sm" onClick={insertLink}>
                  Insert Link
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <Popover open={isTablePopoverOpen} onOpenChange={setIsTablePopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" title="Insert Table">
                <Table className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-72 space-y-3">
              <div className="space-y-2">
                <Label htmlFor="table-rows">Rows</Label>
                <Input
                  id="table-rows"
                  type="number"
                  min={1}
                  max={20}
                  value={tableRows}
                  onChange={(event) => setTableRows(Number(event.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="table-cols">Columns</Label>
                <Input
                  id="table-cols"
                  type="number"
                  min={1}
                  max={12}
                  value={tableCols}
                  onChange={(event) => setTableCols(Number(event.target.value))}
                />
              </div>
              <div className="flex justify-end">
                <Button size="sm" onClick={insertTable}>
                  Insert Table
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <Popover open={isColorPopoverOpen} onOpenChange={setIsColorPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" title="Text Color">
                <Palette className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-56 space-y-3">
              <Label htmlFor="text-color">Text Color</Label>
              <div className="flex items-center gap-3">
                <input
                  id="text-color"
                  type="color"
                  value={selectedColor}
                  className="h-9 w-12 rounded border border-border bg-background cursor-pointer"
                  onChange={(event) => {
                    const color = event.target.value;
                    setSelectedColor(color);
                    runCommand("foreColor", color);
                  }}
                />
                <Input value={selectedColor} onChange={(event) => setSelectedColor(event.target.value)} />
              </div>
            </PopoverContent>
          </Popover>

          <Separator orientation="vertical" className="h-6 mx-1" />
          <Button variant="ghost" size="sm" onClick={addNewPage}>
            <Plus className="w-4 h-4 mr-1" />
            New Page
          </Button>
        </div>

        <div className="flex-1 overflow-auto bg-muted/30 p-6">
          <div className="space-y-8">
            {pages.map((pageHtml, index) => (
              <div key={index} className="mx-auto w-full max-w-[816px]">
                <div className="bg-white text-slate-900 shadow-xl border border-slate-200 rounded-sm min-h-[1056px] p-16">
                  <div
                    ref={(node) => {
                      pageRefs.current[index] = node;
                    }}
                    contentEditable={!isLoading}
                    suppressContentEditableWarning
                    className="prose prose-sm max-w-none focus:outline-none min-h-[900px]"
                    dangerouslySetInnerHTML={{ __html: pageHtml }}
                    onFocus={() => {
                      setActivePageIndex(index);
                      activePageIndexRef.current = index;
                      saveCurrentSelection();
                    }}
                    onMouseUp={saveCurrentSelection}
                    onKeyUp={saveCurrentSelection}
                    onInput={saveCurrentSelection}
                    onClick={handleEditorClick}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Page {index + 1} {activePageIndex === index ? "(Active)" : ""}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ManageAccessModal
        open={showAccessModal}
        onOpenChange={setShowAccessModal}
        itemName={title}
        itemType="file"
        teamId={teamId}
      />
    </MainLayout>
  );
}

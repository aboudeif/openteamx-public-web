import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ManageAccessModal } from "@/features/drive/components/ManageAccessModal";

const toolbarButtons = [
  { icon: Undo, action: "undo", label: "Undo" },
  { icon: Redo, action: "redo", label: "Redo" },
  { type: "separator" },
  { icon: Heading1, action: "h1", label: "Heading 1" },
  { icon: Heading2, action: "h2", label: "Heading 2" },
  { icon: Heading3, action: "h3", label: "Heading 3" },
  { type: "separator" },
  { icon: Bold, action: "bold", label: "Bold" },
  { icon: Italic, action: "italic", label: "Italic" },
  { icon: Underline, action: "underline", label: "Underline" },
  { type: "separator" },
  { icon: AlignLeft, action: "align-left", label: "Align Left" },
  { icon: AlignCenter, action: "align-center", label: "Align Center" },
  { icon: AlignRight, action: "align-right", label: "Align Right" },
  { type: "separator" },
  { icon: List, action: "ul", label: "Bullet List" },
  { icon: ListOrdered, action: "ol", label: "Numbered List" },
  { type: "separator" },
  { icon: Link2, action: "link", label: "Insert Link" },
  { icon: Table, action: "table", label: "Insert Table" },
];

export default function TextEditor() {
  const [title, setTitle] = useState("Untitled Document");
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [content, setContent] = useState(`
    <h1>Welcome to the Text Editor</h1>
    <p>Start typing to create your document. This editor supports:</p>
    <ul>
      <li><strong>Bold</strong>, <em>italic</em>, and <u>underlined</u> text</li>
      <li>Multiple heading levels</li>
      <li>Bullet and numbered lists</li>
      <li>Tables and links</li>
    </ul>
    <p>Use the toolbar above to format your content.</p>
  `);

  const handleSave = () => {
    toast.success("Document saved successfully");
  };

  const handleToolbarAction = (action: string) => {
    toast.info(`Action: ${action}`);
  };

  return (
    <MainLayout>
      <div className="flex flex-col h-[calc(100vh-3.5rem)]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border-0 p-0 h-auto text-lg font-semibold focus-visible:ring-0 bg-transparent"
              />
              <p className="text-xs text-muted-foreground">Last edited: Just now</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowAccessModal(true)}>
              <Share2 className="w-4 h-4 mr-1" />
              Share
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-1 p-2 border-b border-border bg-card flex-wrap">
          {toolbarButtons.map((item, idx) =>
            item.type === "separator" ? (
              <Separator key={idx} orientation="vertical" className="h-6 mx-1" />
            ) : (
              <Button
                key={idx}
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleToolbarAction(item.action!)}
                title={item.label}
              >
                <item.icon className="w-4 h-4" />
              </Button>
            )
          )}
        </div>

        {/* Editor Canvas */}
        <div className="flex-1 overflow-auto bg-background p-8">
          <div className="max-w-3xl mx-auto bg-card rounded-lg shadow-card min-h-[800px] p-12">
            <div
              contentEditable
              suppressContentEditableWarning
              className="prose prose-sm max-w-none focus:outline-none min-h-[600px]"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </div>
      </div>

      <ManageAccessModal
        open={showAccessModal}
        onOpenChange={setShowAccessModal}
        itemName={title}
        itemType="file"
      />
    </MainLayout>
  );
}

import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table2,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Save,
  Share2,
  MoreHorizontal,
  Plus,
  Trash2,
  PaintBucket,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ManageAccessModal } from "@/features/drive/components/ManageAccessModal";

const initialData = [
  ["Item", "Category", "Quantity", "Price", "Total"],
  ["Widget A", "Electronics", "10", "$25.00", "$250.00"],
  ["Widget B", "Electronics", "5", "$45.00", "$225.00"],
  ["Service X", "Services", "2", "$150.00", "$300.00"],
  ["Material Y", "Raw Materials", "100", "$2.50", "$250.00"],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
];

export default function SpreadsheetEditor() {
  const [title, setTitle] = useState("Untitled Spreadsheet");
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [data, setData] = useState(initialData);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);

  const handleSave = () => {
    toast.success("Spreadsheet saved successfully");
  };

  const handleCellChange = (row: number, col: number, value: string) => {
    const newData = [...data];
    newData[row][col] = value;
    setData(newData);
  };

  const addRow = () => {
    setData([...data, Array(data[0].length).fill("")]);
  };

  const addColumn = () => {
    setData(data.map(row => [...row, ""]));
  };

  return (
    <MainLayout>
      <div className="flex flex-col h-[calc(100vh-3.5rem)]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <Table2 className="w-5 h-5 text-success" />
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
        <div className="flex items-center gap-1 p-2 border-b border-border bg-card">
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Bold">
            <Bold className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Italic">
            <Italic className="w-4 h-4" />
          </Button>
          <Separator orientation="vertical" className="h-6 mx-1" />
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Align Left">
            <AlignLeft className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Align Center">
            <AlignCenter className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Align Right">
            <AlignRight className="w-4 h-4" />
          </Button>
          <Separator orientation="vertical" className="h-6 mx-1" />
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Fill Color">
            <PaintBucket className="w-4 h-4" />
          </Button>
          <Separator orientation="vertical" className="h-6 mx-1" />
          <Button variant="ghost" size="sm" onClick={addRow}>
            <Plus className="w-4 h-4 mr-1" />
            Add Row
          </Button>
          <Button variant="ghost" size="sm" onClick={addColumn}>
            <Plus className="w-4 h-4 mr-1" />
            Add Column
          </Button>
        </div>

        {/* Spreadsheet Grid */}
        <div className="flex-1 overflow-auto bg-background p-4">
          <div className="inline-block min-w-full">
            <table className="border-collapse border border-border">
              <thead>
                <tr>
                  <th className="w-10 h-8 bg-muted border border-border text-xs text-muted-foreground font-medium"></th>
                  {data[0].map((_, colIdx) => (
                    <th
                      key={colIdx}
                      className="min-w-[120px] h-8 bg-muted border border-border text-xs text-muted-foreground font-medium"
                    >
                      {String.fromCharCode(65 + colIdx)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, rowIdx) => (
                  <tr key={rowIdx}>
                    <td className="w-10 h-8 bg-muted border border-border text-xs text-muted-foreground font-medium text-center">
                      {rowIdx + 1}
                    </td>
                    {row.map((cell, colIdx) => (
                      <td
                        key={colIdx}
                        className={`min-w-[120px] h-8 border border-border p-0 ${
                          selectedCell?.row === rowIdx && selectedCell?.col === colIdx
                            ? "ring-2 ring-primary ring-inset"
                            : ""
                        } ${rowIdx === 0 ? "bg-muted/50 font-medium" : "bg-card"}`}
                      >
                        <input
                          type="text"
                          value={cell}
                          onChange={(e) => handleCellChange(rowIdx, colIdx, e.target.value)}
                          onFocus={() => setSelectedCell({ row: rowIdx, col: colIdx })}
                          className="w-full h-full px-2 text-sm bg-transparent focus:outline-none"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
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

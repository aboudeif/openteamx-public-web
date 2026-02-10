import { IDriveService } from "@/services/interfaces/IDriveService";
import { DriveItem } from "@/shared/types";
import { DriveItemType } from "@/shared/enums";

const folders: DriveItem[] = [
  { id: "f1", name: "Project Alpha", type: DriveItemType.Folder, modifiedAt: "Jan 28, 2026", modifiedBy: "John Doe", pinned: true },
  { id: "f2", name: "Design Assets", type: DriveItemType.Folder, modifiedAt: "Jan 27, 2026", modifiedBy: "Sarah Chen", pinned: true },
  { id: "f3", name: "Marketing", type: DriveItemType.Folder, modifiedAt: "Jan 25, 2026", modifiedBy: "Mike Johnson" },
  { id: "f4", name: "Documentation", type: DriveItemType.Folder, modifiedAt: "Jan 20, 2026", modifiedBy: "Alex Kim" },
];

const files: DriveItem[] = [
  { id: "d1", name: "Q4 Financial Report.xlsx", type: DriveItemType.Spreadsheet, modifiedAt: "2 hours ago", modifiedBy: "Mike Johnson", size: "245 KB" },
  { id: "d2", name: "Brand Guidelines v2.pdf", type: DriveItemType.Document, modifiedAt: "Yesterday", modifiedBy: "Sarah Chen", size: "4.2 MB", pinned: true },
  { id: "d3", name: "Product Mockups.fig", type: DriveItemType.Image, modifiedAt: "Yesterday", modifiedBy: "Alex Kim", size: "12 MB" },
  { id: "d4", name: "API Documentation", type: DriveItemType.Link, modifiedAt: "2 days ago", modifiedBy: "Emily Davis", url: "https://docs.api.example.com", shared: true },
  { id: "d5", name: "Meeting Notes - Jan 28.docx", type: DriveItemType.Document, modifiedAt: "Jan 28, 2026", modifiedBy: "John Doe", size: "48 KB" },
  { id: "d6", name: "Competitor Analysis", type: DriveItemType.Link, modifiedAt: "Jan 26, 2026", modifiedBy: "Mike Johnson", url: "https://notion.so/analysis" },
  { id: "d7", name: "Team Photo.png", type: DriveItemType.Image, modifiedAt: "Jan 25, 2026", modifiedBy: "Sarah Chen", size: "2.1 MB" },
  { id: "d8", name: "Budget 2026.xlsx", type: DriveItemType.Spreadsheet, modifiedAt: "Jan 22, 2026", modifiedBy: "John Doe", size: "189 KB" },
];

const sharedWithMe: DriveItem[] = [
  { id: "s1", name: "Client Feedback.pdf", type: DriveItemType.Document, modifiedAt: "Jan 27, 2026", modifiedBy: "External - John Smith", size: "1.2 MB", shared: true },
  { id: "s2", name: "Partnership Proposal", type: DriveItemType.Link, modifiedAt: "Jan 24, 2026", modifiedBy: "External - Jane Doe", url: "https://docs.google.com/proposal", shared: true },
];

const folderContents: Record<string, DriveItem[]> = {
  "Project Alpha": [
    { id: "pa1", name: "Requirements.docx", type: DriveItemType.Document, modifiedAt: "Jan 28, 2026", modifiedBy: "John Doe", size: "156 KB" },
    { id: "pa2", name: "Architecture Diagram", type: DriveItemType.Link, modifiedAt: "Jan 27, 2026", modifiedBy: "Alex Kim", url: "https://miro.com/..." },
  ],
  "Design Assets": [
    { id: "da1", name: "Logo Files", type: DriveItemType.Folder, modifiedAt: "Jan 26, 2026", modifiedBy: "Sarah Chen" },
    { id: "da2", name: "Mockups.fig", type: DriveItemType.Image, modifiedAt: "Jan 25, 2026", modifiedBy: "Sarah Chen", size: "24 MB" },
  ],
  "Marketing": [],
  "Documentation": [
    { id: "doc1", name: "User Guide.docx", type: DriveItemType.Document, modifiedAt: "Jan 20, 2026", modifiedBy: "Mike Johnson", size: "89 KB" },
  ],
  "Logo Files": [
    { id: "lf1", name: "logo-dark.png", type: DriveItemType.Image, modifiedAt: "Jan 25, 2026", modifiedBy: "Sarah Chen", size: "45 KB" },
    { id: "lf2", name: "logo-light.png", type: DriveItemType.Image, modifiedAt: "Jan 25, 2026", modifiedBy: "Sarah Chen", size: "42 KB" },
  ],
};

export class MockDriveService implements IDriveService {
  async getFiles(teamId: string, folderId?: string): Promise<DriveItem[]> {
    return new Promise(resolve => {
      setTimeout(() => {
        if (folderId && folderContents[folderId]) {
          resolve(folderContents[folderId]);
        } else {
          // Return root files and folders + shared for the main view simulation
          resolve([...folders, ...files, ...sharedWithMe]);
        }
      }, 100);
    });
  }

  async createFolder(teamId: string, name: string, parentId?: string): Promise<DriveItem> {
    const newFolder: DriveItem = {
      id: `f-${Date.now()}`,
      name,
      type: DriveItemType.Folder,
      modifiedAt: "Just now",
      modifiedBy: "You"
    };
    return Promise.resolve(newFolder);
  }

  async uploadFile(teamId: string, file: File, parentId?: string): Promise<DriveItem> {
     const newFile: DriveItem = {
      id: `f-${Date.now()}`,
      name: file.name,
      type: DriveItemType.Document, // Simplified
      modifiedAt: "Just now",
      modifiedBy: "You",
      size: `${(file.size / 1024).toFixed(1)} KB`
    };
    return Promise.resolve(newFile);
  }

  async deleteItem(itemId: string): Promise<void> {
    return Promise.resolve();
  }
}

export const driveService = new MockDriveService();

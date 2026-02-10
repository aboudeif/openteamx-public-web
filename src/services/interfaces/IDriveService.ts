import { DriveItem } from "@/shared/types";

export interface IDriveService {
  getFiles(teamId: string, folderId?: string): Promise<DriveItem[]>;
  createFolder(teamId: string, name: string, parentId?: string): Promise<DriveItem>;
  uploadFile(teamId: string, file: File, parentId?: string): Promise<DriveItem>;
  deleteItem(itemId: string): Promise<void>;
}

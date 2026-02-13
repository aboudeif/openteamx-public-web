import { DriveItem } from "@/shared/types";

export interface TextDocumentPayload {
  title: string;
  content: string;
}

export interface IDriveService {
  getFiles(teamId: string, folderId?: string): Promise<DriveItem[]>;
  createFolder(teamId: string, name: string, parentId?: string): Promise<DriveItem>;
  uploadFile(teamId: string, file: File, parentId?: string): Promise<DriveItem>;
  deleteItem(itemId: string): Promise<void>;
  createTextDocument(teamId: string, title: string, content: string, folderId?: string): Promise<DriveItem>;
  getDocumentContent(teamId: string, fileId: string): Promise<TextDocumentPayload>;
  saveDocumentContent(teamId: string, fileId: string, title: string, content: string): Promise<void>;
}

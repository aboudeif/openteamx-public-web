import { DriveItem } from "@/shared/types";

export interface TextDocumentPayload {
  title: string;
  content: string;
}

export interface IDriveService {
  getFiles(teamId: string, folderId?: string): Promise<DriveItem[]>;
  createFolder(teamId: string, name: string, parentId?: string): Promise<DriveItem>;
  uploadFile(teamId: string, file: File, parentId?: string): Promise<DriveItem>;
  deleteItem(itemId: string, teamId?: string): Promise<void>;
  renameFile?(teamId: string, fileId: string, name: string): Promise<void>;
  updateFilePreferences?(
    teamId: string,
    fileId: string,
    preferences: { pinned?: boolean; color?: string },
  ): Promise<{ fileId: string; pinned: boolean; color: string | null }>;
  manageFileAccess?(
    teamId: string,
    fileId: string,
    userAccesses: Array<{ userId: string; level: "view" | "edit" }>,
  ): Promise<void>;
  getFileAccess?(
    teamId: string,
    fileId: string,
  ): Promise<Array<{ userId: string; level: "view" | "edit" }>>;
  createTextDocument(teamId: string, title: string, content: string, folderId?: string): Promise<DriveItem>;
  getDocumentContent(teamId: string, fileId: string): Promise<TextDocumentPayload>;
  saveDocumentContent(teamId: string, fileId: string, title: string, content: string): Promise<void>;
}

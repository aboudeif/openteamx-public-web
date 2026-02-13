import { IDriveService } from "@/services/interfaces/IDriveService";
import { DriveItem } from "@/shared/types";
import { api } from "@/lib/api";
import { TextDocumentPayload } from "@/services/interfaces/IDriveService";
import { DriveItemType } from "@/shared/enums";

type ApiFileResponse = {
  id: string;
  name: string;
  mimeType?: string;
  size?: number | string;
  updatedAt?: string;
  createdAt?: string;
  uploadedBy?: {
    name?: string;
  };
  type?: string;
  url?: string;
  pinned?: boolean;
  shared?: boolean;
  color?: string | null;
};

const toDisplayDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

const toDisplaySize = (value?: number | string) => {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value !== "number" || value <= 0) {
    return undefined;
  }

  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
};

const inferDriveType = (file: ApiFileResponse): DriveItemType => {
  const explicitType = (file.type || "").toLowerCase();
  if (explicitType === DriveItemType.Folder) return DriveItemType.Folder;
  if (explicitType === DriveItemType.Spreadsheet) return DriveItemType.Spreadsheet;
  if (explicitType === DriveItemType.Image) return DriveItemType.Image;
  if (explicitType === DriveItemType.Link) return DriveItemType.Link;
  if (explicitType === DriveItemType.Document) return DriveItemType.Document;

  const mime = (file.mimeType || "").toLowerCase();
  const name = file.name.toLowerCase();

  if (mime.includes("sheet") || mime.includes("excel") || name.endsWith(".xlsx") || name.endsWith(".csv")) {
    return DriveItemType.Spreadsheet;
  }
  if (mime.startsWith("image/")) {
    return DriveItemType.Image;
  }
  if (mime.includes("url")) {
    return DriveItemType.Link;
  }
  return DriveItemType.Document;
};

const mapFileToDriveItem = (file: ApiFileResponse): DriveItem => ({
  id: file.id,
  name: file.name,
  type: inferDriveType(file),
  modifiedAt: toDisplayDate(file.updatedAt || file.createdAt),
  modifiedBy: file.uploadedBy?.name || "Team member",
  size: toDisplaySize(file.size),
  url: file.url,
  pinned: file.pinned,
  shared: file.shared,
  color: file.color ?? undefined,
});

export class ApiDriveService implements IDriveService {
  async getFiles(teamId: string, folderId?: string): Promise<DriveItem[]> {
    const params = folderId ? `?folderId=${folderId}` : "";
    const files = await api.get<ApiFileResponse[]>(`/teams/${teamId}/files${params}`);
    return Array.isArray(files) ? files.map(mapFileToDriveItem) : [];
  }

  async createFolder(teamId: string, name: string, parentId?: string): Promise<DriveItem> {
    return api.post<DriveItem>(`/teams/${teamId}/files/folder`, { name, parentId });
  }

  async uploadFile(teamId: string, file: File, parentId?: string): Promise<DriveItem> {
    const formData = new FormData();
    formData.append('file', file);
    if (parentId) formData.append('parentId', parentId);

    const response = await fetch(`/api/teams/${teamId}/files/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return response.json();
  }

  async deleteItem(itemId: string, teamId?: string): Promise<void> {
    if (!teamId) {
      throw new Error("Team ID is required to delete a file");
    }
    return api.delete(`/teams/${teamId}/drive/files/${itemId}`);
  }

  async getDriveContents(teamId: string, folderId?: string): Promise<DriveItem[]> {
    const url = folderId ? `/teams/${teamId}/drive/folders/${folderId}` : `/teams/${teamId}/drive`;
    return api.get<DriveItem[]>(url);
  }

  async createTextDocument(teamId: string, title: string, content: string, folderId?: string): Promise<DriveItem> {
    return api.post<DriveItem>(`/teams/${teamId}/drive/documents`, { name: title, content, folderId });
  }

  async createSpreadsheet(teamId: string, title: string, folderId?: string): Promise<DriveItem> {
    return api.post<DriveItem>(`/teams/${teamId}/drive/spreadsheets`, { title, folderId });
  }

  async addExternalFile(teamId: string, name: string, url: string, type: string, folderId?: string): Promise<DriveItem> {
    return api.post<DriveItem>(`/teams/${teamId}/drive/external-files`, { name, url, type, folderId });
  }

  async renameFile(teamId: string, fileId: string, name: string): Promise<void> {
    return api.patch(`/teams/${teamId}/drive/files/${fileId}/rename`, { name });
  }

  async updateFilePreferences(
    teamId: string,
    fileId: string,
    preferences: { pinned?: boolean; color?: string },
  ): Promise<{ fileId: string; pinned: boolean; color: string | null }> {
    return api.patch(`/teams/${teamId}/drive/files/${fileId}/preferences`, preferences);
  }

  async manageFileAccess(
    teamId: string,
    fileId: string,
    userAccesses: Array<{ userId: string; level: "view" | "edit" }>,
  ): Promise<void> {
    await api.put(`/teams/${teamId}/drive/files/${fileId}/access`, { userAccesses });
  }

  async getFileAccess(
    teamId: string,
    fileId: string,
  ): Promise<Array<{ userId: string; level: "view" | "edit" }>> {
    const response = await api.get<{ fileId: string; access?: Array<{ userId: string; level: "view" | "edit" }> }>(
      `/teams/${teamId}/drive/files/${fileId}/access`,
    );
    return Array.isArray(response?.access) ? response.access : [];
  }

  async getDocumentContent(teamId: string, fileId: string): Promise<TextDocumentPayload> {
    return api.get<TextDocumentPayload>(`/teams/${teamId}/drive/documents/${fileId}`);
  }

  async saveDocumentContent(teamId: string, fileId: string, title: string, content: string): Promise<void> {
    return api.put(`/teams/${teamId}/drive/documents/${fileId}`, { name: title, content });
  }

  async getSpreadsheetContent(teamId: string, fileId: string): Promise<any> {
    return api.get<any>(`/teams/${teamId}/drive/spreadsheets/${fileId}`);
  }

  async saveSpreadsheetContent(teamId: string, fileId: string, title: string, cells: any): Promise<void> {
    return api.put(`/teams/${teamId}/drive/spreadsheets/${fileId}`, { title, cells });
  }

}

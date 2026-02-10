import { IDriveService } from "@/services/interfaces/IDriveService";
import { DriveItem } from "@/shared/types";
import { api } from "@/lib/api";

export class ApiDriveService implements IDriveService {
  async getFiles(teamId: string, folderId?: string): Promise<DriveItem[]> {
    const params = folderId ? `?folderId=${folderId}` : '';
    return api.get<DriveItem[]>(`/teams/${teamId}/files${params}`);
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

  async deleteItem(itemId: string): Promise<void> {
    return api.delete(`/files/${itemId}`);
  }

  async getDriveContents(teamId: string, folderId?: string): Promise<DriveItem[]> {
    const url = folderId ? `/teams/${teamId}/drive/folders/${folderId}` : `/teams/${teamId}/drive`;
    return api.get<DriveItem[]>(url);
  }

  async createTextDocument(teamId: string, title: string, content: string, folderId?: string): Promise<DriveItem> {
    return api.post<DriveItem>(`/teams/${teamId}/drive/documents`, { title, content, folderId, type: "text" });
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

  async manageFileAccess(teamId: string, fileId: string, access: string, members: string[], permissions: string): Promise<void> {
    return api.put(`/teams/${teamId}/drive/files/${fileId}/access`, { access, members, permissions });
  }

  async getDocumentContent(teamId: string, fileId: string): Promise<any> {
    return api.get<any>(`/teams/${teamId}/drive/documents/${fileId}`);
  }

  async saveDocumentContent(teamId: string, fileId: string, title: string, content: string): Promise<void> {
    return api.put(`/teams/${teamId}/drive/documents/${fileId}`, { title, content });
  }

  async getSpreadsheetContent(teamId: string, fileId: string): Promise<any> {
    return api.get<any>(`/teams/${teamId}/drive/spreadsheets/${fileId}`);
  }

  async saveSpreadsheetContent(teamId: string, fileId: string, title: string, cells: any): Promise<void> {
    return api.put(`/teams/${teamId}/drive/spreadsheets/${fileId}`, { title, cells });
  }
}

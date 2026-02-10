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
}

import { api } from "@/lib/api";

export class ApiMeetingNotesService {
  async getNotes(teamId: string): Promise<any[]> {
    return api.get<any[]>(`/teams/${teamId}/notes`);
  }

  async getNoteDetails(teamId: string, noteId: string): Promise<any> {
    return api.get<any>(`/teams/${teamId}/notes/${noteId}`);
  }

  async createNote(teamId: string, note: any): Promise<any> {
    return api.post<any>(`/teams/${teamId}/notes`, note);
  }

  async updateNote(teamId: string, noteId: string, note: any): Promise<any> {
    return api.put<any>(`/teams/${teamId}/notes/${noteId}`, note);
  }

  async deleteNote(teamId: string, noteId: string): Promise<void> {
    return api.delete(`/teams/${teamId}/notes/${noteId}`);
  }
}

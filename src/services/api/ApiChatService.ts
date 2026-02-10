import { IChatService } from "@/services/interfaces/IChatService";
import { ChatMessage, ChatWorkspace, User } from "@/shared/types";
import { api } from "@/lib/api";

export class ApiChatService implements IChatService {
  async getWorkspaces(teamId: string): Promise<ChatWorkspace[]> {
    return api.get<ChatWorkspace[]>(`/teams/${teamId}/workspaces`);
  }

  async getMessages(workspaceId: string): Promise<ChatMessage[]> {
    return api.get<ChatMessage[]>(`/workspaces/${workspaceId}/messages`);
  }

  async sendMessage(workspaceId: string, message: string): Promise<ChatMessage> {
    return api.post<ChatMessage>(`/workspaces/${workspaceId}/messages`, { message });
  }

  async getTeamMembers(teamId: string): Promise<User[]> {
    return api.get<User[]>(`/teams/${teamId}/members`);
  }
}

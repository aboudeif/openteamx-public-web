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

  async createWorkspace(teamId: string, name: string, description: string): Promise<ChatWorkspace> {
    return api.post<ChatWorkspace>(`/teams/${teamId}/chat/workspaces`, { name, description });
  }

  async updateWorkspace(teamId: string, workspaceId: string, name: string, description: string): Promise<ChatWorkspace> {
    return api.put<ChatWorkspace>(`/teams/${teamId}/chat/workspaces/${workspaceId}`, { name, description });
  }

  async deleteWorkspace(teamId: string, workspaceId: string): Promise<void> {
    return api.delete(`/teams/${teamId}/chat/workspaces/${workspaceId}`);
  }

  async getChannels(teamId: string, workspaceId: string): Promise<any[]> {
    return api.get<any[]>(`/teams/${teamId}/chat/workspaces/${workspaceId}/channels`);
  }

  async getChannelMessages(teamId: string, channelId: string): Promise<ChatMessage[]> {
    return api.get<ChatMessage[]>(`/teams/${teamId}/chat/channels/${channelId}/messages`);
  }

  async editMessage(teamId: string, messageId: string, content: string): Promise<ChatMessage> {
    return api.put<ChatMessage>(`/teams/${teamId}/chat/messages/${messageId}`, { content });
  }

  async deleteMessage(teamId: string, messageId: string): Promise<void> {
    return api.delete(`/teams/${teamId}/chat/messages/${messageId}`);
  }

  async addReaction(teamId: string, messageId: string, emoji: string): Promise<void> {
    return api.post(`/teams/${teamId}/chat/messages/${messageId}/reactions`, { emoji });
  }

  async searchMessages(teamId: string, query: string): Promise<ChatMessage[]> {
    return api.get<ChatMessage[]>(`/teams/${teamId}/chat/search?query=${query}`);
  }

  async attachFile(teamId: string, channelId: string, fileId: string, fileName: string): Promise<void> {
    return api.post(`/teams/${teamId}/chat/channels/${channelId}/attachments`, { type: "drive_file", fileId, fileName });
  }

  async addLink(teamId: string, channelId: string, url: string, title: string): Promise<void> {
    return api.post(`/teams/${teamId}/chat/channels/${channelId}/links`, { url, title });
  }
}

import { IChatService } from "@/services/interfaces/IChatService";
import { ChatMessage, ChatWorkspace, User } from "@/shared/types";
import { UserStatus } from "@/shared/enums";
import { api } from "@/lib/api";

type ApiChannel = {
  id?: string;
  name?: string;
  unreadCount?: number;
  isDefault?: boolean;
};

type ApiMessage = {
  id?: string | number;
  content?: string;
  message?: string;
  createdAt?: string;
  time?: string;
  isEdited?: boolean;
  author?: {
    id?: string;
    name?: string;
    avatarUrl?: string;
  };
  user?: string;
  reactions?: Array<{
    emoji?: string;
    count?: number;
    userIds?: string[];
  }>;
  isDeleted?: boolean;
  deletedAt?: string;
  deletedByName?: string;
  channel?: {
    type?: string;
  };
};

type ApiTeamMember = {
  id?: string;
  userId?: string;
  userName?: string;
  user?: {
    id?: string;
    name?: string;
    avatarUrl?: string;
  };
};

function toArray<T>(payload: unknown, nestedKey?: string): T[] {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const container = payload as Record<string, unknown>;

  if (nestedKey && Array.isArray(container[nestedKey])) {
    return container[nestedKey] as T[];
  }

  if (Array.isArray(container.data)) {
    return container.data as T[];
  }

  if (Array.isArray(container.items)) {
    return container.items as T[];
  }

  return [];
}

function toInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "TM";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function formatMessageTime(value?: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function mapMessage(message: ApiMessage): ChatMessage {
  const user = message.author?.name || message.user || "Team member";
  return {
    id: message.id ?? crypto.randomUUID(),
    authorId: message.author?.id,
    user,
    avatar: toInitials(user),
    message: message.message || message.content || "",
    time: formatMessageTime(message.createdAt || message.time),
    reactions: (message.reactions || []).map((reaction) => ({
      emoji: reaction.emoji || "👍",
      count: reaction.count ?? reaction.userIds?.length ?? 0,
    })),
    isEdited: Boolean(message.isEdited),
    isDeleted: Boolean(message.isDeleted),
    deletedAt: message.deletedAt,
    deletedByName: message.deletedByName,
    channelType: message.channel?.type,
  };
}

export class ApiChatService implements IChatService {
  async getWorkspaces(teamId: string): Promise<ChatWorkspace[]> {
    const channelsResponse = await api.get<unknown>(`/teams/${teamId}/chat/workspaces`);
    const channels = toArray<ApiChannel>(channelsResponse);
    return channels
      .filter((channel): channel is ApiChannel & { id: string; name: string } => Boolean(channel.id && channel.name))
      .map((channel) => ({
        id: channel.id,
        name: channel.name,
        isDefault: Boolean(channel.isDefault),
        unread: channel.unreadCount ?? 0,
      }));
  }

  async getMessages(teamId: string, workspaceId: string): Promise<ChatMessage[]> {
    const response = await api.get<unknown>(`/teams/${teamId}/chat/channels/${workspaceId}/messages`);
    return toArray<ApiMessage>(response)
      .sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        if (Number.isNaN(aTime) || Number.isNaN(bTime)) return 0;
        return aTime - bTime;
      })
      .map(mapMessage);
  }

  async sendMessage(teamId: string, workspaceId: string, message: string): Promise<ChatMessage> {
    const response = await api.post<ApiMessage>(`/teams/${teamId}/chat/channels/${workspaceId}/messages`, { content: message });
    return mapMessage(response);
  }

  async getTeamMembers(teamId: string): Promise<User[]> {
    const response = await api.get<unknown>(`/teams/${teamId}/members`);
    const members = toArray<ApiTeamMember>(response, "members");
    return members.map((member) => {
      const id = member.userId || member.user?.id || member.id || crypto.randomUUID();
      const name = member.user?.name || member.userName || "Team member";
      return {
        id,
        name,
        avatar: member.user?.avatarUrl,
        initials: toInitials(name),
        status: UserStatus.Offline,
      };
    });
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

  async getOrCreateDirectChannel(teamId: string, peerUserId: string): Promise<{ id: string; name?: string; type?: string }> {
    return api.post<{ id: string; name?: string; type?: string }>(`/teams/${teamId}/chat/dm/${peerUserId}`);
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

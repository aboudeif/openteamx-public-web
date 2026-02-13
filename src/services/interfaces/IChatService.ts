import { ChatMessage, ChatWorkspace, User } from "@/shared/types";

export interface IChatService {
  getWorkspaces(teamId: string): Promise<ChatWorkspace[]>;
  getMessages(teamId: string, workspaceId: string): Promise<ChatMessage[]>;
  sendMessage(teamId: string, workspaceId: string, message: string): Promise<ChatMessage>;
  getTeamMembers(teamId: string): Promise<User[]>;
  editMessage(teamId: string, messageId: string, content: string): Promise<ChatMessage>;
  deleteMessage(teamId: string, messageId: string): Promise<void>;
  getOrCreateDirectChannel(teamId: string, peerUserId: string): Promise<{ id: string; name?: string; type?: string }>;
  getChannels(teamId: string, workspaceId: string): Promise<any[]>;
}

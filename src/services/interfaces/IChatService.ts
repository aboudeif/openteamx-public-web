import { ChatMessage, ChatWorkspace, User } from "@/shared/types";

export interface IChatService {
  getWorkspaces(teamId: string): Promise<ChatWorkspace[]>;
  getMessages(workspaceId: string): Promise<ChatMessage[]>;
  sendMessage(workspaceId: string, message: string): Promise<ChatMessage>;
  getTeamMembers(teamId: string): Promise<User[]>;
}

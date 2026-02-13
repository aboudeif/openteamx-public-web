import { IChatService } from "@/services/interfaces/IChatService";
import { ChatMessage, ChatWorkspace, User } from "@/shared/types";
import { UserStatus } from "@/shared/enums";

const workspaces: ChatWorkspace[] = [
  { id: "general", name: "General", isDefault: true, unread: 3 },
  { id: "project-alpha", name: "Project Alpha", isProject: true, unread: 1 },
  { id: "project-beta", name: "Project Beta", isProject: true, unread: 0 },
  { id: "design", name: "Design", unread: 5 },
  { id: "engineering", name: "Engineering", unread: 0 },
];

const initialMessages: ChatMessage[] = [
  { id: 1, user: "Sarah Chen", avatar: "SC", message: "Hey team! I just uploaded the new mockups to Figma. Let me know what you think! 🎨", time: "10:32 AM", reactions: [{ emoji: "👍", count: 3 }, { emoji: "🎉", count: 1 }] },
  { id: 2, user: "Mike Johnson", avatar: "MJ", message: "Looking great @Sarah! I especially like the new dashboard layout.", time: "10:35 AM", reactions: [] },
  { id: 3, user: "Alex Kim", avatar: "AK", message: "Agreed! Quick question - are we going with gradient buttons?", time: "10:38 AM", reactions: [] },
  { id: 4, user: "Sarah Chen", avatar: "SC", message: "Good question! I think solid works better for primary actions.", time: "10:40 AM", reactions: [{ emoji: "💯", count: 2 }] },
  { id: 5, user: "Emily Davis", avatar: "ED", message: "I did some research on this. Solid buttons work better for repeated actions.", time: "10:45 AM", reactions: [{ emoji: "🙌", count: 4 }] },
];

const teamMembers: User[] = [
  { id: "1", name: "Sarah Chen", initials: "SC", status: UserStatus.Online },
  { id: "2", name: "Mike Johnson", initials: "MJ", status: UserStatus.Online },
  { id: "3", name: "Alex Kim", initials: "AK", status: UserStatus.Away },
  { id: "4", name: "Emily Davis", initials: "ED", status: UserStatus.Online },
  { id: "5", name: "John Doe", initials: "JD", status: UserStatus.Offline },
];

export class MockChatService implements IChatService {
  async getWorkspaces(teamId: string): Promise<ChatWorkspace[]> {
    return new Promise(resolve => setTimeout(() => resolve([...workspaces]), 100));
  }

  async getMessages(teamId: string, workspaceId: string): Promise<ChatMessage[]> {
    return new Promise(resolve => setTimeout(() => resolve([...initialMessages]), 100));
  }

  async sendMessage(teamId: string, workspaceId: string, message: string): Promise<ChatMessage> {
    const newMessage: ChatMessage = {
      id: Date.now(),
      user: "John Doe",
      avatar: "JD",
      message: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reactions: [],
    };
    return Promise.resolve(newMessage);
  }

  async getTeamMembers(teamId: string): Promise<User[]> {
    return new Promise(resolve => setTimeout(() => resolve([...teamMembers]), 100));
  }

  async editMessage(teamId: string, messageId: string, content: string): Promise<ChatMessage> {
    const existing = initialMessages.find((message) => String(message.id) === String(messageId));
    return Promise.resolve({
      ...(existing || initialMessages[0]),
      id: messageId,
      message: content,
      isEdited: true,
    });
  }

  async deleteMessage(teamId: string, messageId: string): Promise<void> {
    return Promise.resolve();
  }

  async getOrCreateDirectChannel(teamId: string, peerUserId: string): Promise<{ id: string; name?: string; type?: string }> {
    return Promise.resolve({ id: `dm-${peerUserId}`, name: "Direct Message", type: "DM" });
  }

  async getChannels(teamId: string, workspaceId: string): Promise<any[]> {
    return Promise.resolve([]);
  }
}

export const chatService = new MockChatService();

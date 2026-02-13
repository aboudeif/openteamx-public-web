import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { WidgetCard } from "@/components/shared/WidgetCard";
import { MessageSquare, Hash, Circle } from "lucide-react";
import { ApiChatService } from "@/services/api/ApiChatService";

type ChatChannel = {
  id: string;
  name: string;
  lastMessageAt?: string;
  members?: Array<{
    lastReadAt?: string;
  }>;
};

type ChannelMessage = {
  id: string;
  content?: string;
  createdAt?: string;
  author?: {
    name?: string;
  };
};

type WidgetMessage = {
  id: string;
  channel: string;
  sender: string;
  message: string;
  time: string;
  unread: boolean;
};

const chatService = new ApiChatService();

export function ChatWidget() {
  const navigate = useNavigate();
  const { teamId = "" } = useParams();
  const { data: messages = [], isLoading } = useQuery<WidgetMessage[]>({
    queryKey: ["team-chat-widget", teamId],
    queryFn: async () => {
      const workspaceId = `default-${teamId}`;
      const channelsRaw = await chatService.getChannels(teamId, workspaceId);
      const channels = (Array.isArray(channelsRaw) ? channelsRaw : []) as ChatChannel[];

      const latestChannels = channels
        .sort((a, b) => {
          const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
          const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
          return bTime - aTime;
        })
        .slice(0, 3);

      const channelMessages = await Promise.all(
        latestChannels.map(async (channel) => {
          const messagesRaw = await chatService.getChannelMessages(teamId, channel.id);
          const lastMessage = (Array.isArray(messagesRaw) ? messagesRaw : [])[0] as ChannelMessage | undefined;
          const lastReadAt = channel.members?.[0]?.lastReadAt;
          const unread =
            Boolean(lastMessage?.createdAt) &&
            (!lastReadAt ||
              new Date(lastMessage.createdAt as string).getTime() > new Date(lastReadAt).getTime());

          return {
            id: channel.id,
            channel: channel.name || "Channel",
            sender: lastMessage?.author?.name || "Team member",
            message: lastMessage?.content || "No messages yet",
            time: lastMessage?.createdAt
              ? new Date(lastMessage.createdAt).toLocaleString()
              : "",
            unread,
          };
        })
      );

      return channelMessages;
    },
    enabled: Boolean(teamId),
  });

  const unreadCount = messages.filter((m) => m.unread).length;

  return (
    <WidgetCard 
      title="Unread Messages" 
      icon={MessageSquare} 
      action={`${unreadCount} unread`}
      onAction={() => navigate(`/${teamId}/chat`)}
    >
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading messages...</p>
      ) : messages.length === 0 ? (
        <p className="text-sm text-muted-foreground">No channel messages found.</p>
      ) : (
        <div className="space-y-1">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-3 rounded-lg transition-colors cursor-pointer hover:bg-muted/50 ${
                msg.unread ? "bg-primary/5" : ""
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {msg.unread ? <Circle className="w-2 h-2 fill-primary text-primary flex-shrink-0" /> : null}
                <Hash className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">{msg.channel}</span>
                {msg.time ? <span className="text-xs text-muted-foreground ml-auto">{msg.time}</span> : null}
              </div>
              <p className="text-sm text-foreground">
                <span className="font-medium">{msg.sender}:</span>{" "}
                <span className={msg.unread ? "" : "text-muted-foreground"}>{msg.message}</span>
              </p>
            </div>
          ))}
        </div>
      )}
    </WidgetCard>
  );
}

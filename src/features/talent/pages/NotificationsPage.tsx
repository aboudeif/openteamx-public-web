import { useState } from "react";
import { TalentLayout } from "@/features/talent/layout/TalentLayout";
import { Button } from "@/components/ui/button";
import { Bell, Check, CheckCheck, Trash2, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "info" | "success" | "warning" | "team" | "task";
}

const mockNotifications: Notification[] = [
  { id: "1", title: "New team invitation", message: "You've been invited to join TechVentures Studio", time: "5 minutes ago", read: false, type: "team" },
  { id: "2", title: "Task assigned", message: "Sarah Chen assigned you to 'Implement dashboard widgets'", time: "1 hour ago", read: false, type: "task" },
  { id: "3", title: "Sprint review completed", message: "Sprint 12 has been marked as complete", time: "2 hours ago", read: false, type: "success" },
  { id: "4", title: "New comment", message: "Mike Johnson commented on 'API Integration'", time: "3 hours ago", read: true, type: "info" },
  { id: "5", title: "Meeting reminder", message: "Design Review starts in 30 minutes", time: "4 hours ago", read: true, type: "warning" },
  { id: "6", title: "Reward received", message: "You received a $50 reward from DataSync Corp", time: "Yesterday", read: true, type: "success" },
  { id: "7", title: "Project deadline", message: "Project Alpha is due in 3 days", time: "Yesterday", read: true, type: "warning" },
  { id: "8", title: "New team member", message: "Alex Kim joined TechVentures Studio", time: "2 days ago", read: true, type: "team" },
  { id: "9", title: "Task completed", message: "Emily Davis completed 'Design system updates'", time: "2 days ago", read: true, type: "task" },
  { id: "10", title: "Weekly summary", message: "Your weekly activity summary is ready", time: "3 days ago", read: true, type: "info" },
];

const typeColors = {
  info: "bg-info/10 text-info",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  team: "bg-primary/10 text-primary",
  task: "bg-muted text-muted-foreground",
};

export default function Notifications() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [loadedCount, setLoadedCount] = useState(5);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const loadMore = () => {
    setLoadedCount(prev => Math.min(prev + 5, notifications.length));
  };

  const displayedNotifications = notifications.slice(0, loadedCount);

  return (
    <TalentLayout>
      <div className="p-6 lg:p-8 max-w-3xl mx-auto">
        {/* Hero Bell Icon */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Bell className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-muted-foreground mt-1">{unreadCount} unread notifications</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" size="sm" onClick={markAllAsRead} disabled={unreadCount === 0}>
            <CheckCheck className="w-4 h-4 mr-2" />
            Mark all as read
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-24 h-24 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Bell className="w-12 h-12 text-muted-foreground/50" />
            </div>
            <p className="text-lg font-medium text-foreground mb-1">No notifications</p>
            <p className="text-sm text-muted-foreground">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayedNotifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "p-4 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors group",
                  !notification.read && "border-l-4 border-l-primary bg-primary/5"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0", typeColors[notification.type])}>
                    <Bell className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className={cn("text-sm font-medium", !notification.read && "text-foreground")}>{notification.title}</h3>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{notification.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Infinite Load */}
            {loadedCount < notifications.length && (
              <div className="flex justify-center pt-4">
                <Button variant="outline" onClick={loadMore}>
                  Load more
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </TalentLayout>
  );
}

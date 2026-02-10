import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const mockNotifications: Notification[] = [
  { id: "1", title: "New team invitation", message: "You've been invited to join TechVentures Studio", time: "5 min ago", read: false },
  { id: "2", title: "Task assigned", message: "Sarah Chen assigned you to 'Implement dashboard widgets'", time: "1 hour ago", read: false },
  { id: "3", title: "Sprint review", message: "Sprint 12 has been marked as complete", time: "2 hours ago", read: false },
  { id: "4", title: "New comment", message: "Mike Johnson commented on 'API Integration'", time: "3 hours ago", read: true },
  { id: "5", title: "Meeting reminder", message: "Design Review starts in 30 minutes", time: "4 hours ago", read: true },
];

export function NotificationBell() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(mockNotifications);
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const viewAll = () => {
    setOpen(false);
    navigate("/notifications");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative p-2 mt-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-medium rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-3 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <span className="text-xs text-muted-foreground">{unreadCount} unread</span>
          )}
        </div>
        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="w-10 h-10 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">No notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.slice(0, 5).map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-3 hover:bg-muted/50 transition-colors cursor-pointer group",
                    !notification.read && "bg-primary/5"
                  )}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-2">
                    <div className={cn(
                      "w-2 h-2 rounded-full mt-1.5 flex-shrink-0",
                      !notification.read ? "bg-primary" : "bg-transparent"
                    )} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <h4 className="text-sm font-medium truncate">{notification.title}</h4>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">{notification.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
                    </div>
                    {!notification.read && (
                      <button
                        onClick={(e) => { e.stopPropagation(); markAsRead(notification.id); }}
                        className="p-1 rounded hover:bg-muted text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        <div className="p-2 border-t border-border">
          <Button variant="ghost" className="w-full justify-between" onClick={viewAll}>
            View all
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

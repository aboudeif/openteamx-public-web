import { api } from "@/lib/api";

export class ApiNotificationService {
  async getNotifications(): Promise<any[]> {
    return api.get<any[]>("/notifications");
  }

  async getUnreadCount(): Promise<any> {
    return api.get<any>("/notifications/unread-count");
  }

  async markAsRead(notificationId: string): Promise<void> {
    return api.patch(`/notifications/${notificationId}/read`);
  }

  async markAllAsRead(): Promise<void> {
    return api.patch("/notifications/read-all");
  }

  async deleteNotification(notificationId: string): Promise<void> {
    return api.delete(`/notifications/${notificationId}`);
  }
}

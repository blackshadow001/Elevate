export type NotificationType = "success" | "info" | "warning" | "error";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
}

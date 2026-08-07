import { sendSuccess } from "../utils/apiResponse.js";
import {
  deleteOwnedNotification,
  getUnreadCount,
  listOwnNotifications,
  markAllOwnedNotificationsRead,
  markOwnedNotificationRead
} from "../services/notification.service.js";

export const listNotifications = async (req, res) => {
  const result = await listOwnNotifications({ recipientId: req.user.id, query: req.query });
  return sendSuccess(res, 200, "Notifications retrieved successfully.", { notifications: result.items }, result.meta);
};

export const unreadCount = async (req, res) => sendSuccess(
  res, 200, "Unread notification count retrieved successfully.",
  { unreadCount: await getUnreadCount(req.user.id) }
);

export const markOneRead = async (req, res) => sendSuccess(
  res, 200, "Notification marked as read.",
  { notification: await markOwnedNotificationRead({ recipientId: req.user.id, notificationId: req.params.id }) }
);

export const markAllRead = async (req, res) => sendSuccess(
  res, 200, "Notifications marked as read.",
  { updatedCount: await markAllOwnedNotificationsRead(req.user.id) }
);

export const deleteNotification = async (req, res) => {
  await deleteOwnedNotification({ recipientId: req.user.id, notificationId: req.params.id });
  return sendSuccess(res, 200, "Notification deleted successfully.");
};

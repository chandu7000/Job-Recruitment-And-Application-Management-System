import { Op, UniqueConstraintError } from "sequelize";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import AppError from "../utils/AppError.js";
import {
  NOTIFICATION_LIMITS,
  NOTIFICATION_TYPE_VALUES
} from "../constants/notification.constants.js";

const sanitizeMetadata = (metadata) => {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return null;
  const blocked = /password|token|secret|credential|recruiterNotes/i;
  return Object.fromEntries(Object.entries(metadata).filter(([key]) => !blocked.test(key)));
};

export const createNotification = async (payload, options = {}) => {
  const {
    recipientId, type, title, message, resourceType = null,
    resourceId = null, metadata = null, deduplicationKey = null
  } = payload;

  if (!recipientId) throw new AppError("Notification recipient is required.", 422, "NOTIFICATION_RECIPIENT_REQUIRED");
  if (!NOTIFICATION_TYPE_VALUES.includes(type)) throw new AppError("Notification type is invalid.", 422, "INVALID_NOTIFICATION_TYPE");
  if (!title?.trim() || !message?.trim()) throw new AppError("Notification title and message are required.", 422, "INVALID_NOTIFICATION_CONTENT");

  const transaction = options.transaction;
  const recipient = await User.findByPk(recipientId, { transaction });
  if (!recipient) throw new AppError("Notification recipient was not found.", 404, "NOTIFICATION_RECIPIENT_NOT_FOUND");

  if (deduplicationKey) {
    const existing = await Notification.findOne({ where: { deduplicationKey }, transaction });
    if (existing) return { notification: existing, created: false };
  }

  try {
    const notification = await Notification.create({
      recipientId,
      type,
      title: title.trim().slice(0, NOTIFICATION_LIMITS.TITLE),
      message: message.trim().slice(0, NOTIFICATION_LIMITS.MESSAGE),
      resourceType,
      resourceId,
      metadata: sanitizeMetadata(metadata),
      deduplicationKey
    }, { transaction });
    return { notification, created: true };
  } catch (error) {
    if (error instanceof UniqueConstraintError && deduplicationKey) {
      const notification = await Notification.findOne({ where: { deduplicationKey }, transaction });
      return { notification, created: false };
    }
    throw error;
  }
};

export const createNotifications = async (payloads, options = {}) =>
  Promise.all(payloads.map((payload) => createNotification(payload, options)));

export const listOwnNotifications = async ({ recipientId, query = {} }) => {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || 10, 1), NOTIFICATION_LIMITS.MAX_LIMIT);
  const where = { recipientId };
  if (query.read === "true") where.isRead = true;
  if (query.read === "false" || query.unread === "true") where.isRead = false;
  if (query.type) where.type = query.type;
  const orderDirection = query.order === "oldest" ? "ASC" : "DESC";
  const { rows, count } = await Notification.findAndCountAll({
    where,
    attributes: { exclude: ["metadata"] },
    order: [["createdAt", orderDirection]],
    limit,
    offset: (page - 1) * limit
  });
  const totalPages = Math.ceil(count / limit) || 1;
  return {
    items: rows,
    meta: { page, limit, totalItems: count, totalPages, hasNext: page < totalPages, hasPrevious: page > 1 }
  };
};

export const getUnreadCount = (recipientId) => Notification.count({ where: { recipientId, isRead: false } });

export const markOwnedNotificationRead = async ({ recipientId, notificationId }) => {
  const notification = await Notification.findOne({ where: { id: notificationId, recipientId } });
  if (!notification) throw new AppError("Notification not found.", 404, "NOTIFICATION_NOT_FOUND");
  if (!notification.isRead) await notification.update({ isRead: true, readAt: new Date() });
  return notification;
};

export const markAllOwnedNotificationsRead = async (recipientId) => {
  const [updatedCount] = await Notification.update(
    { isRead: true, readAt: new Date() },
    { where: { recipientId, isRead: false, readAt: { [Op.is]: null } } }
  );
  return updatedCount;
};

export const deleteOwnedNotification = async ({ recipientId, notificationId }) => {
  const deletedCount = await Notification.destroy({ where: { id: notificationId, recipientId } });
  if (!deletedCount) throw new AppError("Notification not found.", 404, "NOTIFICATION_NOT_FOUND");
};

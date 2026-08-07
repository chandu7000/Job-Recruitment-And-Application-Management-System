import { param, query } from "express-validator";
import { NOTIFICATION_TYPE_VALUES } from "../constants/notification.constants.js";

export const notificationIdValidator = [
  param("id").isUUID().withMessage("Notification ID must be a valid UUID.")
];

export const notificationListValidator = [
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer."),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100."),
  query("read").optional().isBoolean().withMessage("Read must be true or false."),
  query("unread").optional().isBoolean().withMessage("Unread must be true or false."),
  query("type").optional().isIn(NOTIFICATION_TYPE_VALUES).withMessage("Notification type is invalid."),
  query("order").optional().isIn(["newest", "oldest"]).withMessage("Order must be newest or oldest.")
];

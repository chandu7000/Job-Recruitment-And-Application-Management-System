import { Router } from "express";
import authenticate from "../middlewares/auth.middleware.js";
import validateRequest from "../middlewares/validateRequest.middleware.js";
import {
  deleteNotification, listNotifications, markAllRead, markOneRead, unreadCount
} from "../controllers/notification.controller.js";
import { notificationIdValidator, notificationListValidator } from "../validators/notification.validator.js";

const router = Router();
router.use(authenticate);
router.get("/", notificationListValidator, validateRequest, listNotifications);
router.get("/unread-count", unreadCount);
router.patch("/read-all", markAllRead);
router.patch("/:id/read", notificationIdValidator, validateRequest, markOneRead);
router.delete("/:id", notificationIdValidator, validateRequest, deleteNotification);
export default router;

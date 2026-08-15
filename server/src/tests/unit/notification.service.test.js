import { jest } from "@jest/globals";

const userFindByPk = jest.fn();
const notificationFindOne = jest.fn();
const notificationCreate = jest.fn();
const notificationFindAndCountAll = jest.fn();
const notificationCount = jest.fn();
const notificationUpdate = jest.fn();
const notificationDestroy = jest.fn();

jest.unstable_mockModule("../../models/user.model.js", () => ({
  default: { findByPk: userFindByPk }
}));

jest.unstable_mockModule("../../models/notification.model.js", () => ({
  default: {
    findOne: notificationFindOne,
    create: notificationCreate,
    findAndCountAll: notificationFindAndCountAll,
    count: notificationCount,
    update: notificationUpdate,
    destroy: notificationDestroy
  }
}));

const service = await import("../../services/notification.service.js");

const validPayload = {
  recipientId: "11111111-1111-4111-8111-111111111111",
  type: "INTERVIEW_SCHEDULED",
  title: " Interview scheduled ",
  message: " Your interview has been scheduled. ",
  resourceType: "INTERVIEW",
  resourceId: "22222222-2222-4222-8222-222222222222"
};

describe("Notification service", () => {
  beforeEach(() => jest.clearAllMocks());

  test("creates a validated notification", async () => {
    userFindByPk.mockResolvedValue({ id: validPayload.recipientId });
    notificationFindOne.mockResolvedValue(null);
    notificationCreate.mockImplementation(async (value) => ({ id: "notification-1", ...value }));

    const result = await service.createNotification(validPayload);

    expect(result.created).toBe(true);
    expect(notificationCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Interview scheduled",
        message: "Your interview has been scheduled."
      }),
      { transaction: undefined }
    );
  });

  test("rejects a missing recipient", async () => {
    await expect(service.createNotification({ ...validPayload, recipientId: null }))
      .rejects.toMatchObject({ code: "NOTIFICATION_RECIPIENT_REQUIRED", statusCode: 422 });
  });

  test("rejects an invalid notification type", async () => {
    await expect(service.createNotification({ ...validPayload, type: "UNKNOWN" }))
      .rejects.toMatchObject({ code: "INVALID_NOTIFICATION_TYPE", statusCode: 422 });
  });

  test("returns the existing notification for a duplicate key", async () => {
    userFindByPk.mockResolvedValue({ id: validPayload.recipientId });
    notificationFindOne.mockResolvedValue({ id: "existing" });

    const result = await service.createNotification({ ...validPayload, deduplicationKey: "key-1" });

    expect(result).toEqual({ notification: { id: "existing" }, created: false });
    expect(notificationCreate).not.toHaveBeenCalled();
  });

  test("removes sensitive metadata keys", async () => {
    userFindByPk.mockResolvedValue({ id: validPayload.recipientId });
    notificationCreate.mockResolvedValue({ id: "notification-1" });

    await service.createNotification({
      ...validPayload,
      metadata: { jobId: "job-1", password: "hidden", accessToken: "hidden", safe: true }
    });

    expect(notificationCreate).toHaveBeenCalledWith(
      expect.objectContaining({ metadata: { jobId: "job-1", safe: true } }),
      expect.any(Object)
    );
  });

  test("uses numeric pagination and applies filters", async () => {
    notificationFindAndCountAll.mockResolvedValue({ rows: [], count: 21 });

    const result = await service.listOwnNotifications({
      recipientId: validPayload.recipientId,
      query: { page: "2", limit: "10", unread: "true", type: "INTERVIEW_SCHEDULED", order: "oldest" }
    });

    expect(notificationFindAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ isRead: false, type: "INTERVIEW_SCHEDULED" }),
      limit: 10,
      offset: 10,
      order: [["createdAt", "ASC"]]
    }));
    expect(result.meta).toEqual({ page: 2, limit: 10, totalItems: 21, totalPages: 3, hasNext: true, hasPrevious: true });
  });

  test("marks one owned notification as read idempotently", async () => {
    const update = jest.fn().mockResolvedValue(undefined);
    notificationFindOne.mockResolvedValue({ isRead: false, update });

    await service.markOwnedNotificationRead({ recipientId: validPayload.recipientId, notificationId: "notification-1" });
    expect(update).toHaveBeenCalledWith(expect.objectContaining({ isRead: true, readAt: expect.any(Date) }));
  });

  test("rejects cross-user or missing notification access", async () => {
    notificationFindOne.mockResolvedValue(null);
    await expect(service.markOwnedNotificationRead({ recipientId: validPayload.recipientId, notificationId: "missing" }))
      .rejects.toMatchObject({ code: "NOTIFICATION_NOT_FOUND", statusCode: 404 });
  });

  test("marks all unread notifications and deletes an owned notification", async () => {
    notificationUpdate.mockResolvedValue([3]);
    notificationDestroy.mockResolvedValue(1);
    await expect(service.markAllOwnedNotificationsRead(validPayload.recipientId)).resolves.toBe(3);
    await expect(service.deleteOwnedNotification({ recipientId: validPayload.recipientId, notificationId: "notification-1" })).resolves.toBeUndefined();
  });
});

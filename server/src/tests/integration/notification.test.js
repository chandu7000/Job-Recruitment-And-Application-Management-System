import request from "supertest";
import { Op } from "sequelize";
import app from "../../app.js";
import User from "../../models/user.model.js";
import UserSession from "../../models/userSession.model.js";
import Notification from "../../models/notification.model.js";
import { hashPassword } from "../../utils/password.util.js";
import { createNotification } from "../../services/notification.service.js";

const PASSWORD = "Strong@Password123";
const EMAIL_PREFIX = "p10.notification.";
const uniqueEmail = (label) => `${EMAIL_PREFIX}${label}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;

const createUser = async (role = "JOB_SEEKER") => User.create({
  email: uniqueEmail(role.toLowerCase()),
  passwordHash: await hashPassword(PASSWORD),
  role,
  status: "ACTIVE",
  emailVerifiedAt: new Date()
});

const login = async (email) => {
  const response = await request(app).post("/api/auth/login")
    .set("User-Agent", "CareerForge Notification Integration Test")
    .send({ email, password: PASSWORD }).expect(200);
  return response.body.data.accessToken;
};

const cleanup = async () => {
  const users = await User.unscoped().findAll({ where: { email: { [Op.like]: `${EMAIL_PREFIX}%` } }, attributes: ["id"] });
  const ids = users.map((user) => user.id);
  if (!ids.length) return;
  await Notification.destroy({ where: { recipientId: { [Op.in]: ids } }, force: true });
  await UserSession.unscoped().destroy({ where: { userId: { [Op.in]: ids } }, force: true });
  await User.unscoped().destroy({ where: { id: { [Op.in]: ids } }, force: true });
};

describe("Notification API", () => {
  beforeEach(cleanup);
  afterEach(cleanup);

  test("rejects unauthenticated access", async () => {
    await request(app).get("/api/notifications").expect(401);
  });

  test("lists only owned notifications with pagination and filters", async () => {
    const owner = await createUser();
    const other = await createUser();
    const token = await login(owner.email);

    await createNotification({ recipientId: owner.id, type: "INTERVIEW_SCHEDULED", title: "Interview", message: "Scheduled", deduplicationKey: `owned-${owner.id}` });
    await createNotification({ recipientId: other.id, type: "JOB_CLOSED", title: "Closed", message: "Closed", deduplicationKey: `other-${other.id}` });

    const response = await request(app).get("/api/notifications?page=1&limit=10&unread=true&type=INTERVIEW_SCHEDULED")
      .set("Authorization", `Bearer ${token}`).expect(200);

    expect(response.body.data.notifications).toHaveLength(1);
    expect(response.body.data.notifications[0].recipientId).toBe(owner.id);
    expect(response.body.meta).toEqual(expect.objectContaining({ page: 1, limit: 10, totalItems: 1 }));
  });

  test("returns unread count, marks one and all as read, and deletes owned notification", async () => {
    const owner = await createUser("RECRUITER");
    const token = await login(owner.email);
    const first = (await createNotification({ recipientId: owner.id, type: "JOB_APPLICATION_SUBMITTED", title: "Application", message: "New application", deduplicationKey: `first-${owner.id}` })).notification;
    await createNotification({ recipientId: owner.id, type: "INTERVIEW_CONFIRMED", title: "Confirmed", message: "Confirmed", deduplicationKey: `second-${owner.id}` });

    let response = await request(app).get("/api/notifications/unread-count").set("Authorization", `Bearer ${token}`).expect(200);
    expect(response.body.data.unreadCount).toBe(2);

    await request(app).patch(`/api/notifications/${first.id}/read`).set("Authorization", `Bearer ${token}`).expect(200);
    response = await request(app).patch("/api/notifications/read-all").set("Authorization", `Bearer ${token}`).expect(200);
    expect(response.body.data.updatedCount).toBe(1);

    await request(app).delete(`/api/notifications/${first.id}`).set("Authorization", `Bearer ${token}`).expect(200);
    expect(await Notification.findByPk(first.id)).toBeNull();
  });

  test("prevents cross-user read and delete operations", async () => {
    const owner = await createUser();
    const attacker = await createUser();
    const token = await login(attacker.email);
    const notification = (await createNotification({ recipientId: owner.id, type: "APPLICATION_STATUS_CHANGED", title: "Update", message: "Updated", deduplicationKey: `cross-${owner.id}` })).notification;

    await request(app).patch(`/api/notifications/${notification.id}/read`).set("Authorization", `Bearer ${token}`).expect(404);
    await request(app).delete(`/api/notifications/${notification.id}`).set("Authorization", `Bearer ${token}`).expect(404);
  });

  test("validates notification IDs and prevents duplicate records", async () => {
    const owner = await createUser();
    const token = await login(owner.email);
    await request(app).patch("/api/notifications/not-a-uuid/read").set("Authorization", `Bearer ${token}`).expect(422);

    const payload = { recipientId: owner.id, type: "INTERVIEW_SCHEDULED", title: "Interview", message: "Scheduled", deduplicationKey: `duplicate-${owner.id}` };
    const first = await createNotification(payload);
    const second = await createNotification(payload);
    expect(first.created).toBe(true);
    expect(second.created).toBe(false);
    expect(await Notification.count({ where: { deduplicationKey: payload.deduplicationKey } })).toBe(1);
  });
});

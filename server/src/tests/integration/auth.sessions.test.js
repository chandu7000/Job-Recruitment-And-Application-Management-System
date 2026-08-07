import request from "supertest";
import { Op } from "sequelize";

import app from "../../app.js";
import User from "../../models/user.model.js";
import UserSession from "../../models/userSession.model.js";

const TEST_EMAIL_PREFIX = "sessions.integration.";
const PASSWORD = "Strong@Password123";

const createEmail = (label) =>
    `${TEST_EMAIL_PREFIX}${label}.${Date.now()}@example.com`;

const cleanup = async () => {
    const users = await User.unscoped().findAll({
        where: {
            email: {
                [Op.like]: `${TEST_EMAIL_PREFIX}%`
            }
        },
        attributes: ["id"]
    });

    const userIds = users.map((user) => user.id);

    if (userIds.length === 0) {
        return;
    }

    await UserSession.unscoped().destroy({
        where: {
            userId: {
                [Op.in]: userIds
            }
        },
        force: true
    });

    await User.unscoped().destroy({
        where: {
            id: {
                [Op.in]: userIds
            }
        },
        force: true
    });
};

const registerUser = async (email) => {
    await request(app)
        .post("/api/auth/register/job-seeker")
        .send({
            email,
            password: PASSWORD
        })
        .expect(201);

    const user = await User.unscoped().findOne({
        where: {
            email
        }
    });

    expect(user).not.toBeNull();

    user.emailVerified = true;
    user.status = "ACTIVE";

    await user.save();

    return user;
};

const loginUser = async (email, userAgent) => {
    return request(app)
        .post("/api/auth/login")
        .set("User-Agent", userAgent)
        .send({
            email,
            password: PASSWORD
        })
        .expect(200);
};

describe("Session Management API", () => {
    beforeEach(cleanup);
    afterEach(cleanup);

    describe("GET /api/auth/sessions", () => {
        it("should return the authenticated user's active sessions", async () => {
            const email = createEmail("list");

            await registerUser(email);

            const loginResponse = await loginUser(
                email,
                "CareerForge Sessions Integration Test"
            );

            const accessToken =
                loginResponse.body.data.accessToken;

            const response = await request(app)
                .get("/api/auth/sessions")
                .set(
                    "Authorization",
                    `Bearer ${accessToken}`
                )
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBeGreaterThan(0);

            const session = response.body.data[0];

            expect(session.id).toBeDefined();
            expect(session.deviceName).toBeDefined();
            expect(session.browser).toBeDefined();
            expect(session.operatingSystem).toBeDefined();
        });

        it("should reject session listing without an access token", async () => {
            const response = await request(app)
                .get("/api/auth/sessions")
                .expect(401);

            expect(response.body.success).toBe(false);

            expect(response.body.code).toBe(
                "AUTHENTICATION_REQUIRED"
            );
        });

        it("should reject session listing with an invalid access token", async () => {
            const response = await request(app)
                .get("/api/auth/sessions")
                .set(
                    "Authorization",
                    "Bearer invalid-access-token"
                )
                .expect(401);

            expect(response.body.success).toBe(false);

            expect(response.body.code).toBe(
                "INVALID_ACCESS_TOKEN"
            );
        });

        it("should reject session listing for a disabled account", async () => {
            const email = createEmail("disabled");

            const user = await registerUser(email);

            const loginResponse = await loginUser(
                email,
                "CareerForge Sessions Disabled Test"
            );

            const accessToken =
                loginResponse.body.data.accessToken;

            user.status = "DISABLED";
            await user.save();

            const response = await request(app)
                .get("/api/auth/sessions")
                .set(
                    "Authorization",
                    `Bearer ${accessToken}`
                )
                .expect(403);

            expect(response.body.success).toBe(false);

            expect(response.body.code).toBe(
                "ACCOUNT_DISABLED"
            );
        });

        it("should return multiple active sessions for the authenticated user", async () => {
            const email = createEmail("multiple");

            await registerUser(email);

            const firstLoginResponse = await loginUser(
                email,
                "CareerForge Chrome Session"
            );

            await loginUser(
                email,
                "CareerForge Firefox Session"
            );

            const accessToken =
                firstLoginResponse.body.data.accessToken;

            const response = await request(app)
                .get("/api/auth/sessions")
                .set(
                    "Authorization",
                    `Bearer ${accessToken}`
                )
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);

            expect(
                response.body.data.length
            ).toBeGreaterThanOrEqual(2);
        });
    });

    describe("DELETE /api/auth/sessions/:sessionId", () => {
        it("should revoke a specific active session", async () => {
            const email = createEmail("revoke");

            await registerUser(email);

            const firstLoginResponse = await loginUser(
                email,
                "CareerForge Primary Session"
            );

            await loginUser(
                email,
                "CareerForge Secondary Session"
            );

            const accessToken =
                firstLoginResponse.body.data.accessToken;

            const sessionsResponse = await request(app)
                .get("/api/auth/sessions")
                .set(
                    "Authorization",
                    `Bearer ${accessToken}`
                )
                .expect(200);

            expect(sessionsResponse.body.success).toBe(true);

            const sessions = sessionsResponse.body.data;

            expect(sessions.length).toBeGreaterThanOrEqual(2);

            const sessionToRevoke = sessions.find(
                (session) => session.isCurrent !== true
            ) ?? sessions[1];

            expect(sessionToRevoke).toBeDefined();

            const response = await request(app)
                .delete(
                    `/api/auth/sessions/${sessionToRevoke.id}`
                )
                .set(
                    "Authorization",
                    `Bearer ${accessToken}`
                )
                .expect(200);

            expect(response.body.success).toBe(true);
        });

        it("should reject session revocation without an access token", async () => {
            const response = await request(app)
                .delete("/api/auth/sessions/1")
                .expect(401);

            expect(response.body.success).toBe(false);

            expect(response.body.code).toBe(
                "AUTHENTICATION_REQUIRED"
            );
        });

        it("should reject session revocation with an invalid access token", async () => {
            const response = await request(app)
                .delete("/api/auth/sessions/1")
                .set(
                    "Authorization",
                    "Bearer invalid-access-token"
                )
                .expect(401);

            expect(response.body.success).toBe(false);

            expect(response.body.code).toBe(
                "INVALID_ACCESS_TOKEN"
            );
        });

        it("should reject revoking another user's session", async () => {
            const firstEmail = createEmail("owner");
            const secondEmail = createEmail("attacker");

            await registerUser(firstEmail);
            await registerUser(secondEmail);

            const firstLoginResponse = await loginUser(
                firstEmail,
                "CareerForge Owner Session"
            );

            const secondLoginResponse = await loginUser(
                secondEmail,
                "CareerForge Attacker Session"
            );

            const firstAccessToken =
                firstLoginResponse.body.data.accessToken;

            const secondAccessToken =
                secondLoginResponse.body.data.accessToken;

            const firstSessionsResponse = await request(app)
                .get("/api/auth/sessions")
                .set(
                    "Authorization",
                    `Bearer ${firstAccessToken}`
                )
                .expect(200);

            const firstUserSession =
                firstSessionsResponse.body.data[0];

            expect(firstUserSession).toBeDefined();

            const response = await request(app)
                .delete(
                    `/api/auth/sessions/${firstUserSession.id}`
                )
                .set(
                    "Authorization",
                    `Bearer ${secondAccessToken}`
                )
                .expect(403);

            expect(response.body.success).toBe(false);

            expect(response.body.code).toBe(
                "FORBIDDEN"
            );
        });

        it("should reject revoking a non-existent session", async () => {
            const email = createEmail("not-found");

            await registerUser(email);

            const loginResponse = await loginUser(
                email,
                "CareerForge Not Found Test"
            );

            const accessToken =
                loginResponse.body.data.accessToken;

            const response = await request(app)
                .delete("/api/auth/sessions/999999999")
                .set(
                    "Authorization",
                    `Bearer ${accessToken}`
                );

            console.log(response.status);
            console.log(response.body);

            expect([404, 400]).toContain(response.status);

            expect(response.body.success).toBe(false);
        });

        it("should reject revoking a non-existent session", async () => {
            const email = createEmail("not-found");

            await registerUser(email);

            const loginResponse = await loginUser(
                email,
                "CareerForge Not Found Test"
            );

            const accessToken =
                loginResponse.body.data.accessToken;

            const response = await request(app)
                .delete("/api/auth/sessions/999999999")
                .set(
                    "Authorization",
                    `Bearer ${accessToken}`
                )
                .expect(404);

            expect(response.body.success).toBe(false);

            expect(response.body.code).toBe(
                "SESSION_NOT_FOUND"
            );

            expect(response.body.message).toBe(
                "Session not found."
            );
        });
    });
});
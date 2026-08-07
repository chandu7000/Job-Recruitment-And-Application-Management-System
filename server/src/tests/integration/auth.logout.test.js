import request from "supertest";
import { Op } from "sequelize";

import app from "../../app.js";
import User from "../../models/user.model.js";
import UserSession from "../../models/userSession.model.js";

const TEST_EMAIL_PREFIX = "logout.integration.";
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

const loginUser = async (email) => {
    return request(app)
        .post("/api/auth/login")
        .set("User-Agent", "CareerForge Logout Integration Test")
        .send({
            email,
            password: PASSWORD
        })
        .expect(200);
};

describe("Logout API", () => {
    beforeEach(cleanup);
    afterEach(cleanup);

    describe("POST /api/auth/logout", () => {
        it("should logout successfully", async () => {
            const email = createEmail("success");

            await registerUser(email);

            const loginResponse = await loginUser(email);

            const accessToken =
                loginResponse.body.data.accessToken;

            const refreshCookie =
                loginResponse.headers["set-cookie"];

            const response = await request(app)
                .post("/api/auth/logout")
                .set(
                    "Authorization",
                    `Bearer ${accessToken}`
                )
                .set("Cookie", refreshCookie)
                .expect(200);

            expect(response.body.success).toBe(true);
        });

        it("should reject logout without an access token", async () => {
            const response = await request(app)
                .post("/api/auth/logout")
                .expect(401);

            expect(response.body.success).toBe(false);

            expect(response.body.code).toBe(
                "AUTHENTICATION_REQUIRED"
            );
        });

        it("should reject logout with an invalid access token", async () => {
            const response = await request(app)
                .post("/api/auth/logout")
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

        it("should revoke the refresh session after logout", async () => {
            const email = createEmail("revoke-session");

            await registerUser(email);

            const loginResponse = await loginUser(email);

            const accessToken =
                loginResponse.body.data.accessToken;

            const refreshCookie =
                loginResponse.headers["set-cookie"];

            await request(app)
                .post("/api/auth/logout")
                .set(
                    "Authorization",
                    `Bearer ${accessToken}`
                )
                .set("Cookie", refreshCookie)
                .expect(200);

            const refreshResponse = await request(app)
                .post("/api/auth/refresh-token")
                .set("Cookie", refreshCookie)
                .expect(401);

            expect(refreshResponse.body.success).toBe(false);

            expect(refreshResponse.body.code).toBe(
                "SESSION_REVOKED"
            );
        });

        it("should clear the refresh token cookie after logout", async () => {
            const email = createEmail("clear-cookie");

            await registerUser(email);

            const loginResponse = await loginUser(email);

            const accessToken =
                loginResponse.body.data.accessToken;

            const refreshCookie =
                loginResponse.headers["set-cookie"];

            const response = await request(app)
                .post("/api/auth/logout")
                .set(
                    "Authorization",
                    `Bearer ${accessToken}`
                )
                .set("Cookie", refreshCookie)
                .expect(200);

            const clearedCookies =
                response.headers["set-cookie"];

            expect(clearedCookies).toBeDefined();
            expect(Array.isArray(clearedCookies)).toBe(true);

            expect(
                clearedCookies.some((cookie) =>
                    cookie.startsWith("refreshToken=")
                )
            ).toBe(true);

            expect(
                clearedCookies.some((cookie) =>
                    cookie.includes("Expires=") ||
                    cookie.includes("Max-Age=0")
                )
            ).toBe(true);
        });
    });
});
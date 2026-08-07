import request from "supertest";
import { Op } from "sequelize";

import app from "../../app.js";
import User from "../../models/user.model.js";
import UserSession from "../../models/userSession.model.js";

const TEST_EMAIL_PREFIX = "logoutall.integration.";
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

describe("Logout All API", () => {
    beforeEach(cleanup);
    afterEach(cleanup);

    describe("POST /api/auth/logout-all", () => {
        it("should logout from all devices successfully", async () => {
            const email = createEmail("success");

            await registerUser(email);

            const loginOne = await loginUser(
                email,
                "CareerForge Logout All Test Device One"
            );

            const loginTwo = await loginUser(
                email,
                "CareerForge Logout All Test Device Two"
            );

            const accessToken =
                loginOne.body.data.accessToken;

            const firstRefreshCookie =
                loginOne.headers["set-cookie"];

            const secondRefreshCookie =
                loginTwo.headers["set-cookie"];

            expect(accessToken).toEqual(
                expect.any(String)
            );

            expect(firstRefreshCookie).toBeDefined();
            expect(secondRefreshCookie).toBeDefined();

            const response = await request(app)
                .post("/api/auth/logout-all")
                .set(
                    "Authorization",
                    `Bearer ${accessToken}`
                )
                .expect(200);

            expect(response.body.success).toBe(true);

            const firstRefreshResponse = await request(app)
                .post("/api/auth/refresh-token")
                .set("Cookie", firstRefreshCookie)
                .expect(401);

            expect(
                firstRefreshResponse.body.success
            ).toBe(false);

            expect(
                firstRefreshResponse.body.code
            ).toBe("SESSION_REVOKED");

            const secondRefreshResponse = await request(app)
                .post("/api/auth/refresh-token")
                .set("Cookie", secondRefreshCookie)
                .expect(401);

            expect(
                secondRefreshResponse.body.success
            ).toBe(false);

            expect(
                secondRefreshResponse.body.code
            ).toBe("SESSION_REVOKED");
        });

        it("should reject logout all without an access token", async () => {
            const response = await request(app)
                .post("/api/auth/logout-all")
                .expect(401);

            expect(response.body.success).toBe(false);

            expect(response.body.code).toBe(
                "AUTHENTICATION_REQUIRED"
            );
        });

        it("should reject logout all with an invalid access token", async () => {
            const response = await request(app)
                .post("/api/auth/logout-all")
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

        it("should clear the refresh token cookie after logout all", async () => {
            const email = createEmail("clear-cookie");

            await registerUser(email);

            const loginResponse = await loginUser(
                email,
                "CareerForge Logout All Cookie Test"
            );

            const accessToken =
                loginResponse.body.data.accessToken;

            const refreshCookie =
                loginResponse.headers["set-cookie"];

            const response = await request(app)
                .post("/api/auth/logout-all")
                .set(
                    "Authorization",
                    `Bearer ${accessToken}`
                )
                .set("Cookie", refreshCookie)
                .expect(200);

            expect(response.body.success).toBe(true);

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

        it("should reject logout all for a disabled account", async () => {
            const email = createEmail("disabled");

            const user = await registerUser(email);

            const loginResponse = await loginUser(
                email,
                "CareerForge Logout All Disabled Test"
            );

            const accessToken =
                loginResponse.body.data.accessToken;

            user.status = "DISABLED";
            await user.save();

            const response = await request(app)
                .post("/api/auth/logout-all")
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
    });
});
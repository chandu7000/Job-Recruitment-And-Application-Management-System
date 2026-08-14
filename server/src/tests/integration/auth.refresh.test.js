import request from "supertest";
import { Op } from "sequelize";

import app from "../../app.js";
import User from "../../models/user.model.js";
import UserSession from "../../models/userSession.model.js";

const TEST_EMAIL_PREFIX = "refresh.integration.";
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
        .set("User-Agent", "CareerForge Refresh Integration Test")
        .send({
            email,
            password: PASSWORD
        })
        .expect(200);
};

describe("Refresh Token API", () => {
    beforeEach(cleanup);
    afterEach(cleanup);

    describe("POST /api/auth/restore-session", () => {
        it("should restore the same session repeatedly without rotating the refresh token", async () => {
            const email = createEmail("restore-repeat");

            await registerUser(email);

            const loginResponse = await loginUser(email);
            const refreshCookie = loginResponse.headers["set-cookie"];

            expect(refreshCookie).toBeDefined();

            for (let attempt = 0; attempt < 5; attempt += 1) {
                const response = await request(app)
                    .post("/api/auth/restore-session")
                    .set("Origin", "http://localhost:5173")
                    .set("Sec-Fetch-Site", "same-site")
                    .set("Cookie", refreshCookie)
                    .expect(200);

                expect(response.body.success).toBe(true);
                expect(response.body.data.accessToken).toEqual(expect.any(String));
                expect(response.body.data.user.email).toBe(email);
                expect(response.headers["set-cookie"]).toBeUndefined();
            }

            const refreshResponse = await request(app)
                .post("/api/auth/refresh-token")
                .set("Origin", "http://localhost:5173")
                .set("Sec-Fetch-Site", "same-site")
                .set("Cookie", refreshCookie)
                .expect(200);

            expect(refreshResponse.headers["set-cookie"]).toBeDefined();
        });

        it("should reject session restore when the cookie is missing", async () => {
            const response = await request(app)
                .post("/api/auth/restore-session")
                .expect(401);

            expect(response.body.code).toBe("REFRESH_TOKEN_REQUIRED");
        });
    });

    describe("POST /api/auth/refresh-token", () => {
        it("should refresh the access token successfully", async () => {
            const email = createEmail("success");

            await registerUser(email);

            const loginResponse = await loginUser(email);

            const refreshCookie =
                loginResponse.headers["set-cookie"];

            expect(refreshCookie).toBeDefined();
            expect(Array.isArray(refreshCookie)).toBe(true);

            const response = await request(app)
                .post("/api/auth/refresh-token")
                .set("Cookie", refreshCookie)
                .expect(200);

            expect(response.body.success).toBe(true);

            expect(response.body.data.accessToken).toEqual(
                expect.any(String)
            );

            expect(
                response.headers["set-cookie"]
            ).toBeDefined();
        });

        it("should reject refresh when cookie is missing", async () => {
            const response = await request(app)
                .post("/api/auth/refresh-token")
                .expect(401);

            expect(response.body.success).toBe(false);

            expect(response.body.code).toBe(
                "REFRESH_TOKEN_REQUIRED"
            );
        });

        it("should reject an invalid refresh token", async () => {
            const response = await request(app)
                .post("/api/auth/refresh-token")
                .set(
                    "Cookie",
                    "refreshToken=invalid-refresh-token"
                )
                .expect(401);

            expect(response.body.success).toBe(false);

            expect(response.body.code).toBe(
                "INVALID_REFRESH_TOKEN"
            );
        });

        it("should detect refresh token reuse and revoke all sessions", async () => {
            const email = createEmail("rotation");

            await registerUser(email);

            const loginResponse = await loginUser(email);

            const originalCookie =
                loginResponse.headers["set-cookie"];

            expect(originalCookie).toBeDefined();

            // First refresh succeeds and generates a rotated token
            const firstRefresh = await request(app)
                .post("/api/auth/refresh-token")
                .set("Cookie", originalCookie)
                .expect(200);

            const rotatedCookie =
                firstRefresh.headers["set-cookie"];

            expect(rotatedCookie).toBeDefined();

            // Reusing the old token triggers reuse detection
            const reusedResponse = await request(app)
                .post("/api/auth/refresh-token")
                .set("Cookie", originalCookie)
                .expect(401);

            expect(reusedResponse.body.success).toBe(false);

            expect(reusedResponse.body.code).toBe(
                "REFRESH_TOKEN_REUSE_DETECTED"
            );

            // Reuse detection revokes all sessions,
            // including the newly rotated session
            const rotatedResponse = await request(app)
                .post("/api/auth/refresh-token")
                .set("Cookie", rotatedCookie)
                .expect(401);

            expect(rotatedResponse.body.success).toBe(false);

            expect(rotatedResponse.body.code).toBe(
                "SESSION_REVOKED"
            );
        });

        it("should reject refresh for a disabled account", async () => {
            const email = createEmail("disabled");

            const user = await registerUser(email);

            const loginResponse = await loginUser(email);

            const refreshCookie =
                loginResponse.headers["set-cookie"];

            user.status = "DISABLED";
            await user.save();

            const response = await request(app)
                .post("/api/auth/refresh-token")
                .set("Cookie", refreshCookie)
                .expect(403);

            expect(response.body.success).toBe(false);

            expect(response.body.code).toBe(
                "ACCOUNT_NOT_ACTIVE"
            );
        });

        it(
            "should allow refresh from a trusted origin",
            async () => {
                const email =
                    createEmail("trusted-origin");

                await registerUser(email);

                const loginResponse =
                    await loginUser(email);

                const refreshCookie =
                    loginResponse.headers["set-cookie"];

                const response =
                    await request(app)
                        .post(
                            "/api/auth/refresh-token"
                        )
                        .set(
                            "Origin",
                            "http://localhost:5173"
                        )
                        .set(
                            "Sec-Fetch-Site",
                            "same-site"
                        )
                        .set(
                            "Cookie",
                            refreshCookie
                        )
                        .expect(200);

                expect(
                    response.body.success
                ).toBe(true);
            }
        );

        it(
            "should reject refresh from an untrusted origin",
            async () => {
                const email =
                    createEmail("untrusted-origin");

                await registerUser(email);

                const loginResponse =
                    await loginUser(email);

                const refreshCookie =
                    loginResponse.headers["set-cookie"];

                const response =
                    await request(app)
                        .post(
                            "/api/auth/refresh-token"
                        )
                        .set(
                            "Origin",
                            "https://malicious.example"
                        )
                        .set(
                            "Sec-Fetch-Site",
                            "cross-site"
                        )
                        .set(
                            "Cookie",
                            refreshCookie
                        )
                        .expect(403);

                expect(
                    response.body.success
                ).toBe(false);

                /*
                 * The application's global CORS middleware
                 * executes before route middleware, so it may
                 * reject the malicious origin first.
                 */
                expect([
                    "CORS_ORIGIN_NOT_ALLOWED",
                    "ORIGIN_NOT_ALLOWED",
                    "CROSS_SITE_REQUEST_BLOCKED"
                ]).toContain(
                    response.body.code
                );
            }
        );
    });
});
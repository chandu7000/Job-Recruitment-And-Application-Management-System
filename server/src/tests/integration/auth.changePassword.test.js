import request from "supertest";
import { Op } from "sequelize";

import app from "../../app.js";
import User from "../../models/user.model.js";
import UserSession from "../../models/userSession.model.js";

const TEST_EMAIL_PREFIX =
    "change-password.integration.";

const CURRENT_PASSWORD =
    "Strong@Password123";

const NEW_PASSWORD =
    "NewStrong@Password456";

let emailCounter = 0;

const createEmail = (label) => {
    emailCounter += 1;

    return (
        `${TEST_EMAIL_PREFIX}${label}.` +
        `${Date.now()}.${emailCounter}@example.com`
    );
};

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
            password: CURRENT_PASSWORD
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

const loginUser = (
    email,
    password = CURRENT_PASSWORD,
    userAgent = "CareerForge Change Password Integration Test"
) =>
    request(app)
        .post("/api/auth/login")
        .set("User-Agent", userAgent)
        .send({
            email,
            password
        });

const getAccessToken = (loginResponse) =>
    loginResponse.body.data.accessToken;

const getRefreshCookie = (loginResponse) => {
    const cookies =
        loginResponse.headers["set-cookie"];

    expect(cookies).toBeDefined();
    expect(Array.isArray(cookies)).toBe(true);

    return cookies;
};

describe("Change Password API", () => {
    beforeEach(cleanup);
    afterEach(cleanup);

    describe("POST /api/auth/change-password", () => {
        it("should change the authenticated user's password successfully", async () => {
            const email = createEmail("success");

            await registerUser(email);

            const loginResponse =
                await loginUser(email).expect(200);

            const accessToken =
                getAccessToken(loginResponse);

            const response = await request(app)
                .post("/api/auth/change-password")
                .set(
                    "Authorization",
                    `Bearer ${accessToken}`
                )
                .send({
                    currentPassword:
                        CURRENT_PASSWORD,
                    newPassword:
                        NEW_PASSWORD
                })
                .expect(200);

            expect(response.body.success).toBe(true);
        });

        it("should allow login with the new password after changing it", async () => {
            const email =
                createEmail("new-password-login");

            await registerUser(email);

            const loginResponse =
                await loginUser(email).expect(200);

            const accessToken =
                getAccessToken(loginResponse);

            await request(app)
                .post("/api/auth/change-password")
                .set(
                    "Authorization",
                    `Bearer ${accessToken}`
                )
                .send({
                    currentPassword:
                        CURRENT_PASSWORD,
                    newPassword:
                        NEW_PASSWORD
                })
                .expect(200);

            const newLoginResponse =
                await loginUser(
                    email,
                    NEW_PASSWORD
                ).expect(200);

            expect(
                newLoginResponse.body.data.accessToken
            ).toEqual(expect.any(String));
        });

        it("should reject login with the old password after changing it", async () => {
            const email =
                createEmail("old-password");

            await registerUser(email);

            const loginResponse =
                await loginUser(email).expect(200);

            const accessToken =
                getAccessToken(loginResponse);

            await request(app)
                .post("/api/auth/change-password")
                .set(
                    "Authorization",
                    `Bearer ${accessToken}`
                )
                .send({
                    currentPassword:
                        CURRENT_PASSWORD,
                    newPassword:
                        NEW_PASSWORD
                })
                .expect(200);

            const oldPasswordResponse =
                await loginUser(
                    email,
                    CURRENT_PASSWORD
                ).expect(401);

            expect(
                oldPasswordResponse.body.success
            ).toBe(false);
        });

        it("should reject change password without an access token", async () => {
            const response = await request(app)
                .post("/api/auth/change-password")
                .send({
                    currentPassword:
                        CURRENT_PASSWORD,
                    newPassword:
                        NEW_PASSWORD
                })
                .expect(401);

            expect(response.body.success).toBe(false);

            expect(response.body.code).toBe(
                "AUTHENTICATION_REQUIRED"
            );
        });

        it("should reject change password with an invalid access token", async () => {
            const response = await request(app)
                .post("/api/auth/change-password")
                .set(
                    "Authorization",
                    "Bearer invalid-access-token"
                )
                .send({
                    currentPassword:
                        CURRENT_PASSWORD,
                    newPassword:
                        NEW_PASSWORD
                })
                .expect(401);

            expect(response.body.success).toBe(false);

            expect(response.body.code).toBe(
                "INVALID_ACCESS_TOKEN"
            );
        });

        it("should reject change password for a disabled account", async () => {
            const email =
                createEmail("disabled");

            const user = await registerUser(email);

            const loginResponse =
                await loginUser(email).expect(200);

            const accessToken =
                getAccessToken(loginResponse);

            user.status = "DISABLED";
            await user.save();

            const response = await request(app)
                .post("/api/auth/change-password")
                .set(
                    "Authorization",
                    `Bearer ${accessToken}`
                )
                .send({
                    currentPassword:
                        CURRENT_PASSWORD,
                    newPassword:
                        NEW_PASSWORD
                })
                .expect(403);

            expect(response.body.success).toBe(false);

            expect(response.body.code).toBe(
                "ACCOUNT_DISABLED"
            );
        });

        it("should reject an incorrect current password", async () => {
            const email =
                createEmail("wrong-current");

            await registerUser(email);

            const loginResponse =
                await loginUser(email).expect(200);

            const accessToken =
                getAccessToken(loginResponse);

            const response = await request(app)
                .post("/api/auth/change-password")
                .set(
                    "Authorization",
                    `Bearer ${accessToken}`
                )
                .send({
                    currentPassword:
                        "Wrong@Password999",
                    newPassword:
                        NEW_PASSWORD
                })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.code).toBeDefined();
        });

        it("should reject when the current password is missing", async () => {
            const email =
                createEmail("missing-current");

            await registerUser(email);

            const loginResponse =
                await loginUser(email).expect(200);

            const accessToken =
                getAccessToken(loginResponse);

            const response = await request(app)
                .post("/api/auth/change-password")
                .set(
                    "Authorization",
                    `Bearer ${accessToken}`
                )
                .send({
                    newPassword:
                        NEW_PASSWORD
                })
                .expect(422)

            expect(response.body.success).toBe(false);
            expect(response.body.code).toBeDefined();
        });

        it("should reject when the new password is missing", async () => {
            const email =
                createEmail("missing-new");

            await registerUser(email);

            const loginResponse =
                await loginUser(email).expect(200);

            const accessToken =
                getAccessToken(loginResponse);

            const response = await request(app)
                .post("/api/auth/change-password")
                .set(
                    "Authorization",
                    `Bearer ${accessToken}`
                )
                .send({
                    currentPassword:
                        CURRENT_PASSWORD
                })
                .expect(422)

            expect(response.body.success).toBe(false);
            expect(response.body.code).toBeDefined();
        });

        it("should reject a weak new password", async () => {
            const email =
                createEmail("weak-password");

            await registerUser(email);

            const loginResponse =
                await loginUser(email).expect(200);

            const accessToken =
                getAccessToken(loginResponse);

            const response = await request(app)
                .post("/api/auth/change-password")
                .set(
                    "Authorization",
                    `Bearer ${accessToken}`
                )
                .send({
                    currentPassword:
                        CURRENT_PASSWORD,
                    newPassword: "weak"
                })
                .expect(422)

            expect(response.body.success).toBe(false);
            expect(response.body.code).toBeDefined();
        });

        it("should invalidate the previous refresh session after changing the password", async () => {
            const email =
                createEmail("invalidate-session");

            await registerUser(email);

            const loginResponse = await loginUser(
                email,
                CURRENT_PASSWORD,
                "CareerForge Password Session Test"
            ).expect(200);

            const accessToken =
                getAccessToken(loginResponse);

            const refreshCookie =
                getRefreshCookie(loginResponse);

            await request(app)
                .post("/api/auth/change-password")
                .set(
                    "Authorization",
                    `Bearer ${accessToken}`
                )
                .send({
                    currentPassword:
                        CURRENT_PASSWORD,
                    newPassword:
                        NEW_PASSWORD
                })
                .expect(200);

            const refreshResponse =
                await request(app)
                    .post("/api/auth/refresh-token")
                    .set(
                        "Cookie",
                        refreshCookie
                    )
                    .expect(401);

            expect(
                refreshResponse.body.success
            ).toBe(false);

            expect([
                "SESSION_REVOKED",
                "INVALID_REFRESH_TOKEN"
            ]).toContain(
                refreshResponse.body.code
            );
        });
    });
});
import crypto from "crypto";
import request from "supertest";
import { Op } from "sequelize";

import app from "../../app.js";
import User from "../../models/user.model.js";
import UserSession from "../../models/userSession.model.js";

import {
    hashToken
} from "../../utils/token.util.js";

const TEST_EMAIL_PREFIX =
    "reset-password.integration.";

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

const createResetToken = () =>
    crypto.randomBytes(32).toString("hex");

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
    userAgent =
        "CareerForge Reset Password Integration Test"
) =>
    request(app)
        .post("/api/auth/login")
        .set("User-Agent", userAgent)
        .send({
            email,
            password
        });

const assignResetToken = async ({
    user,
    rawToken,
    expiresAt =
    new Date(Date.now() + 15 * 60 * 1000)
}) => {
    user.passwordResetToken =
        hashToken(rawToken);

    user.passwordResetExpiresAt =
        expiresAt;

    await user.save();

    return user;
};

const sendResetPasswordRequest = ({
    token,
    password = NEW_PASSWORD
}) =>
    request(app)
        .post("/api/auth/reset-password")
        .send({
            token,
            password
        });

describe("Reset Password API", () => {
    beforeEach(cleanup);
    afterEach(cleanup);

    describe("POST /api/auth/reset-password", () => {
        it("should reset the password successfully with a valid token", async () => {
            const email =
                createEmail("success");

            const rawToken =
                createResetToken();

            const user =
                await registerUser(email);

            await assignResetToken({
                user,
                rawToken
            });

            const response =
                await sendResetPasswordRequest({
                    token: rawToken
                }).expect(200);

            expect(response.body.success).toBe(true);

            expect(response.body.message).toBe(
                "Password reset successful."
            );

            expect(response.body.data).toEqual({});
        });

        it("should allow login with the new password after resetting it", async () => {
            const email =
                createEmail("new-login");

            const rawToken =
                createResetToken("new-login");

            const user =
                await registerUser(email);

            await assignResetToken({
                user,
                rawToken
            });

            await sendResetPasswordRequest({
                token: rawToken
            }).expect(200);

            const loginResponse =
                await loginUser(
                    email,
                    NEW_PASSWORD
                ).expect(200);

            expect(
                loginResponse.body.data.accessToken
            ).toEqual(expect.any(String));
        });

        it("should reject login with the old password after resetting it", async () => {
            const email =
                createEmail("old-login");

            const rawToken =
                createResetToken("old-login");

            const user =
                await registerUser(email);

            await assignResetToken({
                user,
                rawToken
            });

            await sendResetPasswordRequest({
                token: rawToken
            }).expect(200);

            const response =
                await loginUser(
                    email,
                    CURRENT_PASSWORD
                ).expect(401);

            expect(response.body.success).toBe(false);

            expect(response.body.code).toBe(
                "INVALID_CREDENTIALS"
            );
        });

        it("should clear the password-reset token after a successful reset", async () => {
            const email =
                createEmail("clear-token");

            const rawToken =
                createResetToken("clear-token");

            const user =
                await registerUser(email);

            await assignResetToken({
                user,
                rawToken
            });

            await sendResetPasswordRequest({
                token: rawToken
            }).expect(200);

            await user.reload();

            expect(
                user.passwordResetToken
            ).toBeNull();

            expect(
                user.passwordResetExpiresAt
            ).toBeNull();
        });

        it("should prevent reuse of a password-reset token", async () => {
            const email =
                createEmail("token-reuse");

            const rawToken =
                createResetToken("token-reuse");

            const user =
                await registerUser(email);

            await assignResetToken({
                user,
                rawToken
            });

            await sendResetPasswordRequest({
                token: rawToken
            }).expect(200);

            const secondResponse =
                await sendResetPasswordRequest({
                    token: rawToken,
                    password:
                        "AnotherStrong@Password789"
                }).expect(400);

            expect(
                secondResponse.body.success
            ).toBe(false);

            expect(secondResponse.body.code).toBe(
                "INVALID_RESET_TOKEN"
            );

            expect(secondResponse.body.message).toBe(
                "Invalid password reset token."
            );
        });

        it("should reject an invalid password-reset token", async () => {
            const email =
                createEmail("invalid-token");

            await registerUser(email);

            const invalidToken =
                createResetToken();

            const response =
                await sendResetPasswordRequest({
                    token: invalidToken
                }).expect(400);

            expect(response.body.success).toBe(false);

            expect(response.body.code).toBe(
                "INVALID_RESET_TOKEN"
            );

            expect(response.body.message).toBe(
                "Invalid password reset token."
            );
        });

        it("should reject an expired password-reset token", async () => {
            const email =
                createEmail("expired-token");

            const rawToken =
                createResetToken("expired-token");

            const user =
                await registerUser(email);

            await assignResetToken({
                user,
                rawToken,
                expiresAt: new Date(
                    Date.now() - 60 * 1000
                )
            });

            const response =
                await sendResetPasswordRequest({
                    token: rawToken
                }).expect(400);

            expect(response.body.success).toBe(false);

            expect(response.body.code).toBe(
                "RESET_TOKEN_EXPIRED"
            );

            expect(response.body.message).toBe(
                "Password reset token has expired."
            );
        });
        it("should reject the request when the reset token is missing", async () => {
            const response =
                await request(app)
                    .post("/api/auth/reset-password")
                    .send({
                        password:
                            NEW_PASSWORD
                    })
                    .expect(422);

            expect(response.body.success).toBe(false);

            expect(
                response.body.code
            ).toBeDefined();
        });

        it("should reject the request when the new password is missing", async () => {
            const email =
                createEmail("missing-password");

            const rawToken =
                createResetToken("missing-password");

            const user =
                await registerUser(email);

            await assignResetToken({
                user,
                rawToken
            });

            const response =
                await request(app)
                    .post("/api/auth/reset-password")
                    .send({
                        token: rawToken
                    })
                    .expect(422);

            expect(response.body.success).toBe(false);

            expect(
                response.body.code
            ).toBeDefined();
        });

        it("should reject a weak replacement password", async () => {
            const email =
                createEmail("weak-password");

            const rawToken =
                createResetToken("weak-password");

            const user =
                await registerUser(email);

            await assignResetToken({
                user,
                rawToken
            });

            const response =
                await request(app)
                    .post("/api/auth/reset-password")
                    .send({
                        token: rawToken,
                        password: "weak"
                    })
                    .expect(422);

            expect(response.body.success).toBe(false);

            expect(
                response.body.code
            ).toBeDefined();
        });

        it("should revoke all existing refresh sessions after resetting the password", async () => {
            const email =
                createEmail("revoke-sessions");

            const rawToken =
                createResetToken("revoke-sessions");

            const user =
                await registerUser(email);

            const loginResponse =
                await loginUser(
                    email,
                    CURRENT_PASSWORD,
                    "CareerForge Reset Password Session Test"
                ).expect(200);

            const refreshCookie =
                loginResponse.headers["set-cookie"];

            expect(refreshCookie).toBeDefined();

            await assignResetToken({
                user,
                rawToken
            });

            await sendResetPasswordRequest({
                token: rawToken
            }).expect(200);

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

        it("should remove the reset token from the database after a successful reset", async () => {
            const email =
                createEmail("token-cleared");

            const rawToken =
                createResetToken("token-cleared");

            const user =
                await registerUser(email);

            await assignResetToken({
                user,
                rawToken
            });

            await sendResetPasswordRequest({
                token: rawToken
            }).expect(200);

            await user.reload();

            expect(
                user.passwordResetToken
            ).toBeNull();

            expect(
                user.passwordResetExpiresAt
            ).toBeNull();
        });

        it("should reject another reset request using the same token after it has been cleared", async () => {
            const email =
                createEmail("cleared-token");

            const rawToken =
                createResetToken("cleared-token");

            const user =
                await registerUser(email);

            await assignResetToken({
                user,
                rawToken
            });

            await sendResetPasswordRequest({
                token: rawToken
            }).expect(200);

            const response =
                await sendResetPasswordRequest({
                    token: rawToken,
                    password:
                        "AnotherStrong@Password789"
                }).expect(400);

            expect(response.body.success).toBe(false);

            expect(
                response.body.code
            ).toBe(
                "INVALID_RESET_TOKEN"
            );
        });

        it("should not expose the password reset token in the response", async () => {
            const email =
                createEmail("response");

            const rawToken =
                createResetToken("response");

            const user =
                await registerUser(email);

            await assignResetToken({
                user,
                rawToken
            });

            const response =
                await sendResetPasswordRequest({
                    token: rawToken
                }).expect(200);

            expect(response.body.success).toBe(true);

            expect(response.body.data).toEqual({});

            expect(
                response.body.data
                    ?.token
            ).toBeUndefined();

            expect(
                response.body.data
                    ?.passwordResetToken
            ).toBeUndefined();
        });
    });
});
import request from "supertest";
import { Op } from "sequelize";

import app from "../../app.js";
import User from "../../models/user.model.js";
import UserSession from "../../models/userSession.model.js";

const TEST_EMAIL_PREFIX =
    "forgot-password.integration.";

const CURRENT_PASSWORD =
    "Strong@Password123";

const GENERIC_MESSAGE =
    "If an account exists for this email, a password reset link has been sent.";

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

const registerUser = async (
    email,
    status = "ACTIVE"
) => {
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

    if (status === "ACTIVE") {
        user.emailVerified = true;
    }

    user.status = status;

    await user.save();

    return user;
};

const sendForgotPasswordRequest = (email) =>
    request(app)
        .post("/api/auth/forgot-password")
        .send({
            email
        });

describe("Forgot Password API", () => {
    beforeEach(cleanup);
    afterEach(cleanup);

    describe("POST /api/auth/forgot-password", () => {
        it("should accept a forgot-password request for an active registered account", async () => {
            const email =
                createEmail("active-success");

            await registerUser(email);

            const response =
                await sendForgotPasswordRequest(
                    email
                ).expect(200);

            expect(response.body.success).toBe(true);

            expect(response.body.message).toBe(
                GENERIC_MESSAGE
            );

            expect(response.body.data).toEqual({});
        });

        it("should save a password-reset token for an active account", async () => {
            const email =
                createEmail("token-saved");

            await registerUser(email);

            await sendForgotPasswordRequest(
                email
            ).expect(200);

            const user =
                await User.unscoped().findOne({
                    where: {
                        email
                    }
                });

            expect(user).not.toBeNull();

            expect(
                user.passwordResetToken
            ).toEqual(expect.any(String));

            expect(
                user.passwordResetToken.length
            ).toBeGreaterThan(0);
        });

        it("should save an expiry date for the password-reset token", async () => {
            const email =
                createEmail("expiry-saved");

            await registerUser(email);

            const requestStartedAt =
                Date.now();

            await sendForgotPasswordRequest(
                email
            ).expect(200);

            const user =
                await User.unscoped().findOne({
                    where: {
                        email
                    }
                });

            expect(user).not.toBeNull();

            expect(
                user.passwordResetExpiresAt
            ).not.toBeNull();

            const expiryTime =
                new Date(
                    user.passwordResetExpiresAt
                ).getTime();

            expect(expiryTime).toBeGreaterThan(
                requestStartedAt
            );

            expect(expiryTime).toBeLessThanOrEqual(
                requestStartedAt +
                16 * 60 * 1000
            );
        });

        it("should set the password-reset token expiry to approximately fifteen minutes", async () => {
            const email =
                createEmail("fifteen-minutes");

            await registerUser(email);

            const beforeRequest =
                Date.now();

            await sendForgotPasswordRequest(
                email
            ).expect(200);

            const afterRequest =
                Date.now();

            const user =
                await User.unscoped().findOne({
                    where: {
                        email
                    }
                });

            const expiryTime =
                new Date(
                    user.passwordResetExpiresAt
                ).getTime();

            const minimumExpectedExpiry =
                beforeRequest +
                14 * 60 * 1000;

            const maximumExpectedExpiry =
                afterRequest +
                16 * 60 * 1000;

            expect(expiryTime).toBeGreaterThanOrEqual(
                minimumExpectedExpiry
            );

            expect(expiryTime).toBeLessThanOrEqual(
                maximumExpectedExpiry
            );
        });

        it("should replace the previous password-reset token when requested again", async () => {
            const email =
                createEmail("replace-token");

            await registerUser(email);

            await sendForgotPasswordRequest(
                email
            ).expect(200);

            const userAfterFirstRequest =
                await User.unscoped().findOne({
                    where: {
                        email
                    }
                });

            const firstToken =
                userAfterFirstRequest
                    .passwordResetToken;

            expect(firstToken).toEqual(
                expect.any(String)
            );

            await sendForgotPasswordRequest(
                email
            ).expect(200);

            const userAfterSecondRequest =
                await User.unscoped().findOne({
                    where: {
                        email
                    }
                });

            const secondToken =
                userAfterSecondRequest
                    .passwordResetToken;

            expect(secondToken).toEqual(
                expect.any(String)
            );

            expect(secondToken).not.toBe(
                firstToken
            );
        });

        it("should return the generic success response for an unregistered email", async () => {
            const email =
                createEmail("unregistered");

            const response =
                await sendForgotPasswordRequest(
                    email
                ).expect(200);

            expect(response.body.success).toBe(true);

            expect(response.body.message).toBe(
                GENERIC_MESSAGE
            );

            expect(response.body.data).toEqual({});

            const user =
                await User.unscoped().findOne({
                    where: {
                        email
                    }
                });

            expect(user).toBeNull();
        });
        it("should return the generic response for a pending verification account", async () => {
            const email =
                createEmail("pending");

            const user =
                await registerUser(
                    email,
                    "PENDING_VERIFICATION"
                );

            const response =
                await sendForgotPasswordRequest(
                    email
                ).expect(200);

            expect(response.body.success).toBe(true);

            expect(response.body.message).toBe(
                GENERIC_MESSAGE
            );

            await user.reload();

            expect(
                user.passwordResetToken
            ).toBeNull();

            expect(
                user.passwordResetExpiresAt
            ).toBeNull();
        });

        it("should return the generic response for a disabled account", async () => {
            const email =
                createEmail("disabled");

            const user =
                await registerUser(
                    email,
                    "DISABLED"
                );

            const response =
                await sendForgotPasswordRequest(
                    email
                ).expect(200);

            expect(response.body.success).toBe(true);

            expect(response.body.message).toBe(
                GENERIC_MESSAGE
            );

            await user.reload();

            expect(
                user.passwordResetToken
            ).toBeNull();

            expect(
                user.passwordResetExpiresAt
            ).toBeNull();
        });

        it("should return the generic response for a suspended account", async () => {
            const email =
                createEmail("suspended");

            const user =
                await registerUser(
                    email,
                    "SUSPENDED"
                );

            const response =
                await sendForgotPasswordRequest(
                    email
                ).expect(200);

            expect(response.body.success).toBe(true);

            expect(response.body.message).toBe(
                GENERIC_MESSAGE
            );

            await user.reload();

            expect(
                user.passwordResetToken
            ).toBeNull();

            expect(
                user.passwordResetExpiresAt
            ).toBeNull();
        });

        it("should reject the request when the email field is missing", async () => {
            const response =
                await request(app)
                    .post("/api/auth/forgot-password")
                    .send({})
                    .expect(422);

            expect(response.body.success).toBe(false);

            expect(
                response.body.code
            ).toBeDefined();
        });

        it("should reject an invalid email address", async () => {
            const response =
                await request(app)
                    .post("/api/auth/forgot-password")
                    .send({
                        email:
                            "invalid-email"
                    })
                    .expect(422);

            expect(response.body.success).toBe(false);

            expect(
                response.body.code
            ).toBeDefined();
        });

        it("should never expose the password-reset token in the API response", async () => {
            const email =
                createEmail("hidden-token");

            await registerUser(email);

            const response =
                await sendForgotPasswordRequest(
                    email
                ).expect(200);

            expect(response.body.success).toBe(true);

            expect(
                response.body.message
            ).toBe(
                GENERIC_MESSAGE
            );

            expect(
                response.body.data
                    .token
            ).toBeUndefined();

            expect(
                response.body.data
                    .passwordResetToken
            ).toBeUndefined();

            expect(
                response.body.data
                    .resetToken
            ).toBeUndefined();
        });
    });
});
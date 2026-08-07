import crypto from "crypto";
import request from "supertest";
import { Op } from "sequelize";

import app from "../../app.js";
import User from "../../models/user.model.js";

import {
    hashToken
} from "../../utils/token.util.js";

const TEST_EMAIL_PREFIX =
    "email-verification.integration.";

const PASSWORD =
    "Strong@Password123";

const GENERIC_VERIFICATION_MESSAGE =
    "If an account exists and requires verification, a verification email has been sent.";

let emailCounter = 0;

const createEmail = (label) => {
    emailCounter += 1;

    return (
        `${TEST_EMAIL_PREFIX}${label}.` +
        `${Date.now()}.${emailCounter}@example.com`
    );
};

const createVerificationToken = () =>
    crypto.randomBytes(32).toString("hex");

const cleanup = async () => {
    await User.unscoped().destroy({
        where: {
            email: {
                [Op.like]:
                    `${TEST_EMAIL_PREFIX}%`
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

    const user =
        await User.unscoped().findOne({
            where: {
                email
            }
        });

    expect(user).not.toBeNull();

    return user;
};

const assignVerificationToken =
    async ({
        user,
        rawToken,
        expiresAt =
        new Date(
            Date.now() +
            24 * 60 * 60 * 1000
        )
    }) => {
        user.emailVerificationToken =
            hashToken(rawToken);

        user.emailVerificationExpiresAt =
            expiresAt;

        user.emailVerified = false;

        await user.save();

        return user;
    };

const verifyEmail = (token) =>
    request(app)
        .post("/api/auth/verify-email")
        .send({
            token
        });

const resendVerification = (email) =>
    request(app)
        .post(
            "/api/auth/resend-verification"
        )
        .send({
            email
        });

describe("Email Verification API", () => {
    beforeEach(cleanup);
    afterEach(cleanup);

    describe(
        "POST /api/auth/verify-email",
        () => {
            it(
                "should verify email successfully with a valid token",
                async () => {
                    const email =
                        createEmail(
                            "success"
                        );

                    const rawToken =
                        createVerificationToken();

                    const user =
                        await registerUser(
                            email
                        );

                    await assignVerificationToken(
                        {
                            user,
                            rawToken
                        }
                    );

                    const response =
                        await verifyEmail(
                            rawToken
                        ).expect(200);

                    expect(
                        response.body.success
                    ).toBe(true);

                    expect(
                        response.body.message
                    ).toBe(
                        "Email verified successfully."
                    );

                    expect(
                        response.body.data
                    ).toEqual({});
                }
            );

            it(
                "should mark the user email as verified",
                async () => {
                    const email =
                        createEmail(
                            "verified"
                        );

                    const rawToken =
                        createVerificationToken();

                    const user =
                        await registerUser(
                            email
                        );

                    await assignVerificationToken(
                        {
                            user,
                            rawToken
                        }
                    );

                    await verifyEmail(
                        rawToken
                    ).expect(200);

                    await user.reload();

                    expect(
                        user.emailVerificationToken
                    ).toBeNull();

                    expect(
                        user.emailVerificationExpiresAt
                    ).toBeNull();
                }
            );

            it(
                "should clear verification token after successful verification",
                async () => {
                    const email =
                        createEmail(
                            "clear-token"
                        );

                    const rawToken =
                        createVerificationToken();

                    const user =
                        await registerUser(
                            email
                        );

                    await assignVerificationToken(
                        {
                            user,
                            rawToken
                        }
                    );

                    await verifyEmail(
                        rawToken
                    ).expect(200);

                    await user.reload();

                    expect(
                        user.emailVerificationToken
                    ).toBeNull();

                    expect(
                        user.emailVerificationExpiresAt
                    ).toBeNull();
                }
            );

            it(
                "should reject an invalid verification token",
                async () => {
                    const email =
                        createEmail(
                            "invalid"
                        );

                    await registerUser(
                        email
                    );

                    const invalidToken =
                        createVerificationToken();

                    const response =
                        await verifyEmail(
                            invalidToken
                        ).expect(400);

                    expect(
                        response.body.success
                    ).toBe(false);

                    expect(
                        response.body.code
                    ).toBe(
                        "INVALID_VERIFICATION_TOKEN"
                    );
                }
            );

            it(
                "should reject an expired verification token",
                async () => {
                    const email =
                        createEmail(
                            "expired"
                        );

                    const rawToken =
                        createVerificationToken();

                    const user =
                        await registerUser(
                            email
                        );

                    await assignVerificationToken(
                        {
                            user,
                            rawToken,
                            expiresAt:
                                new Date(
                                    Date.now() -
                                    60000
                                )
                        }
                    );

                    const response =
                        await verifyEmail(
                            rawToken
                        ).expect(400);

                    expect(
                        response.body.success
                    ).toBe(false);

                    expect(
                        response.body.code
                    ).toBe(
                        "VERIFICATION_TOKEN_EXPIRED"
                    );
                }
            );

            it(
                "should reject request when token is missing",
                async () => {
                    const response =
                        await request(app)
                            .post(
                                "/api/auth/verify-email"
                            )
                            .send({})
                            .expect(422);

                    expect(
                        response.body.success
                    ).toBe(false);

                    expect(
                        response.body.code
                    ).toBeDefined();
                }
            );

            it(
                "should reject request when token format is invalid",
                async () => {
                    const response =
                        await request(app)
                            .post(
                                "/api/auth/verify-email"
                            )
                            .send({
                                token:
                                    "invalid-token"
                            })
                            .expect(422);

                    expect(
                        response.body.success
                    ).toBe(false);

                    expect(
                        response.body.code
                    ).toBeDefined();
                }
            );

            it(
                "should not allow verification token reuse",
                async () => {
                    const email =
                        createEmail(
                            "reuse"
                        );

                    const rawToken =
                        createVerificationToken();

                    const user =
                        await registerUser(
                            email
                        );

                    await assignVerificationToken(
                        {
                            user,
                            rawToken
                        }
                    );

                    await verifyEmail(
                        rawToken
                    ).expect(200);

                    const response =
                        await verifyEmail(
                            rawToken
                        ).expect(400);

                    expect(
                        response.body.success
                    ).toBe(false);

                    expect(
                        response.body.code
                    ).toBe(
                        "INVALID_VERIFICATION_TOKEN"
                    );
                }
            );

            it(
                "should not expose the verification token in the response",
                async () => {
                    const email =
                        createEmail(
                            "response"
                        );

                    const rawToken =
                        createVerificationToken();

                    const user =
                        await registerUser(
                            email
                        );

                    await assignVerificationToken(
                        {
                            user,
                            rawToken
                        }
                    );

                    const response =
                        await verifyEmail(
                            rawToken
                        ).expect(200);

                    expect(
                        response.body.success
                    ).toBe(true);

                    expect(
                        response.body.data
                    ).toEqual({});

                    expect(
                        response.body.data
                            ?.token
                    ).toBeUndefined();

                    expect(
                        response.body.data
                            ?.emailVerificationToken
                    ).toBeUndefined();
                }
            );
        }
    );

    describe(
        "POST /api/auth/resend-verification",
        () => {
            it(
                "should resend verification email for an unverified account",
                async () => {
                    const email =
                        createEmail(
                            "resend-success"
                        );

                    const user =
                        await registerUser(
                            email
                        );

                    const response =
                        await resendVerification(
                            email
                        ).expect(200);

                    expect(
                        response.body.success
                    ).toBe(true);

                    expect(
                        response.body.message
                    ).toBe(
                        GENERIC_VERIFICATION_MESSAGE
                    );

                    expect(
                        response.body.data
                    ).toEqual({});

                    await user.reload();

                    expect(
                        user.emailVerificationToken
                    ).toEqual(
                        expect.any(String)
                    );

                    expect(
                        user.emailVerificationToken
                            .length
                    ).toBeGreaterThan(0);

                    expect(
                        user.emailVerificationExpiresAt
                    ).not.toBeNull();
                }
            );

            it(
                "should return a generic response for an already verified account",
                async () => {
                    const email =
                        createEmail(
                            "already-verified"
                        );

                    const user =
                        await registerUser(
                            email
                        );

                    user.status = "ACTIVE";
                    user.emailVerified = true;
                    user.emailVerifiedAt =
                        new Date();

                    user.emailVerificationToken =
                        null;

                    user.emailVerificationExpiresAt =
                        null;

                    await user.save();

                    const response =
                        await resendVerification(
                            email
                        ).expect(200);

                    expect(
                        response.body.success
                    ).toBe(true);

                    expect(
                        response.body.message
                    ).toBe(
                        GENERIC_VERIFICATION_MESSAGE
                    );

                    expect(
                        response.body.data
                    ).toEqual({});

                    await user.reload();

                    expect(
                        user.emailVerificationToken
                    ).toBeNull();

                    expect(
                        user.emailVerificationExpiresAt
                    ).toBeNull();
                }
            );

            it(
                "should reject resend request when email is missing",
                async () => {
                    const response =
                        await request(app)
                            .post(
                                "/api/auth/resend-verification"
                            )
                            .send({})
                            .expect(422);

                    expect(
                        response.body.success
                    ).toBe(false);

                    expect(
                        response.body.code
                    ).toBeDefined();
                }
            );

            it(
                "should reject resend request when email format is invalid",
                async () => {
                    const response =
                        await request(app)
                            .post(
                                "/api/auth/resend-verification"
                            )
                            .send({
                                email:
                                    "invalid-email"
                            })
                            .expect(422);

                    expect(
                        response.body.success
                    ).toBe(false);

                    expect(
                        response.body.code
                    ).toBeDefined();
                }
            );

            it(
                "should return a generic success response for an unknown email",
                async () => {
                    const email =
                        createEmail(
                            "unknown"
                        );

                    const response =
                        await resendVerification(
                            email
                        ).expect(200);

                    expect(
                        response.body.success
                    ).toBe(true);

                    expect(
                        response.body.message
                    ).toBe(
                        GENERIC_VERIFICATION_MESSAGE
                    );

                    expect(
                        response.body.data
                    ).toEqual({});

                    const user =
                        await User.unscoped().findOne({
                            where: {
                                email
                            }
                        });

                    expect(user).toBeNull();
                }
            );

            it(
                "should replace the previous verification token",
                async () => {
                    const email =
                        createEmail(
                            "replace-token"
                        );

                    const user =
                        await registerUser(
                            email
                        );

                    await resendVerification(
                        email
                    ).expect(200);

                    await user.reload();

                    const firstToken =
                        user.emailVerificationToken;

                    const firstExpiry =
                        user.emailVerificationExpiresAt;

                    expect(
                        firstToken
                    ).toEqual(
                        expect.any(String)
                    );

                    expect(
                        firstExpiry
                    ).not.toBeNull();

                    await resendVerification(
                        email
                    ).expect(200);

                    await user.reload();

                    const secondToken =
                        user.emailVerificationToken;

                    const secondExpiry =
                        user.emailVerificationExpiresAt;

                    expect(
                        secondToken
                    ).toEqual(
                        expect.any(String)
                    );

                    expect(
                        secondExpiry
                    ).not.toBeNull();

                    expect(
                        secondToken
                    ).not.toBe(
                        firstToken
                    );
                },
                15000
            );
        }
    );
});
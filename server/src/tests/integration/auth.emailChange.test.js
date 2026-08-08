import crypto from "node:crypto";

import request from "supertest";
import { Op } from "sequelize";

import app from "../../app.js";

import User from "../../models/user.model.js";
import UserSession from "../../models/userSession.model.js";

import { hashToken } from "../../utils/token.util.js";

const PASSWORD =
    "Strong@Password123";

const CLIENT_ORIGIN =
    "http://localhost:5173";

const TEST_EMAIL_PREFIX =
    "ec.";

let emailSequence = 0;

const createEmail = (label) => {
    emailSequence += 1;

    return `${TEST_EMAIL_PREFIX}${label}.${Date.now()}.${emailSequence}@example.com`;
};

const createToken = () => {
    return crypto
        .randomBytes(32)
        .toString("hex");
};

const createTestIp = () => {
    const randomPart =
        Math.floor(
            Math.random() * 200
        ) + 20;

    return `127.0.0.${randomPart}`;
};

const cleanup = async () => {
    const users =
        await User.unscoped().findAll({
            where: {
                [Op.or]: [
                    {
                        email: {
                            [Op.like]:
                                `${TEST_EMAIL_PREFIX}%`
                        }
                    },
                    {
                        pendingEmail: {
                            [Op.like]:
                                `${TEST_EMAIL_PREFIX}%`
                        }
                    }
                ]
            },
            attributes: ["id"]
        });

    const userIds =
        users.map((user) => user.id);

    if (userIds.length === 0) {
        return;
    }

    await UserSession
        .unscoped()
        .destroy({
            where: {
                userId: {
                    [Op.in]: userIds
                }
            },
            force: true
        });

    await User
        .unscoped()
        .destroy({
            where: {
                id: {
                    [Op.in]: userIds
                }
            },
            force: true
        });
};

const registerAndActivateUser =
    async ({
        email,
        password = PASSWORD
    }) => {
        await request(app)
            .post(
                "/api/auth/register/job-seeker"
            )
            .set(
                "X-Forwarded-For",
                createTestIp()
            )
            .send({
                email,
                password
            })
            .expect(201);

        const user =
            await User
                .unscoped()
                .findOne({
                    where: {
                        email
                    }
                });

        expect(user).not.toBeNull();

        await user.update({
            status: "ACTIVE",
            emailVerifiedAt: new Date(),
            emailVerificationToken: null,
            emailVerificationExpiresAt: null
        });

        return user;
    };

const loginUser = async ({
    email,
    password = PASSWORD
}) => {
    const response =
        await request(app)
            .post("/api/auth/login")
            .set(
                "X-Forwarded-For",
                createTestIp()
            )
            .send({
                email,
                password
            })
            .expect(200);

    expect(
        response.body.data.accessToken
    ).toEqual(
        expect.any(String)
    );

    return {
        accessToken:
            response.body.data.accessToken,

        cookies:
            response.headers["set-cookie"]
    };
};

const createActiveAuthenticatedUser =
    async (label) => {
        const email =
            createEmail(label);

        const user =
            await registerAndActivateUser({
                email
            });

        const login =
            await loginUser({
                email
            });

        return {
            user,
            email,
            accessToken:
                login.accessToken,
            cookies:
                login.cookies
        };
    };

const setEmailChangeRequest =
    async ({
        user,
        pendingEmail,
        rawToken,
        expiresAt
    }) => {
        const hashedToken =
            hashToken(rawToken);

        await user.update({
            pendingEmail,
            emailChangeToken:
                hashedToken,
            emailChangeExpiresAt:
                expiresAt
        });

        return hashedToken;
    };

describe(
    "Email Change API",
    () => {
        beforeEach(async () => {
            await cleanup();
        });

        afterEach(async () => {
            await cleanup();
        });

        describe(
            "POST /api/auth/request-email-change",
            () => {
                it(
                    "should reject an unauthenticated email-change request",
                    async () => {
                        const response =
                            await request(app)
                                .post(
                                    "/api/auth/request-email-change"
                                )
                                .set(
                                    "Origin",
                                    CLIENT_ORIGIN
                                )
                                .set(
                                    "X-Forwarded-For",
                                    createTestIp()
                                )
                                .send({
                                    newEmail:
                                        createEmail(
                                            "unauthenticated"
                                        ),
                                    currentPassword:
                                        PASSWORD
                                })
                                .expect(401);

                        expect(
                            response.body.success
                        ).toBe(false);
                    }
                );

                it(
                    "should reject an invalid new email",
                    async () => {
                        const {
                            accessToken
                        } =
                            await createActiveAuthenticatedUser(
                                "invalid-email"
                            );

                        const response =
                            await request(app)
                                .post(
                                    "/api/auth/request-email-change"
                                )
                                .set(
                                    "Origin",
                                    CLIENT_ORIGIN
                                )
                                .set(
                                    "Authorization",
                                    `Bearer ${accessToken}`
                                )
                                .set(
                                    "X-Forwarded-For",
                                    createTestIp()
                                )
                                .send({
                                    newEmail:
                                        "invalid-email",
                                    currentPassword:
                                        PASSWORD
                                })
                                .expect(422);

                        expect(
                            response.body.success
                        ).toBe(false);

                        expect(
                            response.body.errors
                        ).toBeDefined();
                    }
                );

                it(
                    "should reject when current password is missing",
                    async () => {
                        const {
                            accessToken
                        } =
                            await createActiveAuthenticatedUser(
                                "missing-password"
                            );

                        const response =
                            await request(app)
                                .post(
                                    "/api/auth/request-email-change"
                                )
                                .set(
                                    "Origin",
                                    CLIENT_ORIGIN
                                )
                                .set(
                                    "Authorization",
                                    `Bearer ${accessToken}`
                                )
                                .set(
                                    "X-Forwarded-For",
                                    createTestIp()
                                )
                                .send({
                                    newEmail:
                                        createEmail(
                                            "missing-password-new"
                                        )
                                })
                                .expect(422);

                        expect(
                            response.body.success
                        ).toBe(false);

                        expect(
                            response.body.errors
                        ).toBeDefined();
                    }
                );

                it(
                    "should reject an incorrect current password",
                    async () => {
                        const {
                            accessToken
                        } =
                            await createActiveAuthenticatedUser(
                                "wrong-password"
                            );

                        const response =
                            await request(app)
                                .post(
                                    "/api/auth/request-email-change"
                                )
                                .set(
                                    "Origin",
                                    CLIENT_ORIGIN
                                )
                                .set(
                                    "Authorization",
                                    `Bearer ${accessToken}`
                                )
                                .set(
                                    "X-Forwarded-For",
                                    createTestIp()
                                )
                                .send({
                                    newEmail:
                                        createEmail(
                                            "wrong-password-new"
                                        ),
                                    currentPassword:
                                        "Wrong@Password123"
                                })
                                .expect(400);

                        expect(
                            response.body.success
                        ).toBe(false);

                        expect(
                            response.body.code
                        ).toBe(
                            "INVALID_CURRENT_PASSWORD"
                        );
                    }
                );

                it(
                    "should reject the current email as the new email",
                    async () => {
                        const {
                            email,
                            accessToken
                        } =
                            await createActiveAuthenticatedUser(
                                "same-email"
                            );

                        const response =
                            await request(app)
                                .post(
                                    "/api/auth/request-email-change"
                                )
                                .set(
                                    "Origin",
                                    CLIENT_ORIGIN
                                )
                                .set(
                                    "Authorization",
                                    `Bearer ${accessToken}`
                                )
                                .set(
                                    "X-Forwarded-For",
                                    createTestIp()
                                )
                                .send({
                                    newEmail: email,
                                    currentPassword:
                                        PASSWORD
                                })
                                .expect(400);

                        expect(
                            response.body.code
                        ).toBe(
                            "EMAIL_CHANGE_SAME_AS_CURRENT"
                        );
                    }
                );

                it(
                    "should reject a new email already used by another user",
                    async () => {
                        const first =
                            await createActiveAuthenticatedUser(
                                "duplicate-source"
                            );

                        const usedEmail =
                            createEmail(
                                "duplicate-target"
                            );

                        await registerAndActivateUser({
                            email: usedEmail
                        });

                        const response =
                            await request(app)
                                .post(
                                    "/api/auth/request-email-change"
                                )
                                .set(
                                    "Origin",
                                    CLIENT_ORIGIN
                                )
                                .set(
                                    "Authorization",
                                    `Bearer ${first.accessToken}`
                                )
                                .set(
                                    "X-Forwarded-For",
                                    createTestIp()
                                )
                                .send({
                                    newEmail:
                                        usedEmail,
                                    currentPassword:
                                        PASSWORD
                                })
                                .expect(409);

                        expect(
                            response.body.code
                        ).toBe(
                            "EMAIL_ALREADY_EXISTS"
                        );
                    }
                );

                it(
                    "should accept a valid email-change request",
                    async () => {
                        const {
                            user,
                            email,
                            accessToken
                        } =
                            await createActiveAuthenticatedUser(
                                "request-success"
                            );

                        const newEmail =
                            createEmail(
                                "request-success-new"
                            );

                        const response =
                            await request(app)
                                .post(
                                    "/api/auth/request-email-change"
                                )
                                .set(
                                    "Origin",
                                    CLIENT_ORIGIN
                                )
                                .set(
                                    "Authorization",
                                    `Bearer ${accessToken}`
                                )
                                .set(
                                    "X-Forwarded-For",
                                    createTestIp()
                                )
                                .send({
                                    newEmail,
                                    currentPassword:
                                        PASSWORD
                                })
                                .expect(200);

                        expect(
                            response.body.success
                        ).toBe(true);

                        expect(
                            response.body.message
                        ).toBe(
                            "A verification link has been sent to your new email address."
                        );

                        const updatedUser =
                            await User
                                .scope(
                                    "withAuthenticationFields"
                                )
                                .findByPk(user.id);

                        expect(
                            updatedUser.email
                        ).toBe(email);

                        expect(
                            updatedUser.pendingEmail
                        ).toBe(newEmail);

                        expect(
                            updatedUser.emailChangeToken
                        ).toEqual(
                            expect.any(String)
                        );

                        expect(
                            updatedUser.emailChangeToken
                        ).toHaveLength(64);

                        expect(
                            updatedUser.emailChangeExpiresAt
                        ).toBeInstanceOf(Date);
                    }
                );

                it(
                    "should not expose email-change security fields in the response",
                    async () => {
                        const {
                            accessToken
                        } =
                            await createActiveAuthenticatedUser(
                                "response-security"
                            );

                        const response =
                            await request(app)
                                .post(
                                    "/api/auth/request-email-change"
                                )
                                .set(
                                    "Origin",
                                    CLIENT_ORIGIN
                                )
                                .set(
                                    "Authorization",
                                    `Bearer ${accessToken}`
                                )
                                .set(
                                    "X-Forwarded-For",
                                    createTestIp()
                                )
                                .send({
                                    newEmail:
                                        createEmail(
                                            "response-security-new"
                                        ),
                                    currentPassword:
                                        PASSWORD
                                })
                                .expect(200);

                        const serialized =
                            JSON.stringify(
                                response.body
                            );

                        expect(
                            serialized
                        ).not.toContain(
                            "emailChangeToken"
                        );

                        expect(
                            serialized
                        ).not.toContain(
                            "emailChangeExpiresAt"
                        );

                        expect(
                            serialized
                        ).not.toContain(
                            "pendingEmail"
                        );
                    }
                );
            }
        );

        describe(
            "POST /api/auth/verify-email-change",
            () => {
                it(
                    "should reject a malformed verification token",
                    async () => {
                        const response =
                            await request(app)
                                .post(
                                    "/api/auth/verify-email-change"
                                )
                                .set(
                                    "X-Forwarded-For",
                                    createTestIp()
                                )
                                .send({
                                    token:
                                        "invalid-token"
                                })
                                .expect(422);

                        expect(
                            response.body.success
                        ).toBe(false);
                    }
                );

                it(
                    "should reject an unknown valid-format verification token",
                    async () => {
                        const response =
                            await request(app)
                                .post(
                                    "/api/auth/verify-email-change"
                                )
                                .set(
                                    "X-Forwarded-For",
                                    createTestIp()
                                )
                                .send({
                                    token:
                                        createToken()
                                })
                                .expect(400);

                        expect(
                            response.body.code
                        ).toBe(
                            "INVALID_EMAIL_CHANGE_TOKEN"
                        );
                    }
                );

                it(
                    "should reject an expired email-change token and clear the request",
                    async () => {
                        const {
                            user
                        } =
                            await createActiveAuthenticatedUser(
                                "expired"
                            );

                        const rawToken =
                            createToken();

                        const newEmail =
                            createEmail(
                                "expired-new"
                            );

                        await setEmailChangeRequest({
                            user,
                            pendingEmail:
                                newEmail,
                            rawToken,
                            expiresAt:
                                new Date(
                                    Date.now() -
                                    60 * 1000
                                )
                        });

                        const response =
                            await request(app)
                                .post(
                                    "/api/auth/verify-email-change"
                                )
                                .set(
                                    "X-Forwarded-For",
                                    createTestIp()
                                )
                                .send({
                                    token: rawToken
                                })
                                .expect(400);

                        expect(
                            response.body.code
                        ).toBe(
                            "EMAIL_CHANGE_TOKEN_EXPIRED"
                        );

                        const updatedUser =
                            await User
                                .scope(
                                    "withAuthenticationFields"
                                )
                                .findByPk(user.id);

                        expect(
                            updatedUser.pendingEmail
                        ).toBeNull();

                        expect(
                            updatedUser.emailChangeToken
                        ).toBeNull();

                        expect(
                            updatedUser.emailChangeExpiresAt
                        ).toBeNull();
                    }
                );

                it(
                    "should reject verification when the pending email becomes occupied",
                    async () => {
                        const first =
                            await createActiveAuthenticatedUser(
                                "occupied-source"
                            );

                        const pendingEmail =
                            createEmail(
                                "occupied-target"
                            );

                        const rawToken =
                            createToken();

                        await setEmailChangeRequest({
                            user: first.user,
                            pendingEmail,
                            rawToken,
                            expiresAt:
                                new Date(
                                    Date.now() +
                                    30 * 60 * 1000
                                )
                        });

                        await registerAndActivateUser({
                            email:
                                pendingEmail
                        });

                        const response =
                            await request(app)
                                .post(
                                    "/api/auth/verify-email-change"
                                )
                                .set(
                                    "X-Forwarded-For",
                                    createTestIp()
                                )
                                .send({
                                    token:
                                        rawToken
                                })
                                .expect(409);

                        expect(
                            response.body.code
                        ).toBe(
                            "EMAIL_ALREADY_EXISTS"
                        );

                        const updatedUser =
                            await User
                                .scope(
                                    "withAuthenticationFields"
                                )
                                .findByPk(
                                    first.user.id
                                );

                        expect(
                            updatedUser.pendingEmail
                        ).toBeNull();

                        expect(
                            updatedUser.emailChangeToken
                        ).toBeNull();
                    }
                );

                it(
                    "should change the email successfully and clear email-change fields",
                    async () => {
                        const {
                            user,
                            email
                        } =
                            await createActiveAuthenticatedUser(
                                "verify-success"
                            );

                        const newEmail =
                            createEmail(
                                "verify-success-new"
                            );

                        const rawToken =
                            createToken();

                        await setEmailChangeRequest({
                            user,
                            pendingEmail:
                                newEmail,
                            rawToken,
                            expiresAt:
                                new Date(
                                    Date.now() +
                                    30 * 60 * 1000
                                )
                        });

                        const response =
                            await request(app)
                                .post(
                                    "/api/auth/verify-email-change"
                                )
                                .set(
                                    "X-Forwarded-For",
                                    createTestIp()
                                )
                                .send({
                                    token:
                                        rawToken
                                })
                                .expect(200);

                        expect(
                            response.body.success
                        ).toBe(true);

                        expect(
                            response.body.message
                        ).toBe(
                            "Email changed successfully. Please log in again using your new email."
                        );

                        const updatedUser =
                            await User
                                .scope(
                                    "withAuthenticationFields"
                                )
                                .findByPk(user.id);

                        expect(
                            updatedUser.email
                        ).toBe(newEmail);

                        expect(
                            updatedUser.email
                        ).not.toBe(email);

                        expect(
                            updatedUser.pendingEmail
                        ).toBeNull();

                        expect(
                            updatedUser.emailChangeToken
                        ).toBeNull();

                        expect(
                            updatedUser.emailChangeExpiresAt
                        ).toBeNull();
                    }
                );

                it(
                    "should revoke all sessions after a successful email change",
                    async () => {
                        const {
                            user,
                            email
                        } =
                            await createActiveAuthenticatedUser(
                                "session-revoke"
                            );

                        await loginUser({
                            email
                        });

                        const activeSessionsBefore =
                            await UserSession.count({
                                where: {
                                    userId:
                                        user.id,
                                    revokedAt:
                                        null
                                }
                            });

                        expect(
                            activeSessionsBefore
                        ).toBeGreaterThan(0);

                        const rawToken =
                            createToken();

                        const newEmail =
                            createEmail(
                                "session-revoke-new"
                            );

                        await setEmailChangeRequest({
                            user,
                            pendingEmail:
                                newEmail,
                            rawToken,
                            expiresAt:
                                new Date(
                                    Date.now() +
                                    30 * 60 * 1000
                                )
                        });

                        await request(app)
                            .post(
                                "/api/auth/verify-email-change"
                            )
                            .set(
                                "X-Forwarded-For",
                                createTestIp()
                            )
                            .send({
                                token:
                                    rawToken
                            })
                            .expect(200);

                        const activeSessionsAfter =
                            await UserSession.count({
                                where: {
                                    userId:
                                        user.id,
                                    revokedAt:
                                        null
                                }
                            });

                        expect(
                            activeSessionsAfter
                        ).toBe(0);

                        const sessions =
                            await UserSession
                                .unscoped()
                                .findAll({
                                    where: {
                                        userId:
                                            user.id
                                    }
                                });

                        expect(
                            sessions.length
                        ).toBeGreaterThan(0);

                        for (
                            const session
                            of sessions
                        ) {
                            expect(
                                session.revokedAt
                            ).not.toBeNull();

                            expect(
                                session.revocationReason
                            ).toBe(
                                "EMAIL_CHANGED"
                            );
                        }
                    }
                );

                it(
                    "should clear the refresh-token cookie after successful verification",
                    async () => {
                        const {
                            user
                        } =
                            await createActiveAuthenticatedUser(
                                "cookie-clear"
                            );

                        const rawToken =
                            createToken();

                        await setEmailChangeRequest({
                            user,
                            pendingEmail:
                                createEmail(
                                    "cookie-clear-new"
                                ),
                            rawToken,
                            expiresAt:
                                new Date(
                                    Date.now() +
                                    30 * 60 * 1000
                                )
                        });

                        const response =
                            await request(app)
                                .post(
                                    "/api/auth/verify-email-change"
                                )
                                .set(
                                    "X-Forwarded-For",
                                    createTestIp()
                                )
                                .send({
                                    token:
                                        rawToken
                                })
                                .expect(200);

                        const cookies =
                            response.headers[
                            "set-cookie"
                            ];

                        expect(
                            cookies
                        ).toBeDefined();

                        expect(
                            cookies.some(
                                (cookie) =>
                                    cookie.startsWith(
                                        "refreshToken="
                                    )
                            )
                        ).toBe(true);
                    }
                );

                it(
                    "should not allow the verification token to be reused",
                    async () => {
                        const {
                            user
                        } =
                            await createActiveAuthenticatedUser(
                                "reuse"
                            );

                        const rawToken =
                            createToken();

                        await setEmailChangeRequest({
                            user,
                            pendingEmail:
                                createEmail(
                                    "reuse-new"
                                ),
                            rawToken,
                            expiresAt:
                                new Date(
                                    Date.now() +
                                    30 * 60 * 1000
                                )
                        });

                        await request(app)
                            .post(
                                "/api/auth/verify-email-change"
                            )
                            .set(
                                "X-Forwarded-For",
                                createTestIp()
                            )
                            .send({
                                token:
                                    rawToken
                            })
                            .expect(200);

                        const reusedResponse =
                            await request(app)
                                .post(
                                    "/api/auth/verify-email-change"
                                )
                                .set(
                                    "X-Forwarded-For",
                                    createTestIp()
                                )
                                .send({
                                    token:
                                        rawToken
                                })
                                .expect(400);

                        expect(
                            reusedResponse.body.code
                        ).toBe(
                            "INVALID_EMAIL_CHANGE_TOKEN"
                        );
                    }
                );

                it(
                    "should reject login with the old email and allow login with the new email",
                    async () => {
                        const {
                            user,
                            email: oldEmail
                        } =
                            await createActiveAuthenticatedUser(
                                "login-switch"
                            );

                        const newEmail =
                            createEmail(
                                "login-switch-new"
                            );

                        const rawToken =
                            createToken();

                        await setEmailChangeRequest({
                            user,
                            pendingEmail:
                                newEmail,
                            rawToken,
                            expiresAt:
                                new Date(
                                    Date.now() +
                                    30 * 60 * 1000
                                )
                        });

                        await request(app)
                            .post(
                                "/api/auth/verify-email-change"
                            )
                            .set(
                                "X-Forwarded-For",
                                createTestIp()
                            )
                            .send({
                                token:
                                    rawToken
                            })
                            .expect(200);

                        const oldLogin =
                            await request(app)
                                .post(
                                    "/api/auth/login"
                                )
                                .set(
                                    "X-Forwarded-For",
                                    createTestIp()
                                )
                                .send({
                                    email:
                                        oldEmail,
                                    password:
                                        PASSWORD
                                })
                                .expect(401);

                        expect(
                            oldLogin.body.code
                        ).toBe(
                            "INVALID_CREDENTIALS"
                        );

                        const newLogin =
                            await request(app)
                                .post(
                                    "/api/auth/login"
                                )
                                .set(
                                    "X-Forwarded-For",
                                    createTestIp()
                                )
                                .send({
                                    email:
                                        newEmail,
                                    password:
                                        PASSWORD
                                })
                                .expect(200);

                        expect(
                            newLogin.body.success
                        ).toBe(true);

                        expect(
                            newLogin.body.data.user.email
                        ).toBe(newEmail);
                    }
                );
            }
        );
    }
);
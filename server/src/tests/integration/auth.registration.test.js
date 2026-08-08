import request from "supertest";
import { Op } from "sequelize";

import app from "../../app.js";
import User from "../../models/user.model.js";
import UserSession from "../../models/userSession.model.js";

const TEST_EMAIL_PREFIX =
    "registration.integration.";

const validPassword = "Strong@Password123";

const createTestEmail = (label) => {
    return `${TEST_EMAIL_PREFIX}${label}.${Date.now()}@example.com`;
};

const removeRegistrationTestData = async () => {
    try {
        const users = await User.unscoped().findAll({
            where: {
                email: {
                    [Op.like]: `${TEST_EMAIL_PREFIX}%`
                }
            },
            attributes: ["id"]
        });

        const userIds = users.map((user) => user.id);

        if (userIds.length > 0) {
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
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
};

describe("Job Seeker Registration API", () => {
    beforeEach(async () => {
        await removeRegistrationTestData();
    });

    afterEach(async () => {
        await removeRegistrationTestData();
    });

    describe(
        "POST /api/auth/register/job-seeker",
        () => {
            it(
                "should register a job seeker successfully",
                async () => {
                    const email =
                        createTestEmail("success");

                    const response = await request(app)
                        .post(
                            "/api/auth/register/job-seeker"
                        )
                        .send({
                            email,
                            password: validPassword
                        })
                        .expect("Content-Type", /json/)
                        .expect(201);

                    expect(response.body.success).toBe(
                        true
                    );

                    expect(response.body.message).toBe(
                        "Job seeker registered successfully."
                    );

                    expect(response.body.data).toBeDefined();

                    expect(
                        response.body.data.accessToken
                    ).toEqual(expect.any(String));

                    expect(
                        response.body.data.user
                    ).toMatchObject({
                        email,
                        role: "JOB_SEEKER",
                        status: "PENDING_VERIFICATION"
                    });

                    expect(
                        response.body.data.user.passwordHash
                    ).toBeUndefined();
                }
            );

            it(
                "should store the registered user in the database",
                async () => {
                    const email =
                        createTestEmail("database");

                    await request(app)
                        .post(
                            "/api/auth/register/job-seeker"
                        )
                        .send({
                            email,
                            password: validPassword
                        })
                        .expect(201);

                    const user = await User
                        .scope("withPassword")
                        .findOne({
                            where: {
                                email
                            }
                        });

                    expect(user).not.toBeNull();
                    expect(user.email).toBe(email);
                    expect(user.role).toBe(
                        "JOB_SEEKER"
                    );
                    expect(user.status).toBe(
                        "PENDING_VERIFICATION"
                    );

                    expect(user.passwordHash).toEqual(
                        expect.any(String)
                    );

                    expect(user.passwordHash).not.toBe(
                        validPassword
                    );

                    const passwordMatched =
                        await user.comparePassword(
                            validPassword
                        );

                    expect(passwordMatched).toBe(true);
                }
            );

            it(
                "should create a user session",
                async () => {
                    const email =
                        createTestEmail("session");

                    await request(app)
                        .post(
                            "/api/auth/register/job-seeker"
                        )
                        .set(
                            "User-Agent",
                            "CareerForge Integration Test"
                        )
                        .send({
                            email,
                            password: validPassword
                        })
                        .expect(201);

                    const user = await User.findOne({
                        where: {
                            email
                        }
                    });

                    expect(user).not.toBeNull();

                    const sessions =
                        await UserSession
                            .scope("withRefreshTokenHash")
                            .findAll({
                                where: {
                                    userId: user.id
                                }
                            });

                    expect(sessions).toHaveLength(1);

                    expect(
                        sessions[0].refreshTokenHash
                    ).toEqual(expect.any(String));

                    expect(
                        sessions[0].refreshTokenHash
                    ).toHaveLength(64);

                    expect(
                        sessions[0].expiresAt
                    ).toBeInstanceOf(Date);

                    expect(
                        sessions[0].revokedAt
                    ).toBeNull();
                }
            );

            it(
                "should return the refresh token as an HTTP-only cookie",
                async () => {
                    const email =
                        createTestEmail("cookie");

                    const response = await request(app)
                        .post(
                            "/api/auth/register/job-seeker"
                        )
                        .send({
                            email,
                            password: validPassword
                        })
                        .expect(201);

                    const cookies =
                        response.headers["set-cookie"];

                    expect(cookies).toBeDefined();
                    expect(Array.isArray(cookies)).toBe(
                        true
                    );

                    const refreshCookie =
                        cookies.find((cookie) =>
                            cookie.includes("HttpOnly")
                        );

                    expect(refreshCookie).toBeDefined();
                    expect(refreshCookie).toMatch(
                        /HttpOnly/i
                    );
                }
            );

            it(
                "should reject a duplicate email",
                async () => {
                    const email =
                        createTestEmail("duplicate");

                    await request(app)
                        .post(
                            "/api/auth/register/job-seeker"
                        )
                        .send({
                            email,
                            password: validPassword
                        })
                        .expect(201);

                    const response = await request(app)
                        .post(
                            "/api/auth/register/job-seeker"
                        )
                        .send({
                            email,
                            password: validPassword
                        })
                        .expect(409);

                    expect(response.body.success).toBe(
                        false
                    );

                    expect(response.body.message).toBe(
                        "Email already registered."
                    );

                    expect(response.body.code).toBe(
                        "EMAIL_ALREADY_EXISTS"
                    );

                    const userCount = await User.count({
                        where: {
                            email
                        }
                    });

                    expect(userCount).toBe(1);
                }
            );

            it(
                "should reject an invalid email address",
                async () => {
                    const response = await request(app)
                        .post(
                            "/api/auth/register/job-seeker"
                        )
                        .send({
                            email: "invalid-email",
                            password: validPassword
                        })
                        .expect(422);

                    expect(response.body.success).toBe(
                        false
                    );

                    expect(
                        response.body.errors
                    ).toBeDefined();
                }
            );

            it(
                "should reject a weak password",
                async () => {
                    const email =
                        createTestEmail(
                            "weak-password"
                        );

                    const response = await request(app)
                        .post(
                            "/api/auth/register/job-seeker"
                        )
                        .send({
                            email,
                            password: "password"
                        })
                        .expect(422);

                    expect(response.body.success).toBe(
                        false
                    );

                    expect(
                        response.body.errors
                    ).toBeDefined();

                    const user = await User.findOne({
                        where: {
                            email
                        }
                    });

                    expect(user).toBeNull();
                }
            );

            it(
                "should reject registration when email is missing",
                async () => {
                    const response = await request(app)
                        .post(
                            "/api/auth/register/job-seeker"
                        )
                        .send({
                            password: validPassword
                        })
                        .expect(422);

                    expect(response.body.success).toBe(
                        false
                    );

                    expect(
                        response.body.errors
                    ).toBeDefined();
                }
            );

            it(
                "should reject registration when password is missing",
                async () => {
                    const email =
                        createTestEmail(
                            "missing-password"
                        );

                    const response = await request(app)
                        .post(
                            "/api/auth/register/job-seeker"
                        )
                        .send({
                            email
                        })
                        .expect(422);

                    expect(response.body.success).toBe(
                        false
                    );

                    expect(
                        response.body.errors
                    ).toBeDefined();

                    const user = await User.findOne({
                        where: {
                            email
                        }
                    });

                    expect(user).toBeNull();
                }
            );

            it(
                "should prevent role injection and always create a job seeker",
                async () => {
                    const email =
                        createTestEmail(
                            "role-injection"
                        );

                    const response = await request(app)
                        .post(
                            "/api/auth/register/job-seeker"
                        )
                        .send({
                            email,
                            password: validPassword,
                            role: "RECRUITER"
                        })
                        .expect(201);

                    expect(
                        response.body.data.user.role
                    ).toBe("JOB_SEEKER");

                    const user = await User.findOne({
                        where: {
                            email
                        }
                    });

                    expect(user).not.toBeNull();
                    expect(user.role).toBe(
                        "JOB_SEEKER"
                    );
                }
            );
        }
    );
});

describe("Recruiter Registration API", () => {
    beforeEach(async () => {
        await removeRegistrationTestData();
    });

    afterEach(async () => {
        await removeRegistrationTestData();
    });

    describe(
        "POST /api/auth/register/recruiter",
        () => {
            it(
                "should register a recruiter publicly without authentication",
                async () => {
                    const email =
                        createTestEmail(
                            "recruiter-success"
                        );

                    const response = await request(app)
                        .post(
                            "/api/auth/register/recruiter"
                        )
                        .send({
                            email,
                            password: validPassword
                        })
                        .expect("Content-Type", /json/)
                        .expect(201);

                    expect(response.body.success).toBe(
                        true
                    );

                    expect(response.body.message).toBe(
                        "Recruiter registered successfully."
                    );

                    expect(response.body.data).toBeDefined();

                    expect(
                        response.body.data.accessToken
                    ).toEqual(expect.any(String));

                    expect(
                        response.body.data.user
                    ).toMatchObject({
                        email,
                        role: "RECRUITER",
                        status:
                            "PENDING_VERIFICATION"
                    });

                    expect(
                        response.body.data.user.passwordHash
                    ).toBeUndefined();
                }
            );

            it(
                "should store the recruiter with a hashed password",
                async () => {
                    const email =
                        createTestEmail(
                            "recruiter-database"
                        );

                    await request(app)
                        .post(
                            "/api/auth/register/recruiter"
                        )
                        .send({
                            email,
                            password: validPassword
                        })
                        .expect(201);

                    const user = await User
                        .scope("withPassword")
                        .findOne({
                            where: {
                                email
                            }
                        });

                    expect(user).not.toBeNull();
                    expect(user.email).toBe(email);

                    expect(user.role).toBe(
                        "RECRUITER"
                    );

                    expect(user.status).toBe(
                        "PENDING_VERIFICATION"
                    );

                    expect(user.passwordHash).toEqual(
                        expect.any(String)
                    );

                    expect(user.passwordHash).not.toBe(
                        validPassword
                    );

                    const passwordMatched =
                        await user.comparePassword(
                            validPassword
                        );

                    expect(passwordMatched).toBe(true);
                }
            );

            it(
                "should create a recruiter session",
                async () => {
                    const email =
                        createTestEmail(
                            "recruiter-session"
                        );

                    await request(app)
                        .post(
                            "/api/auth/register/recruiter"
                        )
                        .set(
                            "User-Agent",
                            "CareerForge Recruiter Registration Test"
                        )
                        .send({
                            email,
                            password: validPassword
                        })
                        .expect(201);

                    const user =
                        await User.findOne({
                            where: {
                                email
                            }
                        });

                    expect(user).not.toBeNull();

                    const sessions =
                        await UserSession
                            .scope(
                                "withRefreshTokenHash"
                            )
                            .findAll({
                                where: {
                                    userId: user.id
                                }
                            });

                    expect(sessions).toHaveLength(
                        1
                    );

                    expect(
                        sessions[0].refreshTokenHash
                    ).toEqual(expect.any(String));

                    expect(
                        sessions[0].refreshTokenHash
                    ).toHaveLength(64);

                    expect(
                        sessions[0].expiresAt
                    ).toBeInstanceOf(Date);

                    expect(
                        sessions[0].revokedAt
                    ).toBeNull();
                }
            );

            it(
                "should return recruiter refresh token as an HTTP-only cookie",
                async () => {
                    const email =
                        createTestEmail(
                            "recruiter-cookie"
                        );

                    const response = await request(app)
                        .post(
                            "/api/auth/register/recruiter"
                        )
                        .send({
                            email,
                            password: validPassword
                        })
                        .expect(201);

                    const cookies =
                        response.headers["set-cookie"];

                    expect(cookies).toBeDefined();

                    expect(
                        Array.isArray(cookies)
                    ).toBe(true);

                    const refreshCookie =
                        cookies.find((cookie) =>
                            cookie.includes(
                                "HttpOnly"
                            )
                        );

                    expect(
                        refreshCookie
                    ).toBeDefined();

                    expect(
                        refreshCookie
                    ).toMatch(/HttpOnly/i);
                }
            );

            it(
                "should reject a duplicate recruiter email",
                async () => {
                    const email =
                        createTestEmail(
                            "recruiter-duplicate"
                        );

                    await request(app)
                        .post(
                            "/api/auth/register/recruiter"
                        )
                        .send({
                            email,
                            password: validPassword
                        })
                        .expect(201);

                    const response =
                        await request(app)
                            .post(
                                "/api/auth/register/recruiter"
                            )
                            .send({
                                email,
                                password:
                                    validPassword
                            })
                            .expect(409);

                    expect(
                        response.body.success
                    ).toBe(false);

                    expect(
                        response.body.message
                    ).toBe(
                        "Email already registered."
                    );

                    expect(
                        response.body.code
                    ).toBe(
                        "EMAIL_ALREADY_EXISTS"
                    );

                    const userCount =
                        await User.count({
                            where: {
                                email
                            }
                        });

                    expect(userCount).toBe(1);
                }
            );

            it(
                "should reject an invalid recruiter email",
                async () => {
                    const response =
                        await request(app)
                            .post(
                                "/api/auth/register/recruiter"
                            )
                            .send({
                                email:
                                    "invalid-email",
                                password:
                                    validPassword
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
                "should reject a weak recruiter password",
                async () => {
                    const email =
                        createTestEmail(
                            "recruiter-weak-password"
                        );

                    const response =
                        await request(app)
                            .post(
                                "/api/auth/register/recruiter"
                            )
                            .send({
                                email,
                                password:
                                    "password"
                            })
                            .expect(422);

                    expect(
                        response.body.success
                    ).toBe(false);

                    expect(
                        response.body.errors
                    ).toBeDefined();

                    const user =
                        await User.findOne({
                            where: {
                                email
                            }
                        });

                    expect(user).toBeNull();
                }
            );

            it(
                "should reject recruiter registration when email is missing",
                async () => {
                    const response =
                        await request(app)
                            .post(
                                "/api/auth/register/recruiter"
                            )
                            .send({
                                password:
                                    validPassword
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
                "should reject recruiter registration when password is missing",
                async () => {
                    const email =
                        createTestEmail(
                            "recruiter-missing-password"
                        );

                    const response =
                        await request(app)
                            .post(
                                "/api/auth/register/recruiter"
                            )
                            .send({
                                email
                            })
                            .expect(422);

                    expect(
                        response.body.success
                    ).toBe(false);

                    expect(
                        response.body.errors
                    ).toBeDefined();

                    const user =
                        await User.findOne({
                            where: {
                                email
                            }
                        });

                    expect(user).toBeNull();
                }
            );

            it(
                "should reject ADMIN role injection",
                async () => {
                    const email =
                        createTestEmail(
                            "recruiter-admin-injection"
                        );

                    const response =
                        await request(app)
                            .post(
                                "/api/auth/register/recruiter"
                            )
                            .send({
                                email,
                                password:
                                    validPassword,
                                role: "ADMIN"
                            })
                            .expect(422);

                    expect(
                        response.body.success
                    ).toBe(false);

                    expect(
                        response.body.errors
                    ).toBeDefined();

                    const user =
                        await User.findOne({
                            where: {
                                email
                            }
                        });

                    expect(user).toBeNull();
                }
            );

            it(
                "should reject JOB_SEEKER role injection",
                async () => {
                    const email =
                        createTestEmail(
                            "recruiter-job-seeker-injection"
                        );

                    const response =
                        await request(app)
                            .post(
                                "/api/auth/register/recruiter"
                            )
                            .send({
                                email,
                                password:
                                    validPassword,
                                role:
                                    "JOB_SEEKER"
                            })
                            .expect(422);

                    expect(
                        response.body.success
                    ).toBe(false);

                    expect(
                        response.body.errors
                    ).toBeDefined();

                    const user =
                        await User.findOne({
                            where: {
                                email
                            }
                        });

                    expect(user).toBeNull();
                }
            );
        }
    );
});
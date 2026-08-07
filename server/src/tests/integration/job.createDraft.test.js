import request from "supertest";

import {
    Op
} from "sequelize";

import {
    hashPassword
} from "../../utils/password.util.js";

import app from "../../app.js";

import User from
    "../../models/user.model.js";

import UserSession from
    "../../models/userSession.model.js";

import Company from
    "../../models/company.model.js";

import Job from
    "../../models/job.model.js";

const TEST_EMAIL_PREFIX =
    "job.draft.integration.";

const TEST_COMPANY_SLUG_PREFIX =
    "job-draft-integration-";

const PASSWORD =
    "Strong@Password123";

const createUniqueValue = (
    label
) => {
    const normalizedLabel =
        String(label)
            .trim()
            .toLowerCase()
            .replace(
                /[^a-z0-9]+/g,
                "-"
            )
            .replace(
                /^-+|-+$/g,
                ""
            );

    return `${normalizedLabel}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 10)}`;
};

const createEmail = (
    label
) => {
    return `${TEST_EMAIL_PREFIX}${createUniqueValue(
        label
    )}@example.com`;
};

const cleanup = async () => {
    const users =
        await User.unscoped()
            .findAll({
                where: {
                    email: {
                        [Op.like]:
                            `${TEST_EMAIL_PREFIX}%`
                    }
                },

                attributes: [
                    "id"
                ]
            });

    const userIds =
        users.map(
            (user) => user.id
        );

    if (
        userIds.length === 0
    ) {
        return;
    }

    await Job.unscoped().destroy({
        where: {
            createdBy: {
                [Op.in]:
                    userIds
            }
        },
        force: true
    });

    await Company.unscoped()
        .destroy({
            where: {
                ownerId: {
                    [Op.in]:
                        userIds
                }
            },
            force: true
        });

    await UserSession.unscoped()
        .destroy({
            where: {
                userId: {
                    [Op.in]:
                        userIds
                }
            },
            force: true
        });

    await User.unscoped().destroy({
        where: {
            id: {
                [Op.in]:
                    userIds
            }
        },
        force: true
    });
};

const registerRecruiter = async (
    email
) => {
    const passwordHash =
        await hashPassword(
            PASSWORD
        );

    const user =
        await User.create({
            email,
            passwordHash,
            role:
                "RECRUITER",
            status:
                "ACTIVE",
            emailVerifiedAt:
                new Date()
        });

    expect(user).not.toBeNull();

    return user;
};

const registerJobSeeker = async (
    email
) => {
    await request(app)
        .post(
            "/api/auth/register/job-seeker"
        )
        .send({
            email,
            password: PASSWORD
        })
        .expect(201);

    const user =
        await User.unscoped()
            .findOne({
                where: {
                    email
                }
            });

    user.emailVerifiedAt =
        new Date();

    user.status =
        "ACTIVE";

    await user.save();

    return user;
};

const loginUser = async (
    email
) => {
    const response =
        await request(app)
            .post(
                "/api/auth/login"
            )
            .set(
                "User-Agent",
                "CareerForge Job Draft Integration Test"
            )
            .send({
                email,
                password: PASSWORD
            })
            .expect(200);

    return response.body
        .data.accessToken;
};

const createCompanyFor = async (
    ownerId,
    label
) => {
    return Company.create({
        ownerId,

        companyName:
            `Integration ${label}`,

        slug:
            `${TEST_COMPANY_SLUG_PREFIX}${createUniqueValue(
                label
            )}`,

        status:
            "DRAFT"
    });
};

describe(
    "Create Job Draft API",
    () => {
        beforeEach(cleanup);
        afterEach(cleanup);

        test(
            "creates an incomplete DRAFT job for an authenticated recruiter",
            async () => {
                const email =
                    createEmail(
                        "success"
                    );

                const recruiter =
                    await registerRecruiter(
                        email
                    );

                const accessToken =
                    await loginUser(
                        email
                    );

                const company =
                    await createCompanyFor(
                        recruiter.id,
                        "Success Company"
                    );

                const response =
                    await request(app)
                        .post(
                            "/api/jobs"
                        )
                        .set(
                            "Authorization",
                            `Bearer ${accessToken}`
                        )
                        .send({
                            companyId:
                                company.id,

                            title:
                                "Backend Developer",

                            workMode:
                                "REMOTE",

                            skills: [
                                "Node.js",
                                "MySQL"
                            ]
                        })
                        .expect(201);

                expect(
                    response.body.success
                ).toBe(true);

                expect(
                    response.body.message
                ).toBe(
                    "Job draft created successfully."
                );

                expect(
                    response.body.data.status
                ).toBe("DRAFT");

                expect(
                    response.body.data.companyId
                ).toBe(company.id);

                expect(
                    response.body.data.createdBy
                ).toBe(recruiter.id);

                expect(
                    response.body.data.slug
                ).toBe(
                    "backend-developer"
                );

                const storedJob =
                    await Job.findByPk(
                        response.body.data.id
                    );

                expect(
                    storedJob
                ).not.toBeNull();

                expect(
                    storedJob.status
                ).toBe("DRAFT");
            }
        );

        test(
            "allows a draft with only companyId",
            async () => {
                const email =
                    createEmail(
                        "minimal"
                    );

                const recruiter =
                    await registerRecruiter(
                        email
                    );

                const accessToken =
                    await loginUser(
                        email
                    );

                const company =
                    await createCompanyFor(
                        recruiter.id,
                        "Minimal Company"
                    );

                const response =
                    await request(app)
                        .post(
                            "/api/jobs"
                        )
                        .set(
                            "Authorization",
                            `Bearer ${accessToken}`
                        )
                        .send({
                            companyId:
                                company.id
                        })
                        .expect(201);

                expect(
                    response.body.data.status
                ).toBe("DRAFT");

                expect(
                    response.body.data.slug
                ).toBeNull();
            }
        );

        test(
            "rejects protected lifecycle fields",
            async () => {
                const email =
                    createEmail(
                        "protected"
                    );

                const recruiter =
                    await registerRecruiter(
                        email
                    );

                const accessToken =
                    await loginUser(
                        email
                    );

                const company =
                    await createCompanyFor(
                        recruiter.id,
                        "Protected Company"
                    );

                const response =
                    await request(app)
                        .post(
                            "/api/jobs"
                        )
                        .set(
                            "Authorization",
                            `Bearer ${accessToken}`
                        )
                        .send({
                            companyId:
                                company.id,

                            status:
                                "PUBLISHED",

                            viewCount:
                                999
                        })
                        .expect(400);

                expect(
                    response.body.code
                ).toBe(
                    "UNSUPPORTED_JOB_FIELD"
                );
            }
        );

        test(
            "rejects access to another recruiter's company",
            async () => {
                const ownerEmail =
                    createEmail(
                        "owner"
                    );

                const attackerEmail =
                    createEmail(
                        "attacker"
                    );

                const owner =
                    await registerRecruiter(
                        ownerEmail
                    );

                await registerRecruiter(
                    attackerEmail
                );

                const attackerToken =
                    await loginUser(
                        attackerEmail
                    );

                const company =
                    await createCompanyFor(
                        owner.id,
                        "Owned Company"
                    );

                const response =
                    await request(app)
                        .post(
                            "/api/jobs"
                        )
                        .set(
                            "Authorization",
                            `Bearer ${attackerToken}`
                        )
                        .send({
                            companyId:
                                company.id
                        })
                        .expect(403);

                expect(
                    response.body.code
                ).toBe(
                    "COMPANY_ACCESS_FORBIDDEN"
                );
            }
        );

        test(
            "rejects a JOB_SEEKER",
            async () => {
                const email =
                    createEmail(
                        "job-seeker"
                    );

                await registerJobSeeker(
                    email
                );

                const accessToken =
                    await loginUser(
                        email
                    );

                const response =
                    await request(app)
                        .post(
                            "/api/jobs"
                        )
                        .set(
                            "Authorization",
                            `Bearer ${accessToken}`
                        )
                        .send({
                            companyId:
                                "11111111-1111-1111-1111-111111111111"
                        })
                        .expect(403);

                expect(
                    response.body.code
                ).toBe(
                    "ACCESS_DENIED"
                );
            }
        );

        test(
            "rejects an unauthenticated request",
            async () => {
                const response =
                    await request(app)
                        .post(
                            "/api/jobs"
                        )
                        .send({
                            companyId:
                                "11111111-1111-1111-1111-111111111111"
                        })
                        .expect(401);

                expect(
                    response.body.code
                ).toBe(
                    "AUTHENTICATION_REQUIRED"
                );
            }
        );

        test(
            "rejects an invalid company ID",
            async () => {
                const email =
                    createEmail(
                        "invalid-company"
                    );

                await registerRecruiter(
                    email
                );

                const accessToken =
                    await loginUser(
                        email
                    );

                const response =
                    await request(app)
                        .post(
                            "/api/jobs"
                        )
                        .set(
                            "Authorization",
                            `Bearer ${accessToken}`
                        )
                        .send({
                            companyId:
                                "not-a-uuid"
                        })
                        .expect(422);

                expect(
                    response.body.code
                ).toBe(
                    "VALIDATION_ERROR"
                );
            }
        );
    }
);
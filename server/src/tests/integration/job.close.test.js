import request from "supertest";

import {
    Op
} from "sequelize";

import app from "../../app.js";

import User from
    "../../models/user.model.js";

import UserSession from
    "../../models/userSession.model.js";

import Company from
    "../../models/company.model.js";

import Job from
    "../../models/job.model.js";

import {
    hashPassword
} from "../../utils/password.util.js";

const TEST_EMAIL_PREFIX =
    "job.close.integration.";

const TEST_COMPANY_SLUG_PREFIX =
    "job-close-company-";

const TEST_JOB_SLUG_PREFIX =
    "job-close-";

const PASSWORD =
    "Strong@Password123";

const MISSING_JOB_ID =
    "11111111-1111-4111-8111-111111111111";

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
            )
            .slice(
                0,
                20
            );

    const uniquePart =
        `${Date.now().toString(36)}${Math.random()
            .toString(36)
            .slice(2, 8)}`;

    return `${normalizedLabel}-${uniquePart}`;
};

const createEmail = (
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
            )
            .slice(
                0,
                12
            );

    return (
        `${TEST_EMAIL_PREFIX}` +
        `${normalizedLabel}.` +
        `${Date.now().toString(36)}` +
        `${Math.random()
            .toString(36)
            .slice(2, 7)}` +
        "@example.com"
    );
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
            (user) =>
                user.id
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

    await Company.unscoped().destroy({
        where: {
            ownerId: {
                [Op.in]:
                    userIds
            }
        },

        force: true
    });

    await UserSession.unscoped().destroy({
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

const createUser = async ({
    email,
    role
}) => {
    const passwordHash =
        await hashPassword(
            PASSWORD
        );

    return User.create({
        email,
        passwordHash,
        role,

        status:
            "ACTIVE",

        emailVerifiedAt:
            new Date()
    });
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
                "CareerForge Job Close Integration Test"
            )
            .send({
                email,
                password:
                    PASSWORD
            })
            .expect(200);

    return response.body
        .data.accessToken;
};

const createCompanyFor = async ({
    ownerId,
    label
}) => {
    return Company.create({
        ownerId,

        companyName:
            `Integration ${label}`,

        slug:
            `${TEST_COMPANY_SLUG_PREFIX}${createUniqueValue(
                label
            )}`,

        status:
            "VERIFIED"
    });
};

const createJobFor = async ({
    companyId,
    createdBy,
    title,
    status = "PUBLISHED",
    overrides = {}
}) => {
    const now =
        new Date();

    const lifecycleData = {};

    if (
        status === "PUBLISHED"
    ) {
        lifecycleData.publishedAt =
            new Date(
                now.getTime() -
                24 * 60 * 60 * 1000
            );
    }

    if (
        status === "CLOSED"
    ) {
        lifecycleData.publishedAt =
            new Date(
                now.getTime() -
                2 * 24 * 60 * 60 * 1000
            );

        lifecycleData.closedAt =
            new Date(
                now.getTime() -
                24 * 60 * 60 * 1000
            );

        lifecycleData.closureReason =
            "Previously closed.";
    }

    if (
        status === "REMOVED"
    ) {
        lifecycleData.publishedAt =
            new Date(
                now.getTime() -
                2 * 24 * 60 * 60 * 1000
            );

        lifecycleData.removedAt =
            new Date(
                now.getTime() -
                24 * 60 * 60 * 1000
            );

        lifecycleData.removalReason =
            "Removed for integration testing.";
    }

    return Job.create({
        companyId,
        createdBy,
        title,

        slug:
            `${TEST_JOB_SLUG_PREFIX}${createUniqueValue(
                title
            )}`,

        description:
            `${title} description.`,

        responsibilities:
            "Develop and maintain reliable software systems.",

        requirements:
            "Strong backend-development knowledge.",

        skills: [
            "Node.js",
            "Express",
            "MySQL"
        ],

        location:
            "Hyderabad",

        workMode:
            "HYBRID",

        employmentType:
            "FULL_TIME",

        experienceLevel:
            "JUNIOR",

        minimumExperience:
            1,

        maximumExperience:
            3,

        minimumSalary:
            400000,

        maximumSalary:
            800000,

        salaryCurrency:
            "INR",

        vacancies:
            2,

        applicationDeadline:
            new Date(
                Date.now() +
                30 *
                24 *
                60 *
                60 *
                1000
            ),

        status,

        ...lifecycleData,

        ...overrides
    });
};

const createRecruiterContext = async (
    label
) => {
    const email =
        createEmail(
            label
        );

    const recruiter =
        await createUser({
            email,

            role:
                "RECRUITER"
        });

    const token =
        await loginUser(
            email
        );

    const company =
        await createCompanyFor({
            ownerId:
                recruiter.id,

            label:
                `${label}-company`
        });

    return {
        recruiter,
        token,
        company
    };
};

describe(
    "Close Job API",
    () => {
        beforeEach(
            cleanup
        );

        afterEach(
            cleanup
        );

        test(
            "closes an eligible published job",
            async () => {
                const {
                    recruiter,
                    token,
                    company
                } =
                    await createRecruiterContext(
                        "close-success"
                    );

                const job =
                    await createJobFor({
                        companyId:
                            company.id,

                        createdBy:
                            recruiter.id,

                        title:
                            "Backend Platform Engineer"
                    });

                const beforeClose =
                    Date.now();

                const response =
                    await request(app)
                        .patch(
                            `/api/jobs/${job.id}/close`
                        )
                        .set(
                            "Authorization",
                            `Bearer ${token}`
                        )
                        .send({
                            closureReason:
                                "POSITION_FILLED"
                        })
                        .expect(200);

                expect(
                    response.body.success
                ).toBe(true);

                expect(
                    response.body.message
                ).toBe(
                    "Job closed successfully."
                );

                expect(
                    response.body.data.status
                ).toBe(
                    "CLOSED"
                );

                expect(
                    response.body.data.closureReason
                ).toBe(
                    "POSITION_FILLED"
                );

                expect(
                    response.body.data.closedAt
                ).toEqual(
                    expect.any(
                        String
                    )
                );

                expect(
                    new Date(
                        response.body.data
                            .closedAt
                    ).getTime()
                ).toBeGreaterThanOrEqual(
                    beforeClose
                );

                const storedJob =
                    await Job.findByPk(
                        job.id
                    );

                expect(
                    storedJob.status
                ).toBe(
                    "CLOSED"
                );

                expect(
                    storedJob.closedAt
                ).toBeInstanceOf(
                    Date
                );

                expect(
                    storedJob.closureReason
                ).toBe(
                    "POSITION_FILLED"
                );

                expect(
                    storedJob.publishedAt
                ).toBeInstanceOf(
                    Date
                );
            }
        );

        test(
            "uses the default closure reason when none is supplied",
            async () => {
                const {
                    recruiter,
                    token,
                    company
                } =
                    await createRecruiterContext(
                        "default-reason"
                    );

                const job =
                    await createJobFor({
                        companyId:
                            company.id,

                        createdBy:
                            recruiter.id,

                        title:
                            "Default Reason Engineer"
                    });

                const response =
                    await request(app)
                        .patch(
                            `/api/jobs/${job.id}/close`
                        )
                        .set(
                            "Authorization",
                            `Bearer ${token}`
                        )
                        .send({})
                        .expect(200);

                expect(
                    response.body.data
                        .closureReason
                ).toBe(
                    "RECRUITER_CLOSED"
                );

                const storedJob =
                    await Job.findByPk(
                        job.id
                    );

                expect(
                    storedJob.closureReason
                ).toBe(
                    "RECRUITER_CLOSED"
                );
            }
        );

        test(
            "rejects closing a draft job",
            async () => {
                const {
                    recruiter,
                    token,
                    company
                } =
                    await createRecruiterContext(
                        "draft-job"
                    );

                const job =
                    await createJobFor({
                        companyId:
                            company.id,

                        createdBy:
                            recruiter.id,

                        title:
                            "Draft Job",

                        status:
                            "DRAFT"
                    });

                const response =
                    await request(app)
                        .patch(
                            `/api/jobs/${job.id}/close`
                        )
                        .set(
                            "Authorization",
                            `Bearer ${token}`
                        )
                        .send({
                            closureReason:
                                "TEST"
                        })
                        .expect(409);

                expect(
                    response.body.code
                ).toBe(
                    "JOB_CLOSE_NOT_ALLOWED"
                );

                const storedJob =
                    await Job.findByPk(
                        job.id
                    );

                expect(
                    storedJob.status
                ).toBe(
                    "DRAFT"
                );

                expect(
                    storedJob.closedAt
                ).toBeNull();
            }
        );

        test(
            "rejects closing an already closed job",
            async () => {
                const {
                    recruiter,
                    token,
                    company
                } =
                    await createRecruiterContext(
                        "already-closed"
                    );

                const job =
                    await createJobFor({
                        companyId:
                            company.id,

                        createdBy:
                            recruiter.id,

                        title:
                            "Already Closed Job",

                        status:
                            "CLOSED"
                    });

                const originalClosedAt =
                    Math.floor(
                        job.closedAt.getTime() /
                        1000
                    );

                const response =
                    await request(app)
                        .patch(
                            `/api/jobs/${job.id}/close`
                        )
                        .set(
                            "Authorization",
                            `Bearer ${token}`
                        )
                        .send({
                            closureReason:
                                "SECOND_CLOSE"
                        })
                        .expect(409);

                expect(
                    response.body.code
                ).toBe(
                    "JOB_ALREADY_CLOSED"
                );

                const storedJob =
                    await Job.findByPk(
                        job.id
                    );

                expect(
                    Math.floor(
                        storedJob.closedAt
                            .getTime() /
                        1000
                    )
                ).toBe(
                    originalClosedAt
                );
            }
        );

        test(
            "rejects closing a removed job",
            async () => {
                const {
                    recruiter,
                    token,
                    company
                } =
                    await createRecruiterContext(
                        "removed-job"
                    );

                const job =
                    await createJobFor({
                        companyId:
                            company.id,

                        createdBy:
                            recruiter.id,

                        title:
                            "Removed Job",

                        status:
                            "REMOVED"
                    });

                const response =
                    await request(app)
                        .patch(
                            `/api/jobs/${job.id}/close`
                        )
                        .set(
                            "Authorization",
                            `Bearer ${token}`
                        )
                        .send({
                            closureReason:
                                "TEST"
                        })
                        .expect(409);

                expect(
                    response.body.code
                ).toBe(
                    "JOB_CLOSE_NOT_ALLOWED"
                );

                const storedJob =
                    await Job.findByPk(
                        job.id
                    );

                expect(
                    storedJob.status
                ).toBe(
                    "REMOVED"
                );
            }
        );

        test(
            "rejects another recruiter with JOB_ACCESS_FORBIDDEN",
            async () => {
                const ownerContext =
                    await createRecruiterContext(
                        "owner"
                    );

                const attackerContext =
                    await createRecruiterContext(
                        "attacker"
                    );

                const job =
                    await createJobFor({
                        companyId:
                            ownerContext
                                .company.id,

                        createdBy:
                            ownerContext
                                .recruiter.id,

                        title:
                            "Protected Close Job"
                    });

                const response =
                    await request(app)
                        .patch(
                            `/api/jobs/${job.id}/close`
                        )
                        .set(
                            "Authorization",
                            `Bearer ${attackerContext.token}`
                        )
                        .send({
                            closureReason:
                                "UNAUTHORIZED"
                        })
                        .expect(403);

                expect(
                    response.body.code
                ).toBe(
                    "JOB_ACCESS_FORBIDDEN"
                );

                const storedJob =
                    await Job.findByPk(
                        job.id
                    );

                expect(
                    storedJob.status
                ).toBe(
                    "PUBLISHED"
                );

                expect(
                    storedJob.closedAt
                ).toBeNull();
            }
        );

        test(
            "returns JOB_NOT_FOUND for a missing job",
            async () => {
                const {
                    token
                } =
                    await createRecruiterContext(
                        "missing-job"
                    );

                const response =
                    await request(app)
                        .patch(
                            `/api/jobs/${MISSING_JOB_ID}/close`
                        )
                        .set(
                            "Authorization",
                            `Bearer ${token}`
                        )
                        .send({
                            closureReason:
                                "MISSING"
                        })
                        .expect(404);

                expect(
                    response.body.code
                ).toBe(
                    "JOB_NOT_FOUND"
                );
            }
        );

        test(
            "rejects an invalid job ID",
            async () => {
                const {
                    token
                } =
                    await createRecruiterContext(
                        "invalid-id"
                    );

                const response =
                    await request(app)
                        .patch(
                            "/api/jobs/not-a-valid-uuid/close"
                        )
                        .set(
                            "Authorization",
                            `Bearer ${token}`
                        )
                        .send({
                            closureReason:
                                "TEST"
                        })
                        .expect(422);

                expect(
                    response.body.code
                ).toBe(
                    "VALIDATION_ERROR"
                );

                expect(
                    response.body.errors
                ).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({
                            field:
                                "jobId"
                        })
                    ])
                );
            }
        );

        test(
            "rejects an empty closure reason",
            async () => {
                const {
                    recruiter,
                    token,
                    company
                } =
                    await createRecruiterContext(
                        "empty-reason"
                    );

                const job =
                    await createJobFor({
                        companyId:
                            company.id,

                        createdBy:
                            recruiter.id,

                        title:
                            "Empty Reason Job"
                    });

                const response =
                    await request(app)
                        .patch(
                            `/api/jobs/${job.id}/close`
                        )
                        .set(
                            "Authorization",
                            `Bearer ${token}`
                        )
                        .send({
                            closureReason:
                                "   "
                        })
                        .expect(422);

                expect(
                    response.body.code
                ).toBe(
                    "VALIDATION_ERROR"
                );

                expect(
                    response.body.errors
                ).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({
                            field:
                                "closureReason"
                        })
                    ])
                );

                const storedJob =
                    await Job.findByPk(
                        job.id
                    );

                expect(
                    storedJob.status
                ).toBe(
                    "PUBLISHED"
                );
            }
        );

        test(
            "rejects a closure reason exceeding the maximum length",
            async () => {
                const {
                    recruiter,
                    token,
                    company
                } =
                    await createRecruiterContext(
                        "long-reason"
                    );

                const job =
                    await createJobFor({
                        companyId:
                            company.id,

                        createdBy:
                            recruiter.id,

                        title:
                            "Long Reason Job"
                    });

                const response =
                    await request(app)
                        .patch(
                            `/api/jobs/${job.id}/close`
                        )
                        .set(
                            "Authorization",
                            `Bearer ${token}`
                        )
                        .send({
                            closureReason:
                                "x".repeat(
                                    2001
                                )
                        })
                        .expect(422);

                expect(
                    response.body.code
                ).toBe(
                    "VALIDATION_ERROR"
                );

                expect(
                    response.body.errors
                ).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({
                            field:
                                "closureReason"
                        })
                    ])
                );
            }
        );

        test(
            "rejects a JOB_SEEKER",
            async () => {
                const ownerContext =
                    await createRecruiterContext(
                        "job-seeker-owner"
                    );

                const job =
                    await createJobFor({
                        companyId:
                            ownerContext
                                .company.id,

                        createdBy:
                            ownerContext
                                .recruiter.id,

                        title:
                            "Job Seeker Forbidden Close"
                    });

                const email =
                    createEmail(
                        "job-seeker"
                    );

                await createUser({
                    email,

                    role:
                        "JOB_SEEKER"
                });

                const token =
                    await loginUser(
                        email
                    );

                const response =
                    await request(app)
                        .patch(
                            `/api/jobs/${job.id}/close`
                        )
                        .set(
                            "Authorization",
                            `Bearer ${token}`
                        )
                        .send({
                            closureReason:
                                "FORBIDDEN"
                        })
                        .expect(403);

                expect(
                    response.body.code
                ).toBe(
                    "ACCESS_DENIED"
                );

                const storedJob =
                    await Job.findByPk(
                        job.id
                    );

                expect(
                    storedJob.status
                ).toBe(
                    "PUBLISHED"
                );
            }
        );

        test(
            "rejects an unauthenticated request",
            async () => {
                const ownerContext =
                    await createRecruiterContext(
                        "unauthenticated"
                    );

                const job =
                    await createJobFor({
                        companyId:
                            ownerContext
                                .company.id,

                        createdBy:
                            ownerContext
                                .recruiter.id,

                        title:
                            "Unauthenticated Close Job"
                    });

                const response =
                    await request(app)
                        .patch(
                            `/api/jobs/${job.id}/close`
                        )
                        .send({
                            closureReason:
                                "UNAUTHENTICATED"
                        })
                        .expect(401);

                expect(
                    response.body.code
                ).toBe(
                    "AUTHENTICATION_REQUIRED"
                );

                const storedJob =
                    await Job.findByPk(
                        job.id
                    );

                expect(
                    storedJob.status
                ).toBe(
                    "PUBLISHED"
                );
            }
        );
    }
);
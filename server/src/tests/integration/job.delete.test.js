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
    "job.delete.integration.";

const TEST_COMPANY_SLUG_PREFIX =
    "job-delete-company-";

const TEST_JOB_SLUG_PREFIX =
    "job-delete-";

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
                "CareerForge Job Delete Integration Test"
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
    status = "DRAFT",
    applicationCount = 0,
    overrides = {}
}) => {
    const lifecycleData = {};

    if (
        status === "PUBLISHED"
    ) {
        lifecycleData.publishedAt =
            new Date();
    }

    if (
        status === "CLOSED"
    ) {
        lifecycleData.publishedAt =
            new Date(
                Date.now() -
                2 * 24 * 60 * 60 * 1000
            );

        lifecycleData.closedAt =
            new Date();

        lifecycleData.closureReason =
            "Previously closed.";
    }

    if (
        status === "REMOVED"
    ) {
        lifecycleData.removedAt =
            new Date();

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

        applicationCount,

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
    "Delete Eligible Draft Job API",
    () => {
        beforeEach(
            cleanup
        );

        afterEach(
            cleanup
        );

        test(
            "soft deletes an eligible draft job",
            async () => {
                const {
                    recruiter,
                    token,
                    company
                } =
                    await createRecruiterContext(
                        "delete-success"
                    );

                const job =
                    await createJobFor({
                        companyId:
                            company.id,

                        createdBy:
                            recruiter.id,

                        title:
                            "Draft Backend Engineer"
                    });

                const response =
                    await request(app)
                        .delete(
                            `/api/jobs/${job.id}`
                        )
                        .set(
                            "Authorization",
                            `Bearer ${token}`
                        )
                        .expect(200);

                expect(
                    response.body.success
                ).toBe(true);

                expect(
                    response.body.message
                ).toBe(
                    "Job deleted successfully."
                );

                expect(
                    response.body.data
                ).toEqual({});

                const defaultScopeJob =
                    await Job.findByPk(
                        job.id
                    );

                expect(
                    defaultScopeJob
                ).toBeNull();

                const deletedJob =
                    await Job.unscoped()
                        .findByPk(
                            job.id,
                            {
                                paranoid:
                                    false
                            }
                        );

                expect(
                    deletedJob
                ).not.toBeNull();

                expect(
                    deletedJob.status
                ).toBe(
                    "DRAFT"
                );

                expect(
                    deletedJob.get(
                        "deleted_at"
                    )
                ).toBeInstanceOf(
                    Date
                );
            }
        );

        test.each([
            "PUBLISHED",
            "CLOSED",
            "REMOVED"
        ])(
            "rejects deleting a %s job",
            async (
                status
            ) => {
                const {
                    recruiter,
                    token,
                    company
                } =
                    await createRecruiterContext(
                        `status-${status}`
                    );

                const job =
                    await createJobFor({
                        companyId:
                            company.id,

                        createdBy:
                            recruiter.id,

                        title:
                            `${status} Delete Job`,

                        status
                    });

                const response =
                    await request(app)
                        .delete(
                            `/api/jobs/${job.id}`
                        )
                        .set(
                            "Authorization",
                            `Bearer ${token}`
                        )
                        .expect(409);

                expect(
                    response.body.code
                ).toBe(
                    "JOB_DELETE_NOT_ALLOWED"
                );

                const storedJob =
                    await Job.findByPk(
                        job.id
                    );

                expect(
                    storedJob
                ).not.toBeNull();

                expect(
                    storedJob.status
                ).toBe(
                    status
                );

                expect(
                    storedJob.get(
                        "deleted_at"
                    )
                ).toBeNull();
            }
        );

        test(
            "rejects deleting a draft job with applications",
            async () => {
                const {
                    recruiter,
                    token,
                    company
                } =
                    await createRecruiterContext(
                        "has-applications"
                    );

                const job =
                    await createJobFor({
                        companyId:
                            company.id,

                        createdBy:
                            recruiter.id,

                        title:
                            "Draft With Applications",

                        applicationCount:
                            3
                    });

                const response =
                    await request(app)
                        .delete(
                            `/api/jobs/${job.id}`
                        )
                        .set(
                            "Authorization",
                            `Bearer ${token}`
                        )
                        .expect(409);

                expect(
                    response.body.code
                ).toBe(
                    "JOB_HAS_APPLICATIONS"
                );

                expect(
                    response.body.errors
                ).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({
                            applicationCount:
                                3
                        })
                    ])
                );

                const storedJob =
                    await Job.findByPk(
                        job.id
                    );

                expect(
                    storedJob
                ).not.toBeNull();

                expect(
                    storedJob.get(
                        "deleted_at"
                    )
                ).toBeNull();
            }
        );

        test(
            "rejects another recruiter with JOB_ACCESS_FORBIDDEN",
            async () => {
                const ownerContext =
                    await createRecruiterContext(
                        "delete-owner"
                    );

                const attackerContext =
                    await createRecruiterContext(
                        "delete-attacker"
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
                            "Protected Draft Job"
                    });

                const response =
                    await request(app)
                        .delete(
                            `/api/jobs/${job.id}`
                        )
                        .set(
                            "Authorization",
                            `Bearer ${attackerContext.token}`
                        )
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
                    storedJob
                ).not.toBeNull();

                expect(
                    storedJob.get(
                        "deleted_at"
                    )
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
                        "missing-delete"
                    );

                const response =
                    await request(app)
                        .delete(
                            `/api/jobs/${MISSING_JOB_ID}`
                        )
                        .set(
                            "Authorization",
                            `Bearer ${token}`
                        )
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
                        "invalid-delete-id"
                    );

                const response =
                    await request(app)
                        .delete(
                            "/api/jobs/not-a-valid-uuid"
                        )
                        .set(
                            "Authorization",
                            `Bearer ${token}`
                        )
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
                            "Job Seeker Forbidden Delete"
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
                        .delete(
                            `/api/jobs/${job.id}`
                        )
                        .set(
                            "Authorization",
                            `Bearer ${token}`
                        )
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
                    storedJob
                ).not.toBeNull();
            }
        );

        test(
            "rejects an unauthenticated request",
            async () => {
                const ownerContext =
                    await createRecruiterContext(
                        "unauthenticated-delete"
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
                            "Unauthenticated Delete Job"
                    });

                const response =
                    await request(app)
                        .delete(
                            `/api/jobs/${job.id}`
                        )
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
                    storedJob
                ).not.toBeNull();
            }
        );
    }
);

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
    "job.publish.integration.";

const TEST_COMPANY_SLUG_PREFIX =
    "job-publish-integration-";

const TEST_JOB_SLUG_PREFIX =
    "job-publish-";

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
            .slice(0, 20);

    const uniquePart =
        `${Date.now()
            .toString(36)}${Math.random()
                .toString(36)
                .slice(2, 8)}`;

    return `${normalizedLabel}-${uniquePart}`;
};

const createEmail = (
    label
) => {
    const shortLabel =
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
            .slice(0, 10);

    const uniquePart =
        `${Date.now()
            .toString(36)}${Math.random()
                .toString(36)
                .slice(2, 7)}`;

    return `${TEST_EMAIL_PREFIX}${shortLabel}.${uniquePart}@example.com`;
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
                "CareerForge Job Publish Integration Test"
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
    label,
    status = "VERIFIED"
}) => {
    return Company.create({
        ownerId,

        companyName:
            `Integration ${label}`,

        slug:
            `${TEST_COMPANY_SLUG_PREFIX}${createUniqueValue(
                label
            )}`,

        status
    });
};

const getLifecycleFields = (
    status
) => {
    if (
        status === "PUBLISHED"
    ) {
        return {
            publishedAt:
                new Date()
        };
    }

    if (
        status === "CLOSED"
    ) {
        return {
            publishedAt:
                new Date(
                    Date.now() -
                    2 * 24 * 60 * 60 * 1000
                ),

            closedAt:
                new Date(
                    Date.now() -
                    24 * 60 * 60 * 1000
                ),

            closureReason:
                "Closed for integration testing."
        };
    }

    if (
        status === "REMOVED"
    ) {
        return {
            removedAt:
                new Date(),

            removalReason:
                "Removed for integration testing."
        };
    }

    return {};
};

const createCompleteJobFor = async ({
    companyId,
    createdBy,
    title,
    status = "DRAFT",
    overrides = {}
}) => {
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
            "Develop and maintain production backend services.",

        requirements:
            "Strong JavaScript, Node.js, SQL and API-development knowledge.",

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
                30 * 24 * 60 * 60 * 1000
            ),

        status,

        ...getLifecycleFields(
            status
        ),

        ...overrides
    });
};

const createRecruiterContext = async ({
    label,
    companyStatus = "VERIFIED"
}) => {
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
                `${label}-company`,

            status:
                companyStatus
        });

    return {
        recruiter,
        token,
        company
    };
};

describe(
    "Publish Job API",
    () => {
        beforeEach(cleanup);
        afterEach(cleanup);

        test(
            "publishes an eligible DRAFT job",
            async () => {
                const {
                    recruiter,
                    token,
                    company
                } =
                    await createRecruiterContext({
                        label:
                            "publish-success"
                    });

                const job =
                    await createCompleteJobFor({
                        companyId:
                            company.id,

                        createdBy:
                            recruiter.id,

                        title:
                            "Backend Platform Engineer"
                    });

                const beforePublication =
                    Date.now();

                const response =
                    await request(app)
                        .patch(
                            `/api/jobs/${job.id}/publish`
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
                    "Job published successfully."
                );

                expect(
                    response.body.data.status
                ).toBe(
                    "PUBLISHED"
                );

                expect(
                    response.body.data.publishedAt
                ).toEqual(
                    expect.any(
                        String
                    )
                );

                expect(
                    new Date(
                        response.body.data
                            .publishedAt
                    ).getTime()
                ).toBeGreaterThanOrEqual(
                    beforePublication
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
                    storedJob.publishedAt
                ).toBeInstanceOf(
                    Date
                );

                expect(
                    storedJob.closedAt
                ).toBeNull();

                expect(
                    storedJob.removedAt
                ).toBeNull();

                expect(
                    storedJob.closureReason
                ).toBeNull();

                expect(
                    storedJob.removalReason
                ).toBeNull();
            }
        );

        test(
            "preserves an existing slug",
            async () => {
                const {
                    recruiter,
                    token,
                    company
                } =
                    await createRecruiterContext({
                        label:
                            "preserve-slug"
                    });

                const existingSlug =
                    `existing-${createUniqueValue(
                        "publication-slug"
                    )}`;

                const job =
                    await createCompleteJobFor({
                        companyId:
                            company.id,

                        createdBy:
                            recruiter.id,

                        title:
                            "Existing Slug Engineer",

                        overrides: {
                            slug:
                                existingSlug
                        }
                    });

                const response =
                    await request(app)
                        .patch(
                            `/api/jobs/${job.id}/publish`
                        )
                        .set(
                            "Authorization",
                            `Bearer ${token}`
                        )
                        .expect(200);

                expect(
                    response.body.data.slug
                ).toBe(
                    existingSlug
                );

                const storedJob =
                    await Job.findByPk(
                        job.id
                    );

                expect(
                    storedJob.slug
                ).toBe(
                    existingSlug
                );
            }
        );

        test(
            "generates a slug when the draft does not have one",
            async () => {
                const {
                    recruiter,
                    token,
                    company
                } =
                    await createRecruiterContext({
                        label:
                            "generate-slug"
                    });

                const job =
                    await createCompleteJobFor({
                        companyId:
                            company.id,

                        createdBy:
                            recruiter.id,

                        title:
                            "Cloud Platform Specialist",

                        overrides: {
                            slug:
                                null
                        }
                    });

                const response =
                    await request(app)
                        .patch(
                            `/api/jobs/${job.id}/publish`
                        )
                        .set(
                            "Authorization",
                            `Bearer ${token}`
                        )
                        .expect(200);

                expect(
                    response.body.data.slug
                ).toBe(
                    "cloud-platform-specialist"
                );

                const storedJob =
                    await Job.findByPk(
                        job.id
                    );

                expect(
                    storedJob.slug
                ).toBe(
                    "cloud-platform-specialist"
                );
            }
        );

        test(
            "generates a unique slug when the base slug already exists",
            async () => {
                const {
                    recruiter,
                    token,
                    company
                } =
                    await createRecruiterContext({
                        label:
                            "slug-collision"
                    });

                await createCompleteJobFor({
                    companyId:
                        company.id,

                    createdBy:
                        recruiter.id,

                    title:
                        "Data Platform Engineer",

                    overrides: {
                        slug:
                            "data-platform-engineer"
                    }
                });

                const job =
                    await createCompleteJobFor({
                        companyId:
                            company.id,

                        createdBy:
                            recruiter.id,

                        title:
                            "Data Platform Engineer",

                        overrides: {
                            slug:
                                null
                        }
                    });

                const response =
                    await request(app)
                        .patch(
                            `/api/jobs/${job.id}/publish`
                        )
                        .set(
                            "Authorization",
                            `Bearer ${token}`
                        )
                        .expect(200);

                expect(
                    response.body.data.slug
                ).toBe(
                    "data-platform-engineer-2"
                );
            }
        );

        test(
            "rejects publication for an incomplete draft",
            async () => {
                const {
                    recruiter,
                    token,
                    company
                } =
                    await createRecruiterContext({
                        label:
                            "incomplete"
                    });

                const job =
                    await createCompleteJobFor({
                        companyId:
                            company.id,

                        createdBy:
                            recruiter.id,

                        title:
                            "Incomplete Job",

                        overrides: {
                            description:
                                null,

                            requirements:
                                null,

                            applicationDeadline:
                                null
                        }
                    });

                const response =
                    await request(app)
                        .patch(
                            `/api/jobs/${job.id}/publish`
                        )
                        .set(
                            "Authorization",
                            `Bearer ${token}`
                        )
                        .expect(409);

                expect(
                    response.body.success
                ).toBe(false);

                expect(
                    response.body.code
                ).toBe(
                    "JOB_NOT_READY_FOR_PUBLICATION"
                );

                expect(
                    response.body.errors
                ).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({
                            field:
                                "description"
                        }),

                        expect.objectContaining({
                            field:
                                "requirements"
                        }),

                        expect.objectContaining({
                            field:
                                "applicationDeadline"
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
                    "DRAFT"
                );

                expect(
                    storedJob.publishedAt
                ).toBeNull();
            }
        );

        test(
            "rejects publication for an unverified company",
            async () => {
                const {
                    recruiter,
                    token,
                    company
                } =
                    await createRecruiterContext({
                        label:
                            "unverified",

                        companyStatus:
                            "DRAFT"
                    });

                const job =
                    await createCompleteJobFor({
                        companyId:
                            company.id,

                        createdBy:
                            recruiter.id,

                        title:
                            "Unverified Company Job"
                    });

                const response =
                    await request(app)
                        .patch(
                            `/api/jobs/${job.id}/publish`
                        )
                        .set(
                            "Authorization",
                            `Bearer ${token}`
                        )
                        .expect(409);

                expect(
                    response.body.code
                ).toBe(
                    "COMPANY_NOT_VERIFIED"
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
                    storedJob.publishedAt
                ).toBeNull();
            }
        );

        test.each([
            "PUBLISHED",
            "CLOSED",
            "REMOVED"
        ])(
            "rejects publication from %s status",
            async (
                status
            ) => {
                const {
                    recruiter,
                    token,
                    company
                } =
                    await createRecruiterContext({
                        label:
                            `invalid-${status}`
                    });

                const job =
                    await createCompleteJobFor({
                        companyId:
                            company.id,

                        createdBy:
                            recruiter.id,

                        title:
                            `${status.toLowerCase()} publication job`,

                        status,

                        overrides: {
                            slug:
                                `${status.toLowerCase()}-publication-${createUniqueValue(
                                    "invalid-transition"
                                )}`
                        }
                    });

                const response =
                    await request(app)
                        .patch(
                            `/api/jobs/${job.id}/publish`
                        )
                        .set(
                            "Authorization",
                            `Bearer ${token}`
                        )
                        .expect(409);

                expect(
                    response.body.code
                ).toBe(
                    "INVALID_JOB_STATUS_TRANSITION"
                );

                const storedJob =
                    await Job.findByPk(
                        job.id
                    );

                expect(
                    storedJob.status
                ).toBe(
                    status
                );
            }
        );

        test(
            "rejects another recruiter with JOB_ACCESS_FORBIDDEN",
            async () => {
                const ownerContext =
                    await createRecruiterContext({
                        label:
                            "owner"
                    });

                const attackerContext =
                    await createRecruiterContext({
                        label:
                            "attacker"
                    });

                const job =
                    await createCompleteJobFor({
                        companyId:
                            ownerContext
                                .company.id,

                        createdBy:
                            ownerContext
                                .recruiter.id,

                        title:
                            "Protected Publication Job"
                    });

                const response =
                    await request(app)
                        .patch(
                            `/api/jobs/${job.id}/publish`
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
                    storedJob.status
                ).toBe(
                    "DRAFT"
                );
            }
        );

        test(
            "returns JOB_NOT_FOUND for a missing job",
            async () => {
                const {
                    token
                } =
                    await createRecruiterContext({
                        label:
                            "missing-job"
                    });

                const response =
                    await request(app)
                        .patch(
                            `/api/jobs/${MISSING_JOB_ID}/publish`
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
                    await createRecruiterContext({
                        label:
                            "invalid-id"
                    });

                const response =
                    await request(app)
                        .patch(
                            "/api/jobs/not-a-valid-uuid/publish"
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
                    await createRecruiterContext({
                        label:
                            "job-seeker-owner"
                    });

                const job =
                    await createCompleteJobFor({
                        companyId:
                            ownerContext
                                .company.id,

                        createdBy:
                            ownerContext
                                .recruiter.id,

                        title:
                            "Job Seeker Forbidden Job"
                    });

                const jobSeekerEmail =
                    createEmail(
                        "job-seeker"
                    );

                await createUser({
                    email:
                        jobSeekerEmail,

                    role:
                        "JOB_SEEKER"
                });

                const jobSeekerToken =
                    await loginUser(
                        jobSeekerEmail
                    );

                const response =
                    await request(app)
                        .patch(
                            `/api/jobs/${job.id}/publish`
                        )
                        .set(
                            "Authorization",
                            `Bearer ${jobSeekerToken}`
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
                    storedJob.status
                ).toBe(
                    "DRAFT"
                );
            }
        );

        test(
            "rejects an unauthenticated request",
            async () => {
                const ownerContext =
                    await createRecruiterContext({
                        label:
                            "unauthenticated"
                    });

                const job =
                    await createCompleteJobFor({
                        companyId:
                            ownerContext
                                .company.id,

                        createdBy:
                            ownerContext
                                .recruiter.id,

                        title:
                            "Unauthenticated Publication Job"
                    });

                const response =
                    await request(app)
                        .patch(
                            `/api/jobs/${job.id}/publish`
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
                    storedJob.status
                ).toBe(
                    "DRAFT"
                );
            }
        );
    }
);
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
    "job.update.integration.";

const TEST_COMPANY_SLUG_PREFIX =
    "job-update-integration-";

const TEST_JOB_SLUG_PREFIX =
    "job-update-";

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
            );

    return `${normalizedLabel}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 10)}`;
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
            .slice(0, 12);

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
                "CareerForge Job Update Integration Test"
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
                    24 * 60 * 60 * 1000
                ),

            closedAt:
                new Date()
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

const createJobFor = async ({
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
            `${title} description`,

        responsibilities:
            "Develop and maintain backend services.",

        requirements:
            "Strong JavaScript and database knowledge.",

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
        await createCompanyFor(
            recruiter.id,
            `${label} Company`
        );

    return {
        recruiter,
        token,
        company
    };
};

describe(
    "Update Eligible Job API",
    () => {
        beforeEach(cleanup);
        afterEach(cleanup);

        test(
            "updates approved fields on a DRAFT job",
            async () => {
                const {
                    recruiter,
                    token,
                    company
                } =
                    await createRecruiterContext(
                        "draft-success"
                    );

                const job =
                    await createJobFor({
                        companyId:
                            company.id,

                        createdBy:
                            recruiter.id,

                        title:
                            "Backend Developer"
                    });

                const futureDeadline =
                    new Date(
                        Date.now() +
                        60 * 24 * 60 * 60 * 1000
                    );

                const response =
                    await request(app)
                        .put(
                            `/api/jobs/${job.id}`
                        )
                        .set(
                            "Authorization",
                            `Bearer ${token}`
                        )
                        .send({
                            description:
                                "Updated backend developer description.",

                            location:
                                "Bengaluru",

                            workMode:
                                "REMOTE",

                            minimumSalary:
                                500000,

                            maximumSalary:
                                900000,

                            vacancies:
                                4,

                            applicationDeadline:
                                futureDeadline.toISOString()
                        })
                        .expect(200);

                expect(
                    response.body.success
                ).toBe(true);

                expect(
                    response.body.message
                ).toBe(
                    "Job updated successfully."
                );

                expect(
                    response.body.data.description
                ).toBe(
                    "Updated backend developer description."
                );

                expect(
                    response.body.data.location
                ).toBe(
                    "Bengaluru"
                );

                expect(
                    response.body.data.workMode
                ).toBe(
                    "REMOTE"
                );

                expect(
                    Number(
                        response.body.data.minimumSalary
                    )
                ).toBe(
                    500000
                );

                expect(
                    Number(
                        response.body.data.maximumSalary
                    )
                ).toBe(
                    900000
                );

                expect(
                    response.body.data.vacancies
                ).toBe(4);

                const storedJob =
                    await Job.findByPk(
                        job.id
                    );

                expect(
                    storedJob.description
                ).toBe(
                    "Updated backend developer description."
                );

                expect(
                    storedJob.location
                ).toBe(
                    "Bengaluru"
                );

                expect(
                    storedJob.workMode
                ).toBe(
                    "REMOTE"
                );
            }
        );

        test(
            "updates the slug when a DRAFT title changes",
            async () => {
                const {
                    recruiter,
                    token,
                    company
                } =
                    await createRecruiterContext(
                        "title-change"
                    );

                const job =
                    await createJobFor({
                        companyId:
                            company.id,

                        createdBy:
                            recruiter.id,

                        title:
                            "Backend Developer"
                    });

                const response =
                    await request(app)
                        .put(
                            `/api/jobs/${job.id}`
                        )
                        .set(
                            "Authorization",
                            `Bearer ${token}`
                        )
                        .send({
                            title:
                                "Senior Platform Engineer"
                        })
                        .expect(200);

                expect(
                    response.body.data.title
                ).toBe(
                    "Senior Platform Engineer"
                );

                expect(
                    response.body.data.slug
                ).toBe(
                    "senior-platform-engineer"
                );

                const storedJob =
                    await Job.findByPk(
                        job.id
                    );

                expect(
                    storedJob.title
                ).toBe(
                    "Senior Platform Engineer"
                );

                expect(
                    storedJob.slug
                ).toBe(
                    "senior-platform-engineer"
                );
            }
        );

        test(
            "generates a unique slug when the updated title collides",
            async () => {
                const {
                    recruiter,
                    token,
                    company
                } =
                    await createRecruiterContext(
                        "slug-collision"
                    );

                await createJobFor({
                    companyId:
                        company.id,

                    createdBy:
                        recruiter.id,

                    title:
                        "Platform Engineer",

                    overrides: {
                        slug:
                            "platform-engineer"
                    }
                });

                const jobToUpdate =
                    await createJobFor({
                        companyId:
                            company.id,

                        createdBy:
                            recruiter.id,

                        title:
                            "Backend Engineer"
                    });

                const response =
                    await request(app)
                        .put(
                            `/api/jobs/${jobToUpdate.id}`
                        )
                        .set(
                            "Authorization",
                            `Bearer ${token}`
                        )
                        .send({
                            title:
                                "Platform Engineer"
                        })
                        .expect(200);

                expect(
                    response.body.data.slug
                ).toBe(
                    "platform-engineer-2"
                );
            }
        );

        test(
            "allows safe fields to be updated on a PUBLISHED job",
            async () => {
                const {
                    recruiter,
                    token,
                    company
                } =
                    await createRecruiterContext(
                        "published-safe"
                    );

                const job =
                    await createJobFor({
                        companyId:
                            company.id,

                        createdBy:
                            recruiter.id,

                        title:
                            "Published Backend Job",

                        status:
                            "PUBLISHED"
                    });

                const response =
                    await request(app)
                        .put(
                            `/api/jobs/${job.id}`
                        )
                        .set(
                            "Authorization",
                            `Bearer ${token}`
                        )
                        .send({
                            description:
                                "Updated published description.",

                            responsibilities:
                                "Updated published responsibilities.",

                            location:
                                "Chennai",

                            workMode:
                                "REMOTE",

                            vacancies:
                                5
                        })
                        .expect(200);

                expect(
                    response.body.data.status
                ).toBe(
                    "PUBLISHED"
                );

                expect(
                    response.body.data.description
                ).toBe(
                    "Updated published description."
                );

                expect(
                    response.body.data.location
                ).toBe(
                    "Chennai"
                );

                expect(
                    response.body.data.workMode
                ).toBe(
                    "REMOTE"
                );

                expect(
                    response.body.data.vacancies
                ).toBe(5);
            }
        );

        test(
            "rejects restricted field changes on a PUBLISHED job",
            async () => {
                const {
                    recruiter,
                    token,
                    company
                } =
                    await createRecruiterContext(
                        "published-restricted"
                    );

                const job =
                    await createJobFor({
                        companyId:
                            company.id,

                        createdBy:
                            recruiter.id,

                        title:
                            "Published Restricted Job",

                        status:
                            "PUBLISHED"
                    });

                const response =
                    await request(app)
                        .put(
                            `/api/jobs/${job.id}`
                        )
                        .set(
                            "Authorization",
                            `Bearer ${token}`
                        )
                        .send({
                            title:
                                "Changed Published Title"
                        })
                        .expect(409);

                expect(
                    response.body.code
                ).toBe(
                    "JOB_UPDATE_NOT_ALLOWED"
                );

                const storedJob =
                    await Job.findByPk(
                        job.id
                    );

                expect(
                    storedJob.title
                ).toBe(
                    "Published Restricted Job"
                );
            }
        );

        test.each([
            "CLOSED",
            "REMOVED"
        ])(
            "rejects normal updates when job status is %s",
            async (status) => {
                const {
                    recruiter,
                    token,
                    company
                } =
                    await createRecruiterContext(
                        `blocked-${status}`
                    );

                const job =
                    await createJobFor({
                        companyId:
                            company.id,

                        createdBy:
                            recruiter.id,

                        title:
                            `${status} Job`,

                        status
                    });

                const response =
                    await request(app)
                        .put(
                            `/api/jobs/${job.id}`
                        )
                        .set(
                            "Authorization",
                            `Bearer ${token}`
                        )
                        .send({
                            description:
                                "This update must not be accepted."
                        })
                        .expect(409);

                expect(
                    response.body.code
                ).toBe(
                    "JOB_UPDATE_NOT_ALLOWED"
                );
            }
        );

        test(
            "rejects protected lifecycle and counter fields",
            async () => {
                const {
                    recruiter,
                    token,
                    company
                } =
                    await createRecruiterContext(
                        "protected-fields"
                    );

                const job =
                    await createJobFor({
                        companyId:
                            company.id,

                        createdBy:
                            recruiter.id,

                        title:
                            "Protected Fields Job"
                    });

                const response =
                    await request(app)
                        .put(
                            `/api/jobs/${job.id}`
                        )
                        .set(
                            "Authorization",
                            `Bearer ${token}`
                        )
                        .send({
                            status:
                                "PUBLISHED",

                            createdBy:
                                recruiter.id,

                            viewCount:
                                999,

                            applicationCount:
                                999,

                            publishedAt:
                                new Date()
                                    .toISOString()
                        })
                        .expect(400);

                expect(
                    response.body.code
                ).toBe(
                    "UNSUPPORTED_JOB_FIELD"
                );

                expect(
                    response.body.errors
                ).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({
                            field:
                                "status"
                        }),

                        expect.objectContaining({
                            field:
                                "createdBy"
                        }),

                        expect.objectContaining({
                            field:
                                "viewCount"
                        }),

                        expect.objectContaining({
                            field:
                                "applicationCount"
                        }),

                        expect.objectContaining({
                            field:
                                "publishedAt"
                        })
                    ])
                );
            }
        );

        test(
            "rejects an empty update body",
            async () => {
                const {
                    recruiter,
                    token,
                    company
                } =
                    await createRecruiterContext(
                        "empty-update"
                    );

                const job =
                    await createJobFor({
                        companyId:
                            company.id,

                        createdBy:
                            recruiter.id,

                        title:
                            "Empty Update Job"
                    });

                const response =
                    await request(app)
                        .put(
                            `/api/jobs/${job.id}`
                        )
                        .set(
                            "Authorization",
                            `Bearer ${token}`
                        )
                        .send({})
                        .expect(400);

                expect(
                    response.body.code
                ).toBe(
                    "NO_SUPPORTED_JOB_FIELDS"
                );
            }
        );

        test(
            "rejects an unsupported update field",
            async () => {
                const {
                    recruiter,
                    token,
                    company
                } =
                    await createRecruiterContext(
                        "unsupported-field"
                    );

                const job =
                    await createJobFor({
                        companyId:
                            company.id,

                        createdBy:
                            recruiter.id,

                        title:
                            "Unsupported Field Job"
                    });

                const response =
                    await request(app)
                        .put(
                            `/api/jobs/${job.id}`
                        )
                        .set(
                            "Authorization",
                            `Bearer ${token}`
                        )
                        .send({
                            randomField:
                                "not-supported"
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
            "rejects an invalid salary range",
            async () => {
                const {
                    recruiter,
                    token,
                    company
                } =
                    await createRecruiterContext(
                        "salary-range"
                    );

                const job =
                    await createJobFor({
                        companyId:
                            company.id,

                        createdBy:
                            recruiter.id,

                        title:
                            "Salary Range Job"
                    });

                const response =
                    await request(app)
                        .put(
                            `/api/jobs/${job.id}`
                        )
                        .set(
                            "Authorization",
                            `Bearer ${token}`
                        )
                        .send({
                            minimumSalary:
                                1000000,

                            maximumSalary:
                                500000
                        })
                        .expect(422);

                expect(
                    response.body.code
                ).toBe(
                    "INVALID_SALARY_RANGE"
                );
            }
        );

        test(
            "validates salary range using an existing stored value",
            async () => {
                const {
                    recruiter,
                    token,
                    company
                } =
                    await createRecruiterContext(
                        "salary-existing"
                    );

                const job =
                    await createJobFor({
                        companyId:
                            company.id,

                        createdBy:
                            recruiter.id,

                        title:
                            "Existing Salary Job",

                        overrides: {
                            minimumSalary:
                                400000,

                            maximumSalary:
                                800000
                        }
                    });

                const response =
                    await request(app)
                        .put(
                            `/api/jobs/${job.id}`
                        )
                        .set(
                            "Authorization",
                            `Bearer ${token}`
                        )
                        .send({
                            minimumSalary:
                                900000
                        })
                        .expect(422);

                expect(
                    response.body.code
                ).toBe(
                    "INVALID_SALARY_RANGE"
                );
            }
        );

        test(
            "rejects an invalid experience range",
            async () => {
                const {
                    recruiter,
                    token,
                    company
                } =
                    await createRecruiterContext(
                        "experience-range"
                    );

                const job =
                    await createJobFor({
                        companyId:
                            company.id,

                        createdBy:
                            recruiter.id,

                        title:
                            "Experience Range Job"
                    });

                const response =
                    await request(app)
                        .put(
                            `/api/jobs/${job.id}`
                        )
                        .set(
                            "Authorization",
                            `Bearer ${token}`
                        )
                        .send({
                            minimumExperience:
                                5,

                            maximumExperience:
                                2
                        })
                        .expect(422);

                expect(
                    response.body.code
                ).toBe(
                    "INVALID_EXPERIENCE_RANGE"
                );
            }
        );

        test(
            "rejects a past application deadline",
            async () => {
                const {
                    recruiter,
                    token,
                    company
                } =
                    await createRecruiterContext(
                        "past-deadline"
                    );

                const job =
                    await createJobFor({
                        companyId:
                            company.id,

                        createdBy:
                            recruiter.id,

                        title:
                            "Past Deadline Job"
                    });

                const response =
                    await request(app)
                        .put(
                            `/api/jobs/${job.id}`
                        )
                        .set(
                            "Authorization",
                            `Bearer ${token}`
                        )
                        .send({
                            applicationDeadline:
                                "2020-01-01T00:00:00.000Z"
                        })
                        .expect(422);

                expect(
                    response.body.code
                ).toBe(
                    "INVALID_APPLICATION_DEADLINE"
                );
            }
        );

        test(
            "rejects invalid request field values",
            async () => {
                const {
                    recruiter,
                    token,
                    company
                } =
                    await createRecruiterContext(
                        "validation-error"
                    );

                const job =
                    await createJobFor({
                        companyId:
                            company.id,

                        createdBy:
                            recruiter.id,

                        title:
                            "Validation Error Job"
                    });

                const response =
                    await request(app)
                        .put(
                            `/api/jobs/${job.id}`
                        )
                        .set(
                            "Authorization",
                            `Bearer ${token}`
                        )
                        .send({
                            workMode:
                                "INVALID_MODE",

                            vacancies:
                                0,

                            minimumExperience:
                                -1
                        })
                        .expect(422);

                expect(
                    response.body.code
                ).toBe(
                    "VALIDATION_ERROR"
                );

                expect(
                    response.body.errors
                        .length
                ).toBeGreaterThan(0);
            }
        );

        test(
            "prevents another recruiter from updating the job",
            async () => {
                const ownerContext =
                    await createRecruiterContext(
                        "owner"
                    );

                const attackerEmail =
                    createEmail(
                        "attacker"
                    );

                await createUser({
                    email:
                        attackerEmail,

                    role:
                        "RECRUITER"
                });

                const attackerToken =
                    await loginUser(
                        attackerEmail
                    );

                const job =
                    await createJobFor({
                        companyId:
                            ownerContext.company.id,

                        createdBy:
                            ownerContext.recruiter.id,

                        title:
                            "Owner Private Job"
                    });

                const response =
                    await request(app)
                        .put(
                            `/api/jobs/${job.id}`
                        )
                        .set(
                            "Authorization",
                            `Bearer ${attackerToken}`
                        )
                        .send({
                            description:
                                "Unauthorized description update."
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
                    storedJob.description
                ).toBe(
                    "Owner Private Job description"
                );
            }
        );

        test(
            "returns JOB_NOT_FOUND for a missing job",
            async () => {
                const email =
                    createEmail(
                        "missing-job"
                    );

                await createUser({
                    email,
                    role:
                        "RECRUITER"
                });

                const token =
                    await loginUser(
                        email
                    );

                const response =
                    await request(app)
                        .put(
                            `/api/jobs/${MISSING_JOB_ID}`
                        )
                        .set(
                            "Authorization",
                            `Bearer ${token}`
                        )
                        .send({
                            description:
                                "Updated description."
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
                const email =
                    createEmail(
                        "invalid-id"
                    );

                await createUser({
                    email,
                    role:
                        "RECRUITER"
                });

                const token =
                    await loginUser(
                        email
                    );

                const response =
                    await request(app)
                        .put(
                            "/api/jobs/not-a-valid-uuid"
                        )
                        .set(
                            "Authorization",
                            `Bearer ${token}`
                        )
                        .send({
                            description:
                                "Updated description."
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
            "rejects a JOB_SEEKER",
            async () => {
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
                        .put(
                            `/api/jobs/${MISSING_JOB_ID}`
                        )
                        .set(
                            "Authorization",
                            `Bearer ${token}`
                        )
                        .send({
                            description:
                                "Unauthorized update."
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
                        .put(
                            `/api/jobs/${MISSING_JOB_ID}`
                        )
                        .send({
                            description:
                                "Unauthenticated update."
                        })
                        .expect(401);

                expect(
                    response.body.code
                ).toBe(
                    "AUTHENTICATION_REQUIRED"
                );
            }
        );
    }
);
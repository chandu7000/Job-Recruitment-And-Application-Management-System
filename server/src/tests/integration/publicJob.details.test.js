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
    "publicjoblist.";

const TEST_COMPANY_SLUG_PREFIX =
    "public-job-company-";

const TEST_JOB_SLUG_PREFIX =
    "public-job-";

const PASSWORD =
    "Strong@Password123";

const DAY_IN_MILLISECONDS =
    24 * 60 * 60 * 1000;

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

    return (
        `${normalizedLabel}-` +
        `${Date.now()}-` +
        `${Math.random()
            .toString(36)
            .slice(2, 10)}`
    );
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
            .slice(0, 15);

    const uniquePart =
        `${Date.now()
            .toString(36)}` +
        `${Math.random()
            .toString(36)
            .slice(2, 7)}`;

    return (
        `${TEST_EMAIL_PREFIX}` +
        `${normalizedLabel}.` +
        `${uniquePart}@example.com`
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

const createRecruiter = async (
    label
) => {
    const passwordHash =
        await hashPassword(
            PASSWORD
        );

    return User.create({
        email:
            createEmail(label),

        passwordHash,

        role:
            "RECRUITER",

        status:
            "ACTIVE",

        emailVerifiedAt:
            new Date()
    });
};

const createCompany = async ({
    ownerId,
    label,
    status = "VERIFIED"
}) => {
    return Company.create({
        ownerId,

        companyName:
            `Public ${label}`,

        slug:
            `${TEST_COMPANY_SLUG_PREFIX}` +
            `${createUniqueValue(label)}`,

        companyEmail:
            createEmail(
                `${label}-company`
            ),

        companyPhone:
            "9876543210",

        description:
            `${label} company description`,

        website:
            "https://example.com",

        industry:
            "Technology",

        companySize:
            "51-200",

        foundedYear:
            2020,

        location:
            "Hyderabad",

        address:
            "Private company address",

        city:
            "Hyderabad",

        state:
            "Telangana",

        country:
            "India",

        postalCode:
            "500001",

        logoUrl:
            "https://example.com/logo.png",

        logoPublicId:
            "private-logo-public-id",

        status,

        verificationReason:
            status === "REJECTED"
                ? "Private rejection reason"
                : null
    });
};

const createJob = async ({
    companyId,
    createdBy,
    label,
    status = "PUBLISHED",

    skills = [
        "Java",
        "Spring Boot"
    ],

    location = "Hyderabad",

    workMode = "HYBRID",

    employmentType =
    "FULL_TIME",

    experienceLevel =
    "JUNIOR",

    minimumExperience = 1,

    maximumExperience = 3,

    minimumSalary = 400000,

    maximumSalary = 800000,

    applicationDeadline =
    new Date(
        Date.now() +
        10 *
        DAY_IN_MILLISECONDS
    ),

    publishedAt =
    new Date(
        Date.now() -
        DAY_IN_MILLISECONDS
    )
}) => {
    const lifecycleFields = {};

    if (
        status === "PUBLISHED"
    ) {
        lifecycleFields.publishedAt =
            publishedAt;
    }

    if (
        status === "CLOSED"
    ) {
        lifecycleFields.publishedAt =
            publishedAt;

        lifecycleFields.closedAt =
            new Date();

        lifecycleFields.closureReason =
            "RECRUITER_CLOSED";
    }

    if (
        status === "REMOVED"
    ) {
        lifecycleFields.removedAt =
            new Date();

        lifecycleFields.removalReason =
            "Private removal reason";
    }

    return Job.create({
        companyId,
        createdBy,

        title:
            `${label} Developer`,

        slug:
            `${TEST_JOB_SLUG_PREFIX}` +
            `${createUniqueValue(label)}`,

        description:
            `${label} description`,

        responsibilities:
            `${label} responsibilities`,

        requirements:
            `${label} requirements`,

        skills,
        location,
        workMode,
        employmentType,
        experienceLevel,
        minimumExperience,
        maximumExperience,
        minimumSalary,
        maximumSalary,

        salaryCurrency:
            "INR",

        vacancies:
            3,

        applicationDeadline,
        status,

        viewCount:
            7,

        applicationCount:
            4,

        ...lifecycleFields
    });
};

const expectPrivateFieldsAbsent = (
    job
) => {
    expect(job).not.toHaveProperty(
        "companyId"
    );

    expect(job).not.toHaveProperty(
        "createdBy"
    );

    expect(job).not.toHaveProperty(
        "status"
    );

    expect(job).not.toHaveProperty(
        "applicationCount"
    );

    expect(job).not.toHaveProperty(
        "closedAt"
    );

    expect(job).not.toHaveProperty(
        "closureReason"
    );

    expect(job).not.toHaveProperty(
        "removedAt"
    );

    expect(job).not.toHaveProperty(
        "removalReason"
    );

    expect(job).not.toHaveProperty(
        "deletedAt"
    );

    expect(job).not.toHaveProperty(
        "createdAt"
    );

    expect(job).not.toHaveProperty(
        "updatedAt"
    );

    expect(job.company).not
        .toHaveProperty(
            "ownerId"
        );

    expect(job.company).not
        .toHaveProperty(
            "companyEmail"
        );

    expect(job.company).not
        .toHaveProperty(
            "companyPhone"
        );

    expect(job.company).not
        .toHaveProperty(
            "address"
        );

    expect(job.company).not
        .toHaveProperty(
            "postalCode"
        );

    expect(job.company).not
        .toHaveProperty(
            "logoPublicId"
        );

    expect(job.company).not
        .toHaveProperty(
            "verificationReason"
        );

    expect(job.company).not
        .toHaveProperty(
            "status"
        );

    expect(job.company).not
        .toHaveProperty(
            "deletedAt"
        );
};

describe(
    "Public Job Details API",
    () => {
        beforeEach(cleanup);
        afterEach(cleanup);

        test(
            "returns an eligible public job by ID without authentication",
            async () => {
                const recruiter =
                    await createRecruiter(
                        "details-by-id"
                    );

                const company =
                    await createCompany({
                        ownerId:
                            recruiter.id,

                        label:
                            "Details By ID Company"
                    });

                const job =
                    await createJob({
                        companyId:
                            company.id,

                        createdBy:
                            recruiter.id,

                        label:
                            "Details By ID"
                    });

                const response =
                    await request(app)
                        .get(
                            `/api/public/jobs/${job.id}`
                        )
                        .expect(
                            "Content-Type",
                            /json/
                        )
                        .expect(200);

                expect(
                    response.body.success
                ).toBe(true);

                expect(
                    response.body.message
                ).toBe(
                    "Public job fetched successfully."
                );

                expect(
                    response.body.data.id
                ).toBe(job.id);

                expect(
                    response.body.data.title
                ).toBe(job.title);

                expect(
                    response.body.data.description
                ).toBe(
                    job.description
                );

                expect(
                    response.body.data
                        .responsibilities
                ).toBe(
                    job.responsibilities
                );

                expect(
                    response.body.data.requirements
                ).toBe(
                    job.requirements
                );

                expect(
                    response.body.data.company.id
                ).toBe(company.id);

                expectPrivateFieldsAbsent(
                    response.body.data
                );
            }
        );

        test(
            "returns an eligible public job by slug without authentication",
            async () => {
                const recruiter =
                    await createRecruiter(
                        "details-by-slug"
                    );

                const company =
                    await createCompany({
                        ownerId:
                            recruiter.id,

                        label:
                            "Details By Slug Company"
                    });

                const job =
                    await createJob({
                        companyId:
                            company.id,

                        createdBy:
                            recruiter.id,

                        label:
                            "Details By Slug"
                    });

                const response =
                    await request(app)
                        .get(
                            `/api/public/jobs/slug/${job.slug}`
                        )
                        .expect(200);

                expect(
                    response.body.success
                ).toBe(true);

                expect(
                    response.body.data.id
                ).toBe(job.id);

                expect(
                    response.body.data.slug
                ).toBe(job.slug);
            }
        );

        test(
            "increments view count after successful ID retrieval",
            async () => {
                const recruiter =
                    await createRecruiter(
                        "details-view-id"
                    );

                const company =
                    await createCompany({
                        ownerId:
                            recruiter.id,

                        label:
                            "Details View ID Company"
                    });

                const job =
                    await createJob({
                        companyId:
                            company.id,

                        createdBy:
                            recruiter.id,

                        label:
                            "Details View ID"
                    });

                expect(
                    Number(job.viewCount)
                ).toBe(7);

                const response =
                    await request(app)
                        .get(
                            `/api/public/jobs/${job.id}`
                        )
                        .expect(200);

                expect(
                    Number(
                        response.body.data
                            .viewCount
                    )
                ).toBe(8);

                await job.reload();

                expect(
                    Number(job.viewCount)
                ).toBe(8);
            }
        );

        test(
            "increments view count after successful slug retrieval",
            async () => {
                const recruiter =
                    await createRecruiter(
                        "details-view-slug"
                    );

                const company =
                    await createCompany({
                        ownerId:
                            recruiter.id,

                        label:
                            "Details View Slug Company"
                    });

                const job =
                    await createJob({
                        companyId:
                            company.id,

                        createdBy:
                            recruiter.id,

                        label:
                            "Details View Slug"
                    });

                await request(app)
                    .get(
                        `/api/public/jobs/slug/${job.slug}`
                    )
                    .expect(200);

                await job.reload();

                expect(
                    Number(job.viewCount)
                ).toBe(8);
            }
        );

        test.each([
            "DRAFT",
            "CLOSED",
            "REMOVED"
        ])(
            "returns controlled 404 for a %s job",
            async (status) => {
                const recruiter =
                    await createRecruiter(
                        `details-${status}`
                    );

                const company =
                    await createCompany({
                        ownerId:
                            recruiter.id,

                        label:
                            `Details ${status} Company`
                    });

                const job =
                    await createJob({
                        companyId:
                            company.id,

                        createdBy:
                            recruiter.id,

                        label:
                            `Details ${status}`,

                        status
                    });

                const response =
                    await request(app)
                        .get(
                            `/api/public/jobs/${job.id}`
                        )
                        .expect(404);

                expect(
                    response.body.code
                ).toBe(
                    "PUBLIC_JOB_NOT_FOUND"
                );

                expect(
                    response.body.message
                ).toBe(
                    "Public job not found."
                );

                await job.reload();

                expect(
                    Number(job.viewCount)
                ).toBe(7);
            }
        );

        test(
            "returns controlled 404 for an expired published job",
            async () => {
                const recruiter =
                    await createRecruiter(
                        "details-expired"
                    );

                const company =
                    await createCompany({
                        ownerId:
                            recruiter.id,

                        label:
                            "Details Expired Company"
                    });

                const job =
                    await createJob({
                        companyId:
                            company.id,

                        createdBy:
                            recruiter.id,

                        label:
                            "Details Expired",

                        applicationDeadline:
                            new Date(
                                Date.now() -
                                DAY_IN_MILLISECONDS
                            )
                    });

                const response =
                    await request(app)
                        .get(
                            `/api/public/jobs/${job.id}`
                        )
                        .expect(404);

                expect(
                    response.body.code
                ).toBe(
                    "PUBLIC_JOB_NOT_FOUND"
                );

                await job.reload();

                expect(
                    Number(job.viewCount)
                ).toBe(7);
            }
        );

        test(
            "returns controlled 404 for a soft-deleted job",
            async () => {
                const recruiter =
                    await createRecruiter(
                        "details-deleted-job"
                    );

                const company =
                    await createCompany({
                        ownerId:
                            recruiter.id,

                        label:
                            "Details Deleted Job Company"
                    });

                const job =
                    await createJob({
                        companyId:
                            company.id,

                        createdBy:
                            recruiter.id,

                        label:
                            "Details Deleted Job"
                    });

                await job.destroy();

                const response =
                    await request(app)
                        .get(
                            `/api/public/jobs/${job.id}`
                        )
                        .expect(404);

                expect(
                    response.body.code
                ).toBe(
                    "PUBLIC_JOB_NOT_FOUND"
                );

                const deletedJob =
                    await Job.findByPk(
                        job.id,
                        {
                            paranoid: false
                        }
                    );

                expect(
                    Number(
                        deletedJob.viewCount
                    )
                ).toBe(7);
            }
        );

        test(
            "returns controlled 404 for a job belonging to an unverified company",
            async () => {
                const recruiter =
                    await createRecruiter(
                        "details-unverified-company"
                    );

                const company =
                    await createCompany({
                        ownerId:
                            recruiter.id,

                        label:
                            "Details Unverified Company",

                        status:
                            "DRAFT"
                    });

                const job =
                    await createJob({
                        companyId:
                            company.id,

                        createdBy:
                            recruiter.id,

                        label:
                            "Details Unverified Job"
                    });

                const response =
                    await request(app)
                        .get(
                            `/api/public/jobs/${job.id}`
                        )
                        .expect(404);

                expect(
                    response.body.code
                ).toBe(
                    "PUBLIC_JOB_NOT_FOUND"
                );

                await job.reload();

                expect(
                    Number(job.viewCount)
                ).toBe(7);
            }
        );

        test(
            "returns controlled 404 for a job belonging to a soft-deleted company",
            async () => {
                const recruiter =
                    await createRecruiter(
                        "details-deleted-company"
                    );

                const company =
                    await createCompany({
                        ownerId:
                            recruiter.id,

                        label:
                            "Details Deleted Company"
                    });

                const job =
                    await createJob({
                        companyId:
                            company.id,

                        createdBy:
                            recruiter.id,

                        label:
                            "Details Deleted Company Job"
                    });

                await company.destroy();

                const response =
                    await request(app)
                        .get(
                            `/api/public/jobs/${job.id}`
                        )
                        .expect(404);

                expect(
                    response.body.code
                ).toBe(
                    "PUBLIC_JOB_NOT_FOUND"
                );

                await job.reload();

                expect(
                    Number(job.viewCount)
                ).toBe(7);
            }
        );

        test(
            "returns controlled 404 for an unknown valid job ID",
            async () => {
                const response =
                    await request(app)
                        .get(
                            "/api/public/jobs/11111111-1111-4111-8111-111111111111"
                        )
                        .expect(404);

                expect(
                    response.body.code
                ).toBe(
                    "PUBLIC_JOB_NOT_FOUND"
                );
            }
        );

        test(
            "returns controlled 404 for an unknown valid slug",
            async () => {
                const response =
                    await request(app)
                        .get(
                            "/api/public/jobs/slug/unknown-public-job"
                        )
                        .expect(404);

                expect(
                    response.body.code
                ).toBe(
                    "PUBLIC_JOB_NOT_FOUND"
                );
            }
        );

        test(
            "rejects an invalid job UUID",
            async () => {
                const response =
                    await request(app)
                        .get(
                            "/api/public/jobs/invalid-id"
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

        test.each([
            "Invalid-Slug",
            "invalid_slug",
            "invalid slug",
            "invalid@slug"
        ])(
            "rejects invalid public job slug %s",
            async (slug) => {
                const response =
                    await request(app)
                        .get(
                            `/api/public/jobs/slug/${encodeURIComponent(
                                slug
                            )}`
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
                                "slug"
                        })
                    ])
                );
            }
        );

        test(
            "does not interpret the slug route as the UUID route",
            async () => {
                const recruiter =
                    await createRecruiter(
                        "details-route-order"
                    );

                const company =
                    await createCompany({
                        ownerId:
                            recruiter.id,

                        label:
                            "Details Route Order Company"
                    });

                const job =
                    await createJob({
                        companyId:
                            company.id,

                        createdBy:
                            recruiter.id,

                        label:
                            "Details Route Order"
                    });

                const response =
                    await request(app)
                        .get(
                            `/api/public/jobs/slug/${job.slug}`
                        )
                        .expect(200);

                expect(
                    response.body.data.id
                ).toBe(job.id);

                expect(
                    response.body.code
                ).toBeUndefined();
            }
        );

        test(
            "does not expose private job or company fields",
            async () => {
                const recruiter =
                    await createRecruiter(
                        "details-private-fields"
                    );

                const company =
                    await createCompany({
                        ownerId:
                            recruiter.id,

                        label:
                            "Details Private Fields Company"
                    });

                const job =
                    await createJob({
                        companyId:
                            company.id,

                        createdBy:
                            recruiter.id,

                        label:
                            "Details Private Fields"
                    });

                const response =
                    await request(app)
                        .get(
                            `/api/public/jobs/${job.id}`
                        )
                        .expect(200);

                expectPrivateFieldsAbsent(
                    response.body.data
                );

                expect(
                    response.body.data
                ).not.toHaveProperty(
                    "createdBy"
                );

                expect(
                    response.body.data
                ).not.toHaveProperty(
                    "status"
                );

                expect(
                    response.body.data
                ).not.toHaveProperty(
                    "applicationCount"
                );

                expect(
                    response.body.data.company
                ).not.toHaveProperty(
                    "ownerId"
                );

                expect(
                    response.body.data.company
                ).not.toHaveProperty(
                    "verificationReason"
                );
            }
        );

        test(
            "returns similar eligible public jobs",
            async () => {
                const recruiter =
                    await createRecruiter(
                        "similar-success"
                    );

                const company =
                    await createCompany({
                        ownerId:
                            recruiter.id,

                        label:
                            "Similar Success Company"
                    });

                const sourceJob =
                    await createJob({
                        companyId:
                            company.id,

                        createdBy:
                            recruiter.id,

                        label:
                            "Source Java",

                        skills: [
                            "Java",
                            "Spring Boot"
                        ],

                        location:
                            "Hyderabad",

                        workMode:
                            "HYBRID",

                        employmentType:
                            "FULL_TIME",

                        experienceLevel:
                            "JUNIOR"
                    });

                const similarJob =
                    await createJob({
                        companyId:
                            company.id,

                        createdBy:
                            recruiter.id,

                        label:
                            "Similar Java",

                        skills: [
                            "Java",
                            "MySQL"
                        ],

                        location:
                            "Hyderabad",

                        workMode:
                            "HYBRID",

                        employmentType:
                            "FULL_TIME",

                        experienceLevel:
                            "JUNIOR"
                    });

                await createJob({
                    companyId:
                        company.id,

                    createdBy:
                        recruiter.id,

                    label:
                        "Unrelated Python",

                    skills: [
                        "Python"
                    ],

                    location:
                        "Delhi",

                    workMode:
                        "REMOTE",

                    employmentType:
                        "CONTRACT",

                    experienceLevel:
                        "SENIOR",

                    minimumSalary:
                        1200000,

                    maximumSalary:
                        1800000
                });

                const response =
                    await request(app)
                        .get(
                            `/api/public/jobs/${sourceJob.id}/similar`
                        )
                        .expect(200);

                expect(
                    response.body.success
                ).toBe(true);

                expect(
                    response.body.message
                ).toBe(
                    "Similar public jobs fetched successfully."
                );

                expect(
                    response.body.data
                        .map(
                            (job) =>
                                job.id
                        )
                ).toContain(
                    similarJob.id
                );

                expect(
                    response.body.data
                        .map(
                            (job) =>
                                job.id
                        )
                ).not.toContain(
                    sourceJob.id
                );
            }
        );

        test(
            "orders stronger similar jobs before weaker matches",
            async () => {
                const recruiter =
                    await createRecruiter(
                        "similar-ranking"
                    );

                const company =
                    await createCompany({
                        ownerId:
                            recruiter.id,

                        label:
                            "Similar Ranking Company"
                    });

                const sourceJob =
                    await createJob({
                        companyId:
                            company.id,

                        createdBy:
                            recruiter.id,

                        label:
                            "Ranking Source",

                        skills: [
                            "Java",
                            "Spring Boot"
                        ]
                    });

                const strongMatch =
                    await createJob({
                        companyId:
                            company.id,

                        createdBy:
                            recruiter.id,

                        label:
                            "Strong Match",

                        skills: [
                            "Java",
                            "Spring Boot"
                        ],

                        location:
                            "Hyderabad",

                        workMode:
                            "HYBRID",

                        employmentType:
                            "FULL_TIME",

                        experienceLevel:
                            "JUNIOR"
                    });

                const weakerMatch =
                    await createJob({
                        companyId:
                            company.id,

                        createdBy:
                            recruiter.id,

                        label:
                            "Weak Match",

                        skills: [
                            "Java"
                        ],

                        location:
                            "Delhi",

                        workMode:
                            "REMOTE",

                        employmentType:
                            "CONTRACT",

                        experienceLevel:
                            "SENIOR"
                    });

                const response =
                    await request(app)
                        .get(
                            `/api/public/jobs/${sourceJob.id}/similar`
                        )
                        .expect(200);

                const ids =
                    response.body.data.map(
                        (job) =>
                            job.id
                    );

                expect(
                    ids.indexOf(
                        strongMatch.id
                    )
                ).toBeLessThan(
                    ids.indexOf(
                        weakerMatch.id
                    )
                );
            }
        );

        test(
            "excludes unavailable jobs from similar results",
            async () => {
                const recruiter =
                    await createRecruiter(
                        "similar-ineligible"
                    );

                const company =
                    await createCompany({
                        ownerId:
                            recruiter.id,

                        label:
                            "Similar Ineligible Company"
                    });

                const sourceJob =
                    await createJob({
                        companyId:
                            company.id,

                        createdBy:
                            recruiter.id,

                        label:
                            "Ineligible Source"
                    });

                const eligibleJob =
                    await createJob({
                        companyId:
                            company.id,

                        createdBy:
                            recruiter.id,

                        label:
                            "Ineligible Eligible"
                    });

                await createJob({
                    companyId:
                        company.id,

                    createdBy:
                        recruiter.id,

                    label:
                        "Ineligible Draft",

                    status:
                        "DRAFT"
                });

                await createJob({
                    companyId:
                        company.id,

                    createdBy:
                        recruiter.id,

                    label:
                        "Ineligible Closed",

                    status:
                        "CLOSED"
                });

                await createJob({
                    companyId:
                        company.id,

                    createdBy:
                        recruiter.id,

                    label:
                        "Ineligible Removed",

                    status:
                        "REMOVED"
                });

                await createJob({
                    companyId:
                        company.id,

                    createdBy:
                        recruiter.id,

                    label:
                        "Ineligible Expired",

                    applicationDeadline:
                        new Date(
                            Date.now() -
                            DAY_IN_MILLISECONDS
                        )
                });

                const response =
                    await request(app)
                        .get(
                            `/api/public/jobs/${sourceJob.id}/similar`
                        )
                        .expect(200);

                expect(
                    response.body.data
                        .map(
                            (job) =>
                                job.id
                        )
                ).toEqual([
                    eligibleJob.id
                ]);
            }
        );

        test(
            "obeys the requested similar-job limit",
            async () => {
                const recruiter =
                    await createRecruiter(
                        "similar-limit"
                    );

                const company =
                    await createCompany({
                        ownerId:
                            recruiter.id,

                        label:
                            "Similar Limit Company"
                    });

                const sourceJob =
                    await createJob({
                        companyId:
                            company.id,

                        createdBy:
                            recruiter.id,

                        label:
                            "Limit Source"
                    });

                for (
                    let index = 1;
                    index <= 5;
                    index += 1
                ) {
                    await createJob({
                        companyId:
                            company.id,

                        createdBy:
                            recruiter.id,

                        label:
                            `Limit Match ${index}`
                    });
                }

                const response =
                    await request(app)
                        .get(
                            `/api/public/jobs/${sourceJob.id}/similar`
                        )
                        .query({
                            limit:
                                2
                        })
                        .expect(200);

                expect(
                    response.body.data
                ).toHaveLength(2);

                expect(
                    response.body.meta.limit
                ).toBe(2);

                expect(
                    response.body.meta.count
                ).toBe(2);
            }
        );

        test.each([
            0,
            11,
            -1,
            "invalid"
        ])(
            "rejects invalid similar-job limit %s",
            async (limit) => {
                const response =
                    await request(app)
                        .get(
                            "/api/public/jobs/11111111-1111-4111-8111-111111111111/similar"
                        )
                        .query({
                            limit
                        })
                        .expect(422);

                expect(
                    response.body.code
                ).toBe(
                    "VALIDATION_ERROR"
                );
            }
        );

        test(
            "returns controlled 404 when source job is unavailable",
            async () => {
                const recruiter =
                    await createRecruiter(
                        "similar-source-unavailable"
                    );

                const company =
                    await createCompany({
                        ownerId:
                            recruiter.id,

                        label:
                            "Similar Source Unavailable Company"
                    });

                const draftJob =
                    await createJob({
                        companyId:
                            company.id,

                        createdBy:
                            recruiter.id,

                        label:
                            "Similar Source Draft",

                        status:
                            "DRAFT"
                    });

                const response =
                    await request(app)
                        .get(
                            `/api/public/jobs/${draftJob.id}/similar`
                        )
                        .expect(404);

                expect(
                    response.body.code
                ).toBe(
                    "PUBLIC_JOB_NOT_FOUND"
                );
            }
        );

        test(
            "does not increment source job views when requesting similar jobs",
            async () => {
                const recruiter =
                    await createRecruiter(
                        "similar-no-view"
                    );

                const company =
                    await createCompany({
                        ownerId:
                            recruiter.id,

                        label:
                            "Similar No View Company"
                    });

                const sourceJob =
                    await createJob({
                        companyId:
                            company.id,

                        createdBy:
                            recruiter.id,

                        label:
                            "Similar No View Source"
                    });

                await createJob({
                    companyId:
                        company.id,

                    createdBy:
                        recruiter.id,

                    label:
                        "Similar No View Match"
                });

                await request(app)
                    .get(
                        `/api/public/jobs/${sourceJob.id}/similar`
                    )
                    .expect(200);

                await sourceJob.reload();

                expect(
                    Number(
                        sourceJob.viewCount
                    )
                ).toBe(7);
            }
        );

        test(
            "does not expose private fields in similar jobs",
            async () => {
                const recruiter =
                    await createRecruiter(
                        "similar-private"
                    );

                const company =
                    await createCompany({
                        ownerId:
                            recruiter.id,

                        label:
                            "Similar Private Company"
                    });

                const sourceJob =
                    await createJob({
                        companyId:
                            company.id,

                        createdBy:
                            recruiter.id,

                        label:
                            "Similar Private Source"
                    });

                await createJob({
                    companyId:
                        company.id,

                    createdBy:
                        recruiter.id,

                    label:
                        "Similar Private Match"
                });

                const response =
                    await request(app)
                        .get(
                            `/api/public/jobs/${sourceJob.id}/similar`
                        )
                        .expect(200);

                expectPrivateFieldsAbsent(
                    response.body.data[0]
                );
            }
        );
    }
);
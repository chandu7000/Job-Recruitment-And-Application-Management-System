import request from "supertest";

import {
    Op
} from "sequelize";

import Job from
    "../../models/job.model.js";

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

const TEST_EMAIL_PREFIX =
    "publicjoblist.";

const TEST_COMPANY_SLUG_PREFIX =
    "public-job-company-";

const PASSWORD =
    "Strong@Password123";

const TEST_JOB_SLUG_PREFIX =
    "public-company-job-";

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

    // Delete child job records first.
    await Job.unscoped().destroy({
        where: {
            createdBy: {
                [Op.in]:
                    userIds
            }
        },

        force:
            true
    });

    // Delete companies only after jobs are removed.
    await Company.unscoped().destroy({
        where: {
            ownerId: {
                [Op.in]:
                    userIds
            }
        },

        force:
            true
    });

    await UserSession.unscoped().destroy({
        where: {
            userId: {
                [Op.in]:
                    userIds
            }
        },

        force:
            true
    });

    await User.unscoped().destroy({
        where: {
            id: {
                [Op.in]:
                    userIds
            }
        },

        force:
            true
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

const createCompanyJob =
    async ({
        companyId,
        createdBy,
        label,
        status = "PUBLISHED",
        title,
        location = "Hyderabad",
        workMode = "HYBRID",
        employmentType =
        "FULL_TIME",
        experienceLevel =
        "JUNIOR",
        skills = [
            "Java",
            "Spring Boot"
        ],
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
                title ??
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
                3,

            applicationDeadline,
            status,

            viewCount:
                7,

            applicationCount:
                0,

            ...lifecycleFields
        });
    };

describe(
    "Public Company Details API",
    () => {
        beforeEach(cleanup);
        afterEach(cleanup);

        test(
            "returns a verified company by ID without authentication",
            async () => {
                const recruiter =
                    await createRecruiter(
                        "public-company-id"
                    );

                const company =
                    await createCompany({
                        ownerId:
                            recruiter.id,

                        label:
                            "Public Company ID",

                        status:
                            "VERIFIED"
                    });

                const response =
                    await request(app)
                        .get(
                            `/api/public/companies/${company.id}`
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
                    "Public company fetched successfully."
                );

                expect(
                    response.body.data.id
                ).toBe(company.id);

                expect(
                    response.body.data.companyName
                ).toBe(
                    company.companyName
                );

                expect(
                    response.body.data.description
                ).toBe(
                    company.description
                );
            }
        );

        test(
            "returns a verified company by slug without authentication",
            async () => {
                const recruiter =
                    await createRecruiter(
                        "public-company-slug"
                    );

                const company =
                    await createCompany({
                        ownerId:
                            recruiter.id,

                        label:
                            "Public Company Slug",

                        status:
                            "VERIFIED"
                    });

                const response =
                    await request(app)
                        .get(
                            `/api/public/companies/slug/${company.slug}`
                        )
                        .expect(200);

                expect(
                    response.body.data.id
                ).toBe(company.id);

                expect(
                    response.body.data.slug
                ).toBe(company.slug);
            }
        );

        test.each([
            "DRAFT",
            "PENDING_VERIFICATION",
            "REJECTED"
        ])(
            "returns controlled 404 for a %s company",
            async (status) => {
                const recruiter =
                    await createRecruiter(
                        `public-company-${status}`
                    );

                const company =
                    await createCompany({
                        ownerId:
                            recruiter.id,

                        label:
                            `Public Company ${status}`,

                        status
                    });

                const response =
                    await request(app)
                        .get(
                            `/api/public/companies/${company.id}`
                        )
                        .expect(404);

                expect(
                    response.body.code
                ).toBe(
                    "PUBLIC_COMPANY_NOT_FOUND"
                );

                expect(
                    response.body.message
                ).toBe(
                    "Public company not found."
                );
            }
        );

        test(
            "returns controlled 404 for a soft-deleted company",
            async () => {
                const recruiter =
                    await createRecruiter(
                        "public-company-deleted"
                    );

                const company =
                    await createCompany({
                        ownerId:
                            recruiter.id,

                        label:
                            "Public Company Deleted",

                        status:
                            "VERIFIED"
                    });

                await company.destroy();

                const response =
                    await request(app)
                        .get(
                            `/api/public/companies/${company.id}`
                        )
                        .expect(404);

                expect(
                    response.body.code
                ).toBe(
                    "PUBLIC_COMPANY_NOT_FOUND"
                );

                const deletedCompany =
                    await Company.findByPk(
                        company.id,
                        {
                            paranoid:
                                false
                        }
                    );

                expect(
                    deletedCompany
                ).not.toBeNull();
            }
        );

        test(
            "returns controlled 404 for an unknown valid company ID",
            async () => {
                const response =
                    await request(app)
                        .get(
                            "/api/public/companies/11111111-1111-4111-8111-111111111111"
                        )
                        .expect(404);

                expect(
                    response.body.code
                ).toBe(
                    "PUBLIC_COMPANY_NOT_FOUND"
                );
            }
        );

        test(
            "returns controlled 404 for an unknown valid company slug",
            async () => {
                const response =
                    await request(app)
                        .get(
                            "/api/public/companies/slug/unknown-public-company"
                        )
                        .expect(404);

                expect(
                    response.body.code
                ).toBe(
                    "PUBLIC_COMPANY_NOT_FOUND"
                );
            }
        );

        test(
            "rejects an invalid company UUID",
            async () => {
                const response =
                    await request(app)
                        .get(
                            "/api/public/companies/invalid-id"
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
                                "companyId"
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
            "rejects invalid company slug %s",
            async (slug) => {
                const response =
                    await request(app)
                        .get(
                            `/api/public/companies/slug/${encodeURIComponent(
                                slug
                            )}`
                        )
                        .expect(422);

                expect(
                    response.body.code
                ).toBe(
                    "VALIDATION_ERROR"
                );
            }
        );

        test(
            "does not interpret the slug route as the UUID route",
            async () => {
                const recruiter =
                    await createRecruiter(
                        "public-company-route-order"
                    );

                const company =
                    await createCompany({
                        ownerId:
                            recruiter.id,

                        label:
                            "Public Company Route Order",

                        status:
                            "VERIFIED"
                    });

                const response =
                    await request(app)
                        .get(
                            `/api/public/companies/slug/${company.slug}`
                        )
                        .expect(200);

                expect(
                    response.body.data.id
                ).toBe(company.id);
            }
        );

        test(
            "does not expose private company or recruiter fields",
            async () => {
                const recruiter =
                    await createRecruiter(
                        "public-company-private"
                    );

                const company =
                    await createCompany({
                        ownerId:
                            recruiter.id,

                        label:
                            "Public Company Private",

                        status:
                            "VERIFIED"
                    });

                const response =
                    await request(app)
                        .get(
                            `/api/public/companies/${company.id}`
                        )
                        .expect(200);

                const publicCompany =
                    response.body.data;

                expect(
                    publicCompany
                ).not.toHaveProperty(
                    "ownerId"
                );

                expect(
                    publicCompany
                ).not.toHaveProperty(
                    "companyEmail"
                );

                expect(
                    publicCompany
                ).not.toHaveProperty(
                    "companyPhone"
                );

                expect(
                    publicCompany
                ).not.toHaveProperty(
                    "address"
                );

                expect(
                    publicCompany
                ).not.toHaveProperty(
                    "postalCode"
                );

                expect(
                    publicCompany
                ).not.toHaveProperty(
                    "logoPublicId"
                );

                expect(
                    publicCompany
                ).not.toHaveProperty(
                    "status"
                );

                expect(
                    publicCompany
                ).not.toHaveProperty(
                    "verificationReason"
                );

                expect(
                    publicCompany
                ).not.toHaveProperty(
                    "deletedAt"
                );

                expect(
                    publicCompany
                ).not.toHaveProperty(
                    "owner"
                );

                expect(
                    publicCompany
                ).not.toHaveProperty(
                    "verificationHistory"
                );
            }
        );

        test(
            "returns only eligible jobs belonging to the requested company",
            async () => {
                const recruiter =
                    await createRecruiter(
                        "company-jobs-owner"
                    );

                const otherRecruiter =
                    await createRecruiter(
                        "company-jobs-other"
                    );

                const company =
                    await createCompany({
                        ownerId:
                            recruiter.id,

                        label:
                            "Company Jobs Owner",

                        status:
                            "VERIFIED"
                    });

                const otherCompany =
                    await createCompany({
                        ownerId:
                            otherRecruiter.id,

                        label:
                            "Company Jobs Other",

                        status:
                            "VERIFIED"
                    });

                const matchingJob =
                    await createCompanyJob({
                        companyId:
                            company.id,

                        createdBy:
                            recruiter.id,

                        label:
                            "Matching Java"
                    });

                await createCompanyJob({
                    companyId:
                        otherCompany.id,

                    createdBy:
                        otherRecruiter.id,

                    label:
                        "Other Company"
                });

                const response =
                    await request(app)
                        .get(
                            `/api/public/companies/${company.id}/jobs`
                        )
                        .expect(200);

                expect(
                    response.body.data
                ).toHaveLength(1);

                expect(
                    response.body.data[0].id
                ).toBe(
                    matchingJob.id
                );

                expect(
                    response.body.meta.totalRecords
                ).toBe(1);
            }
        );

        test(
            "returns company jobs by company slug",
            async () => {
                const recruiter =
                    await createRecruiter(
                        "company-jobs-slug"
                    );

                const company =
                    await createCompany({
                        ownerId:
                            recruiter.id,

                        label:
                            "Company Jobs Slug",

                        status:
                            "VERIFIED"
                    });

                const job =
                    await createCompanyJob({
                        companyId:
                            company.id,

                        createdBy:
                            recruiter.id,

                        label:
                            "Slug Job"
                    });

                const response =
                    await request(app)
                        .get(
                            `/api/public/companies/slug/${company.slug}/jobs`
                        )
                        .expect(200);

                expect(
                    response.body.data
                ).toHaveLength(1);

                expect(
                    response.body.data[0].id
                ).toBe(job.id);
            }
        );

        test(
            "excludes draft closed removed expired and deleted company jobs",
            async () => {
                const recruiter =
                    await createRecruiter(
                        "company-jobs-ineligible"
                    );

                const company =
                    await createCompany({
                        ownerId:
                            recruiter.id,

                        label:
                            "Company Jobs Ineligible",

                        status:
                            "VERIFIED"
                    });

                const eligibleJob =
                    await createCompanyJob({
                        companyId:
                            company.id,

                        createdBy:
                            recruiter.id,

                        label:
                            "Eligible"
                    });

                await createCompanyJob({
                    companyId:
                        company.id,

                    createdBy:
                        recruiter.id,

                    label:
                        "Draft",

                    status:
                        "DRAFT"
                });

                await createCompanyJob({
                    companyId:
                        company.id,

                    createdBy:
                        recruiter.id,

                    label:
                        "Closed",

                    status:
                        "CLOSED"
                });

                await createCompanyJob({
                    companyId:
                        company.id,

                    createdBy:
                        recruiter.id,

                    label:
                        "Removed",

                    status:
                        "REMOVED"
                });

                await createCompanyJob({
                    companyId:
                        company.id,

                    createdBy:
                        recruiter.id,

                    label:
                        "Expired",

                    applicationDeadline:
                        new Date(
                            Date.now() -
                            DAY_IN_MILLISECONDS
                        )
                });

                const deletedJob =
                    await createCompanyJob({
                        companyId:
                            company.id,

                        createdBy:
                            recruiter.id,

                        label:
                            "Deleted"
                    });

                await deletedJob.destroy();

                const response =
                    await request(app)
                        .get(
                            `/api/public/companies/${company.id}/jobs`
                        )
                        .expect(200);

                expect(
                    response.body.data
                ).toHaveLength(1);

                expect(
                    response.body.data[0].id
                ).toBe(
                    eligibleJob.id
                );
            }
        );

        test(
            "supports search filters sorting and pagination for company jobs",
            async () => {
                const recruiter =
                    await createRecruiter(
                        "company-jobs-query"
                    );

                const company =
                    await createCompany({
                        ownerId:
                            recruiter.id,

                        label:
                            "Company Jobs Query",

                        status:
                            "VERIFIED"
                    });

                await createCompanyJob({
                    companyId:
                        company.id,

                    createdBy:
                        recruiter.id,

                    label:
                        "Java Backend",

                    title:
                        "Java Backend Developer",

                    workMode:
                        "HYBRID",

                    employmentType:
                        "FULL_TIME"
                });

                await createCompanyJob({
                    companyId:
                        company.id,

                    createdBy:
                        recruiter.id,

                    label:
                        "Python Backend",

                    title:
                        "Python Backend Developer",

                    workMode:
                        "REMOTE",

                    employmentType:
                        "CONTRACT"
                });

                const response =
                    await request(app)
                        .get(
                            `/api/public/companies/${company.id}/jobs`
                        )
                        .query({
                            search:
                                "Java",

                            workMode:
                                "HYBRID",

                            employmentType:
                                "FULL_TIME",

                            sort:
                                "titleAscending",

                            page:
                                1,

                            limit:
                                5
                        })
                        .expect(200);

                expect(
                    response.body.data
                ).toHaveLength(1);

                expect(
                    response.body.data[0].title
                ).toBe(
                    "Java Backend Developer"
                );

                expect(
                    response.body.meta
                ).toEqual(
                    expect.objectContaining({
                        page:
                            1,

                        limit:
                            5,

                        totalRecords:
                            1,

                        totalPages:
                            1
                    })
                );
            }
        );

        test(
            "returns an empty standardized result when company has no eligible jobs",
            async () => {
                const recruiter =
                    await createRecruiter(
                        "company-jobs-empty"
                    );

                const company =
                    await createCompany({
                        ownerId:
                            recruiter.id,

                        label:
                            "Company Jobs Empty",

                        status:
                            "VERIFIED"
                    });

                const response =
                    await request(app)
                        .get(
                            `/api/public/companies/${company.id}/jobs`
                        )
                        .expect(200);

                expect(
                    response.body.data
                ).toEqual([]);

                expect(
                    response.body.meta
                ).toEqual(
                    expect.objectContaining({
                        page:
                            1,

                        limit:
                            10,

                        totalRecords:
                            0,

                        totalPages:
                            1,

                        hasPreviousPage:
                            false,

                        hasNextPage:
                            false
                    })
                );
            }
        );

        test(
            "returns 404 for jobs of an unavailable company",
            async () => {
                const recruiter =
                    await createRecruiter(
                        "company-jobs-unavailable"
                    );

                const company =
                    await createCompany({
                        ownerId:
                            recruiter.id,

                        label:
                            "Company Jobs Unavailable",

                        status:
                            "DRAFT"
                    });

                const response =
                    await request(app)
                        .get(
                            `/api/public/companies/${company.id}/jobs`
                        )
                        .expect(404);

                expect(
                    response.body.code
                ).toBe(
                    "PUBLIC_COMPANY_NOT_FOUND"
                );
            }
        );

        test(
            "rejects invalid company-job query values",
            async () => {
                const recruiter =
                    await createRecruiter(
                        "company-jobs-validation"
                    );

                const company =
                    await createCompany({
                        ownerId:
                            recruiter.id,

                        label:
                            "Company Jobs Validation",

                        status:
                            "VERIFIED"
                    });

                const response =
                    await request(app)
                        .get(
                            `/api/public/companies/${company.id}/jobs`
                        )
                        .query({
                            workMode:
                                "INVALID",

                            page:
                                0
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
            "does not expose private fields in company job results",
            async () => {
                const recruiter =
                    await createRecruiter(
                        "company-jobs-private"
                    );

                const company =
                    await createCompany({
                        ownerId:
                            recruiter.id,

                        label:
                            "Company Jobs Private",

                        status:
                            "VERIFIED"
                    });

                await createCompanyJob({
                    companyId:
                        company.id,

                    createdBy:
                        recruiter.id,

                    label:
                        "Private Fields"
                });

                const response =
                    await request(app)
                        .get(
                            `/api/public/companies/${company.id}/jobs`
                        )
                        .expect(200);

                const job =
                    response.body.data[0];

                expect(job).not
                    .toHaveProperty(
                        "companyId"
                    );

                expect(job).not
                    .toHaveProperty(
                        "createdBy"
                    );

                expect(job).not
                    .toHaveProperty(
                        "status"
                    );

                expect(job).not
                    .toHaveProperty(
                        "deletedAt"
                    );

                expect(job).not
                    .toHaveProperty(
                        "applicationCount"
                    );

                expect(job.company).not
                    .toHaveProperty(
                        "ownerId"
                    );

                expect(job.company).not
                    .toHaveProperty(
                        "verificationReason"
                    );
            }
        );
    }
);
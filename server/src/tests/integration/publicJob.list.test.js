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
  "Public Job List API",
  () => {
    beforeEach(cleanup);
    afterEach(cleanup);

    test(
      "returns an eligible published job without authentication",
      async () => {
        const recruiter =
          await createRecruiter(
            "eligible"
          );

        const company =
          await createCompany({
            ownerId:
              recruiter.id,

            label:
              "Eligible Company"
          });

        const job =
          await createJob({
            companyId:
              company.id,

            createdBy:
              recruiter.id,

            label:
              "Eligible Backend"
          });

        const response =
          await request(app)
            .get(
              "/api/public/jobs"
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
          "Public jobs fetched successfully."
        );

        expect(
          response.body.data
        ).toHaveLength(1);

        expect(
          response.body.data[0]
            .id
        ).toBe(
          job.id
        );

        expect(
          response.body.data[0]
            .title
        ).toBe(
          job.title
        );

        expect(
          response.body.data[0]
            .company
            .id
        ).toBe(
          company.id
        );

        expect(
          response.body.data[0]
            .company
            .companyName
        ).toBe(
          company.companyName
        );

        expect(
          response.body.meta
        ).toEqual({
          page: 1,
          limit: 10,
          offset: 0,
          totalRecords: 1,
          totalPages: 1,
          hasPreviousPage:
            false,
          hasNextPage:
            false
        });

        expect(
          response.body.requestId
        ).toEqual(
          expect.any(String)
        );

        expect(
          response.body.timestamp
        ).toEqual(
          expect.any(String)
        );

        expectPrivateFieldsAbsent(
          response.body.data[0]
        );
      }
    );

    test(
      "excludes draft, closed, removed and expired jobs",
      async () => {
        const recruiter =
          await createRecruiter(
            "statuses"
          );

        const company =
          await createCompany({
            ownerId:
              recruiter.id,

            label:
              "Status Company"
          });

        const eligibleJob =
          await createJob({
            companyId:
              company.id,

            createdBy:
              recruiter.id,

            label:
              "Visible"
          });

        await createJob({
          companyId:
            company.id,

          createdBy:
            recruiter.id,

          label:
            "Draft",

          status:
            "DRAFT"
        });

        await createJob({
          companyId:
            company.id,

          createdBy:
            recruiter.id,

          label:
            "Closed",

          status:
            "CLOSED"
        });

        await createJob({
          companyId:
            company.id,

          createdBy:
            recruiter.id,

          label:
            "Removed",

          status:
            "REMOVED"
        });

        await createJob({
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

        const response =
          await request(app)
            .get(
              "/api/public/jobs"
            )
            .expect(200);

        expect(
          response.body.data
        ).toHaveLength(1);

        expect(
          response.body.data[0]
            .id
        ).toBe(
          eligibleJob.id
        );

        expect(
          response.body.meta
            .totalRecords
        ).toBe(1);
      }
    );

    test(
      "excludes jobs belonging to unverified companies",
      async () => {
        const recruiter =
          await createRecruiter(
            "unverified"
          );

        const verifiedCompany =
          await createCompany({
            ownerId:
              recruiter.id,

            label:
              "Verified Company"
          });

        const unverifiedCompany =
          await createCompany({
            ownerId:
              recruiter.id,

            label:
              "Draft Company",

            status:
              "DRAFT"
          });

        const eligibleJob =
          await createJob({
            companyId:
              verifiedCompany.id,

            createdBy:
              recruiter.id,

            label:
              "Verified Company Job"
          });

        await createJob({
          companyId:
            unverifiedCompany.id,

          createdBy:
            recruiter.id,

          label:
            "Unverified Company Job"
        });

        const response =
          await request(app)
            .get(
              "/api/public/jobs"
            )
            .expect(200);

        expect(
          response.body.data
        ).toHaveLength(1);

        expect(
          response.body.data[0]
            .id
        ).toBe(
          eligibleJob.id
        );
      }
    );

    test(
      "excludes soft-deleted jobs",
      async () => {
        const recruiter =
          await createRecruiter(
            "deleted-job"
          );

        const company =
          await createCompany({
            ownerId:
              recruiter.id,

            label:
              "Deleted Job Company"
          });

        const eligibleJob =
          await createJob({
            companyId:
              company.id,

            createdBy:
              recruiter.id,

            label:
              "Available"
          });

        const deletedJob =
          await createJob({
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
              "/api/public/jobs"
            )
            .expect(200);

        expect(
          response.body.data
        ).toHaveLength(1);

        expect(
          response.body.data[0]
            .id
        ).toBe(
          eligibleJob.id
        );
      }
    );

    test(
      "excludes jobs belonging to a soft-deleted company",
      async () => {
        const recruiter =
          await createRecruiter(
            "deleted-company"
          );

        const availableCompany =
          await createCompany({
            ownerId:
              recruiter.id,

            label:
              "Available Company"
          });

        const deletedCompany =
          await createCompany({
            ownerId:
              recruiter.id,

            label:
              "Deleted Company"
          });

        const eligibleJob =
          await createJob({
            companyId:
              availableCompany.id,

            createdBy:
              recruiter.id,

            label:
              "Available Company Job"
          });

        await createJob({
          companyId:
            deletedCompany.id,

          createdBy:
            recruiter.id,

          label:
            "Deleted Company Job"
        });

        await deletedCompany.destroy();

        const response =
          await request(app)
            .get(
              "/api/public/jobs"
            )
            .expect(200);

        expect(
          response.body.data
        ).toHaveLength(1);

        expect(
          response.body.data[0]
            .id
        ).toBe(
          eligibleJob.id
        );
      }
    );

    test(
      "supports pagination and returns correct metadata",
      async () => {
        const recruiter =
          await createRecruiter(
            "pagination"
          );

        const company =
          await createCompany({
            ownerId:
              recruiter.id,

            label:
              "Pagination Company"
          });

        await createJob({
          companyId:
            company.id,

          createdBy:
            recruiter.id,

          label:
            "Job One",

          publishedAt:
            new Date(
              Date.now() -
              3 *
              DAY_IN_MILLISECONDS
            )
        });

        await createJob({
          companyId:
            company.id,

          createdBy:
            recruiter.id,

          label:
            "Job Two",

          publishedAt:
            new Date(
              Date.now() -
              2 *
              DAY_IN_MILLISECONDS
            )
        });

        await createJob({
          companyId:
            company.id,

          createdBy:
            recruiter.id,

          label:
            "Job Three",

          publishedAt:
            new Date(
              Date.now() -
              DAY_IN_MILLISECONDS
            )
        });

        const response =
          await request(app)
            .get(
              "/api/public/jobs?page=2&limit=2"
            )
            .expect(200);

        expect(
          response.body.data
        ).toHaveLength(1);

        expect(
          response.body.meta
        ).toEqual({
          page: 2,
          limit: 2,
          offset: 2,
          totalRecords: 3,
          totalPages: 2,
          hasPreviousPage:
            true,
          hasNextPage:
            false
        });
      }
    );

    test(
      "returns an empty standardized result when no eligible jobs exist",
      async () => {
        const response =
          await request(app)
            .get(
              "/api/public/jobs"
            )
            .expect(200);

        expect(
          response.body.success
        ).toBe(true);

        expect(
          response.body.data
        ).toEqual([]);

        expect(
          response.body.meta
        ).toEqual({
          page: 1,
          limit: 10,
          offset: 0,
          totalRecords: 0,
          totalPages: 1,
          hasPreviousPage:
            false,
          hasNextPage:
            false
        });
      }
    );

    test.each([
      [
        "page=0",
        "page"
      ],
      [
        "page=-1",
        "page"
      ],
      [
        "page=invalid",
        "page"
      ],
      [
        "limit=0",
        "limit"
      ],
      [
        "limit=101",
        "limit"
      ],
      [
        "limit=invalid",
        "limit"
      ]
    ])(
      "rejects invalid public pagination query %s",
      async (
        queryString,
        expectedField
      ) => {
        const response =
          await request(app)
            .get(
              `/api/public/jobs?${queryString}`
            )
            .expect(422);

        expect(
          response.body.success
        ).toBe(false);

        expect(
          response.body.code
        ).toBe(
          "VALIDATION_ERROR"
        );

        expect(
          response.body.message
        ).toBe(
          "Request validation failed"
        );

        expect(
          response.body.errors
        ).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              field:
                expectedField
            })
          ])
        );
      }
    );

    test(
      "does not increment job views while listing public jobs",
      async () => {
        const recruiter =
          await createRecruiter(
            "view-count"
          );

        const company =
          await createCompany({
            ownerId:
              recruiter.id,

            label:
              "View Company"
          });

        const job =
          await createJob({
            companyId:
              company.id,

            createdBy:
              recruiter.id,

            label:
              "View Count"
          });

        expect(
          Number(
            job.viewCount
          )
        ).toBe(7);

        await request(app)
          .get(
            "/api/public/jobs"
          )
          .expect(200);

        const reloadedJob =
          await Job.findByPk(
            job.id
          );

        expect(
          Number(
            reloadedJob.viewCount
          )
        ).toBe(7);
      }
    );

    test(
      "searches eligible public jobs by exact and partial title",
      async () => {
        const recruiter =
          await createRecruiter(
            "title-search"
          );

        const company =
          await createCompany({
            ownerId:
              recruiter.id,

            label:
              "Title Search Company"
          });

        const matchingJob =
          await createJob({
            companyId:
              company.id,

            createdBy:
              recruiter.id,

            label:
              "Java Backend Engineer"
          });

        await createJob({
          companyId:
            company.id,

          createdBy:
            recruiter.id,

          label:
            "Python Data Engineer"
        });

        const exactResponse =
          await request(app)
            .get(
              "/api/public/jobs"
            )
            .query({
              search:
                matchingJob.title
            })
            .expect(200);

        expect(
          exactResponse.body.data
        ).toHaveLength(1);

        expect(
          exactResponse.body.data[0]
            .id
        ).toBe(
          matchingJob.id
        );

        const partialResponse =
          await request(app)
            .get(
              "/api/public/jobs"
            )
            .query({
              search:
                "Backend"
            })
            .expect(200);

        expect(
          partialResponse.body.data
        ).toHaveLength(1);

        expect(
          partialResponse.body.data[0]
            .id
        ).toBe(
          matchingJob.id
        );
      }
    );

    test(
      "searches eligible public jobs by skills",
      async () => {
        const recruiter =
          await createRecruiter(
            "skill-search"
          );

        const company =
          await createCompany({
            ownerId:
              recruiter.id,

            label:
              "Skill Search Company"
          });

        const matchingJob =
          await createJob({
            companyId:
              company.id,

            createdBy:
              recruiter.id,

            label:
              "Kafka Platform"
          });

        await matchingJob.update({
          skills: [
            "Java",
            "Kafka",
            "Spring Boot"
          ]
        });

        const unrelatedJob =
          await createJob({
            companyId:
              company.id,

            createdBy:
              recruiter.id,

            label:
              "Frontend Platform"
          });

        await unrelatedJob.update({
          skills: [
            "React",
            "JavaScript"
          ]
        });

        const response =
          await request(app)
            .get(
              "/api/public/jobs"
            )
            .query({
              search:
                "Kafka"
            })
            .expect(200);

        expect(
          response.body.data
        ).toHaveLength(1);

        expect(
          response.body.data[0]
            .id
        ).toBe(
          matchingJob.id
        );

        expect(
          response.body.meta
            .totalRecords
        ).toBe(1);
      }
    );

    test(
      "searches eligible public jobs by location",
      async () => {
        const recruiter =
          await createRecruiter(
            "location-search"
          );

        const company =
          await createCompany({
            ownerId:
              recruiter.id,

            label:
              "Location Search Company"
          });

        const matchingJob =
          await createJob({
            companyId:
              company.id,

            createdBy:
              recruiter.id,

            label:
              "Pune Cloud"
          });

        await matchingJob.update({
          location:
            "Pune"
        });

        const unrelatedJob =
          await createJob({
            companyId:
              company.id,

            createdBy:
              recruiter.id,

            label:
              "Chennai Cloud"
          });

        await unrelatedJob.update({
          location:
            "Chennai"
        });

        const response =
          await request(app)
            .get(
              "/api/public/jobs"
            )
            .query({
              search:
                "Pune"
            })
            .expect(200);

        expect(
          response.body.data
        ).toHaveLength(1);

        expect(
          response.body.data[0]
            .id
        ).toBe(
          matchingJob.id
        );
      }
    );

    test(
      "searches eligible public jobs by company name",
      async () => {
        const recruiter =
          await createRecruiter(
            "company-search"
          );

        const matchingCompany =
          await createCompany({
            ownerId:
              recruiter.id,

            label:
              "Acme Technologies"
          });

        const otherCompany =
          await createCompany({
            ownerId:
              recruiter.id,

            label:
              "Different Organization"
          });

        const matchingJob =
          await createJob({
            companyId:
              matchingCompany.id,

            createdBy:
              recruiter.id,

            label:
              "Backend Role"
          });

        await createJob({
          companyId:
            otherCompany.id,

          createdBy:
            recruiter.id,

          label:
            "Another Backend Role"
        });

        const response =
          await request(app)
            .get(
              "/api/public/jobs"
            )
            .query({
              search:
                "Acme Technologies"
            })
            .expect(200);

        expect(
          response.body.data
        ).toHaveLength(1);

        expect(
          response.body.data[0]
            .id
        ).toBe(
          matchingJob.id
        );

        expect(
          response.body.data[0]
            .company.id
        ).toBe(
          matchingCompany.id
        );
      }
    );

    test(
      "supports case-insensitive search and trims whitespace",
      async () => {
        const recruiter =
          await createRecruiter(
            "case-search"
          );

        const company =
          await createCompany({
            ownerId:
              recruiter.id,

            label:
              "Case Search Company"
          });

        const matchingJob =
          await createJob({
            companyId:
              company.id,

            createdBy:
              recruiter.id,

            label:
              "Spring Boot Specialist"
          });

        const response =
          await request(app)
            .get(
              "/api/public/jobs"
            )
            .query({
              search:
                "   spring boot   "
            })
            .expect(200);

        expect(
          response.body.data
        ).toHaveLength(1);

        expect(
          response.body.data[0]
            .id
        ).toBe(
          matchingJob.id
        );
      }
    );

    test(
      "returns a standardized empty result when search has no matches",
      async () => {
        const recruiter =
          await createRecruiter(
            "no-result-search"
          );

        const company =
          await createCompany({
            ownerId:
              recruiter.id,

            label:
              "No Result Company"
          });

        await createJob({
          companyId:
            company.id,

          createdBy:
            recruiter.id,

          label:
            "Java Developer"
        });

        const response =
          await request(app)
            .get(
              "/api/public/jobs"
            )
            .query({
              search:
                "NonexistentQuantumRole"
            })
            .expect(200);

        expect(
          response.body.success
        ).toBe(true);

        expect(
          response.body.data
        ).toEqual([]);

        expect(
          response.body.meta
        ).toEqual({
          page: 1,
          limit: 10,
          offset: 0,
          totalRecords: 0,
          totalPages: 1,
          hasPreviousPage:
            false,
          hasNextPage:
            false
        });
      }
    );

    test(
      "never returns ineligible jobs through public search",
      async () => {
        const recruiter =
          await createRecruiter(
            "eligibility-search"
          );

        const verifiedCompany =
          await createCompany({
            ownerId:
              recruiter.id,

            label:
              "Eligible Search Company"
          });

        const draftCompany =
          await createCompany({
            ownerId:
              recruiter.id,

            label:
              "Unavailable Search Company",

            status:
              "DRAFT"
          });

        const eligibleJob =
          await createJob({
            companyId:
              verifiedCompany.id,

            createdBy:
              recruiter.id,

            label:
              "Unique Search Target"
          });

        await createJob({
          companyId:
            verifiedCompany.id,

          createdBy:
            recruiter.id,

          label:
            "Unique Search Target Draft",

          status:
            "DRAFT"
        });

        await createJob({
          companyId:
            verifiedCompany.id,

          createdBy:
            recruiter.id,

          label:
            "Unique Search Target Closed",

          status:
            "CLOSED"
        });

        await createJob({
          companyId:
            verifiedCompany.id,

          createdBy:
            recruiter.id,

          label:
            "Unique Search Target Expired",

          applicationDeadline:
            new Date(
              Date.now() -
              DAY_IN_MILLISECONDS
            )
        });

        await createJob({
          companyId:
            draftCompany.id,

          createdBy:
            recruiter.id,

          label:
            "Unique Search Target Unverified"
        });

        const response =
          await request(app)
            .get(
              "/api/public/jobs"
            )
            .query({
              search:
                "Unique Search Target"
            })
            .expect(200);

        expect(
          response.body.data
        ).toHaveLength(1);

        expect(
          response.body.data[0]
            .id
        ).toBe(
          eligibleJob.id
        );

        expect(
          response.body.meta
            .totalRecords
        ).toBe(1);
      }
    );

    test(
      "keeps private fields hidden in public search results",
      async () => {
        const recruiter =
          await createRecruiter(
            "privacy-search"
          );

        const company =
          await createCompany({
            ownerId:
              recruiter.id,

            label:
              "Privacy Search Company"
          });

        await createJob({
          companyId:
            company.id,

          createdBy:
            recruiter.id,

          label:
            "Privacy Search Developer"
        });

        const response =
          await request(app)
            .get(
              "/api/public/jobs"
            )
            .query({
              search:
                "Privacy Search"
            })
            .expect(200);

        expect(
          response.body.data
        ).toHaveLength(1);

        expectPrivateFieldsAbsent(
          response.body.data[0]
        );
      }
    );

    test(
      "rejects a blank search value",
      async () => {
        const response =
          await request(app)
            .get(
              "/api/public/jobs"
            )
            .query({
              search:
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
                "search",

              message:
                "Search must be between 1 and 200 characters."
            })
          ])
        );
      }
    );

    test(
      "rejects search text longer than 200 characters",
      async () => {
        const response =
          await request(app)
            .get(
              "/api/public/jobs"
            )
            .query({
              search:
                "a".repeat(201)
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
                "search",

              message:
                "Search must be between 1 and 200 characters."
            })
          ])
        );
      }
    );

    test(
      "filters eligible public jobs by location",
      async () => {
        const recruiter =
          await createRecruiter(
            "filter-location"
          );

        const company =
          await createCompany({
            ownerId:
              recruiter.id,

            label:
              "Location Filter Company"
          });

        const matchingJob =
          await createJob({
            companyId:
              company.id,

            createdBy:
              recruiter.id,

            label:
              "Hyderabad Backend",

            location:
              "Hyderabad"
          });

        await createJob({
          companyId:
            company.id,

          createdBy:
            recruiter.id,

          label:
            "Pune Backend",

          location:
            "Pune"
        });

        const response =
          await request(app)
            .get(
              "/api/public/jobs"
            )
            .query({
              location:
                "Hyderabad"
            })
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
          response.body.meta
            .totalRecords
        ).toBe(1);
      }
    );

    test(
      "filters eligible public jobs by employment type",
      async () => {
        const recruiter =
          await createRecruiter(
            "filter-employment"
          );

        const company =
          await createCompany({
            ownerId:
              recruiter.id,

            label:
              "Employment Filter Company"
          });

        const matchingJob =
          await createJob({
            companyId:
              company.id,

            createdBy:
              recruiter.id,

            label:
              "Contract Backend",

            employmentType:
              "CONTRACT"
          });

        await createJob({
          companyId:
            company.id,

          createdBy:
            recruiter.id,

          label:
            "Full Time Backend",

          employmentType:
            "FULL_TIME"
        });

        const response =
          await request(app)
            .get(
              "/api/public/jobs"
            )
            .query({
              employmentType:
                "CONTRACT"
            })
            .expect(200);

        expect(
          response.body.data
        ).toHaveLength(1);

        expect(
          response.body.data[0].id
        ).toBe(
          matchingJob.id
        );
      }
    );

    test(
      "filters eligible public jobs by experience level",
      async () => {
        const recruiter =
          await createRecruiter(
            "filter-experience"
          );

        const company =
          await createCompany({
            ownerId:
              recruiter.id,

            label:
              "Experience Filter Company"
          });

        const matchingJob =
          await createJob({
            companyId:
              company.id,

            createdBy:
              recruiter.id,

            label:
              "Senior Backend",

            experienceLevel:
              "SENIOR"
          });

        await createJob({
          companyId:
            company.id,

          createdBy:
            recruiter.id,

          label:
            "Junior Backend",

          experienceLevel:
            "JUNIOR"
        });

        const response =
          await request(app)
            .get(
              "/api/public/jobs"
            )
            .query({
              experienceLevel:
                "SENIOR"
            })
            .expect(200);

        expect(
          response.body.data
        ).toHaveLength(1);

        expect(
          response.body.data[0].id
        ).toBe(
          matchingJob.id
        );
      }
    );

    test(
      "supports combined location, work mode, employment type and experience filters",
      async () => {
        const recruiter =
          await createRecruiter(
            "combined-filters"
          );

        const company =
          await createCompany({
            ownerId:
              recruiter.id,

            label:
              "Combined Filter Company"
          });

        const matchingJob =
          await createJob({
            companyId:
              company.id,

            createdBy:
              recruiter.id,

            label:
              "Combined Match",

            location:
              "Hyderabad",

            workMode:
              "REMOTE",

            employmentType:
              "FULL_TIME",

            experienceLevel:
              "MID"
          });

        await createJob({
          companyId:
            company.id,

          createdBy:
            recruiter.id,

          label:
            "Wrong Work Mode",

          location:
            "Hyderabad",

          workMode:
            "ONSITE",

          employmentType:
            "FULL_TIME",

          experienceLevel:
            "MID"
        });

        await createJob({
          companyId:
            company.id,

          createdBy:
            recruiter.id,

          label:
            "Wrong Location",

          location:
            "Pune",

          workMode:
            "REMOTE",

          employmentType:
            "FULL_TIME",

          experienceLevel:
            "MID"
        });

        const response =
          await request(app)
            .get(
              "/api/public/jobs"
            )
            .query({
              location:
                "Hyderabad",

              workMode:
                "REMOTE",

              employmentType:
                "FULL_TIME",

              experienceLevel:
                "MID"
            })
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
          response.body.meta
            .totalRecords
        ).toBe(1);
      }
    );

    test(
      "combines public search with core filters",
      async () => {
        const recruiter =
          await createRecruiter(
            "search-filter"
          );

        const company =
          await createCompany({
            ownerId:
              recruiter.id,

            label:
              "Search Filter Company"
          });

        const matchingJob =
          await createJob({
            companyId:
              company.id,

            createdBy:
              recruiter.id,

            label:
              "Java Platform",

            skills: [
              "Java",
              "Spring Boot"
            ],

            location:
              "Hyderabad",

            workMode:
              "HYBRID"
          });

        const pythonJob =
          await createJob({
            companyId:
              company.id,

            createdBy:
              recruiter.id,

            label:
              "Python Platform",

            skills: [
              "Python",
              "Django"
            ],

            location:
              "Hyderabad",

            workMode:
              "HYBRID"
          });

        const wrongFilterJob =
          await createJob({
            companyId:
              company.id,

            createdBy:
              recruiter.id,

            label:
              "Java Remote",

            skills: [
              "Java",
              "Spring Boot"
            ],

            location:
              "Pune",

            workMode:
              "REMOTE"
          });

        const response =
          await request(app)
            .get(
              "/api/public/jobs"
            )
            .query({
              search:
                "Java",

              location:
                "Hyderabad",

              workMode:
                "HYBRID"
            })
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
          response.body.data.map(
            (job) => job.id
          )
        ).not.toContain(
          pythonJob.id
        );

        expect(
          response.body.data.map(
            (job) => job.id
          )
        ).not.toContain(
          wrongFilterJob.id
        );

        expect(
          response.body.meta
            .totalRecords
        ).toBe(1);
      }
    );

    test(
      "keeps ineligible jobs excluded when filters are applied",
      async () => {
        const recruiter =
          await createRecruiter(
            "filter-eligibility"
          );

        const verifiedCompany =
          await createCompany({
            ownerId:
              recruiter.id,

            label:
              "Filter Eligible Company"
          });

        const unavailableCompany =
          await createCompany({
            ownerId:
              recruiter.id,

            label:
              "Filter Unavailable Company",

            status:
              "DRAFT"
          });

        const eligibleJob =
          await createJob({
            companyId:
              verifiedCompany.id,

            createdBy:
              recruiter.id,

            label:
              "Eligible Remote",

            workMode:
              "REMOTE"
          });

        await createJob({
          companyId:
            verifiedCompany.id,

          createdBy:
            recruiter.id,

          label:
            "Draft Remote",

          status:
            "DRAFT",

          workMode:
            "REMOTE"
        });

        await createJob({
          companyId:
            verifiedCompany.id,

          createdBy:
            recruiter.id,

          label:
            "Expired Remote",

          workMode:
            "REMOTE",

          applicationDeadline:
            new Date(
              Date.now() -
              DAY_IN_MILLISECONDS
            )
        });

        await createJob({
          companyId:
            unavailableCompany.id,

          createdBy:
            recruiter.id,

          label:
            "Unavailable Remote",

          workMode:
            "REMOTE"
        });

        const response =
          await request(app)
            .get(
              "/api/public/jobs"
            )
            .query({
              workMode:
                "REMOTE"
            })
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
      "keeps private fields hidden in filtered results",
      async () => {
        const recruiter =
          await createRecruiter(
            "filter-privacy"
          );

        const company =
          await createCompany({
            ownerId:
              recruiter.id,

            label:
              "Filter Privacy Company"
          });

        await createJob({
          companyId:
            company.id,

          createdBy:
            recruiter.id,

          label:
            "Private Filter",

          workMode:
            "REMOTE"
        });

        const response =
          await request(app)
            .get(
              "/api/public/jobs"
            )
            .query({
              workMode:
                "REMOTE"
            })
            .expect(200);

        expect(
          response.body.data
        ).toHaveLength(1);

        expectPrivateFieldsAbsent(
          response.body.data[0]
        );
      }
    );

    test.each([
      [
        "workMode",
        "INVALID_MODE"
      ],
      [
        "employmentType",
        "INVALID_TYPE"
      ],
      [
        "experienceLevel",
        "INVALID_LEVEL"
      ]
    ])(
      "rejects invalid %s filter",
      async (
        field,
        value
      ) => {
        const response =
          await request(app)
            .get(
              "/api/public/jobs"
            )
            .query({
              [field]:
                value
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
              field
            })
          ])
        );
      }
    );

    test(
      "rejects a blank location filter",
      async () => {
        const response =
          await request(app)
            .get(
              "/api/public/jobs"
            )
            .query({
              location:
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
                "location",

              message:
                "Location must be between 1 and 255 characters."
            })
          ])
        );
      }
    );

    test(
      "rejects a location longer than 255 characters",
      async () => {
        const response =
          await request(app)
            .get(
              "/api/public/jobs"
            )
            .query({
              location:
                "a".repeat(256)
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
                "location"
            })
          ])
        );
      }
    );

    test(
      "filters jobs by work mode independently",
      async () => {
        const recruiter =
          await createRecruiter(
            "work-mode-complete"
          );

        const company =
          await createCompany({
            ownerId:
              recruiter.id,
            label:
              "Work Mode Complete"
          });

        const matchingJob =
          await createJob({
            companyId:
              company.id,
            createdBy:
              recruiter.id,
            label:
              "Remote Match",
            workMode:
              "REMOTE"
          });

        await createJob({
          companyId:
            company.id,
          createdBy:
            recruiter.id,
          label:
            "Onsite Other",
          workMode:
            "ONSITE"
        });

        const response =
          await request(app)
            .get(
              "/api/public/jobs"
            )
            .query({
              workMode:
                "REMOTE"
            })
            .expect(200);

        expect(
          response.body.data
        ).toHaveLength(1);

        expect(
          response.body.data[0].id
        ).toBe(
          matchingJob.id
        );
      }
    );

    test(
      "filters jobs requiring all requested skills",
      async () => {
        const recruiter =
          await createRecruiter(
            "skills-filter"
          );

        const company =
          await createCompany({
            ownerId:
              recruiter.id,
            label:
              "Skills Filter"
          });

        const matchingJob =
          await createJob({
            companyId:
              company.id,
            createdBy:
              recruiter.id,
            label:
              "Java Kafka",
            skills: [
              "Java",
              "Kafka",
              "Spring Boot"
            ]
          });

        await createJob({
          companyId:
            company.id,
          createdBy:
            recruiter.id,
          label:
            "Java Only",
          skills: [
            "Java",
            "Spring Boot"
          ]
        });

        const response =
          await request(app)
            .get(
              "/api/public/jobs"
            )
            .query({
              skills:
                "Java,Kafka"
            })
            .expect(200);

        expect(
          response.body.data
        ).toHaveLength(1);

        expect(
          response.body.data[0].id
        ).toBe(
          matchingJob.id
        );
      }
    );

    test(
      "filters jobs using salary overlap",
      async () => {
        const recruiter =
          await createRecruiter(
            "salary-overlap"
          );

        const company =
          await createCompany({
            ownerId:
              recruiter.id,
            label:
              "Salary Overlap"
          });

        const matchingJob =
          await createJob({
            companyId:
              company.id,
            createdBy:
              recruiter.id,
            label:
              "Matching Salary",
            minimumSalary:
              600000,
            maximumSalary:
              1000000
          });

        await createJob({
          companyId:
            company.id,
          createdBy:
            recruiter.id,
          label:
            "Low Salary",
          minimumSalary:
            200000,
          maximumSalary:
            400000
        });

        await createJob({
          companyId:
            company.id,
          createdBy:
            recruiter.id,
          label:
            "High Salary",
          minimumSalary:
            1300000,
          maximumSalary:
            1600000
        });

        const response =
          await request(app)
            .get(
              "/api/public/jobs"
            )
            .query({
              minimumSalary:
                500000,
              maximumSalary:
                1200000
            })
            .expect(200);

        expect(
          response.body.data
        ).toHaveLength(1);

        expect(
          response.body.data[0].id
        ).toBe(
          matchingJob.id
        );
      }
    );

    test(
      "filters jobs by company ID",
      async () => {
        const recruiter =
          await createRecruiter(
            "company-filter"
          );

        const matchingCompany =
          await createCompany({
            ownerId:
              recruiter.id,
            label:
              "Matching Company Filter"
          });

        const otherCompany =
          await createCompany({
            ownerId:
              recruiter.id,
            label:
              "Other Company Filter"
          });

        const matchingJob =
          await createJob({
            companyId:
              matchingCompany.id,
            createdBy:
              recruiter.id,
            label:
              "Matching Company Job"
          });

        await createJob({
          companyId:
            otherCompany.id,
          createdBy:
            recruiter.id,
          label:
            "Other Company Job"
        });

        const response =
          await request(app)
            .get(
              "/api/public/jobs"
            )
            .query({
              companyId:
                matchingCompany.id
            })
            .expect(200);

        expect(
          response.body.data
        ).toHaveLength(1);

        expect(
          response.body.data[0].id
        ).toBe(
          matchingJob.id
        );
      }
    );

    test(
      "filters jobs by publication date range",
      async () => {
        const recruiter =
          await createRecruiter(
            "published-range"
          );

        const company =
          await createCompany({
            ownerId:
              recruiter.id,
            label:
              "Published Range"
          });

        const matchingJob =
          await createJob({
            companyId:
              company.id,
            createdBy:
              recruiter.id,
            label:
              "Published Match",
            publishedAt:
              new Date(
                "2026-08-02T12:00:00.000Z"
              )
          });

        await createJob({
          companyId:
            company.id,
          createdBy:
            recruiter.id,
          label:
            "Published Outside",
          publishedAt:
            new Date(
              "2026-07-01T12:00:00.000Z"
            )
        });

        const response =
          await request(app)
            .get(
              "/api/public/jobs"
            )
            .query({
              publishedFrom:
                "2026-08-01",
              publishedTo:
                "2026-08-03"
            })
            .expect(200);

        expect(
          response.body.data
        ).toHaveLength(1);

        expect(
          response.body.data[0].id
        ).toBe(
          matchingJob.id
        );
      }
    );

    test(
      "filters jobs by deadline date range",
      async () => {
        const recruiter =
          await createRecruiter(
            "deadline-range"
          );

        const company =
          await createCompany({
            ownerId:
              recruiter.id,
            label:
              "Deadline Range"
          });

        const matchingJob =
          await createJob({
            companyId:
              company.id,
            createdBy:
              recruiter.id,
            label:
              "Deadline Match",
            applicationDeadline:
              new Date(
                "2026-08-20T12:00:00.000Z"
              )
          });

        await createJob({
          companyId:
            company.id,
          createdBy:
            recruiter.id,
          label:
            "Deadline Outside",
          applicationDeadline:
            new Date(
              "2026-09-20T12:00:00.000Z"
            )
        });

        const response =
          await request(app)
            .get(
              "/api/public/jobs"
            )
            .query({
              deadlineFrom:
                "2026-08-15",
              deadlineTo:
                "2026-08-25"
            })
            .expect(200);

        expect(
          response.body.data
        ).toHaveLength(1);

        expect(
          response.body.data[0].id
        ).toBe(
          matchingJob.id
        );
      }
    );

    test.each([
      [
        {
          minimumSalary:
            -1
        },
        "minimumSalary"
      ],
      [
        {
          maximumSalary:
            -1
        },
        "maximumSalary"
      ],
      [
        {
          minimumSalary:
            900000,
          maximumSalary:
            500000
        },
        "maximumSalary"
      ],
      [
        {
          companyId:
            "invalid-uuid"
        },
        "companyId"
      ],
      [
        {
          publishedFrom:
            "invalid-date"
        },
        "publishedFrom"
      ],
      [
        {
          publishedFrom:
            "2026-08-10",
          publishedTo:
            "2026-08-01"
        },
        "publishedTo"
      ],
      [
        {
          deadlineFrom:
            "invalid-date"
        },
        "deadlineFrom"
      ],
      [
        {
          deadlineFrom:
            "2026-09-01",
          deadlineTo:
            "2026-08-01"
        },
        "deadlineTo"
      ],
      [
        {
          skills:
            "   "
        },
        "skills"
      ]
    ])(
      "rejects invalid complete filter query %#",
      async (
        queryValue,
        expectedField
      ) => {
        const response =
          await request(app)
            .get(
              "/api/public/jobs"
            )
            .query(
              queryValue
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
                expectedField
            })
          ])
        );
      }
    );

    test(
      "returns consistent first and second public job pages without duplicates",
      async () => {
        const recruiter =
          await createRecruiter(
            "pagination-pages"
          );

        const company =
          await createCompany({
            ownerId:
              recruiter.id,

            label:
              "Pagination Pages Company"
          });

        const createdJobs = [];

        for (
          let index = 1;
          index <= 5;
          index += 1
        ) {
          const job =
            await createJob({
              companyId:
                company.id,

              createdBy:
                recruiter.id,

              label:
                `Paged Job ${index}`,

              publishedAt:
                new Date(
                  Date.now() -
                  index *
                  DAY_IN_MILLISECONDS
                )
            });

          createdJobs.push(job);
        }

        const firstPage =
          await request(app)
            .get(
              "/api/public/jobs"
            )
            .query({
              page: 1,
              limit: 2,
              sort: "latest"
            })
            .expect(200);

        const secondPage =
          await request(app)
            .get(
              "/api/public/jobs"
            )
            .query({
              page: 2,
              limit: 2,
              sort: "latest"
            })
            .expect(200);

        expect(
          firstPage.body.data
        ).toHaveLength(2);

        expect(
          secondPage.body.data
        ).toHaveLength(2);

        expect(
          firstPage.body.meta
        ).toEqual({
          page: 1,
          limit: 2,
          offset: 0,
          totalRecords: 5,
          totalPages: 3,
          hasPreviousPage: false,
          hasNextPage: true
        });

        expect(
          secondPage.body.meta
        ).toEqual({
          page: 2,
          limit: 2,
          offset: 2,
          totalRecords: 5,
          totalPages: 3,
          hasPreviousPage: true,
          hasNextPage: true
        });

        const firstPageIds =
          firstPage.body.data.map(
            (job) => job.id
          );

        const secondPageIds =
          secondPage.body.data.map(
            (job) => job.id
          );

        expect(
          firstPageIds
        ).toEqual([
          createdJobs[0].id,
          createdJobs[1].id
        ]);

        expect(
          secondPageIds
        ).toEqual([
          createdJobs[2].id,
          createdJobs[3].id
        ]);

        expect(
          firstPageIds.some(
            (id) =>
              secondPageIds.includes(
                id
              )
          )
        ).toBe(false);
      }
    );

    test(
      "returns correct metadata for the final public job page",
      async () => {
        const recruiter =
          await createRecruiter(
            "pagination-final-page"
          );

        const company =
          await createCompany({
            ownerId:
              recruiter.id,

            label:
              "Pagination Final Page Company"
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
              `Final Page Job ${index}`,

            publishedAt:
              new Date(
                Date.now() -
                index *
                DAY_IN_MILLISECONDS
              )
          });
        }

        const response =
          await request(app)
            .get(
              "/api/public/jobs"
            )
            .query({
              page: 3,
              limit: 2,
              sort: "latest"
            })
            .expect(200);

        expect(
          response.body.data
        ).toHaveLength(1);

        expect(
          response.body.meta
        ).toEqual({
          page: 3,
          limit: 2,
          offset: 4,
          totalRecords: 5,
          totalPages: 3,
          hasPreviousPage: true,
          hasNextPage: false
        });
      }
    );

    test(
      "supports pagination with public job search",
      async () => {
        const recruiter =
          await createRecruiter(
            "pagination-search"
          );

        const company =
          await createCompany({
            ownerId:
              recruiter.id,

            label:
              "Pagination Search Company"
          });

        for (
          let index = 1;
          index <= 3;
          index += 1
        ) {
          await createJob({
            companyId:
              company.id,

            createdBy:
              recruiter.id,

            label:
              `Java Pagination ${index}`,

            skills: [
              "Java",
              "Spring Boot"
            ],

            publishedAt:
              new Date(
                Date.now() -
                index *
                DAY_IN_MILLISECONDS
              )
          });
        }

        await createJob({
          companyId:
            company.id,

          createdBy:
            recruiter.id,

          label:
            "Python Pagination",

          skills: [
            "Python",
            "Django"
          ]
        });

        const response =
          await request(app)
            .get(
              "/api/public/jobs"
            )
            .query({
              search: "Java",
              page: 2,
              limit: 2,
              sort: "latest"
            })
            .expect(200);

        expect(
          response.body.data
        ).toHaveLength(1);

        expect(
          response.body.data[0]
            .title
        ).toContain(
          "Java Pagination"
        );

        expect(
          response.body.meta
        ).toEqual({
          page: 2,
          limit: 2,
          offset: 2,
          totalRecords: 3,
          totalPages: 2,
          hasPreviousPage: true,
          hasNextPage: false
        });
      }
    );

    test(
      "supports search filters sorting and pagination together",
      async () => {
        const recruiter =
          await createRecruiter(
            "pagination-combined"
          );

        const company =
          await createCompany({
            ownerId:
              recruiter.id,

            label:
              "Pagination Combined Company"
          });

        for (
          const label of [
            "Alpha Java",
            "Bravo Java",
            "Charlie Java"
          ]
        ) {
          await createJob({
            companyId:
              company.id,

            createdBy:
              recruiter.id,

            label,

            skills: [
              "Java",
              "Spring Boot"
            ],

            location:
              "Hyderabad",

            workMode:
              "REMOTE"
          });
        }

        await createJob({
          companyId:
            company.id,

          createdBy:
            recruiter.id,

          label:
            "Excluded Java Onsite",

          skills: [
            "Java",
            "Spring Boot"
          ],

          location:
            "Hyderabad",

          workMode:
            "ONSITE"
        });

        await createJob({
          companyId:
            company.id,

          createdBy:
            recruiter.id,

          label:
            "Excluded Python Remote",

          skills: [
            "Python",
            "Django"
          ],

          location:
            "Hyderabad",

          workMode:
            "REMOTE"
        });

        const response =
          await request(app)
            .get(
              "/api/public/jobs"
            )
            .query({
              search:
                "Java",

              location:
                "Hyderabad",

              workMode:
                "REMOTE",

              sort:
                "titleAscending",

              page:
                2,

              limit:
                2
            })
            .expect(200);

        expect(
          response.body.data
        ).toHaveLength(1);

        expect(
          response.body.data[0]
            .title
        ).toBe(
          "Charlie Java Developer"
        );

        expect(
          response.body.meta
        ).toEqual({
          page: 2,
          limit: 2,
          offset: 2,
          totalRecords: 3,
          totalPages: 2,
          hasPreviousPage: true,
          hasNextPage: false
        });
      }
    );


  }
);
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
  "joblist.";

const TEST_COMPANY_SLUG_PREFIX =
  "job-list-own-integration-";

const TEST_JOB_SLUG_PREFIX =
  "job-list-own-";

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

  return `${normalizedLabel}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
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
      .toString(36)}${Math.random()
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
        "CareerForge Job List Integration Test"
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

const createRecruiterContext =
  async (
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

const createJobFor = async ({
  companyId,
  createdBy,
  title,
  status = "DRAFT",
  skills = [
    "Node.js",
    "MySQL"
  ],
  location = "Hyderabad",
  workMode = "REMOTE",
  employmentType = "FULL_TIME",
  experienceLevel = "JUNIOR",
  minimumSalary = 300000,
  maximumSalary = 600000,
  applicationDeadline = null,
  publishedAt = null,
  createdAt = null
}) => {
  const lifecycleFields = {};

  if (
    status === "PUBLISHED"
  ) {
    lifecycleFields.publishedAt =
      publishedAt ??
      new Date(
        Date.now() -
        DAY_IN_MILLISECONDS
      );
  }

  if (
    status === "CLOSED"
  ) {
    lifecycleFields.publishedAt =
      publishedAt ??
      new Date(
        Date.now() -
        2 *
        DAY_IN_MILLISECONDS
      );

    lifecycleFields.closedAt =
      new Date(
        Date.now() -
        DAY_IN_MILLISECONDS
      );

    lifecycleFields.closureReason =
      "RECRUITER_CLOSED";
  }

  if (
    status === "REMOVED"
  ) {
    lifecycleFields.removedAt =
      new Date();

    lifecycleFields.removalReason =
      "Removed for integration testing.";
  }

  const job =
    await Job.create({
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
        `${title} responsibilities`,

      requirements:
        `${title} requirements`,

      skills,
      location,
      workMode,
      employmentType,
      experienceLevel,
      minimumSalary,
      maximumSalary,
      applicationDeadline,
      status,

      ...lifecycleFields
    });

  if (createdAt) {
    await Job.update(
      {
        created_at:
          createdAt,

        updated_at:
          createdAt
      },
      {
        where: {
          id:
            job.id
        },

        silent:
          true
      }
    );

    return Job.findByPk(
      job.id
    );
  }

  return job;
};

const expectSingleJob = (
  response,
  job
) => {
  expect(
    response.body.data
  ).toHaveLength(1);

  expect(
    response.body.data[0].id
  ).toBe(
    job.id
  );

  expect(
    response.body.meta.totalRecords
  ).toBe(1);
};

describe(
  "Recruiter Own Job List API",
  () => {
    beforeEach(cleanup);
    afterEach(cleanup);

    test(
      "returns only jobs created by the authenticated recruiter",
      async () => {
        const recruiterEmail =
          createEmail(
            "owner"
          );

        const otherEmail =
          createEmail(
            "other"
          );

        const recruiter =
          await createUser({
            email:
              recruiterEmail,

            role:
              "RECRUITER"
          });

        const otherRecruiter =
          await createUser({
            email:
              otherEmail,

            role:
              "RECRUITER"
          });

        const recruiterToken =
          await loginUser(
            recruiterEmail
          );

        const recruiterCompany =
          await createCompanyFor(
            recruiter.id,
            "Owner Company"
          );

        const otherCompany =
          await createCompanyFor(
            otherRecruiter.id,
            "Other Company"
          );

        const ownedJob =
          await createJobFor({
            companyId:
              recruiterCompany.id,

            createdBy:
              recruiter.id,

            title:
              "Owned Backend Developer"
          });

        await createJobFor({
          companyId:
            otherCompany.id,

          createdBy:
            otherRecruiter.id,

          title:
            "Foreign Backend Developer"
        });

        const response =
          await request(app)
            .get(
              "/api/jobs/me"
            )
            .set(
              "Authorization",
              `Bearer ${recruiterToken}`
            )
            .expect(200);

        expect(
          response.body.success
        ).toBe(true);

        expect(
          response.body.message
        ).toBe(
          "Recruiter jobs fetched successfully."
        );

        expectSingleJob(
          response,
          ownedJob
        );

        expect(
          response.body.data[0].createdBy
        ).toBe(
          recruiter.id
        );

        expect(
          response.body.meta
        ).toEqual({
          page:
            1,

          limit:
            10,

          offset:
            0,

          totalRecords:
            1,

          totalPages:
            1,

          hasPreviousPage:
            false,

          hasNextPage:
            false
        });
      }
    );

    test(
      "supports pagination and returns offset metadata",
      async () => {
        const {
          recruiter,
          token,
          company
        } =
          await createRecruiterContext(
            "pagination"
          );

        await createJobFor({
          companyId:
            company.id,

          createdBy:
            recruiter.id,

          title:
            "Job One"
        });

        await createJobFor({
          companyId:
            company.id,

          createdBy:
            recruiter.id,

          title:
            "Job Two"
        });

        await createJobFor({
          companyId:
            company.id,

          createdBy:
            recruiter.id,

          title:
            "Job Three"
        });

        const response =
          await request(app)
            .get(
              "/api/jobs/me?page=2&limit=2&sort=oldest"
            )
            .set(
              "Authorization",
              `Bearer ${token}`
            )
            .expect(200);

        expect(
          response.body.data
        ).toHaveLength(1);

        expect(
          response.body.meta
        ).toEqual({
          page:
            2,

          limit:
            2,

          offset:
            2,

          totalRecords:
            3,

          totalPages:
            2,

          hasPreviousPage:
            true,

          hasNextPage:
            false
        });
      }
    );

    test.each([
      [
        "title",
        "Backend",
        {
          title:
            "Backend Platform Engineer",

          skills: [
            "Java",
            "Spring Boot"
          ],

          location:
            "Hyderabad"
        }
      ],
      [
        "skills",
        "Kafka",
        {
          title:
            "Event Platform Engineer",

          skills: [
            "Java",
            "Kafka"
          ],

          location:
            "Hyderabad"
        }
      ],
      [
        "location",
        "Pune",
        {
          title:
            "Cloud Engineer",

          skills: [
            "AWS"
          ],

          location:
            "Pune"
        }
      ]
    ])(
      "supports search by %s",
      async (
        _field,
        search,
        matchingData
      ) => {
        const {
          recruiter,
          token,
          company
        } =
          await createRecruiterContext(
            `search-${search}`
          );

        const matchingJob =
          await createJobFor({
            companyId:
              company.id,

            createdBy:
              recruiter.id,

            ...matchingData
          });

        await createJobFor({
          companyId:
            company.id,

          createdBy:
            recruiter.id,

          title:
            "Unrelated Role",

          skills: [
            "Python"
          ],

          location:
            "Chennai"
        });

        const response =
          await request(app)
            .get(
              "/api/jobs/me"
            )
            .query({
              search
            })
            .set(
              "Authorization",
              `Bearer ${token}`
            )
            .expect(200);

        expectSingleJob(
          response,
          matchingJob
        );
      }
    );

    test(
      "supports status, work mode, employment type, experience level and location filters",
      async () => {
        const {
          recruiter,
          token,
          company
        } =
          await createRecruiterContext(
            "basic-filters"
          );

        const matchingJob =
          await createJobFor({
            companyId:
              company.id,

            createdBy:
              recruiter.id,

            title:
              "Remote Backend Engineer",

            status:
              "DRAFT",

            location:
              "Hyderabad",

            workMode:
              "REMOTE",

            employmentType:
              "FULL_TIME",

            experienceLevel:
              "JUNIOR"
          });

        await createJobFor({
          companyId:
            company.id,

          createdBy:
            recruiter.id,

          title:
            "Senior Frontend Engineer",

          status:
            "DRAFT",

          location:
            "Bengaluru",

          workMode:
            "ONSITE",

          employmentType:
            "CONTRACT",

          experienceLevel:
            "SENIOR"
        });

        const response =
          await request(app)
            .get(
              "/api/jobs/me"
            )
            .query({
              status:
                "DRAFT",

              location:
                "Hyderabad",

              workMode:
                "REMOTE",

              employmentType:
                "FULL_TIME",

              experienceLevel:
                "JUNIOR"
            })
            .set(
              "Authorization",
              `Bearer ${token}`
            )
            .expect(200);

        expectSingleJob(
          response,
          matchingJob
        );
      }
    );

    test(
      "supports overlapping salary-range filtering",
      async () => {
        const {
          recruiter,
          token,
          company
        } =
          await createRecruiterContext(
            "salary-filter"
          );

        const matchingJob =
          await createJobFor({
            companyId:
              company.id,

            createdBy:
              recruiter.id,

            title:
              "Mid Salary Job",

            minimumSalary:
              500000,

            maximumSalary:
              900000
          });

        await createJobFor({
          companyId:
            company.id,

          createdBy:
            recruiter.id,

          title:
            "Low Salary Job",

          minimumSalary:
            100000,

          maximumSalary:
            250000
        });

        const response =
          await request(app)
            .get(
              "/api/jobs/me"
            )
            .query({
              minimumSalary:
                600000,

              maximumSalary:
                800000
            })
            .set(
              "Authorization",
              `Bearer ${token}`
            )
            .expect(200);

        expectSingleJob(
          response,
          matchingJob
        );
      }
    );

    test(
      "supports creation-date filtering",
      async () => {
        const {
          recruiter,
          token,
          company
        } =
          await createRecruiterContext(
            "creation-date"
          );

        const matchingJob =
          await createJobFor({
            companyId:
              company.id,

            createdBy:
              recruiter.id,

            title:
              "Created In Range",

            createdAt:
              new Date(
                "2026-06-15T10:00:00.000Z"
              )
          });

        await createJobFor({
          companyId:
            company.id,

          createdBy:
            recruiter.id,

          title:
            "Created Outside Range",

          createdAt:
            new Date(
              "2026-05-01T10:00:00.000Z"
            )
        });

        const response =
          await request(app)
            .get(
              "/api/jobs/me"
            )
            .query({
              dateFrom:
                "2026-06-01T00:00:00.000Z",

              dateTo:
                "2026-06-30T23:59:59.999Z"
            })
            .set(
              "Authorization",
              `Bearer ${token}`
            )
            .expect(200);

        expectSingleJob(
          response,
          matchingJob
        );
      }
    );

    test(
      "supports publication-date filtering",
      async () => {
        const {
          recruiter,
          token,
          company
        } =
          await createRecruiterContext(
            "publication-date"
          );

        const matchingJob =
          await createJobFor({
            companyId:
              company.id,

            createdBy:
              recruiter.id,

            title:
              "Published In Range",

            status:
              "PUBLISHED",

            publishedAt:
              new Date(
                "2026-06-15T10:00:00.000Z"
              ),

            applicationDeadline:
              new Date(
                "2027-01-01T00:00:00.000Z"
              )
          });

        await createJobFor({
          companyId:
            company.id,

          createdBy:
            recruiter.id,

          title:
            "Published Outside Range",

          status:
            "PUBLISHED",

          publishedAt:
            new Date(
              "2026-05-01T10:00:00.000Z"
            ),

          applicationDeadline:
            new Date(
              "2027-01-01T00:00:00.000Z"
            )
        });

        const response =
          await request(app)
            .get(
              "/api/jobs/me"
            )
            .query({
              publishedFrom:
                "2026-06-01T00:00:00.000Z",

              publishedTo:
                "2026-06-30T23:59:59.999Z"
            })
            .set(
              "Authorization",
              `Bearer ${token}`
            )
            .expect(200);

        expectSingleJob(
          response,
          matchingJob
        );
      }
    );

    test(
      "supports application-deadline filtering",
      async () => {
        const {
          recruiter,
          token,
          company
        } =
          await createRecruiterContext(
            "deadline-filter"
          );

        const matchingJob =
          await createJobFor({
            companyId:
              company.id,

            createdBy:
              recruiter.id,

            title:
              "Deadline In Range",

            applicationDeadline:
              new Date(
                "2026-10-15T10:00:00.000Z"
              )
          });

        await createJobFor({
          companyId:
            company.id,

          createdBy:
            recruiter.id,

          title:
            "Deadline Outside Range",

          applicationDeadline:
            new Date(
              "2026-12-15T10:00:00.000Z"
            )
        });

        const response =
          await request(app)
            .get(
              "/api/jobs/me"
            )
            .query({
              deadlineFrom:
                "2026-10-01T00:00:00.000Z",

              deadlineTo:
                "2026-10-31T23:59:59.999Z"
            })
            .set(
              "Authorization",
              `Bearer ${token}`
            )
            .expect(200);

        expectSingleJob(
          response,
          matchingJob
        );
      }
    );

    test.each([
      [
        "newest",
        [
          "Charlie Role",
          "Bravo Role",
          "Alpha Role"
        ]
      ],
      [
        "oldest",
        [
          "Alpha Role",
          "Bravo Role",
          "Charlie Role"
        ]
      ],
      [
        "titleAscending",
        [
          "Alpha Role",
          "Bravo Role",
          "Charlie Role"
        ]
      ],
      [
        "titleDescending",
        [
          "Charlie Role",
          "Bravo Role",
          "Alpha Role"
        ]
      ],
      [
        "salaryAscending",
        [
          "Alpha Role",
          "Bravo Role",
          "Charlie Role"
        ]
      ],
      [
        "salaryDescending",
        [
          "Charlie Role",
          "Bravo Role",
          "Alpha Role"
        ]
      ],
      [
        "deadlineSoon",
        [
          "Alpha Role",
          "Bravo Role",
          "Charlie Role"
        ]
      ]
    ])(
      "supports %s sorting",
      async (
        sort,
        expectedTitles
      ) => {
        const {
          recruiter,
          token,
          company
        } =
          await createRecruiterContext(
            `sort-${sort}`
          );

        await createJobFor({
          companyId:
            company.id,

          createdBy:
            recruiter.id,

          title:
            "Alpha Role",

          minimumSalary:
            300000,

          maximumSalary:
            400000,

          applicationDeadline:
            new Date(
              "2026-09-01T00:00:00.000Z"
            ),

          createdAt:
            new Date(
              "2026-06-01T00:00:00.000Z"
            )
        });

        await createJobFor({
          companyId:
            company.id,

          createdBy:
            recruiter.id,

          title:
            "Bravo Role",

          minimumSalary:
            500000,

          maximumSalary:
            600000,

          applicationDeadline:
            new Date(
              "2026-10-01T00:00:00.000Z"
            ),

          createdAt:
            new Date(
              "2026-06-02T00:00:00.000Z"
            )
        });

        await createJobFor({
          companyId:
            company.id,

          createdBy:
            recruiter.id,

          title:
            "Charlie Role",

          minimumSalary:
            700000,

          maximumSalary:
            800000,

          applicationDeadline:
            new Date(
              "2026-11-01T00:00:00.000Z"
            ),

          createdAt:
            new Date(
              "2026-06-03T00:00:00.000Z"
            )
        });

        const response =
          await request(app)
            .get(
              "/api/jobs/me"
            )
            .query({
              sort,
              limit:
                10
            })
            .set(
              "Authorization",
              `Bearer ${token}`
            )
            .expect(200);

        expect(
          response.body.data.map(
            (job) =>
              job.title
          )
        ).toEqual(
          expectedTitles
        );
      }
    );

    test.each([
      [
        "creation",
        {
          dateFrom:
            "2026-07-10T00:00:00.000Z",

          dateTo:
            "2026-07-01T00:00:00.000Z"
        },

        "Creation date start date cannot be after end date."
      ],
      [
        "publication",
        {
          publishedFrom:
            "2026-07-10T00:00:00.000Z",

          publishedTo:
            "2026-07-01T00:00:00.000Z"
        },

        "Publication date start date cannot be after end date."
      ],
      [
        "deadline",
        {
          deadlineFrom:
            "2026-07-10T00:00:00.000Z",

          deadlineTo:
            "2026-07-01T00:00:00.000Z"
        },

        "Deadline start date cannot be after end date."
      ]
    ])(
      "rejects a reversed %s date range",
      async (
        _label,
        query,
        expectedMessage
      ) => {
        const {
          token
        } =
          await createRecruiterContext(
            `invalid-${_label}`
          );

        const response =
          await request(app)
            .get(
              "/api/jobs/me"
            )
            .query(
              query
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
              message:
                expectedMessage
            })
          ])
        );
      }
    );

    test(
      "returns an empty result when recruiter has no jobs",
      async () => {
        const email =
          createEmail(
            "empty"
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
            .get(
              "/api/jobs/me"
            )
            .set(
              "Authorization",
              `Bearer ${token}`
            )
            .expect(200);

        expect(
          response.body.data
        ).toEqual([]);

        expect(
          response.body.meta
        ).toEqual({
          page:
            1,

          limit:
            10,

          offset:
            0,

          totalRecords:
            0,

          totalPages:
            1,

          hasPreviousPage:
            false,

          hasNextPage:
            false
        });
      }
    );

    test(
      "rejects invalid query values",
      async () => {
        const email =
          createEmail(
            "invalid-query"
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
            .get(
              "/api/jobs/me?page=0&limit=500&status=INVALID"
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
          response.body.errors.length
        ).toBeGreaterThan(0);
      }
    );

    test(
      "rejects invalid publication and deadline date formats",
      async () => {
        const {
          token
        } =
          await createRecruiterContext(
            "invalid-date-format"
          );

        const response =
          await request(app)
            .get(
              "/api/jobs/me"
            )
            .query({
              publishedFrom:
                "not-a-date",

              deadlineTo:
                "also-not-a-date"
            })
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
            .map(
              (error) =>
                error.field
            )
        ).toEqual(
          expect.arrayContaining([
            "publishedFrom",
            "deadlineTo"
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
            .get(
              "/api/jobs/me"
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
      }
    );

    test(
      "rejects an unauthenticated request",
      async () => {
        const response =
          await request(app)
            .get(
              "/api/jobs/me"
            )
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

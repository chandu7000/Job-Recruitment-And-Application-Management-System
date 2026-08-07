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
  "job.get-own.integration.";

const TEST_COMPANY_SLUG_PREFIX =
  "job-get-own-integration-";

const TEST_JOB_SLUG_PREFIX =
  "job-get-own-";

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
        "CareerForge Job Details Integration Test"
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

const createJobFor = async ({
  companyId,
  createdBy,
  title,
  status = "DRAFT"
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
        "2027-12-31T23:59:59.000Z"
      ),

    status,

    viewCount:
      4,

    applicationCount:
      1
  });
};

describe(
  "Recruiter Own Job Details API",
  () => {
    beforeEach(cleanup);
    afterEach(cleanup);

    test(
      "returns an owned job with recruiter lifecycle details",
      async () => {
        const email =
          createEmail(
            "success"
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
            "Success Company"
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

        const response =
          await request(app)
            .get(
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
          "Job fetched successfully."
        );

        expect(
          response.body.data.id
        ).toBe(job.id);

        expect(
          response.body.data.companyId
        ).toBe(company.id);

        expect(
          response.body.data.createdBy
        ).toBe(
          recruiter.id
        );

        expect(
          response.body.data.status
        ).toBe("DRAFT");

        expect(
          response.body.data.viewCount
        ).toBe(4);

        expect(
          response.body.data.applicationCount
        ).toBe(1);

        expect(
          response.body.data.company
        ).toEqual(
          expect.objectContaining({
            id:
              company.id,

            ownerId:
              recruiter.id
          })
        );

        expect(
          response.body.data.creator
        ).toEqual(
          expect.objectContaining({
            id:
              recruiter.id,

            role:
              "RECRUITER"
          })
        );
      }
    );

    test(
      "hides another recruiter's job using JOB_NOT_FOUND",
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
          await createUser({
            email:
              ownerEmail,

            role:
              "RECRUITER"
          });

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

        const ownerCompany =
          await createCompanyFor(
            owner.id,
            "Owner Company"
          );

        const ownerJob =
          await createJobFor({
            companyId:
              ownerCompany.id,

            createdBy:
              owner.id,

            title:
              "Private Recruiter Job"
          });

        const response =
          await request(app)
            .get(
              `/api/jobs/${ownerJob.id}`
            )
            .set(
              "Authorization",
              `Bearer ${attackerToken}`
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
      "returns JOB_NOT_FOUND for a missing job",
      async () => {
        const email =
          createEmail(
            "missing"
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
            .get(
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
              `/api/jobs/${MISSING_JOB_ID}`
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
              `/api/jobs/${MISSING_JOB_ID}`
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
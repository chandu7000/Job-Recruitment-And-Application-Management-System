import {
  Op
} from "sequelize";

import User from
  "../../models/user.model.js";

import Company from
  "../../models/company.model.js";

import Job from
  "../../models/job.model.js";

import {
  hashPassword
} from "../../utils/password.util.js";

import {
  closeExpiredJobs
} from "../../services/jobExpiry.service.js";

const TEST_EMAIL_PREFIX =
  "job.expiry.integration.";

const TEST_COMPANY_SLUG_PREFIX =
  "job-expiry-company-";

const TEST_JOB_SLUG_PREFIX =
  "job-expiry-";

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
      )
      .slice(
        0,
        20
      );

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
      createEmail(
        label
      ),

    passwordHash,

    role:
      "RECRUITER",

    status:
      "ACTIVE",

    emailVerifiedAt:
      new Date()
  });
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

const createPublishedJob = async ({
  companyId,
  createdBy,
  title,
  applicationDeadline
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

    applicationDeadline,

    status:
      "PUBLISHED",

    publishedAt:
      new Date(
        Date.now() -
        2 * 24 * 60 * 60 * 1000
      )
  });
};

describe(
  "Job Expiry Integration",
  () => {
    beforeEach(
      cleanup
    );

    afterEach(
      cleanup
    );

    test(
      "closes expired published jobs and preserves future jobs",
      async () => {
        const now =
          new Date(
            "2026-08-03T12:00:00.000Z"
          );

        const recruiter =
          await createRecruiter(
            "expiry-success"
          );

        const company =
          await createCompanyFor({
            ownerId:
              recruiter.id,

            label:
              "expiry-success-company"
          });

        const expiredJob =
          await createPublishedJob({
            companyId:
              company.id,

            createdBy:
              recruiter.id,

            title:
              "Expired Backend Engineer",

            applicationDeadline:
              new Date(
                "2026-08-02T12:00:00.000Z"
              )
          });

        const futureJob =
          await createPublishedJob({
            companyId:
              company.id,

            createdBy:
              recruiter.id,

            title:
              "Future Backend Engineer",

            applicationDeadline:
              new Date(
                "2026-08-04T12:00:00.000Z"
              )
          });

        const summary =
          await closeExpiredJobs({
            now,
            limit:
              100
          });

        expect(
          summary.scanned
        ).toBe(1);

        expect(
          summary.closed
        ).toBe(1);

        expect(
          summary.skipped
        ).toBe(0);

        expect(
          summary.failed
        ).toBe(0);

        expect(
          summary.closedJobIds
        ).toEqual([
          expiredJob.id
        ]);

        expect(
          summary.failedJobs
        ).toEqual([]);

        const storedExpiredJob =
          await Job.findByPk(
            expiredJob.id
          );

        expect(
          storedExpiredJob.status
        ).toBe(
          "CLOSED"
        );

        expect(
          storedExpiredJob.closedAt
        ).toBeInstanceOf(
          Date
        );

        expect(
          storedExpiredJob.closureReason
        ).toBe(
          "DEADLINE_EXPIRED"
        );

        const storedFutureJob =
          await Job.findByPk(
            futureJob.id
          );

        expect(
          storedFutureJob.status
        ).toBe(
          "PUBLISHED"
        );

        expect(
          storedFutureJob.closedAt
        ).toBeNull();

        expect(
          storedFutureJob.closureReason
        ).toBeNull();
      }
    );

    test(
      "does not close draft, closed, or removed jobs even when deadline passed",
      async () => {
        const now =
          new Date(
            "2026-08-03T12:00:00.000Z"
          );

        const recruiter =
          await createRecruiter(
            "status-protection"
          );

        const company =
          await createCompanyFor({
            ownerId:
              recruiter.id,

            label:
              "status-protection-company"
          });

        const pastDeadline =
          new Date(
            "2026-08-01T12:00:00.000Z"
          );

        const draftJob =
          await Job.create({
            companyId:
              company.id,

            createdBy:
              recruiter.id,

            title:
              "Draft Expiry Job",

            slug:
              `${TEST_JOB_SLUG_PREFIX}${createUniqueValue(
                "draft-expiry"
              )}`,

            vacancies:
              1,

            applicationDeadline:
              pastDeadline,

            status:
              "DRAFT"
          });

        const closedJob =
          await Job.create({
            companyId:
              company.id,

            createdBy:
              recruiter.id,

            title:
              "Closed Expiry Job",

            slug:
              `${TEST_JOB_SLUG_PREFIX}${createUniqueValue(
                "closed-expiry"
              )}`,

            vacancies:
              1,

            applicationDeadline:
              pastDeadline,

            status:
              "CLOSED",

            publishedAt:
              new Date(
                "2026-07-30T12:00:00.000Z"
              ),

            closedAt:
              new Date(
                "2026-08-01T12:00:00.000Z"
              ),

            closureReason:
              "RECRUITER_CLOSED"
          });

        const removedJob =
          await Job.create({
            companyId:
              company.id,

            createdBy:
              recruiter.id,

            title:
              "Removed Expiry Job",

            slug:
              `${TEST_JOB_SLUG_PREFIX}${createUniqueValue(
                "removed-expiry"
              )}`,

            vacancies:
              1,

            applicationDeadline:
              pastDeadline,

            status:
              "REMOVED",

            removedAt:
              new Date(
                "2026-08-01T12:00:00.000Z"
              ),

            removalReason:
              "Removed for testing."
          });

        const summary =
          await closeExpiredJobs({
            now
          });

        expect(
          summary.scanned
        ).toBe(0);

        expect(
          summary.closed
        ).toBe(0);

        const storedDraftJob =
          await Job.findByPk(
            draftJob.id
          );

        expect(
          storedDraftJob.status
        ).toBe(
          "DRAFT"
        );

        const storedClosedJob =
          await Job.findByPk(
            closedJob.id
          );

        expect(
          storedClosedJob.status
        ).toBe(
          "CLOSED"
        );

        expect(
          storedClosedJob.closureReason
        ).toBe(
          "RECRUITER_CLOSED"
        );

        const storedRemovedJob =
          await Job.findByPk(
            removedJob.id
          );

        expect(
          storedRemovedJob.status
        ).toBe(
          "REMOVED"
        );
      }
    );

    test(
      "respects the batch limit",
      async () => {
        const now =
          new Date(
            "2026-08-03T12:00:00.000Z"
          );

        const recruiter =
          await createRecruiter(
            "batch-limit"
          );

        const company =
          await createCompanyFor({
            ownerId:
              recruiter.id,

            label:
              "batch-limit-company"
          });

        const firstJob =
          await createPublishedJob({
            companyId:
              company.id,

            createdBy:
              recruiter.id,

            title:
              "First Expired Job",

            applicationDeadline:
              new Date(
                "2026-08-01T10:00:00.000Z"
              )
          });

        const secondJob =
          await createPublishedJob({
            companyId:
              company.id,

            createdBy:
              recruiter.id,

            title:
              "Second Expired Job",

            applicationDeadline:
              new Date(
                "2026-08-02T10:00:00.000Z"
              )
          });

        const summary =
          await closeExpiredJobs({
            now,
            limit:
              1
          });

        expect(
          summary.scanned
        ).toBe(1);

        expect(
          summary.closed
        ).toBe(1);

        expect(
          summary.closedJobIds
        ).toEqual([
          firstJob.id
        ]);

        const storedFirstJob =
          await Job.findByPk(
            firstJob.id
          );

        expect(
          storedFirstJob.status
        ).toBe(
          "CLOSED"
        );

        const storedSecondJob =
          await Job.findByPk(
            secondJob.id
          );

        expect(
          storedSecondJob.status
        ).toBe(
          "PUBLISHED"
        );
      }
    );

    test(
      "returns an empty summary when no expired jobs exist",
      async () => {
        const now =
          new Date(
            "2026-08-03T12:00:00.000Z"
          );

        const recruiter =
          await createRecruiter(
            "empty-expiry"
          );

        const company =
          await createCompanyFor({
            ownerId:
              recruiter.id,

            label:
              "empty-expiry-company"
          });

        await createPublishedJob({
          companyId:
            company.id,

          createdBy:
            recruiter.id,

          title:
            "Active Future Job",

          applicationDeadline:
            new Date(
              "2026-08-10T12:00:00.000Z"
            )
        });

        const summary =
          await closeExpiredJobs({
            now
          });

        expect(summary).toEqual({
          scanned:
            0,

          closed:
            0,

          skipped:
            0,

          failed:
            0,

          closedJobIds:
            [],

          failedJobs:
            []
        });
      }
    );
  }
);

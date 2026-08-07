import {
  jest
} from "@jest/globals";

const {
  PUBLIC_JOB_LIST_FIELDS,
  PUBLIC_JOB_DETAIL_FIELDS,
  PUBLIC_COMPANY_SUMMARY_FIELDS,
  PUBLIC_COMPANY_DETAIL_FIELDS,
  convertToPlainObject,
  pickPublicFields,
  sanitizePublicCompanySummary,
  sanitizePublicCompanyDetail,
  sanitizePublicJobListItem,
  sanitizePublicJobDetail,
  sanitizePublicJobList
} = await import(
  "../../utils/publicResponseSanitizer.js"
);

describe(
  "Public response sanitizer",
  () => {
    const privateRecruiter = {
      id:
        "33333333-3333-4333-8333-333333333333",

      userId:
        "44444444-4444-4444-8444-444444444444",

      email:
        "private-recruiter@example.com",

      phoneNumber:
        "9999999999",

      firstName:
        "Private",

      lastName:
        "Recruiter",

      designation:
        "Internal Recruiter",

      biography:
        "Private recruiter biography",

      linkedinUrl:
        "https://linkedin.com/in/private",

      password:
        "private-password",

      passwordHash:
        "private-password-hash",

      accessToken:
        "private-access-token",

      refreshToken:
        "private-refresh-token",

      sessions: [
        {
          id:
            "private-session"
        }
      ]
    };

    const privateCompany = {
      id:
        "11111111-1111-4111-8111-111111111111",

      ownerId:
        privateRecruiter.id,

      companyName:
        "CareerForge Technologies",

      slug:
        "careerforge-technologies",

      companyEmail:
        "private-company@example.com",

      companyPhone:
        "9999999999",

      description:
        "Public company description.",

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

      status:
        "VERIFIED",

      verificationReason:
        "Internal verification information",

      rejectionReason:
        "Internal rejection reason",

      moderationNotes:
        "Internal moderation notes",

      verificationHistory: [
        {
          id: 1,
          status:
            "VERIFIED"
        }
      ],

      auditMetadata: {
        reviewedBy:
          "admin-id"
      },

      deletedAt:
        null,

      createdAt:
        new Date(
          "2026-01-01T10:00:00.000Z"
        ),

      updatedAt:
        new Date(
          "2026-02-01T10:00:00.000Z"
        ),

      owner:
        privateRecruiter,

      recruiter:
        privateRecruiter
    };

    const privateJob = {
      id:
        "22222222-2222-4222-8222-222222222222",

      companyId:
        privateCompany.id,

      createdBy:
        privateRecruiter.id,

      title:
        "Java Backend Developer",

      slug:
        "java-backend-developer",

      description:
        "Public job description",

      responsibilities:
        "Public responsibilities",

      requirements:
        "Public requirements",

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
        "JUNIOR",

      minimumExperience:
        "1.0",

      maximumExperience:
        "3.0",

      minimumSalary:
        "400000.00",

      maximumSalary:
        "800000.00",

      salaryCurrency:
        "INR",

      vacancies:
        3,

      applicationDeadline:
        new Date(
          "2026-09-01T10:00:00.000Z"
        ),

      status:
        "PUBLISHED",

      publishedAt:
        new Date(
          "2026-08-01T10:00:00.000Z"
        ),

      closedAt:
        null,

      removedAt:
        null,

      removalReason:
        "Private removal reason",

      closureReason:
        "Private closure reason",

      viewCount:
        10,

      applicationCount:
        5,

      auditMetadata: {
        createdFrom:
          "internal-service"
      },

      failureMetadata: {
        code:
          "INTERNAL_FAILURE"
      },

      deletedAt:
        null,

      createdAt:
        new Date(
          "2026-01-01T10:00:00.000Z"
        ),

      updatedAt:
        new Date(
          "2026-02-01T10:00:00.000Z"
        ),

      company:
        privateCompany,

      creator:
        privateRecruiter,

      recruiter:
        privateRecruiter
    };

    const expectPrivateCompanyFieldsAbsent =
      (
        company
      ) => {
        expect(company).not
          .toHaveProperty(
            "ownerId"
          );

        expect(company).not
          .toHaveProperty(
            "companyEmail"
          );

        expect(company).not
          .toHaveProperty(
            "companyPhone"
          );

        expect(company).not
          .toHaveProperty(
            "address"
          );

        expect(company).not
          .toHaveProperty(
            "postalCode"
          );

        expect(company).not
          .toHaveProperty(
            "logoPublicId"
          );

        expect(company).not
          .toHaveProperty(
            "status"
          );

        expect(company).not
          .toHaveProperty(
            "verificationReason"
          );

        expect(company).not
          .toHaveProperty(
            "rejectionReason"
          );

        expect(company).not
          .toHaveProperty(
            "moderationNotes"
          );

        expect(company).not
          .toHaveProperty(
            "verificationHistory"
          );

        expect(company).not
          .toHaveProperty(
            "auditMetadata"
          );

        expect(company).not
          .toHaveProperty(
            "deletedAt"
          );

        expect(company).not
          .toHaveProperty(
            "createdAt"
          );

        expect(company).not
          .toHaveProperty(
            "updatedAt"
          );

        expect(company).not
          .toHaveProperty(
            "owner"
          );

        expect(company).not
          .toHaveProperty(
            "recruiter"
          );
      };

    const expectPrivateJobFieldsAbsent =
      (
        job
      ) => {
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
            "applicationCount"
          );

        expect(job).not
          .toHaveProperty(
            "closedAt"
          );

        expect(job).not
          .toHaveProperty(
            "closureReason"
          );

        expect(job).not
          .toHaveProperty(
            "removedAt"
          );

        expect(job).not
          .toHaveProperty(
            "removalReason"
          );

        expect(job).not
          .toHaveProperty(
            "auditMetadata"
          );

        expect(job).not
          .toHaveProperty(
            "failureMetadata"
          );

        expect(job).not
          .toHaveProperty(
            "deletedAt"
          );

        expect(job).not
          .toHaveProperty(
            "createdAt"
          );

        expect(job).not
          .toHaveProperty(
            "updatedAt"
          );

        expect(job).not
          .toHaveProperty(
            "creator"
          );

        expect(job).not
          .toHaveProperty(
            "recruiter"
          );

        expectPrivateCompanyFieldsAbsent(
          job.company
        );
      };

    test(
      "defines only approved public job-list fields",
      () => {
        expect(
          PUBLIC_JOB_LIST_FIELDS
        ).toEqual([
          "id",
          "title",
          "slug",
          "skills",
          "location",
          "workMode",
          "employmentType",
          "experienceLevel",
          "minimumExperience",
          "maximumExperience",
          "minimumSalary",
          "maximumSalary",
          "salaryCurrency",
          "vacancies",
          "applicationDeadline",
          "publishedAt",
          "viewCount"
        ]);

        expect(
          PUBLIC_JOB_LIST_FIELDS
        ).not.toContain(
          "createdBy"
        );

        expect(
          PUBLIC_JOB_LIST_FIELDS
        ).not.toContain(
          "status"
        );
      }
    );

    test(
      "defines only approved public job-detail fields",
      () => {
        expect(
          PUBLIC_JOB_DETAIL_FIELDS
        ).toEqual(
          expect.arrayContaining([
            "id",
            "title",
            "description",
            "responsibilities",
            "requirements",
            "viewCount"
          ])
        );

        expect(
          PUBLIC_JOB_DETAIL_FIELDS
        ).not.toContain(
          "removalReason"
        );

        expect(
          PUBLIC_JOB_DETAIL_FIELDS
        ).not.toContain(
          "applicationCount"
        );
      }
    );

    test(
      "defines only approved company-summary fields",
      () => {
        expect(
          PUBLIC_COMPANY_SUMMARY_FIELDS
        ).toEqual([
          "id",
          "companyName",
          "slug",
          "industry",
          "companySize",
          "location",
          "city",
          "state",
          "country",
          "logoUrl"
        ]);

        expect(
          PUBLIC_COMPANY_SUMMARY_FIELDS
        ).not.toContain(
          "ownerId"
        );
      }
    );

    test(
      "defines only approved company-detail fields",
      () => {
        expect(
          PUBLIC_COMPANY_DETAIL_FIELDS
        ).toEqual([
          "id",
          "companyName",
          "slug",
          "description",
          "website",
          "industry",
          "companySize",
          "foundedYear",
          "location",
          "city",
          "state",
          "country",
          "logoUrl"
        ]);

        expect(
          PUBLIC_COMPANY_DETAIL_FIELDS
        ).not.toContain(
          "verificationReason"
        );
      }
    );

    test(
      "returns null for missing entities",
      () => {
        expect(
          convertToPlainObject(
            null
          )
        ).toBeNull();

        expect(
          convertToPlainObject(
            undefined
          )
        ).toBeNull();
      }
    );

    test(
      "returns null for unsupported primitive and array inputs",
      () => {
        expect(
          convertToPlainObject(
            "invalid"
          )
        ).toBeNull();

        expect(
          convertToPlainObject(
            123
          )
        ).toBeNull();

        expect(
          convertToPlainObject(
            []
          )
        ).toBeNull();
      }
    );

    test(
      "supports a plain object",
      () => {
        const value = {
          id: "1"
        };

        expect(
          convertToPlainObject(
            value
          )
        ).toEqual(value);

        expect(
          convertToPlainObject(
            value
          )
        ).not.toBe(value);
      }
    );

    test(
      "supports a Sequelize-like toJSON method",
      () => {
        const entity = {
          toJSON:
            jest.fn(
              () => ({
                id: "1",
                privateValue:
                  "hidden"
              })
            )
        };

        expect(
          convertToPlainObject(
            entity
          )
        ).toEqual({
          id: "1",
          privateValue:
            "hidden"
        });

        expect(
          entity.toJSON
        ).toHaveBeenCalledTimes(1);
      }
    );

    test(
      "supports a Sequelize-like get plain method",
      () => {
        const entity = {
          get:
            jest.fn(
              () => ({
                id: "1",
                privateValue:
                  "hidden"
              })
            )
        };

        expect(
          convertToPlainObject(
            entity
          )
        ).toEqual({
          id: "1",
          privateValue:
            "hidden"
        });

        expect(
          entity.get
        ).toHaveBeenCalledWith({
          plain: true
        });
      }
    );

    test(
      "picks only explicitly allowed fields",
      () => {
        expect(
          pickPublicFields(
            {
              id: "1",
              title:
                "Developer",
              createdBy:
                "private-value",
              passwordHash:
                "private-hash"
            },
            [
              "id",
              "title"
            ]
          )
        ).toEqual({
          id: "1",
          title:
            "Developer"
        });
      }
    );

    test(
      "returns null when picking fields from invalid input",
      () => {
        expect(
          pickPublicFields(
            null,
            [
              "id"
            ]
          )
        ).toBeNull();
      }
    );

    test(
      "returns only safe company summary fields",
      () => {
        const result =
          sanitizePublicCompanySummary(
            privateCompany
          );

        expect(result).toEqual({
          id:
            privateCompany.id,

          companyName:
            privateCompany
              .companyName,

          slug:
            privateCompany.slug,

          industry:
            privateCompany.industry,

          companySize:
            privateCompany
              .companySize,

          location:
            privateCompany.location,

          city:
            privateCompany.city,

          state:
            privateCompany.state,

          country:
            privateCompany.country,

          logoUrl:
            privateCompany.logoUrl
        });

        expectPrivateCompanyFieldsAbsent(
          result
        );
      }
    );

    test(
      "returns only safe public company detail fields",
      () => {
        const result =
          sanitizePublicCompanyDetail(
            privateCompany
          );

        expect(result).toEqual({
          id:
            privateCompany.id,

          companyName:
            privateCompany
              .companyName,

          slug:
            privateCompany.slug,

          description:
            privateCompany.description,

          website:
            privateCompany.website,

          industry:
            privateCompany.industry,

          companySize:
            privateCompany
              .companySize,

          foundedYear:
            privateCompany.foundedYear,

          location:
            privateCompany.location,

          city:
            privateCompany.city,

          state:
            privateCompany.state,

          country:
            privateCompany.country,

          logoUrl:
            privateCompany.logoUrl
        });

        expectPrivateCompanyFieldsAbsent(
          result
        );
      }
    );

    test(
      "returns null for missing company sanitizer input",
      () => {
        expect(
          sanitizePublicCompanySummary(
            null
          )
        ).toBeNull();

        expect(
          sanitizePublicCompanyDetail(
            null
          )
        ).toBeNull();
      }
    );

    test(
      "sanitizes a public job-list item",
      () => {
        const result =
          sanitizePublicJobListItem(
            privateJob
          );

        expect(result).toEqual(
          expect.objectContaining({
            id:
              privateJob.id,

            title:
              privateJob.title,

            slug:
              privateJob.slug,

            skills:
              privateJob.skills,

            company:
              expect.objectContaining({
                id:
                  privateCompany.id,

                companyName:
                  privateCompany
                    .companyName
              })
          })
        );

        expectPrivateJobFieldsAbsent(
          result
        );
      }
    );

    test(
      "sanitizes a public job-detail item",
      () => {
        const result =
          sanitizePublicJobDetail(
            privateJob
          );

        expect(result).toEqual(
          expect.objectContaining({
            id:
              privateJob.id,

            title:
              privateJob.title,

            description:
              privateJob.description,

            responsibilities:
              privateJob
                .responsibilities,

            requirements:
              privateJob.requirements,

            company:
              expect.objectContaining({
                id:
                  privateCompany.id
              })
          })
        );

        expectPrivateJobFieldsAbsent(
          result
        );
      }
    );

    test(
      "removes nested recruiter and authentication information",
      () => {
        const result =
          sanitizePublicJobDetail(
            privateJob
          );

        expect(result).not
          .toHaveProperty(
            "creator"
          );

        expect(result).not
          .toHaveProperty(
            "recruiter"
          );

        expect(result.company).not
          .toHaveProperty(
            "owner"
          );

        expect(result.company).not
          .toHaveProperty(
            "recruiter"
          );

        expect(
          JSON.stringify(
            result
          )
        ).not.toContain(
          privateRecruiter.email
        );

        expect(
          JSON.stringify(
            result
          )
        ).not.toContain(
          "private-password-hash"
        );

        expect(
          JSON.stringify(
            result
          )
        ).not.toContain(
          "private-access-token"
        );
      }
    );

    test(
      "keeps approved safe fields present",
      () => {
        const job =
          sanitizePublicJobDetail(
            privateJob
          );

        const company =
          sanitizePublicCompanyDetail(
            privateCompany
          );

        expect(job).toEqual(
          expect.objectContaining({
            id:
              privateJob.id,

            title:
              privateJob.title,

            applicationDeadline:
              privateJob
                .applicationDeadline,

            publishedAt:
              privateJob.publishedAt,

            viewCount:
              privateJob.viewCount
          })
        );

        expect(company).toEqual(
          expect.objectContaining({
            id:
              privateCompany.id,

            companyName:
              privateCompany
                .companyName,

            description:
              privateCompany
                .description,

            website:
              privateCompany.website
          })
        );
      }
    );

    test(
      "sanitizes an array used by job lists company jobs and similar jobs",
      () => {
        const result =
          sanitizePublicJobList([
            privateJob,
            null
          ]);

        expect(result).toHaveLength(
          1
        );

        expect(
          result[0].id
        ).toBe(
          privateJob.id
        );

        expectPrivateJobFieldsAbsent(
          result[0]
        );
      }
    );

    test(
      "returns an empty array for invalid list input",
      () => {
        expect(
          sanitizePublicJobList(
            null
          )
        ).toEqual([]);

        expect(
          sanitizePublicJobList(
            {}
          )
        ).toEqual([]);

        expect(
          sanitizePublicJobList(
            "invalid"
          )
        ).toEqual([]);
      }
    );

    test(
      "filters invalid elements from public job arrays",
      () => {
        const result =
          sanitizePublicJobList([
            null,
            undefined,
            "invalid",
            privateJob,
            []
          ]);

        expect(result).toHaveLength(
          1
        );

        expect(
          result[0].id
        ).toBe(
          privateJob.id
        );
      }
    );
  }
);
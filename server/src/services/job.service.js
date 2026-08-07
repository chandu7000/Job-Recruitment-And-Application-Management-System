import {
  sequelize
} from "../config/database.js";

import {
  logJobEvent
} from "./jobAudit.service.js";

import AppError from "../utils/AppError.js";

import validateCompanyOwnership from
  "../utils/companyOwnership.js";

import {
  normalizeJobSlug,
  generateUniqueJobSlug
} from "../utils/jobSlug.js";

import {
  getPagination,
  getPaginationMeta
} from "../utils/pagination.js";

import {
  validateJobPublicationEligibility
} from "../utils/jobPublicationEligibility.js";

import {
  validateJobStatusTransition
} from "../utils/jobStatusTransition.js";

import {
  JOB_STATUSES,
  JOB_EVENTS
} from "../constants/job.constants.js";

import {
  createJob,
  findJobById,
  findJobBySlug,
  findRecruiterJobs,
  findRecruiterJobById,
  countRecruiterJobs,
  findJobsByCompany,
  findAllActiveJobs,
  updateJob,

  publishJob as publishJobRecord,

  closeJob as closeJobRecord,

  deleteDraftJob as deleteDraftJobRecord
} from "../repositories/job.repository.js";

import {
  findCompanyById
} from "../repositories/company.repository.js";

const DRAFT_EDITABLE_JOB_FIELDS =
  Object.freeze([
    "title",
    "description",
    "responsibilities",
    "requirements",
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
    "applicationDeadline"
  ]);

const PUBLISHED_EDITABLE_JOB_FIELDS =
  Object.freeze([
    "description",
    "responsibilities",
    "requirements",
    "skills",
    "location",
    "workMode",
    "vacancies",
    "applicationDeadline"
  ]);

const PROTECTED_JOB_FIELDS =
  Object.freeze([
    "id",
    "companyId",
    "createdBy",
    "slug",
    "status",
    "publishedAt",
    "closedAt",
    "removedAt",
    "removalReason",
    "closureReason",
    "viewCount",
    "applicationCount",
    "createdAt",
    "updatedAt",
    "deletedAt",
    "created_at",
    "updated_at",
    "deleted_at"
  ]);

const CREATE_DRAFT_ALLOWED_FIELDS =
  Object.freeze([
    "companyId",
    ...DRAFT_EDITABLE_JOB_FIELDS
  ]);

const CREATE_DRAFT_ALLOWED_FIELD_SET =
  new Set(
    CREATE_DRAFT_ALLOWED_FIELDS
  );

const PROTECTED_JOB_FIELD_SET =
  new Set(
    PROTECTED_JOB_FIELDS
  );

const getUnsupportedJobFields = (
  payload
) => {
  if (
    !payload ||
    typeof payload !== "object" ||
    Array.isArray(payload)
  ) {
    return [];
  }

  return Object.keys(
    payload
  ).filter(
    (field) =>
      !CREATE_DRAFT_ALLOWED_FIELD_SET
        .has(field)
  );
};

const removeUndefinedFields = (
  data
) => {
  return Object.fromEntries(
    Object.entries(data).filter(
      ([, value]) =>
        value !== undefined
    )
  );
};

const getJobPlainValue = (
  job,
  field
) => {
  if (
    job &&
    typeof job.get === "function"
  ) {
    return job.get(field);
  }

  return job?.[field];
};

const getEditableFieldsForStatus = (
  status
) => {
  if (
    status === JOB_STATUSES.DRAFT
  ) {
    return DRAFT_EDITABLE_JOB_FIELDS;
  }

  if (
    status === JOB_STATUSES.PUBLISHED
  ) {
    return PUBLISHED_EDITABLE_JOB_FIELDS;
  }

  return [];
};

const getProtectedFieldsFromPayload = (
  payload
) => {
  return Object.keys(
    payload
  ).filter(
    (field) =>
      PROTECTED_JOB_FIELD_SET.has(
        field
      )
  );
};

const getUnsupportedUpdateFields = (
  payload
) => {
  const allRecruiterEditableFields =
    new Set(
      DRAFT_EDITABLE_JOB_FIELDS
    );

  return Object.keys(
    payload
  ).filter(
    (field) =>
      !allRecruiterEditableFields.has(
        field
      ) &&
      !PROTECTED_JOB_FIELD_SET.has(
        field
      )
  );
};

const buildEffectiveRange = ({
  job,
  payload,
  minimumField,
  maximumField
}) => {
  const minimumValue =
    Object.prototype.hasOwnProperty.call(
      payload,
      minimumField
    )
      ? payload[minimumField]
      : getJobPlainValue(
        job,
        minimumField
      );

  const maximumValue =
    Object.prototype.hasOwnProperty.call(
      payload,
      maximumField
    )
      ? payload[maximumField]
      : getJobPlainValue(
        job,
        maximumField
      );

  return {
    minimumValue,
    maximumValue
  };
};

const validateSalaryRange = ({
  job,
  payload
}) => {
  const {
    minimumValue,
    maximumValue
  } = buildEffectiveRange({
    job,
    payload,
    minimumField:
      "minimumSalary",
    maximumField:
      "maximumSalary"
  });

  if (
    minimumValue === null ||
    minimumValue === undefined ||
    maximumValue === null ||
    maximumValue === undefined
  ) {
    return true;
  }

  if (
    Number(minimumValue) >
    Number(maximumValue)
  ) {
    throw new AppError(
      "Minimum salary cannot exceed maximum salary.",
      422,
      "INVALID_SALARY_RANGE",
      [
        {
          field:
            "minimumSalary",
          minimumSalary:
            minimumValue,
          maximumSalary:
            maximumValue
        }
      ]
    );
  }

  return true;
};

const validateExperienceRange = ({
  job,
  payload
}) => {
  const {
    minimumValue,
    maximumValue
  } = buildEffectiveRange({
    job,
    payload,
    minimumField:
      "minimumExperience",
    maximumField:
      "maximumExperience"
  });

  if (
    minimumValue === null ||
    minimumValue === undefined ||
    maximumValue === null ||
    maximumValue === undefined
  ) {
    return true;
  }

  if (
    Number(minimumValue) >
    Number(maximumValue)
  ) {
    throw new AppError(
      "Minimum experience cannot exceed maximum experience.",
      422,
      "INVALID_EXPERIENCE_RANGE",
      [
        {
          field:
            "minimumExperience",
          minimumExperience:
            minimumValue,
          maximumExperience:
            maximumValue
        }
      ]
    );
  }

  return true;
};

const validateUpdatedDeadline = (
  payload
) => {
  if (
    !Object.prototype.hasOwnProperty.call(
      payload,
      "applicationDeadline"
    )
  ) {
    return true;
  }

  const deadline =
    payload.applicationDeadline;

  if (
    deadline === null
  ) {
    return true;
  }

  const parsedDeadline =
    deadline instanceof Date
      ? deadline
      : new Date(deadline);

  if (
    Number.isNaN(
      parsedDeadline.getTime()
    )
  ) {
    throw new AppError(
      "Application deadline is invalid.",
      422,
      "INVALID_APPLICATION_DEADLINE",
      [
        {
          field:
            "applicationDeadline",
          value:
            deadline
        }
      ]
    );
  }

  if (
    parsedDeadline.getTime() <=
    Date.now()
  ) {
    throw new AppError(
      "Application deadline must be in the future.",
      422,
      "INVALID_APPLICATION_DEADLINE",
      [
        {
          field:
            "applicationDeadline",
          value:
            parsedDeadline
        }
      ]
    );
  }

  return true;
};

const writeJobAuditSafely =
  async (
    auditPayload,
    failureMessage
  ) => {
    try {
      await logJobEvent(
        auditPayload
      );
    } catch (auditError) {
      console.error(
        failureMessage,
        auditError.message
      );
    }
  };

const createDraftJob = async ({
  recruiterId,
  payload,
  auditContext = {}
}) => {
  let auditDetails = {
    recruiterId,

    jobId:
      null,

    companyId:
      payload?.companyId ??
      null
  };

  const requestedFields =
    payload &&
      typeof payload ===
      "object" &&
      !Array.isArray(payload)
      ? Object.keys(
        payload
      )
      : [];

  try {
    const unsupportedFields =
      getUnsupportedJobFields(
        payload
      );

    if (
      unsupportedFields.length >
      0
    ) {
      throw new AppError(
        "One or more job fields are not supported.",
        400,
        "UNSUPPORTED_JOB_FIELD",
        unsupportedFields.map(
          (field) => ({
            field,

            message:
              "This field cannot be supplied when creating a job draft."
          })
        )
      );
    }

    const company =
      await findCompanyById(
        payload.companyId
      );

    if (!company) {
      throw new AppError(
        "Company not found.",
        404,
        "COMPANY_NOT_FOUND"
      );
    }

    validateCompanyOwnership(
      company,
      recruiterId
    );

    const slug =
      await generateUniqueJobSlug(
        payload.title,
        findJobBySlug
      );

    const jobData =
      removeUndefinedFields({
        companyId:
          payload.companyId,

        createdBy:
          recruiterId,

        title:
          payload.title,

        slug,

        description:
          payload.description,

        responsibilities:
          payload.responsibilities,

        requirements:
          payload.requirements,

        skills:
          payload.skills,

        location:
          payload.location,

        workMode:
          payload.workMode,

        employmentType:
          payload.employmentType,

        experienceLevel:
          payload.experienceLevel,

        minimumExperience:
          payload.minimumExperience,

        maximumExperience:
          payload.maximumExperience,

        minimumSalary:
          payload.minimumSalary,

        maximumSalary:
          payload.maximumSalary,

        salaryCurrency:
          payload.salaryCurrency,

        vacancies:
          payload.vacancies,

        applicationDeadline:
          payload.applicationDeadline,

        status:
          JOB_STATUSES.DRAFT
      });

    let job;

    try {
      job =
        await createJob(
          jobData
        );
    } catch {
      throw new AppError(
        "Job draft could not be created.",
        500,
        "JOB_CREATION_FAILED"
      );
    }

    if (!job) {
      throw new AppError(
        "Job draft could not be created.",
        500,
        "JOB_CREATION_FAILED"
      );
    }

    auditDetails = {
      recruiterId,

      jobId:
        getJobPlainValue(
          job,
          "id"
        ) ?? null,

      companyId:
        getJobPlainValue(
          job,
          "companyId"
        ) ??
        payload.companyId ??
        null
    };

    await writeJobAuditSafely(
      {
        recruiterId,

        jobId:
          auditDetails.jobId,

        companyId:
          auditDetails.companyId,

        event:
          JOB_EVENTS.JOB_CREATED,

        status:
          "SUCCESS",

        previousStatus:
          null,

        nextStatus:
          JOB_STATUSES.DRAFT,

        ipAddress:
          auditContext.ipAddress ??
          null,

        userAgent:
          auditContext.userAgent ??
          null,

        requestId:
          auditContext.requestId ??
          null,

        metadata: {
          changedFields:
            requestedFields,

          initialStatus:
            JOB_STATUSES.DRAFT
        }
      },

      "Failed to write job creation audit event:"
    );

    return job;
  } catch (error) {
    const isStructuredApplicationError =
      error instanceof AppError ||
      (
        error &&
        Number.isInteger(
          error.statusCode
        ) &&
        typeof error.code ===
        "string"
      );

    const finalError =
      isStructuredApplicationError
        ? error
        : new AppError(
          "Job draft could not be created.",
          500,
          "JOB_CREATION_FAILED"
        );

    await writeJobAuditSafely(
      {
        recruiterId,

        jobId:
          auditDetails.jobId,

        companyId:
          auditDetails.companyId,

        event:
          JOB_EVENTS
            .JOB_CREATION_FAILED,

        status:
          "FAILED",

        previousStatus:
          null,

        nextStatus:
          JOB_STATUSES.DRAFT,

        ipAddress:
          auditContext.ipAddress ??
          null,

        userAgent:
          auditContext.userAgent ??
          null,

        requestId:
          auditContext.requestId ??
          null,

        metadata: {
          requestedFields,

          errorCode:
            finalError.code ??
            "INTERNAL_SERVER_ERROR",

          message:
            finalError.message
        }
      },

      "Failed to write job creation audit event:"
    );

    throw finalError;
  }
};

const createNewJob = async ({
  ownerId,
  auditContext = {},
  ...payload
}) => {
  return createDraftJob({
    recruiterId:
      ownerId,

    payload,

    auditContext
  });
};

const getRecruiterJobs = async ({
  recruiterId,
  query = {}
}) => {
  const {
    page,
    limit,
    offset
  } = getPagination(
    query
  );

  const filters = {
    status:
      query.status,

    location:
      query.location,

    employmentType:
      query.employmentType,

    workMode:
      query.workMode,

    experienceLevel:
      query.experienceLevel,

    dateFrom:
      query.dateFrom,

    dateTo:
      query.dateTo,

    publishedFrom:
      query.publishedFrom,

    publishedTo:
      query.publishedTo,

    deadlineFrom:
      query.deadlineFrom,

    deadlineTo:
      query.deadlineTo,

    minimumSalary:
      query.minimumSalary,

    maximumSalary:
      query.maximumSalary
  };

  const [
    jobs,
    totalRecords
  ] = await Promise.all([
    findRecruiterJobs({
      createdBy:
        recruiterId,

      limit,
      offset,
      filters,

      search:
        query.search,

      sort:
        query.sort ||
        "newest"
    }),

    countRecruiterJobs({
      createdBy:
        recruiterId,

      filters,

      search:
        query.search
    })
  ]);

  return {
    jobs,

    pagination:
      getPaginationMeta(
        page,
        limit,
        totalRecords
      )
  };
};

const getRecruiterJobById =
  async ({
    recruiterId,
    jobId
  }) => {
    const job =
      await findRecruiterJobById({
        jobId,
        createdBy:
          recruiterId
      });

    if (!job) {
      throw new AppError(
        "Job not found.",
        404,
        "JOB_NOT_FOUND"
      );
    }

    return job;
  };

const updateEligibleJob = async ({
  recruiterId,
  jobId,
  payload,
  auditContext = {}
}) => {
  let auditDetails = {
    recruiterId,
    jobId,

    companyId:
      null,

    previousStatus:
      null,

    changedFields:
      []
  };

  try {
    if (
      !payload ||
      typeof payload !==
      "object" ||
      Array.isArray(payload) ||
      Object.keys(payload)
        .length === 0
    ) {
      throw new AppError(
        "At least one supported job field is required.",
        400,
        "NO_SUPPORTED_JOB_FIELDS"
      );
    }

    const protectedFields =
      getProtectedFieldsFromPayload(
        payload
      );

    if (
      protectedFields.length >
      0
    ) {
      throw new AppError(
        "One or more protected job fields cannot be updated.",
        400,
        "UNSUPPORTED_JOB_FIELD",
        protectedFields.map(
          (field) => ({
            field,

            message:
              "This field cannot be changed through the normal job update endpoint."
          })
        )
      );
    }

    const unsupportedFields =
      getUnsupportedUpdateFields(
        payload
      );

    if (
      unsupportedFields.length >
      0
    ) {
      throw new AppError(
        "One or more job fields are not supported.",
        400,
        "UNSUPPORTED_JOB_FIELD",
        unsupportedFields.map(
          (field) => ({
            field,

            message:
              "This field is not supported for job updates."
          })
        )
      );
    }

    const job =
      await findJobById(
        jobId
      );

    if (!job) {
      throw new AppError(
        "Job not found.",
        404,
        "JOB_NOT_FOUND"
      );
    }

    const companyId =
      getJobPlainValue(
        job,
        "companyId"
      );

    const currentStatus =
      getJobPlainValue(
        job,
        "status"
      );

    auditDetails = {
      ...auditDetails,

      companyId,

      previousStatus:
        currentStatus
    };

    const jobCreatorId =
      getJobPlainValue(
        job,
        "createdBy"
      );

    if (
      jobCreatorId !==
      recruiterId
    ) {
      throw new AppError(
        "You are not allowed to update this job.",
        403,
        "JOB_ACCESS_FORBIDDEN"
      );
    }

    const company =
      await findCompanyById(
        companyId
      );

    if (!company) {
      throw new AppError(
        "Company not found.",
        404,
        "COMPANY_NOT_FOUND"
      );
    }

    validateCompanyOwnership(
      company,
      recruiterId
    );

    if (
      currentStatus ===
      JOB_STATUSES.CLOSED ||
      currentStatus ===
      JOB_STATUSES.REMOVED
    ) {
      throw new AppError(
        `A ${currentStatus.toLowerCase()} job cannot be edited.`,
        409,
        "JOB_UPDATE_NOT_ALLOWED",
        [
          {
            currentStatus
          }
        ]
      );
    }

    const editableFields =
      getEditableFieldsForStatus(
        currentStatus
      );

    const disallowedForStatus =
      Object.keys(
        payload
      ).filter(
        (field) =>
          !editableFields.includes(
            field
          )
      );

    if (
      disallowedForStatus.length >
      0
    ) {
      throw new AppError(
        "One or more fields cannot be updated in the current job status.",
        409,
        "JOB_UPDATE_NOT_ALLOWED",
        disallowedForStatus.map(
          (field) => ({
            field,
            currentStatus,

            allowedFields:
              editableFields
          })
        )
      );
    }

    const updateData =
      removeUndefinedFields(
        Object.fromEntries(
          Object.entries(
            payload
          ).filter(
            ([field]) =>
              editableFields.includes(
                field
              )
          )
        )
      );

    if (
      Object.keys(updateData)
        .length === 0
    ) {
      throw new AppError(
        "At least one supported job field is required.",
        400,
        "NO_SUPPORTED_JOB_FIELDS"
      );
    }

    validateSalaryRange({
      job,

      payload:
        updateData
    });

    validateExperienceRange({
      job,

      payload:
        updateData
    });

    validateUpdatedDeadline(
      updateData
    );

    const changedFields =
      Object.keys(
        updateData
      );

    if (
      Object.prototype
        .hasOwnProperty.call(
          updateData,
          "title"
        )
    ) {
      const currentTitle =
        getJobPlainValue(
          job,
          "title"
        );

      const currentSlug =
        getJobPlainValue(
          job,
          "slug"
        );

      const currentNormalizedTitle =
        normalizeJobSlug(
          currentTitle
        );

      const nextNormalizedTitle =
        normalizeJobSlug(
          updateData.title
        );

      if (
        currentNormalizedTitle !==
        nextNormalizedTitle
      ) {
        updateData.slug =
          await generateUniqueJobSlug(
            updateData.title,
            findJobBySlug
          );
      } else {
        updateData.slug =
          currentSlug;
      }
    }

    auditDetails.changedFields =
      changedFields;

    const updatedJob =
      await updateJob(
        jobId,
        updateData
      );

    if (!updatedJob) {
      throw new AppError(
        "Job not found.",
        404,
        "JOB_NOT_FOUND"
      );
    }

    await writeJobAuditSafely(
      {
        recruiterId,
        jobId,
        companyId,

        event:
          JOB_EVENTS.JOB_UPDATED,

        status:
          "SUCCESS",

        previousStatus:
          currentStatus,

        nextStatus:
          currentStatus,

        ipAddress:
          auditContext.ipAddress ??
          null,

        userAgent:
          auditContext.userAgent ??
          null,

        requestId:
          auditContext.requestId ??
          null,

        metadata: {
          changedFields
        }
      },

      "Failed to write job update audit event:"
    );

    return updatedJob;
  } catch (error) {
    await writeJobAuditSafely(
      {
        recruiterId,
        jobId,

        companyId:
          auditDetails.companyId,

        event:
          JOB_EVENTS
            .JOB_UPDATE_FAILED,

        status:
          "FAILED",

        previousStatus:
          auditDetails
            .previousStatus,

        nextStatus:
          auditDetails
            .previousStatus,

        ipAddress:
          auditContext.ipAddress ??
          null,

        userAgent:
          auditContext.userAgent ??
          null,

        requestId:
          auditContext.requestId ??
          null,

        metadata: {
          changedFields:
            auditDetails
              .changedFields,

          requestedFields:
            payload &&
              typeof payload ===
              "object" &&
              !Array.isArray(
                payload
              )
              ? Object.keys(
                payload
              )
              : [],

          errorCode:
            error.code ??
            "INTERNAL_SERVER_ERROR",

          message:
            error.message
        }
      },

      "Failed to write job update audit event:"
    );

    throw error;
  }
};

/*
 * Temporary compatibility wrapper.
 */
const updateExistingJob = async ({
  ownerId,
  jobId,
  updateData,
  auditContext = {}
}) => {
  return updateEligibleJob({
    recruiterId:
      ownerId,

    jobId,

    payload:
      updateData,

    auditContext
  });
};

const publishEligibleJob = async ({
  recruiterId,
  jobId,
  auditContext = {}
}) => {
  const publishedAt =
    new Date();

  let auditDetails = {
    recruiterId,
    jobId,
    companyId: null,
    previousStatus: null
  };

  try {
    const publishedJob =
      await sequelize.transaction(
        async (
          transaction
        ) => {
          const job =
            await findJobById(
              jobId,
              {
                transaction,

                lock:
                  transaction
                    .LOCK.UPDATE
              }
            );

          if (!job) {
            throw new AppError(
              "Job not found.",
              404,
              "JOB_NOT_FOUND"
            );
          }

          const jobCreatorId =
            getJobPlainValue(
              job,
              "createdBy"
            );

          const companyId =
            getJobPlainValue(
              job,
              "companyId"
            );

          const currentStatus =
            getJobPlainValue(
              job,
              "status"
            );

          auditDetails = {
            recruiterId,
            jobId,
            companyId,
            previousStatus:
              currentStatus
          };

          /*
           * Job ownership must be checked directly.
           *
           * This gives the required job-specific error
           * instead of COMPANY_ACCESS_FORBIDDEN.
           */
          if (
            jobCreatorId !==
            recruiterId
          ) {
            throw new AppError(
              "You are not allowed to publish this job.",
              403,
              "JOB_ACCESS_FORBIDDEN"
            );
          }

          /*
           * Validate lifecycle transition before checking
           * publication completeness.
           *
           * PUBLISHED, CLOSED, and REMOVED jobs therefore
           * return INVALID_JOB_STATUS_TRANSITION.
           */
          validateJobStatusTransition(
            currentStatus,
            JOB_STATUSES.PUBLISHED
          );

          const company =
            await findCompanyById(
              companyId,
              {
                transaction,

                lock:
                  transaction
                    .LOCK.UPDATE
              }
            );

          if (!company) {
            throw new AppError(
              "Company not found.",
              404,
              "COMPANY_NOT_FOUND"
            );
          }

          /*
           * This validates:
           * - company is VERIFIED
           * - job is complete
           * - deadline is in the future
           * - vacancies are valid
           * - salary/experience ranges are valid
           * - location rules are satisfied
           */
          validateJobPublicationEligibility(
            job,
            company,
            {
              now:
                publishedAt
            }
          );

          let slug =
            getJobPlainValue(
              job,
              "slug"
            );

          if (!slug) {
            const title =
              getJobPlainValue(
                job,
                "title"
              );

            slug =
              await generateUniqueJobSlug(
                title,

                (
                  candidate
                ) =>
                  findJobBySlug(
                    candidate,
                    {
                      transaction,

                      lock:
                        transaction
                          .LOCK.UPDATE
                    }
                  )
              );
          }

          const result =
            await publishJobRecord(
              jobId,
              {
                publishedAt,
                slug
              },
              {
                transaction,

                lock:
                  transaction
                    .LOCK.UPDATE
              }
            );

          if (!result) {
            throw new AppError(
              "Job not found.",
              404,
              "JOB_NOT_FOUND"
            );
          }

          return result;
        }
      );

    await logJobEvent({
      recruiterId,
      jobId,

      companyId:
        auditDetails.companyId,

      event:
        JOB_EVENTS
          .JOB_PUBLISHED,

      status:
        "SUCCESS",

      previousStatus:
        auditDetails
          .previousStatus,

      nextStatus:
        JOB_STATUSES.PUBLISHED,

      ipAddress:
        auditContext.ipAddress ??
        null,

      userAgent:
        auditContext.userAgent ??
        null,

      requestId:
        auditContext.requestId ??
        null,

      metadata: {
        publishedAt
      }
    });

    return publishedJob;
  } catch (error) {
    try {
      await logJobEvent({
        recruiterId,
        jobId,

        companyId:
          auditDetails.companyId,

        event:
          JOB_EVENTS
            .JOB_PUBLICATION_FAILED,

        status:
          "FAILED",

        previousStatus:
          auditDetails
            .previousStatus,

        nextStatus:
          JOB_STATUSES.PUBLISHED,

        ipAddress:
          auditContext.ipAddress ??
          null,

        userAgent:
          auditContext.userAgent ??
          null,

        requestId:
          auditContext.requestId ??
          null,

        metadata: {
          errorCode:
            error.code ??
            "INTERNAL_SERVER_ERROR",

          message:
            error.message
        }
      });
    } catch (
    auditError
    ) {
      console.error(
        "Failed to write job publication audit event:",
        auditError.message
      );
    }

    throw error;
  }
};

const closePublishedJob = async ({
  recruiterId,
  jobId,
  closureReason =
  "RECRUITER_CLOSED",
  auditContext = {}
}) => {
  const closedAt =
    new Date();

  let auditDetails = {
    recruiterId,
    jobId,
    companyId: null,
    previousStatus: null
  };

  try {
    const closedJob =
      await sequelize.transaction(
        async (
          transaction
        ) => {
          const job =
            await findJobById(
              jobId,
              {
                transaction,

                lock:
                  transaction
                    .LOCK.UPDATE
              }
            );

          if (!job) {
            throw new AppError(
              "Job not found.",
              404,
              "JOB_NOT_FOUND"
            );
          }

          const jobCreatorId =
            getJobPlainValue(
              job,
              "createdBy"
            );

          const companyId =
            getJobPlainValue(
              job,
              "companyId"
            );

          const currentStatus =
            getJobPlainValue(
              job,
              "status"
            );

          auditDetails = {
            recruiterId,
            jobId,
            companyId,
            previousStatus:
              currentStatus
          };

          /*
           * Validate direct job ownership so the API returns
           * JOB_ACCESS_FORBIDDEN instead of a company-specific
           * ownership error.
           */
          if (
            jobCreatorId !==
            recruiterId
          ) {
            throw new AppError(
              "You are not allowed to close this job.",
              403,
              "JOB_ACCESS_FORBIDDEN"
            );
          }

          if (
            currentStatus ===
            JOB_STATUSES.CLOSED
          ) {
            throw new AppError(
              "Job is already closed.",
              409,
              "JOB_ALREADY_CLOSED"
            );
          }

          if (
            currentStatus !==
            JOB_STATUSES.PUBLISHED
          ) {
            throw new AppError(
              "Only a published job can be closed.",
              409,
              "JOB_CLOSE_NOT_ALLOWED",
              [
                {
                  currentStatus,

                  requiredStatus:
                    JOB_STATUSES.PUBLISHED
                }
              ]
            );
          }

          /*
           * Protect the lifecycle using the centralized
           * transition map.
           */
          validateJobStatusTransition(
            currentStatus,
            JOB_STATUSES.CLOSED
          );

          const company =
            await findCompanyById(
              companyId,
              {
                transaction,

                lock:
                  transaction
                    .LOCK.UPDATE
              }
            );

          if (!company) {
            throw new AppError(
              "Company not found.",
              404,
              "COMPANY_NOT_FOUND"
            );
          }

          validateCompanyOwnership(
            company,
            recruiterId
          );

          const result =
            await closeJobRecord(
              jobId,
              {
                closedAt,
                closureReason
              },
              {
                transaction,

                lock:
                  transaction
                    .LOCK.UPDATE
              }
            );

          if (!result) {
            throw new AppError(
              "Job not found.",
              404,
              "JOB_NOT_FOUND"
            );
          }

          return result;
        }
      );

    await logJobEvent({
      recruiterId,
      jobId,

      companyId:
        auditDetails.companyId,

      event:
        JOB_EVENTS.JOB_CLOSED,

      status:
        "SUCCESS",

      previousStatus:
        auditDetails.previousStatus,

      nextStatus:
        JOB_STATUSES.CLOSED,

      ipAddress:
        auditContext.ipAddress ??
        null,

      userAgent:
        auditContext.userAgent ??
        null,

      requestId:
        auditContext.requestId ??
        null,

      metadata: {
        closedAt,
        closureReason
      }
    });

    return closedJob;
  } catch (error) {
    try {
      await logJobEvent({
        recruiterId,
        jobId,

        companyId:
          auditDetails.companyId,

        event:
          JOB_EVENTS
            .JOB_CLOSE_FAILED,

        status:
          "FAILED",

        previousStatus:
          auditDetails
            .previousStatus,

        nextStatus:
          JOB_STATUSES.CLOSED,

        ipAddress:
          auditContext.ipAddress ??
          null,

        userAgent:
          auditContext.userAgent ??
          null,

        requestId:
          auditContext.requestId ??
          null,

        metadata: {
          errorCode:
            error.code ??
            "INTERNAL_SERVER_ERROR",

          message:
            error.message,

          closureReason
        }
      });
    } catch (
    auditError
    ) {
      console.error(
        "Failed to write job close audit event:",
        auditError.message
      );
    }

    throw error;
  }
};

const getJobById = async (
  jobId
) => {
  const job =
    await findJobById(
      jobId
    );

  if (!job) {
    throw new AppError(
      "Job not found.",
      404,
      "JOB_NOT_FOUND"
    );
  }

  return job;
};

const getCompanyJobs = async ({
  ownerId,
  companyId
}) => {
  const company =
    await findCompanyById(
      companyId
    );

  if (!company) {
    throw new AppError(
      "Company not found.",
      404,
      "COMPANY_NOT_FOUND"
    );
  }

  validateCompanyOwnership(
    company,
    ownerId
  );

  return findJobsByCompany(
    companyId
  );
};

const getAllJobs = async () => {
  return findAllActiveJobs();
};

const deleteEligibleDraftJob = async ({
  recruiterId,
  jobId,
  auditContext = {}
}) => {
  let auditDetails = {
    recruiterId,
    jobId,
    companyId: null,
    previousStatus: null,
    applicationCount: null
  };

  try {
    await sequelize.transaction(
      async (
        transaction
      ) => {
        const job =
          await findJobById(
            jobId,
            {
              transaction,

              lock:
                transaction
                  .LOCK.UPDATE
            }
          );

        if (!job) {
          throw new AppError(
            "Job not found.",
            404,
            "JOB_NOT_FOUND"
          );
        }

        const jobCreatorId =
          getJobPlainValue(
            job,
            "createdBy"
          );

        const companyId =
          getJobPlainValue(
            job,
            "companyId"
          );

        const currentStatus =
          getJobPlainValue(
            job,
            "status"
          );

        const applicationCount =
          Number(
            getJobPlainValue(
              job,
              "applicationCount"
            ) ?? 0
          );

        auditDetails = {
          recruiterId,
          jobId,
          companyId,
          previousStatus:
            currentStatus,
          applicationCount
        };

        /*
         * Use direct job ownership validation to return the
         * required job-specific error.
         */
        if (
          jobCreatorId !==
          recruiterId
        ) {
          throw new AppError(
            "You are not allowed to delete this job.",
            403,
            "JOB_ACCESS_FORBIDDEN"
          );
        }

        if (
          currentStatus !==
          JOB_STATUSES.DRAFT
        ) {
          throw new AppError(
            "Only a draft job can be deleted.",
            409,
            "JOB_DELETE_NOT_ALLOWED",
            [
              {
                currentStatus,

                requiredStatus:
                  JOB_STATUSES.DRAFT
              }
            ]
          );
        }

        if (
          applicationCount > 0
        ) {
          throw new AppError(
            "A job with applications cannot be deleted.",
            409,
            "JOB_HAS_APPLICATIONS",
            [
              {
                applicationCount
              }
            ]
          );
        }

        const company =
          await findCompanyById(
            companyId,
            {
              transaction,

              lock:
                transaction
                  .LOCK.UPDATE
            }
          );

        if (!company) {
          throw new AppError(
            "Company not found.",
            404,
            "COMPANY_NOT_FOUND"
          );
        }

        validateCompanyOwnership(
          company,
          recruiterId
        );

        const deleted =
          await deleteDraftJobRecord(
            jobId,
            {
              transaction,
              force: false
            }
          );

        if (!deleted) {
          throw new AppError(
            "Job could not be deleted because it is no longer eligible.",
            409,
            "JOB_DELETE_NOT_ALLOWED"
          );
        }
      }
    );

    await logJobEvent({
      recruiterId,
      jobId,

      companyId:
        auditDetails.companyId,

      event:
        JOB_EVENTS.JOB_DELETED,

      status:
        "SUCCESS",

      previousStatus:
        auditDetails.previousStatus,

      nextStatus:
        null,

      ipAddress:
        auditContext.ipAddress ??
        null,

      userAgent:
        auditContext.userAgent ??
        null,

      requestId:
        auditContext.requestId ??
        null,

      metadata: {
        deletionType:
          "SOFT_DELETE",

        applicationCount:
          auditDetails
            .applicationCount
      }
    });

    return {
      message:
        "Job deleted successfully."
    };
  } catch (error) {
    try {
      await logJobEvent({
        recruiterId,
        jobId,

        companyId:
          auditDetails.companyId,

        event:
          JOB_EVENTS
            .JOB_DELETE_FAILED,

        status:
          "FAILED",

        previousStatus:
          auditDetails
            .previousStatus,

        nextStatus:
          null,

        ipAddress:
          auditContext.ipAddress ??
          null,

        userAgent:
          auditContext.userAgent ??
          null,

        requestId:
          auditContext.requestId ??
          null,

        metadata: {
          errorCode:
            error.code ??
            "INTERNAL_SERVER_ERROR",

          message:
            error.message,

          applicationCount:
            auditDetails
              .applicationCount
        }
      });
    } catch (
    auditError
    ) {
      console.error(
        "Failed to write job deletion audit event:",
        auditError.message
      );
    }

    throw error;
  }
};

const deleteExistingJob = async ({
  ownerId,
  jobId,
  auditContext = {}
}) => {
  return deleteEligibleDraftJob({
    recruiterId:
      ownerId,

    jobId,

    auditContext
  });
};

export {
  CREATE_DRAFT_ALLOWED_FIELDS,
  DRAFT_EDITABLE_JOB_FIELDS,
  PUBLISHED_EDITABLE_JOB_FIELDS,
  PROTECTED_JOB_FIELDS,
  getUnsupportedJobFields,
  getEditableFieldsForStatus,
  validateSalaryRange,
  validateExperienceRange,
  validateUpdatedDeadline,
  createDraftJob,
  createNewJob,
  getRecruiterJobs,
  getRecruiterJobById,
  updateEligibleJob,
  publishEligibleJob,
  closePublishedJob,
  deleteEligibleDraftJob,

  // Temporary compatibility exports
  getJobById,
  getCompanyJobs,
  getAllJobs,
  updateExistingJob,
  deleteExistingJob
};
export const JOB_STATUSES = Object.freeze({
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
  CLOSED: "CLOSED",
  REMOVED: "REMOVED"
});

export const JOB_STATUS_VALUES = Object.freeze(
  Object.values(JOB_STATUSES)
);

export const JOB_WORK_MODES = Object.freeze({
  ONSITE: "ONSITE",
  REMOTE: "REMOTE",
  HYBRID: "HYBRID"
});

export const JOB_WORK_MODE_VALUES = Object.freeze(
  Object.values(JOB_WORK_MODES)
);

export const JOB_EMPLOYMENT_TYPES =
  Object.freeze({
    FULL_TIME: "FULL_TIME",
    PART_TIME: "PART_TIME",
    INTERNSHIP: "INTERNSHIP",
    CONTRACT: "CONTRACT",
    FREELANCE: "FREELANCE"
  });

export const JOB_EMPLOYMENT_TYPE_VALUES =
  Object.freeze(
    Object.values(
      JOB_EMPLOYMENT_TYPES
    )
  );

export const JOB_EXPERIENCE_LEVELS =
  Object.freeze({
    FRESHER: "FRESHER",
    JUNIOR: "JUNIOR",
    MID: "MID",
    SENIOR: "SENIOR",
    LEAD: "LEAD"
  });

export const JOB_EXPERIENCE_LEVEL_VALUES =
  Object.freeze(
    Object.values(
      JOB_EXPERIENCE_LEVELS
    )
  );

export const JOB_DEFAULTS =
  Object.freeze({
    SALARY_CURRENCY:
      "INR",

    VACANCIES:
      1,

    VIEW_COUNT:
      0,

    APPLICATION_COUNT:
      0
  });

export const JOB_CLOSURE_REASONS =
  Object.freeze({
    RECRUITER_CLOSED:
      "RECRUITER_CLOSED",

    DEADLINE_EXPIRED:
      "DEADLINE_EXPIRED"
  });

export const JOB_CLOSURE_REASON_VALUES =
  Object.freeze(
    Object.values(
      JOB_CLOSURE_REASONS
    )
  );

export const JOB_EVENTS =
  Object.freeze({
    JOB_CREATED:
      "JOB_CREATED",

    JOB_CREATION_FAILED:
      "JOB_CREATION_FAILED",

    JOB_UPDATED:
      "JOB_UPDATED",

    JOB_UPDATE_FAILED:
      "JOB_UPDATE_FAILED",

    JOB_PUBLISHED:
      "JOB_PUBLISHED",

    JOB_PUBLICATION_FAILED:
      "JOB_PUBLICATION_FAILED",

    JOB_CLOSED:
      "JOB_CLOSED",

    JOB_CLOSE_FAILED:
      "JOB_CLOSE_FAILED",

    JOB_DELETED:
      "JOB_DELETED",

    JOB_DELETE_FAILED:
      "JOB_DELETE_FAILED",

    JOB_EXPIRED:
      "JOB_EXPIRED",

    JOB_EXPIRY_FAILED:
      "JOB_EXPIRY_FAILED"
  });

export const JOB_FIELD_LIMITS =
  Object.freeze({
    TITLE_MIN_LENGTH: 3,
    TITLE_MAX_LENGTH: 150,

    SLUG_MAX_LENGTH: 180,

    DESCRIPTION_MAX_LENGTH: 50000,

    RESPONSIBILITIES_MAX_LENGTH:
      30000,

    REQUIREMENTS_MAX_LENGTH: 30000,

    LOCATION_MAX_LENGTH: 255,

    REMOVAL_REASON_MAX_LENGTH: 2000,

    CLOSURE_REASON_MAX_LENGTH: 2000,

    SKILLS_MAX_COUNT: 50,

    SKILL_MAX_LENGTH: 100,

    MAX_EXPERIENCE_YEARS: 60,

    MAX_VACANCIES: 100000
  });

export const RECRUITER_JOB_STATUS_TRANSITIONS =
  Object.freeze({
    [JOB_STATUSES.DRAFT]:
      Object.freeze([
        JOB_STATUSES.PUBLISHED
      ]),

    [JOB_STATUSES.PUBLISHED]:
      Object.freeze([
        JOB_STATUSES.CLOSED
      ]),

    [JOB_STATUSES.CLOSED]:
      Object.freeze([]),

    [JOB_STATUSES.REMOVED]:
      Object.freeze([])
  });

export const MODERATION_JOB_STATUS_TRANSITIONS =
  Object.freeze({
    [JOB_STATUSES.DRAFT]:
      Object.freeze([
        JOB_STATUSES.REMOVED
      ]),

    [JOB_STATUSES.PUBLISHED]:
      Object.freeze([
        JOB_STATUSES.REMOVED
      ]),

    [JOB_STATUSES.CLOSED]:
      Object.freeze([
        JOB_STATUSES.REMOVED
      ]),

    [JOB_STATUSES.REMOVED]:
      Object.freeze([])
  });

export const JOB_STATUS_ERROR_CODES =
  Object.freeze({
    INVALID_STATUS:
      "INVALID_JOB_STATUS",

    INVALID_TRANSITION:
      "INVALID_JOB_STATUS_TRANSITION"
  });
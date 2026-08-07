import {
  DataTypes,
  Model
} from "sequelize";

import {
  sequelize
} from "../config/database.js";

import {
  JOB_STATUSES,
  JOB_STATUS_VALUES,
  JOB_WORK_MODE_VALUES,
  JOB_EMPLOYMENT_TYPE_VALUES,
  JOB_EXPERIENCE_LEVEL_VALUES,
  JOB_DEFAULTS,
  JOB_FIELD_LIMITS
} from "../constants/job.constants.js";

class Job extends Model { }

Job.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue:
        DataTypes.UUIDV4,
      primaryKey: true
    },

    companyId: {
      field: "company_id",
      type: DataTypes.UUID,
      allowNull: false,

      references: {
        model: "companies",
        key: "id"
      },

      onDelete: "RESTRICT",
      onUpdate: "CASCADE"
    },

    createdBy: {
      field: "created_by",
      type: DataTypes.UUID,
      allowNull: false,

      references: {
        model: "users",
        key: "id"
      },

      onDelete: "RESTRICT",
      onUpdate: "CASCADE"
    },



    title: {
      type: DataTypes.STRING(
        JOB_FIELD_LIMITS
          .TITLE_MAX_LENGTH
      ),

      allowNull: true,

      validate: {
        len: {
          args: [
            JOB_FIELD_LIMITS
              .TITLE_MIN_LENGTH,

            JOB_FIELD_LIMITS
              .TITLE_MAX_LENGTH
          ],

          msg:
            "Job title must be between 3 and 150 characters."
        }
      },

      set(value) {
        this.setDataValue(
          "title",
          typeof value === "string"
            ? value.trim()
            : value
        );
      }
    },

    slug: {
      type: DataTypes.STRING(
        JOB_FIELD_LIMITS
          .SLUG_MAX_LENGTH
      ),

      allowNull: true,
      unique: true,

      validate: {
        len: {
          args: [
            1,
            JOB_FIELD_LIMITS
              .SLUG_MAX_LENGTH
          ],

          msg:
            "Job slug must not exceed 180 characters."
        },

        is: {
          args:
            /^[a-z0-9]+(?:-[a-z0-9]+)*$/,

          msg:
            "Job slug must contain lowercase letters, numbers, and hyphens only."
        }
      },

      set(value) {
        this.setDataValue(
          "slug",
          typeof value === "string"
            ? value
              .trim()
              .toLowerCase()
            : value
        );
      }
    },

    description: {
      type: DataTypes.TEXT("long"),
      allowNull: true,

      validate: {
        len: {
          args: [
            0,
            JOB_FIELD_LIMITS
              .DESCRIPTION_MAX_LENGTH
          ],

          msg:
            "Job description must not exceed 50000 characters."
        }
      },

      set(value) {
        this.setDataValue(
          "description",
          typeof value === "string"
            ? value.trim()
            : value
        );
      }
    },

    responsibilities: {
      type: DataTypes.TEXT("long"),
      allowNull: true,

      validate: {
        len: {
          args: [
            0,
            JOB_FIELD_LIMITS
              .RESPONSIBILITIES_MAX_LENGTH
          ],

          msg:
            "Job responsibilities must not exceed 30000 characters."
        }
      },

      set(value) {
        this.setDataValue(
          "responsibilities",
          typeof value === "string"
            ? value.trim()
            : value
        );
      }
    },

    requirements: {
      type: DataTypes.TEXT("long"),
      allowNull: true,

      validate: {
        len: {
          args: [
            0,
            JOB_FIELD_LIMITS
              .REQUIREMENTS_MAX_LENGTH
          ],

          msg:
            "Job requirements must not exceed 30000 characters."
        }
      },

      set(value) {
        this.setDataValue(
          "requirements",
          typeof value === "string"
            ? value.trim()
            : value
        );
      }
    },

    skills: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],

      validate: {
        isValidSkills(value) {
          if (
            value === null ||
            value === undefined
          ) {
            return;
          }

          if (!Array.isArray(value)) {
            throw new Error(
              "Job skills must be an array."
            );
          }

          if (
            value.length >
            JOB_FIELD_LIMITS
              .SKILLS_MAX_COUNT
          ) {
            throw new Error(
              "A job cannot contain more than 50 skills."
            );
          }

          const normalizedSkills =
            value.map((skill) => {
              if (
                typeof skill !==
                "string"
              ) {
                throw new Error(
                  "Every job skill must be a string."
                );
              }

              const normalizedSkill =
                skill.trim();

              if (!normalizedSkill) {
                throw new Error(
                  "Job skills cannot contain empty values."
                );
              }

              if (
                normalizedSkill.length >
                JOB_FIELD_LIMITS
                  .SKILL_MAX_LENGTH
              ) {
                throw new Error(
                  "Each job skill must not exceed 100 characters."
                );
              }

              return normalizedSkill;
            });

          const uniqueSkills =
            new Set(
              normalizedSkills.map(
                (skill) =>
                  skill.toLowerCase()
              )
            );

          if (
            uniqueSkills.size !==
            normalizedSkills.length
          ) {
            throw new Error(
              "Job skills cannot contain duplicate values."
            );
          }
        }
      },

      set(value) {
        if (!Array.isArray(value)) {
          this.setDataValue(
            "skills",
            value
          );

          return;
        }

        const normalizedSkills =
          value.map((skill) =>
            typeof skill === "string"
              ? skill.trim()
              : skill
          );

        this.setDataValue(
          "skills",
          normalizedSkills
        );
      }
    },

    location: {
      type: DataTypes.STRING(
        JOB_FIELD_LIMITS
          .LOCATION_MAX_LENGTH
      ),

      allowNull: true,

      validate: {
        len: {
          args: [
            1,
            JOB_FIELD_LIMITS
              .LOCATION_MAX_LENGTH
          ],

          msg:
            "Job location must not exceed 255 characters."
        }
      },

      set(value) {
        this.setDataValue(
          "location",
          typeof value === "string"
            ? value.trim()
            : value
        );
      }
    },

    workMode: {
      field: "work_mode",

      type: DataTypes.ENUM(
        ...JOB_WORK_MODE_VALUES
      ),

      allowNull: true,

      validate: {
        isIn: {
          args: [
            JOB_WORK_MODE_VALUES
          ],

          msg:
            "Job work mode is invalid."
        }
      }
    },

    employmentType: {
      field: "employment_type",

      type: DataTypes.ENUM(
        ...JOB_EMPLOYMENT_TYPE_VALUES
      ),

      allowNull: true,

      validate: {
        isIn: {
          args: [
            JOB_EMPLOYMENT_TYPE_VALUES
          ],

          msg:
            "Job employment type is invalid."
        }
      }
    },

    experienceLevel: {
      field: "experience_level",

      type: DataTypes.ENUM(
        ...JOB_EXPERIENCE_LEVEL_VALUES
      ),

      allowNull: true,

      validate: {
        isIn: {
          args: [
            JOB_EXPERIENCE_LEVEL_VALUES
          ],

          msg:
            "Job experience level is invalid."
        }
      }
    },

    minimumExperience: {
      field: "minimum_experience",

      type: DataTypes.DECIMAL(
        4,
        1
      ),

      allowNull: true,

      validate: {
        min: {
          args: [0],

          msg:
            "Minimum experience cannot be negative."
        },

        max: {
          args: [
            JOB_FIELD_LIMITS
              .MAX_EXPERIENCE_YEARS
          ],

          msg:
            "Minimum experience cannot exceed 60 years."
        }
      }
    },

    maximumExperience: {
      field: "maximum_experience",

      type: DataTypes.DECIMAL(
        4,
        1
      ),

      allowNull: true,

      validate: {
        min: {
          args: [0],

          msg:
            "Maximum experience cannot be negative."
        },

        max: {
          args: [
            JOB_FIELD_LIMITS
              .MAX_EXPERIENCE_YEARS
          ],

          msg:
            "Maximum experience cannot exceed 60 years."
        }
      }
    },

    minimumSalary: {
      field: "minimum_salary",

      type: DataTypes.DECIMAL(
        15,
        2
      ),

      allowNull: true,

      validate: {
        min: {
          args: [0],

          msg:
            "Minimum salary cannot be negative."
        }
      }
    },

    maximumSalary: {
      field: "maximum_salary",

      type: DataTypes.DECIMAL(
        15,
        2
      ),

      allowNull: true,

      validate: {
        min: {
          args: [0],

          msg:
            "Maximum salary cannot be negative."
        }
      }
    },

    salaryCurrency: {
      field: "salary_currency",

      type: DataTypes.STRING(3),

      allowNull: false,

      defaultValue:
        JOB_DEFAULTS
          .SALARY_CURRENCY,

      validate: {
        is: {
          args: /^[A-Z]{3}$/,

          msg:
            "Salary currency must be a valid three-letter uppercase code."
        }
      },

      set(value) {
        this.setDataValue(
          "salaryCurrency",
          typeof value === "string"
            ? value
              .trim()
              .toUpperCase()
            : value
        );
      }
    },

    vacancies: {
      type:
        DataTypes.INTEGER.UNSIGNED,

      allowNull: false,

      defaultValue:
        JOB_DEFAULTS.VACANCIES,

      validate: {
        min: {
          args: [1],

          msg:
            "Vacancies must be at least 1."
        },

        max: {
          args: [
            JOB_FIELD_LIMITS
              .MAX_VACANCIES
          ],

          msg:
            "Vacancies cannot exceed 100000."
        }
      }
    },

    applicationDeadline: {
      field:
        "application_deadline",

      type: DataTypes.DATE,

      allowNull: true,

      validate: {
        isDate: {
          msg:
            "Application deadline must be a valid date."
        }
      }
    },

    status: {
      type: DataTypes.ENUM(
        ...JOB_STATUS_VALUES
      ),

      allowNull: false,

      defaultValue:
        JOB_STATUSES.DRAFT,

      validate: {
        isIn: {
          args: [
            JOB_STATUS_VALUES
          ],

          msg:
            "Job status is invalid."
        }
      }
    },

    publishedAt: {
      field: "published_at",
      type: DataTypes.DATE,
      allowNull: true
    },

    closedAt: {
      field: "closed_at",
      type: DataTypes.DATE,
      allowNull: true
    },

    removedAt: {
      field: "removed_at",
      type: DataTypes.DATE,
      allowNull: true
    },

    previousStatus: { field: "previous_status", type: DataTypes.ENUM("DRAFT", "PUBLISHED", "CLOSED"), allowNull: true },
    removedBy: { field: "removed_by", type: DataTypes.UUID, allowNull: true },
    restoredBy: { field: "restored_by", type: DataTypes.UUID, allowNull: true },
    restoredAt: { field: "restored_at", type: DataTypes.DATE, allowNull: true },

    removalReason: {
      field: "removal_reason",
      type: DataTypes.TEXT,
      allowNull: true,

      validate: {
        len: {
          args: [
            0,
            JOB_FIELD_LIMITS
              .REMOVAL_REASON_MAX_LENGTH
          ],

          msg:
            "Removal reason must not exceed 2000 characters."
        }
      }
    },

    closureReason: {
      field: "closure_reason",
      type: DataTypes.TEXT,
      allowNull: true,

      validate: {
        len: {
          args: [
            0,
            JOB_FIELD_LIMITS
              .CLOSURE_REASON_MAX_LENGTH
          ],

          msg:
            "Closure reason must not exceed 2000 characters."
        }
      }
    },

    deletedAt: {
      field: "deleted_at",
      type: DataTypes.DATE,
      allowNull: true
    },

    viewCount: {
      field: "view_count",

      type:
        DataTypes.INTEGER.UNSIGNED,

      allowNull: false,

      defaultValue:
        JOB_DEFAULTS.VIEW_COUNT,

      validate: {
        min: {
          args: [0],

          msg:
            "View count cannot be negative."
        }
      }
    },

    applicationCount: {
      field: "application_count",

      type:
        DataTypes.INTEGER.UNSIGNED,

      allowNull: false,

      defaultValue:
        JOB_DEFAULTS
          .APPLICATION_COUNT,

      validate: {
        min: {
          args: [0],

          msg:
            "Application count cannot be negative."
        }
      }
    },
  },
  {
    sequelize,

    modelName: "Job",

    tableName: "jobs",

    timestamps: true,

    paranoid: true,

    createdAt: "created_at",

    updatedAt: "updated_at",

    deletedAt: "deleted_at",

    freezeTableName: true,

    indexes: [
      {
        name:
          "idx_jobs_company_id",

        fields: [
          "company_id"
        ]
      },

      {
        name:
          "idx_jobs_created_by",

        fields: [
          "created_by"
        ]
      },

      {
        name:
          "uq_jobs_slug",

        unique: true,

        fields: [
          "slug"
        ]
      },

      {
        name:
          "idx_jobs_status",

        fields: [
          "status"
        ]
      },

      {
        name:
          "idx_jobs_location",

        fields: [
          "location"
        ]
      },

      {
        name:
          "idx_jobs_work_mode",

        fields: [
          "work_mode"
        ]
      },

      {
        name:
          "idx_jobs_employment_type",

        fields: [
          "employment_type"
        ]
      },

      {
        name:
          "idx_jobs_experience_level",

        fields: [
          "experience_level"
        ]
      },

      {
        name:
          "idx_jobs_application_deadline",

        fields: [
          "application_deadline"
        ]
      },

      {
        name:
          "idx_jobs_published_at",

        fields: [
          "published_at"
        ]
      },

      {
        name:
          "idx_jobs_company_status",

        fields: [
          "company_id",
          "status"
        ]
      }
    ],

    validate: {
      salaryRangeIsValid() {
        if (
          this.minimumSalary ===
          null ||
          this.minimumSalary ===
          undefined ||
          this.maximumSalary ===
          null ||
          this.maximumSalary ===
          undefined
        ) {
          return;
        }

        if (
          Number(
            this.minimumSalary
          ) >
          Number(
            this.maximumSalary
          )
        ) {
          throw new Error(
            "Minimum salary cannot exceed maximum salary."
          );
        }
      },

      experienceRangeIsValid() {
        if (
          this.minimumExperience ===
          null ||
          this.minimumExperience ===
          undefined ||
          this.maximumExperience ===
          null ||
          this.maximumExperience ===
          undefined
        ) {
          return;
        }

        if (
          Number(
            this.minimumExperience
          ) >
          Number(
            this.maximumExperience
          )
        ) {
          throw new Error(
            "Minimum experience cannot exceed maximum experience."
          );
        }
      },

      lifecycleFieldsAreConsistent() {
        if (
          this.status ===
          JOB_STATUSES.DRAFT &&
          (
            this.publishedAt ||
            this.closedAt ||
            this.removedAt
          )
        ) {
          throw new Error(
            "A draft job cannot contain publication, closure, or removal timestamps."
          );
        }

        if (
          this.status ===
          JOB_STATUSES.PUBLISHED &&
          !this.publishedAt
        ) {
          throw new Error(
            "A published job must contain a publication timestamp."
          );
        }

        if (
          this.status ===
          JOB_STATUSES.CLOSED &&
          !this.closedAt
        ) {
          throw new Error(
            "A closed job must contain a closure timestamp."
          );
        }

        if (
          this.status ===
          JOB_STATUSES.REMOVED &&
          !this.removedAt
        ) {
          throw new Error(
            "A removed job must contain a removal timestamp."
          );
        }
      }
    }
  }
);

export default Job;
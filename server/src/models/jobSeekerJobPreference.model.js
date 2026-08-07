import { DataTypes, Model } from "sequelize";

import { sequelize } from "../config/database.js";

class JobSeekerJobPreference extends Model {}

JobSeekerJobPreference.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },

    jobSeekerProfileId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      field: "job_seeker_profile_id"
    },

    preferredJobRoles: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      field: "preferred_job_roles"
    },

    preferredLocations: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      field: "preferred_locations"
    },

    employmentTypes: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      field: "employment_types"
    },

    workModes: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      field: "work_modes"
    },

    expectedSalary: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      field: "expected_salary"
    },

    salaryCurrency: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: "INR",
      field: "salary_currency"
    },

    noticePeriodDays: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "notice_period_days"
    },

    willingToRelocate: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "willing_to_relocate"
    },

    availabilityStatus: {
      type: DataTypes.ENUM(
        "IMMEDIATELY_AVAILABLE",
        "OPEN_TO_OPPORTUNITIES",
        "SERVING_NOTICE_PERIOD",
        "NOT_LOOKING"
      ),
      allowNull: false,
      defaultValue: "OPEN_TO_OPPORTUNITIES",
      field: "availability_status"
    }
  },
  {
    sequelize,
    modelName: "JobSeekerJobPreference",
    tableName: "job_seeker_job_preferences",
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        unique: true,
        fields: ["job_seeker_profile_id"]
      },
      {
        fields: ["availability_status"]
      }
    ]
  }
);

export default JobSeekerJobPreference;
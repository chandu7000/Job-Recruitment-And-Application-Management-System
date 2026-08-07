import { DataTypes, Model } from "sequelize";

import { sequelize } from "../config/database.js";

class JobSeekerExperience extends Model {}

JobSeekerExperience.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true
    },

    jobSeekerProfileId: {
      field: "job_seeker_profile_id",
      type: DataTypes.UUID,
      allowNull: false
    },

    company: {
      type: DataTypes.STRING(200),
      allowNull: false
    },

    role: {
      type: DataTypes.STRING(150),
      allowNull: false
    },

    employmentType: {
      field: "employment_type",
      type: DataTypes.ENUM(
        "FULL_TIME",
        "PART_TIME",
        "CONTRACT",
        "INTERNSHIP",
        "FREELANCE",
        "TEMPORARY"
      ),
      allowNull: false
    },

    location: {
      type: DataTypes.STRING(150),
      allowNull: true
    },

    startDate: {
      field: "start_date",
      type: DataTypes.DATEONLY,
      allowNull: false
    },

    endDate: {
      field: "end_date",
      type: DataTypes.DATEONLY,
      allowNull: true
    },

    isCurrent: {
      field: "is_current",
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: "JobSeekerExperience",
    tableName: "job_seeker_experiences",
    timestamps: true,
    underscored: true,
    freezeTableName: true,

    indexes: [
      {
        name: "idx_job_seeker_experiences_profile_id",
        fields: ["job_seeker_profile_id"]
      },
      {
        name: "idx_job_seeker_experiences_company",
        fields: ["company"]
      },
      {
        name: "idx_job_seeker_experiences_employment_type",
        fields: ["employment_type"]
      },
      {
        name: "idx_job_seeker_experiences_dates",
        fields: [
          "start_date",
          "end_date"
        ]
      }
    ]
  }
);

export default JobSeekerExperience;
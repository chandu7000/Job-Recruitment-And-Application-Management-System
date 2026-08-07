import { DataTypes, Model } from "sequelize";

import { sequelize } from "../config/database.js";

class JobSeekerEducation extends Model {}

JobSeekerEducation.init(
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

    institution: {
      type: DataTypes.STRING(200),
      allowNull: false
    },

    degree: {
      type: DataTypes.STRING(150),
      allowNull: false
    },

    fieldOfStudy: {
      field: "field_of_study",
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

    grade: {
      type: DataTypes.STRING(50),
      allowNull: true
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: "JobSeekerEducation",
    tableName: "job_seeker_educations",
    timestamps: true,
    underscored: true,
    freezeTableName: true,

    indexes: [
      {
        name: "idx_job_seeker_educations_profile_id",
        fields: ["job_seeker_profile_id"]
      },
      {
        name: "idx_job_seeker_educations_institution",
        fields: ["institution"]
      },
      {
        name: "idx_job_seeker_educations_dates",
        fields: [
          "start_date",
          "end_date"
        ]
      }
    ]
  }
);

export default JobSeekerEducation;
import { DataTypes, Model } from "sequelize";

import { sequelize } from "../config/database.js";

class JobSeekerProject extends Model {}

JobSeekerProject.init(
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

    title: {
      type: DataTypes.STRING(200),
      allowNull: false
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },

    technologies: {
      type: DataTypes.JSON,
      allowNull: true
    },

    projectUrl: {
      field: "project_url",
      type: DataTypes.STRING(500),
      allowNull: true
    },

    repositoryUrl: {
      field: "repository_url",
      type: DataTypes.STRING(500),
      allowNull: true
    },

    startDate: {
      field: "start_date",
      type: DataTypes.DATEONLY,
      allowNull: true
    },

    endDate: {
      field: "end_date",
      type: DataTypes.DATEONLY,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: "JobSeekerProject",
    tableName: "job_seeker_projects",
    timestamps: true,
    underscored: true,
    freezeTableName: true,

    indexes: [
      {
        name: "idx_job_seeker_projects_profile_id",
        fields: ["job_seeker_profile_id"]
      },
      {
        name: "idx_job_seeker_projects_title",
        fields: ["title"]
      },
      {
        name: "idx_job_seeker_projects_dates",
        fields: [
          "start_date",
          "end_date"
        ]
      }
    ]
  }
);

export default JobSeekerProject;
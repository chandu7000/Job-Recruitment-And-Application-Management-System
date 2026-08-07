import { DataTypes, Model } from "sequelize";

import { sequelize } from "../config/database.js";

class JobSeekerCertification extends Model {}

JobSeekerCertification.init(
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

    name: {
      type: DataTypes.STRING(200),
      allowNull: false
    },

    issuingOrganization: {
      field: "issuing_organization",
      type: DataTypes.STRING(200),
      allowNull: false
    },

    credentialId: {
      field: "credential_id",
      type: DataTypes.STRING(200),
      allowNull: true
    },

    credentialUrl: {
      field: "credential_url",
      type: DataTypes.STRING(500),
      allowNull: true
    },

    issueDate: {
      field: "issue_date",
      type: DataTypes.DATEONLY,
      allowNull: false
    },

    expiryDate: {
      field: "expiry_date",
      type: DataTypes.DATEONLY,
      allowNull: true
    },

    doesNotExpire: {
      field: "does_not_expire",
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  },
  {
    sequelize,
    modelName: "JobSeekerCertification",
    tableName: "job_seeker_certifications",
    timestamps: true,
    underscored: true,
    freezeTableName: true,

    indexes: [
      {
        name: "idx_job_seeker_certifications_profile_id",
        fields: ["job_seeker_profile_id"]
      },
      {
        name: "idx_job_seeker_certifications_name",
        fields: ["name"]
      },
      {
        name:
          "idx_job_seeker_certifications_issuing_organization",
        fields: ["issuing_organization"]
      },
      {
        name: "idx_job_seeker_certifications_dates",
        fields: ["issue_date", "expiry_date"]
      }
    ]
  }
);

export default JobSeekerCertification;
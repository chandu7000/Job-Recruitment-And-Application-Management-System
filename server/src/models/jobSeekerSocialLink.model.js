import { DataTypes, Model } from "sequelize";

import { sequelize } from "../config/database.js";

class JobSeekerSocialLink extends Model {}

JobSeekerSocialLink.init(
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

    platform: {
      type: DataTypes.ENUM(
        "LINKEDIN",
        "GITHUB",
        "PORTFOLIO",
        "LEETCODE",
        "HACKERRANK",
        "STACK_OVERFLOW",
        "PERSONAL_WEBSITE",
        "OTHER"
      ),
      allowNull: false
    },

    url: {
      type: DataTypes.STRING(500),
      allowNull: false
    },

    displayName: {
      field: "display_name",
      type: DataTypes.STRING(150),
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: "JobSeekerSocialLink",
    tableName: "job_seeker_social_links",
    timestamps: true,
    underscored: true,
    freezeTableName: true,

    indexes: [
      {
        name:
          "idx_job_seeker_social_links_profile_id",
        fields: ["job_seeker_profile_id"]
      },
      {
        name:
          "idx_job_seeker_social_links_platform",
        fields: ["platform"]
      },
      {
        name:
          "uq_job_seeker_social_links_profile_platform",
        unique: true,
        fields: [
          "job_seeker_profile_id",
          "platform"
        ]
      }
    ]
  }
);

export default JobSeekerSocialLink;
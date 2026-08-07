import { DataTypes, Model } from "sequelize";

import { sequelize } from "../config/database.js";

class JobSeekerSkill extends Model {}

JobSeekerSkill.init(
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

    skillName: {
      field: "skill_name",
      type: DataTypes.STRING(100),
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: "JobSeekerSkill",
    tableName: "job_seeker_skills",
    timestamps: true,
    underscored: true,
    freezeTableName: true,

    indexes: [
      {
        name: "idx_job_seeker_skills_profile_id",
        fields: ["job_seeker_profile_id"]
      },
      {
        name: "idx_job_seeker_skills_skill_name",
        fields: ["skill_name"]
      },
      {
        name: "idx_job_seeker_skills_unique_profile_skill",
        unique: true,
        fields: [
          "job_seeker_profile_id",
          "skill_name"
        ]
      }
    ]
  }
);

export default JobSeekerSkill;
import { DataTypes, Model } from "sequelize";

import { sequelize } from "../config/database.js";

class JobSeekerProfile extends Model { }

JobSeekerProfile.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true
    },

    userId: {
      field: "user_id",
      type: DataTypes.UUID,
      allowNull: false,
      unique: true
    },

    firstName: {
      field: "first_name",
      type: DataTypes.STRING(100),
      allowNull: true
    },

    lastName: {
      field: "last_name",
      type: DataTypes.STRING(100),
      allowNull: true
    },

    phoneNumber: {
      field: "phone_number",
      type: DataTypes.STRING(30),
      allowNull: true
    },

    location: {
      type: DataTypes.STRING(255),
      allowNull: true
    },

    addressLine1: {
      field: "address_line_1",
      type: DataTypes.STRING(255),
      allowNull: true
    },

    addressLine2: {
      field: "address_line_2",
      type: DataTypes.STRING(255),
      allowNull: true
    },

    city: {
      type: DataTypes.STRING(100),
      allowNull: true
    },

    state: {
      type: DataTypes.STRING(100),
      allowNull: true
    },

    country: {
      type: DataTypes.STRING(100),
      allowNull: true
    },

    postalCode: {
      field: "postal_code",
      type: DataTypes.STRING(20),
      allowNull: true
    },

    headline: {
      type: DataTypes.STRING(255),
      allowNull: true
    },

    biography: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    profileImageUrl: {
      field: "profile_image_url",
      type: DataTypes.STRING(2048),
      allowNull: true
    },

    profileImagePublicId: {
      field: "profile_image_public_id",
      type: DataTypes.STRING(500),
      allowNull: true
    },

    resumeUrl: {
      field: "resume_url",
      type: DataTypes.STRING(2048),
      allowNull: true
    },

    resumePublicId: {
      field: "resume_public_id",
      type: DataTypes.STRING(500),
      allowNull: true
    },

    resumeOriginalName: {
      field: "resume_original_name",
      type: DataTypes.STRING(255),
      allowNull: true
    },
  },
  {
    sequelize,
    modelName: "JobSeekerProfile",
    tableName: "job_seeker_profiles",
    timestamps: true,
    underscored: true,
    freezeTableName: true
  }
);

export default JobSeekerProfile;
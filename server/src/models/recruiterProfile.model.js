import { DataTypes } from "sequelize";

import { sequelize } from "../config/database.js";

const RecruiterProfile = sequelize.define(
  "RecruiterProfile",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      field: "user_id",
      references: {
        model: "users",
        key: "id"
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE"
    },

    firstName: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: "first_name",
      validate: {
        len: {
          args: [1, 100],
          msg: "First name must contain between 1 and 100 characters"
        }
      }
    },

    lastName: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: "last_name",
      validate: {
        len: {
          args: [1, 100],
          msg: "Last name must contain between 1 and 100 characters"
        }
      }
    },

    designation: {
      type: DataTypes.STRING(150),
      allowNull: true,
      validate: {
        len: {
          args: [1, 150],
          msg: "Designation must contain between 1 and 150 characters"
        }
      }
    },

    phoneNumber: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: "phone_number",
      validate: {
        len: {
          args: [7, 20],
          msg: "Phone number must contain between 7 and 20 characters"
        },

        is: {
          args: /^\+?[0-9\s()-]{7,20}$/,
          msg: "Phone number format is invalid"
        }
      }
    },

    biography: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 2000],
          msg: "Biography cannot exceed 2000 characters"
        }
      }
    },

    linkedinUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: "linkedin_url",
      validate: {
        isUrl: {
          msg: "LinkedIn URL must be a valid URL"
        },

        isLinkedInUrl(value) {
          if (!value) {
            return;
          }

          let parsedUrl;

          try {
            parsedUrl = new URL(value);
          } catch {
            throw new Error("LinkedIn URL must be a valid URL");
          }

          const hostname = parsedUrl.hostname
            .toLowerCase()
            .replace(/^www\./, "");

          if (
            hostname !== "linkedin.com" &&
            !hostname.endsWith(".linkedin.com")
          ) {
            throw new Error(
              "LinkedIn URL must belong to linkedin.com"
            );
          }
        }
      }
    }
  },
  {
    tableName: "recruiter_profiles",

    timestamps: true,

    createdAt: "created_at",

    updatedAt: "updated_at",

    indexes: [
      {
        name: "uq_recruiter_profiles_user_id",
        unique: true,
        fields: ["user_id"]
      },

      {
        name: "idx_recruiter_profiles_phone_number",
        fields: ["phone_number"]
      }
    ]
  }
);

export default RecruiterProfile;
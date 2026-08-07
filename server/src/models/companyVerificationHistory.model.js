import {
  DataTypes
} from "sequelize";

import {
  sequelize
} from "../config/database.js";

import {
  COMPANY_STATUS_VALUES
} from "../constants/company.constants.js";

import Company from "./company.model.js";
import User from "./user.model.js";

const CompanyVerificationHistory =
  sequelize.define(
    "CompanyVerificationHistory",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
      },

      companyId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "company_id",

        references: {
          model: Company,
          key: "id"
        },

        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      },

      oldStatus: {
        type: DataTypes.ENUM(
          ...COMPANY_STATUS_VALUES
        ),
        allowNull: false,
        field: "old_status"
      },

      newStatus: {
        type: DataTypes.ENUM(
          ...COMPANY_STATUS_VALUES
        ),
        allowNull: false,
        field: "new_status"
      },

      reason: {
        type: DataTypes.TEXT,
        allowNull: true,

        validate: {
          len: {
            args: [0, 2000],
            msg:
              "Verification history reason must not exceed 2000 characters."
          }
        }
      },

      performedBy: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "performed_by",

        references: {
          model: User,
          key: "id"
        },

        onDelete: "RESTRICT",
        onUpdate: "CASCADE"
      }
    },
    {
      tableName:
        "company_verification_history",

      timestamps: true,

      createdAt: "created_at",

      updatedAt: false,

      indexes: [
        {
          name:
            "idx_company_verification_history_company_id",
          fields: ["company_id"]
        },

        {
          name:
            "idx_company_verification_history_performed_by",
          fields: ["performed_by"]
        },

        {
          name:
            "idx_company_verification_history_created_at",
          fields: ["created_at"]
        }
      ]
    }
  );

export default CompanyVerificationHistory;
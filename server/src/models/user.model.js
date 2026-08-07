import { DataTypes, Model } from "sequelize";
import bcrypt from "bcrypt";

import { sequelize } from "../config/database.js";

import {
  USER_ROLES,
  ACCOUNT_STATUS
} from "../constants/app.constants.js";

class User extends Model {
  async comparePassword(password) {
    return bcrypt.compare(
      password,
      this.passwordHash
    );
  }

  isLocked() {
    return Boolean(
      this.lockedUntil &&
      this.lockedUntil > new Date()
    );
  }

  toJSON() {
    const values = {
      ...this.get()
    };

    delete values.passwordHash;
    delete values.passwordResetToken;
    delete values.passwordResetExpiresAt;
    delete values.emailVerificationToken;
    delete values.emailVerificationExpiresAt;
    delete values.pendingEmail;
    delete values.emailChangeToken;
    delete values.emailChangeExpiresAt;

    return values;
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },

    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true
      },
      set(value) {
        this.setDataValue(
          "email",
          value?.trim().toLowerCase()
        );
      }
    },

    passwordHash: {
      field: "password_hash",
      type: DataTypes.STRING(255),
      allowNull: false
    },

    role: {
      type: DataTypes.ENUM(
        ...Object.values(USER_ROLES)
      ),
      allowNull: false,
      defaultValue: USER_ROLES.JOB_SEEKER
    },

    status: {
      type: DataTypes.ENUM(
        ...Object.values(ACCOUNT_STATUS)
      ),
      allowNull: false,
      defaultValue:
        ACCOUNT_STATUS.PENDING_VERIFICATION
    },

    emailVerifiedAt: {
      field: "email_verified_at",
      type: DataTypes.DATE,
      allowNull: true
    },

    failedLoginAttempts: {
      field: "failed_login_attempts",
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },

    lockedUntil: {
      field: "locked_until",
      type: DataTypes.DATE,
      allowNull: true
    },

    lastLoginAt: {
      field: "last_login_at",
      type: DataTypes.DATE,
      allowNull: true
    },

    passwordChangedAt: {
      field: "password_changed_at",
      type: DataTypes.DATE,
      allowNull: true
    },

    passwordResetToken: {
      field: "password_reset_token",
      type: DataTypes.STRING(255),
      allowNull: true
    },

    passwordResetExpiresAt: {
      field: "password_reset_expires_at",
      type: DataTypes.DATE,
      allowNull: true
    },

    emailVerificationToken: {
      field: "email_verification_token",
      type: DataTypes.STRING(255),
      allowNull: true
    },

    emailVerificationExpiresAt: {
      field: "email_verification_expires_at",
      type: DataTypes.DATE,
      allowNull: true
    },
    pendingEmail: {
      field: "pending_email",
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isEmail: true
      },
      set(value) {
        this.setDataValue(
          "pendingEmail",
          value
            ? value.trim().toLowerCase()
            : null
        );
      }
    },

    emailChangeToken: {
      field: "email_change_token",
      type: DataTypes.STRING(255),
      allowNull: true
    },

    emailChangeExpiresAt: {
      field: "email_change_expires_at",
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: true,
    underscored: true,
    freezeTableName: true,

    defaultScope: {
      attributes: {
        exclude: [
          "passwordHash",
          "passwordResetToken",
          "passwordResetExpiresAt",
          "emailVerificationToken",
          "emailVerificationExpiresAt",
          "pendingEmail",
          "emailChangeToken",
          "emailChangeExpiresAt"
        ]
      }
    },

    scopes: {
      withPassword: {
        attributes: {
          include: [
            "passwordHash"
          ]
        }
      },

      withAuthenticationFields: {
        attributes: {
          include: [
            "passwordHash",
            "passwordResetToken",
            "passwordResetExpiresAt",
            "emailVerificationToken",
            "emailVerificationExpiresAt",
            "pendingEmail",
            "emailChangeToken",
            "emailChangeExpiresAt"
          ]
        }
      }
    }
  }
);

export default User;
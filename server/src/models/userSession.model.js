import { DataTypes, Model } from "sequelize";

import { sequelize } from "../config/database.js";

class UserSession extends Model {
  isExpired() {
    return this.expiresAt < new Date();
  }

  isRevoked() {
    return Boolean(this.revokedAt);
  }

  isActive() {
    return !this.isExpired() && !this.isRevoked();
  }
}

UserSession.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },

    userId: {
      field: "user_id",
      type: DataTypes.UUID,
      allowNull: false
    },

    refreshTokenHash: {
      field: "refresh_token_hash",
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },

    userAgent: {
      field: "user_agent",
      type: DataTypes.TEXT,
      allowNull: true
    },

    ipAddress: {
      field: "ip_address",
      type: DataTypes.STRING(45),
      allowNull: true
    },

    expiresAt: {
      field: "expires_at",
      type: DataTypes.DATE,
      allowNull: false
    },

    revokedAt: {
      field: "revoked_at",
      type: DataTypes.DATE,
      allowNull: true
    },

    revocationReason: {
      field: "revocation_reason",
      type: DataTypes.STRING(100),
      allowNull: true
    },

    lastUsedAt: {
      field: "last_used_at",
      type: DataTypes.DATE,
      allowNull: true
    },

    deviceName: {
      field: "device_name",
      type: DataTypes.STRING(100),
      allowNull: true
    },

    browser: {
      field: "browser",
      type: DataTypes.STRING(100),
      allowNull: true
    },

    operatingSystem: {
      field: "operating_system",
      type: DataTypes.STRING(100),
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: "UserSession",
    tableName: "user_sessions",
    timestamps: true,
    underscored: true,
    freezeTableName: true,

    defaultScope: {
      attributes: {
        exclude: ["refreshTokenHash"]
      }
    },

    scopes: {
      withRefreshTokenHash: {
        attributes: {
          include: ["refreshTokenHash"]
        }
      }
    }
  }
);

export default UserSession;
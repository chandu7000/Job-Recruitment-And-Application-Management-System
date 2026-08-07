import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database.js";
import User from "./user.model.js";

class RefreshToken extends Model {}

RefreshToken.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },

    userId: {
      field: "user_id",
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id"
      }
    },

    token: {
      type: DataTypes.STRING(512),
      allowNull: false,
      unique: true
    },

    expiresAt: {
      field: "expires_at",
      type: DataTypes.DATE,
      allowNull: false
    },

    revoked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  },
  {
    sequelize,
    modelName: "RefreshToken",
    tableName: "refresh_tokens",
    timestamps: true,
    underscored: true,
    freezeTableName: true
  }
);

User.hasMany(RefreshToken, {
  foreignKey: "user_id",
  as: "refreshTokens"
});

RefreshToken.belongsTo(User, {
  foreignKey: "user_id",
  as: "user"
});

export default RefreshToken;
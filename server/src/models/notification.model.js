import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database.js";
import {
  NOTIFICATION_LIMITS,
  NOTIFICATION_RESOURCE_TYPE_VALUES,
  NOTIFICATION_TYPE_VALUES
} from "../constants/notification.constants.js";

class Notification extends Model {}

Notification.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  recipientId: { field: "recipient_id", type: DataTypes.UUID, allowNull: false },
  type: { type: DataTypes.STRING(80), allowNull: false, validate: { isIn: [NOTIFICATION_TYPE_VALUES] } },
  title: { type: DataTypes.STRING(NOTIFICATION_LIMITS.TITLE), allowNull: false },
  message: { type: DataTypes.STRING(NOTIFICATION_LIMITS.MESSAGE), allowNull: false },
  resourceType: {
    field: "resource_type",
    type: DataTypes.STRING(40),
    allowNull: true,
    validate: { isIn: [NOTIFICATION_RESOURCE_TYPE_VALUES] }
  },
  resourceId: { field: "resource_id", type: DataTypes.UUID, allowNull: true },
  metadata: { type: DataTypes.JSON, allowNull: true },
  deduplicationKey: {
    field: "deduplication_key",
    type: DataTypes.STRING(NOTIFICATION_LIMITS.DEDUPLICATION_KEY),
    allowNull: true,
    unique: true
  },
  isRead: { field: "is_read", type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  readAt: { field: "read_at", type: DataTypes.DATE, allowNull: true }
}, {
  sequelize,
  modelName: "Notification",
  tableName: "notifications",
  timestamps: true,
  underscored: true,
  freezeTableName: true
});

export default Notification;

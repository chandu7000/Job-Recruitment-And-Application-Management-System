import { DataTypes, Model } from "sequelize";

import { sequelize } from "../config/database.js";
import {
  INTERVIEW_STATUS_VALUES
} from "../constants/interview.constants.js";

class InterviewHistory extends Model {}

InterviewHistory.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },

    interviewId: {
      field: "interview_id",
      type: DataTypes.UUID,
      allowNull: false
    },

    previousStatus: {
      field: "previous_status",
      type: DataTypes.ENUM(
        ...INTERVIEW_STATUS_VALUES
      ),
      allowNull: true
    },

    newStatus: {
      field: "new_status",
      type: DataTypes.ENUM(
        ...INTERVIEW_STATUS_VALUES
      ),
      allowNull: false
    },

    previousSchedule: {
      field: "previous_schedule",
      type: DataTypes.JSON,
      allowNull: true
    },

    newSchedule: {
      field: "new_schedule",
      type: DataTypes.JSON,
      allowNull: true
    },

    previousMeetingInfo: {
      field: "previous_meeting_info",
      type: DataTypes.JSON,
      allowNull: true
    },

    newMeetingInfo: {
      field: "new_meeting_info",
      type: DataTypes.JSON,
      allowNull: true
    },

    changedBy: {
      field: "changed_by",
      type: DataTypes.UUID,
      allowNull: false
    },

    reason: {
      type: DataTypes.STRING(1000),
      allowNull: true
    },

    event: {
      type: DataTypes.STRING(100),
      allowNull: false
    },

    createdAt: {
      field: "created_at",
      type: DataTypes.DATE(6),
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: "InterviewHistory",
    tableName: "interview_history",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: false,
    underscored: true,
    freezeTableName: true
  }
);

export default InterviewHistory;
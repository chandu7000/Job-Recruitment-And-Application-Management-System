import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database.js";
import { INTERVIEW_STATUS_VALUES, INTERVIEW_STATUSES, MEETING_TYPE_VALUES, INTERVIEW_LIMITS } from "../constants/interview.constants.js";
class Interview extends Model {}
Interview.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  applicationId: { field: "application_id", type: DataTypes.UUID, allowNull: false }, candidateId: { field: "candidate_id", type: DataTypes.UUID, allowNull: false },
  recruiterId: { field: "recruiter_id", type: DataTypes.UUID, allowNull: false }, jobId: { field: "job_id", type: DataTypes.UUID, allowNull: false }, companyId: { field: "company_id", type: DataTypes.UUID, allowNull: false },
  scheduledStartAt: { field: "scheduled_start_at", type: DataTypes.DATE, allowNull: false }, scheduledEndAt: { field: "scheduled_end_at", type: DataTypes.DATE, allowNull: false },
  timezone: { type: DataTypes.STRING(100), allowNull: false }, meetingType: { field: "meeting_type", type: DataTypes.ENUM(...MEETING_TYPE_VALUES), allowNull: false },
  meetingLink: { field: "meeting_link", type: DataTypes.STRING(2048), allowNull: true }, physicalLocation: { field: "physical_location", type: DataTypes.STRING(INTERVIEW_LIMITS.LOCATION), allowNull: true },
  phoneInstructions: { field: "phone_instructions", type: DataTypes.STRING(INTERVIEW_LIMITS.PHONE_INSTRUCTIONS), allowNull: true }, interviewInstructions: { field: "interview_instructions", type: DataTypes.TEXT, allowNull: true },
  status: { type: DataTypes.ENUM(...INTERVIEW_STATUS_VALUES), allowNull: false, defaultValue: INTERVIEW_STATUSES.SCHEDULED }, cancellationReason: { field: "cancellation_reason", type: DataTypes.STRING(INTERVIEW_LIMITS.REASON), allowNull: true },
  cancelledAt: { field: "cancelled_at", type: DataTypes.DATE, allowNull: true }, declineReason: { field: "decline_reason", type: DataTypes.STRING(INTERVIEW_LIMITS.REASON), allowNull: true }, declinedAt: { field: "declined_at", type: DataTypes.DATE, allowNull: true },
  confirmedAt: { field: "confirmed_at", type: DataTypes.DATE, allowNull: true }, feedback: { type: DataTypes.TEXT, allowNull: true }, rating: { type: DataTypes.INTEGER, allowNull: true, validate: { min: 1, max: 5 } },
  strengths: { type: DataTypes.TEXT, allowNull: true }, concerns: { type: DataTypes.TEXT, allowNull: true }, recommendation: { type: DataTypes.STRING(INTERVIEW_LIMITS.RECOMMENDATION), allowNull: true },
  feedbackVisibleToCandidate: { field: "feedback_visible_to_candidate", type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }, completedAt: { field: "completed_at", type: DataTypes.DATE, allowNull: true }
}, { sequelize, modelName: "Interview", tableName: "interviews", timestamps: true, underscored: true, freezeTableName: true });
export default Interview;

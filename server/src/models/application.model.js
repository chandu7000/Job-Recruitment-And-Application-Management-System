import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database.js";
import { APPLICATION_STATUSES, APPLICATION_STATUS_VALUES, APPLICATION_LIMITS } from "../constants/application.constants.js";
class Application extends Model {}
Application.init({
 id:{type:DataTypes.UUID,defaultValue:DataTypes.UUIDV4,primaryKey:true}, candidateId:{field:"candidate_id",type:DataTypes.UUID,allowNull:false},
 jobId:{field:"job_id",type:DataTypes.UUID,allowNull:false}, companyId:{field:"company_id",type:DataTypes.UUID,allowNull:false},
 status:{type:DataTypes.ENUM(...APPLICATION_STATUS_VALUES),allowNull:false,defaultValue:APPLICATION_STATUSES.APPLIED},
 coverLetter:{field:"cover_letter",type:DataTypes.TEXT,allowNull:true,validate:{len:[0,APPLICATION_LIMITS.COVER_LETTER]}},
 recruiterNotes:{field:"recruiter_notes",type:DataTypes.TEXT,allowNull:true,validate:{len:[0,APPLICATION_LIMITS.RECRUITER_NOTES]}},
 withdrawalReason:{field:"withdrawal_reason",type:DataTypes.STRING(APPLICATION_LIMITS.WITHDRAWAL_REASON),allowNull:true}, withdrawnAt:{field:"withdrawn_at",type:DataTypes.DATE,allowNull:true},
 resumeSnapshot:{field:"resume_snapshot",type:DataTypes.JSON,allowNull:false}, candidateSnapshot:{field:"candidate_snapshot",type:DataTypes.JSON,allowNull:false},
 jobSnapshot:{field:"job_snapshot",type:DataTypes.JSON,allowNull:false}, companySnapshot:{field:"company_snapshot",type:DataTypes.JSON,allowNull:false}, salarySnapshot:{field:"salary_snapshot",type:DataTypes.JSON,allowNull:true}
},{sequelize,modelName:"Application",tableName:"applications",timestamps:true,underscored:true,freezeTableName:true,indexes:[{name:"uq_applications_candidate_job",unique:true,fields:["candidate_id","job_id"]},{name:"idx_applications_candidate_status_created",fields:["candidate_id","status","created_at"]},{name:"idx_applications_job_status_created",fields:["job_id","status","created_at"]},{name:"idx_applications_company_id",fields:["company_id"]}]});
export default Application;

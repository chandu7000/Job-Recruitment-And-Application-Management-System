import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database.js";
class SavedJob extends Model {}
SavedJob.init({
 id:{type:DataTypes.UUID,defaultValue:DataTypes.UUIDV4,primaryKey:true},
 candidateId:{field:"candidate_id",type:DataTypes.UUID,allowNull:false,validate:{isUUID:4}},
 jobId:{field:"job_id",type:DataTypes.UUID,allowNull:false,validate:{isUUID:4}}
},{sequelize,modelName:"SavedJob",tableName:"saved_jobs",timestamps:true,underscored:true,freezeTableName:true,indexes:[{name:"uq_saved_jobs_candidate_job",unique:true,fields:["candidate_id","job_id"]},{name:"idx_saved_jobs_candidate_created_at",fields:["candidate_id","created_at"]},{name:"idx_saved_jobs_job_id",fields:["job_id"]}]});
export default SavedJob;

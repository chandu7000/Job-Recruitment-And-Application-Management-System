import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database.js";
import { APPLICATION_STATUS_VALUES, APPLICATION_LIMITS } from "../constants/application.constants.js";
class ApplicationStatusHistory extends Model {}
ApplicationStatusHistory.init({id:{type:DataTypes.UUID,defaultValue:DataTypes.UUIDV4,primaryKey:true},applicationId:{field:"application_id",type:DataTypes.UUID,allowNull:false},previousStatus:{field:"previous_status",type:DataTypes.ENUM(...APPLICATION_STATUS_VALUES),allowNull:true},newStatus:{field:"new_status",type:DataTypes.ENUM(...APPLICATION_STATUS_VALUES),allowNull:false},changedBy:{field:"changed_by",type:DataTypes.UUID,allowNull:false},reason:{type:DataTypes.STRING(APPLICATION_LIMITS.STATUS_REASON),allowNull:true},metadata:{type:DataTypes.JSON,allowNull:true}},{sequelize,modelName:"ApplicationStatusHistory",tableName:"application_status_history",timestamps:true,updatedAt:false,underscored:true,freezeTableName:true,indexes:[{name:"idx_application_status_history_application_created",fields:["application_id","created_at"]}]});
export default ApplicationStatusHistory;

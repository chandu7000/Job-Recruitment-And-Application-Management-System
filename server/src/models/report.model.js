import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database.js";
import { REPORT_CATEGORY_VALUES, REPORT_STATUS_VALUES, REPORT_STATUSES, REPORT_TARGET_TYPE_VALUES } from "../constants/report.constants.js";
class Report extends Model {}
Report.init({
  id:{type:DataTypes.UUID,defaultValue:DataTypes.UUIDV4,primaryKey:true},
  reporterId:{field:"reporter_id",type:DataTypes.UUID,allowNull:false},
  targetType:{field:"target_type",type:DataTypes.ENUM(...REPORT_TARGET_TYPE_VALUES),allowNull:false},
  targetResourceId:{field:"target_resource_id",type:DataTypes.UUID,allowNull:false},
  category:{type:DataTypes.ENUM(...REPORT_CATEGORY_VALUES),allowNull:false},
  description:{type:DataTypes.TEXT,allowNull:false,validate:{len:[10,2000]}},
  status:{type:DataTypes.ENUM(...REPORT_STATUS_VALUES),allowNull:false,defaultValue:REPORT_STATUSES.OPEN},
  adminResolution:{field:"admin_resolution",type:DataTypes.STRING(500),allowNull:true},
  adminRemarks:{field:"admin_remarks",type:DataTypes.TEXT,allowNull:true},
  reviewedBy:{field:"reviewed_by",type:DataTypes.UUID,allowNull:true},
  reviewedAt:{field:"reviewed_at",type:DataTypes.DATE,allowNull:true}
},{sequelize,modelName:"Report",tableName:"reports",timestamps:true,underscored:true,indexes:[{name:"idx_reports_status",fields:["status"]},{name:"idx_reports_target",fields:["target_type","target_resource_id"]},{name:"idx_reports_reporter",fields:["reporter_id"]},{name:"idx_reports_created_at",fields:["created_at"]}]});
export default Report;

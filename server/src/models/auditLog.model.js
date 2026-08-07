import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database.js";
class AuditLog extends Model {}
AuditLog.init({
  id:{type:DataTypes.UUID,defaultValue:DataTypes.UUIDV4,primaryKey:true}, actorUserId:{field:"actor_user_id",type:DataTypes.UUID,allowNull:true}, actorRole:{field:"actor_role",type:DataTypes.STRING(40),allowNull:true}, action:{type:DataTypes.STRING(100),allowNull:false}, resourceType:{field:"resource_type",type:DataTypes.STRING(60),allowNull:false}, resourceId:{field:"resource_id",type:DataTypes.UUID,allowNull:true}, metadata:{type:DataTypes.JSON,allowNull:true}, ipAddress:{field:"ip_address",type:DataTypes.STRING(64),allowNull:true}, userAgent:{field:"user_agent",type:DataTypes.STRING(500),allowNull:true}, requestId:{field:"request_id",type:DataTypes.STRING(100),allowNull:true}, result:{type:DataTypes.STRING(30),allowNull:false,defaultValue:"SUCCESS"}, reason:{type:DataTypes.STRING(1000),allowNull:true}
},{sequelize,modelName:"AuditLog",tableName:"audit_logs",timestamps:true,updatedAt:false,underscored:true,indexes:[{name:"idx_audit_actor",fields:["actor_user_id"]},{name:"idx_audit_action",fields:["action"]},{name:"idx_audit_resource",fields:["resource_type","resource_id"]},{name:"idx_audit_role",fields:["actor_role"]},{name:"idx_audit_created_at",fields:["created_at"]}]});
export default AuditLog;

import AuditLog from "../models/auditLog.model.js";
import { sanitizeAuditMetadata } from "../constants/audit.constants.js";
export const buildRequestContext = (req={}) => ({ ipAddress:req.ip || null,userAgent:req.get?.("user-agent") || null,requestId:req.requestId || null });
export const createAuditLog = async ({actor=null,action,resourceType,resourceId=null,metadata=null,result="SUCCESS",reason=null,requestContext={},transaction=null}) => AuditLog.create({actorUserId:actor?.id || null,actorRole:actor?.role || null,action,resourceType,resourceId,metadata:sanitizeAuditMetadata(metadata),result,reason,...requestContext},{transaction});
export const createAuditLogSafely = async (payload) => { try{return await createAuditLog(payload);}catch(error){console.error("Non-critical audit logging failed:",error.message);return null;} };

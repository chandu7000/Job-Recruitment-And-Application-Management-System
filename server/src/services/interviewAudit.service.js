import { recordApplicationAudit } from "./applicationAudit.service.js";
export const recordInterviewAudit=({req,event,interview,metadata=null,transaction=null})=>recordApplicationAudit({req,event,applicationId:interview?.applicationId||null,metadata:{interviewId:interview?.id,...metadata},transaction});

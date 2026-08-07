import { sendSuccess } from "../utils/apiResponse.js"; import { saveJobForCandidate,removeSavedJobForCandidate,getCandidateSavedJobs } from "../services/savedJob.service.js";
export const saveJob=async(req,res)=>sendSuccess(res,201,"Job saved successfully.",{savedJob:await saveJobForCandidate({candidateId:req.user.id,jobId:req.params.jobId})});
export const removeSavedJob=async(req,res)=>{await removeSavedJobForCandidate({candidateId:req.user.id,jobId:req.params.jobId});return sendSuccess(res,200,"Saved job removed successfully.");};
export const getMySavedJobs=async(req,res)=>{const r=await getCandidateSavedJobs({candidateId:req.user.id,query:req.query});return sendSuccess(res,200,"Saved jobs retrieved successfully.",{savedJobs:r.items},r.meta);};

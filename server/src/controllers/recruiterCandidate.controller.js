import {
  getRecruiterCandidateProfile
} from "../services/recruiterCandidate.service.js";

import {
  sendSuccess
} from "../utils/apiResponse.js";

const getCandidateProfile = async (
  req,
  res,
  next
) => {

  try {

    const candidate =
      await getRecruiterCandidateProfile(
        req.params.profileId
      );

    return sendSuccess(
      res,
      200,
      "Candidate profile fetched successfully",
      candidate
    );
  } catch(error){
    next(error);
  }
};


export {
  getCandidateProfile
};
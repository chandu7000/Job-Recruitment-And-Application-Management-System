import {
  getAdminCandidateProfile
} from "../services/adminCandidate.service.js";

import {
  sendSuccess
} from "../utils/apiResponse.js";


const getAdminCandidateProfileController =
async (
  req,
  res,
  next
) => {

  try {

    const candidate =
      await getAdminCandidateProfile(
        req.params.profileId
      );


    return sendSuccess(
      res,
      200,
      "Admin candidate profile fetched successfully.",
      candidate
    );


  } catch(error) {

    next(error);

  }

};


export {
  getAdminCandidateProfileController
};
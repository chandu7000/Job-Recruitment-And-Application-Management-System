import {
  getProfileCompletion
} from "../services/jobSeekerProfileCompletion.service.js";

import {
  sendSuccess
} from "../utils/apiResponse.js";


const getMyProfileCompletion =
async (
  req,
  res,
  next
) => {

  try {

    const completion =
      await getProfileCompletion(
        req.user.id
      );


    return sendSuccess(
      res,
      200,
      "Profile completion fetched successfully.",
      completion
    );


  } catch(error) {

    next(error);

  }

};


export {
  getMyProfileCompletion
};
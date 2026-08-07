import { Router } from "express";

import authenticate, {
  authorize
} from "../middlewares/auth.middleware.js";

import {
  USER_ROLES
} from "../constants/app.constants.js";

import {
  getCandidateProfile
} from "../controllers/recruiterCandidate.controller.js";


const router = Router();


router.use(
  authenticate,
  authorize(
    USER_ROLES.RECRUITER
  )
);


router.get(
  "/:profileId",
  getCandidateProfile
);


export default router;
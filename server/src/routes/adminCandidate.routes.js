import { Router } from "express";

import authenticate, {
  authorize
} from "../middlewares/auth.middleware.js";

import {
  USER_ROLES
} from "../constants/app.constants.js";

import {
  getAdminCandidateProfileController
} from "../controllers/adminCandidate.controller.js";


const router = Router();


router.use(
  authenticate,
  authorize(
    USER_ROLES.ADMIN
  )
);


router.get(
  "/:profileId",
  getAdminCandidateProfileController
);


export default router;
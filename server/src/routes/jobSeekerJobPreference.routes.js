import { Router } from "express";

import jobSeekerJobPreferenceController
  from "../controllers/jobSeekerJobPreference.controller.js";
import { authenticate }
  from "../middlewares/auth.middleware.js";
import {
  validateUpdateJobPreference
} from "../validators/jobSeekerJobPreference.validator.js";

const router = Router();

router.use(authenticate);

router
  .route("/")
  .get(
    jobSeekerJobPreferenceController.getJobPreference
  )
  .patch(
    validateUpdateJobPreference,
    jobSeekerJobPreferenceController.updateJobPreference
  )
  .delete(
    jobSeekerJobPreferenceController.deleteJobPreference
  );

export default router;
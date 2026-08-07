import { Router } from "express";

import jobSeekerCertificationController
  from "../controllers/jobSeekerCertification.controller.js";
import { authenticate }
  from "../middlewares/auth.middleware.js";
import {
  validateCertificationId,
  validateCreateCertification,
  validateUpdateCertification
} from "../validators/jobSeekerCertification.validator.js";

const router = Router();

router.use(authenticate);

router
  .route("/")
  .post(
    validateCreateCertification,
    jobSeekerCertificationController.createCertification
  )
  .get(
    jobSeekerCertificationController.getCertifications
  );

router
  .route("/:certificationId")
  .get(
    validateCertificationId,
    jobSeekerCertificationController.getCertificationById
  )
  .patch(
    validateCertificationId,
    validateUpdateCertification,
    jobSeekerCertificationController.updateCertification
  )
  .delete(
    validateCertificationId,
    jobSeekerCertificationController.deleteCertification
  );

export default router;
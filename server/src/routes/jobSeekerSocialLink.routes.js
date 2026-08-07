import { Router } from "express";

import jobSeekerSocialLinkController
  from "../controllers/jobSeekerSocialLink.controller.js";
import { authenticate }
  from "../middlewares/auth.middleware.js";
import {
  validateCreateSocialLink,
  validateSocialLinkId,
  validateUpdateSocialLink
} from "../validators/jobSeekerSocialLink.validator.js";

const router = Router();

router.use(authenticate);

router
  .route("/")
  .post(
    validateCreateSocialLink,
    jobSeekerSocialLinkController.createSocialLink
  )
  .get(
    jobSeekerSocialLinkController.getSocialLinks
  );

router
  .route("/:socialLinkId")
  .get(
    validateSocialLinkId,
    jobSeekerSocialLinkController.getSocialLinkById
  )
  .patch(
    validateSocialLinkId,
    validateUpdateSocialLink,
    jobSeekerSocialLinkController.updateSocialLink
  )
  .delete(
    validateSocialLinkId,
    jobSeekerSocialLinkController.deleteSocialLink
  );

export default router;
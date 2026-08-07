import {
  body,
  param
} from "express-validator";

const skillNameValidator = body(
  "skillName"
)
  .exists({
    checkFalsy: true
  })
  .withMessage(
    "Skill name is required."
  )
  .bail()
  .isString()
  .withMessage(
    "Skill name must be a string."
  )
  .bail()
  .trim()
  .isLength({
    min: 1,
    max: 100
  })
  .withMessage(
    "Skill name must be between 1 and 100 characters."
  );

const validateSkillBodyFields =
  body().custom((value) => {
    const allowedFields = [
      "skillName"
    ];

    const receivedFields =
      Object.keys(value);

    const invalidFields =
      receivedFields.filter(
        (field) =>
          !allowedFields.includes(field)
      );

    if (invalidFields.length > 0) {
      throw new Error(
        `Unsupported skill fields: ${invalidFields.join(", ")}`
      );
    }

    return true;
  });

const createJobSeekerSkillValidator = [
  skillNameValidator,
  validateSkillBodyFields
];

const updateJobSeekerSkillValidator = [
  param("skillId")
    .isUUID()
    .withMessage(
      "Skill ID must be a valid UUID."
    ),

  skillNameValidator,
  validateSkillBodyFields
];

const deleteJobSeekerSkillValidator = [
  param("skillId")
    .isUUID()
    .withMessage(
      "Skill ID must be a valid UUID."
    )
];

export {
  createJobSeekerSkillValidator,
  updateJobSeekerSkillValidator,
  deleteJobSeekerSkillValidator
};
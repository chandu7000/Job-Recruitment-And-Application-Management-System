import {
  JOB_FIELD_LIMITS
} from "../constants/job.constants.js";

const normalizeJobSlug = (
  value
) => {
  if (
    typeof value !== "string"
  ) {
    return "";
  }

  return value
    .normalize("NFKD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .toLowerCase()
    .trim()
    .replace(
      /[^a-z0-9]+/g,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      ""
    );
};

const buildSlugCandidate = (
  baseSlug,
  sequence
) => {
  const suffix =
    sequence > 1
      ? `-${sequence}`
      : "";

  const maximumBaseLength =
    JOB_FIELD_LIMITS
      .SLUG_MAX_LENGTH -
    suffix.length;

  const truncatedBase =
    baseSlug
      .slice(
        0,
        maximumBaseLength
      )
      .replace(
        /-+$/g,
        ""
      );

  return `${truncatedBase}${suffix}`;
};

const generateUniqueJobSlug = async (
  title,
  findBySlug
) => {
  if (
    typeof findBySlug !==
    "function"
  ) {
    throw new TypeError(
      "findBySlug must be a function."
    );
  }

  const baseSlug =
    normalizeJobSlug(title);

  if (!baseSlug) {
    return null;
  }

  let sequence = 1;

  while (sequence <= 1000) {
    const candidate =
      buildSlugCandidate(
        baseSlug,
        sequence
      );

    const existingJob =
      await findBySlug(
        candidate
      );

    if (!existingJob) {
      return candidate;
    }

    sequence += 1;
  }

  throw new Error(
    "Unable to generate a unique job slug."
  );
};

export {
  normalizeJobSlug,
  generateUniqueJobSlug
};
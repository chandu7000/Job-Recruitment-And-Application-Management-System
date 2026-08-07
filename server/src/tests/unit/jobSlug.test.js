import {
  jest
} from "@jest/globals";

import {
  normalizeJobSlug,
  generateUniqueJobSlug
} from "../../utils/jobSlug.js";

describe(
  "Job slug utility",
  () => {
    describe(
      "normalizeJobSlug",
      () => {
        test(
          "normalizes a job title",
          () => {
            expect(
              normalizeJobSlug(
                " Senior Backend Developer "
              )
            ).toBe(
              "senior-backend-developer"
            );
          }
        );

        test(
          "removes unsupported characters",
          () => {
            expect(
              normalizeJobSlug(
                "Node.js / API Engineer!"
              )
            ).toBe(
              "node-js-api-engineer"
            );
          }
        );

        test(
          "returns an empty value for missing input",
          () => {
            expect(
              normalizeJobSlug()
            ).toBe("");
          }
        );
      }
    );

    describe(
      "generateUniqueJobSlug",
      () => {
        test(
          "returns null when title is missing",
          async () => {
            const findBySlug =
              jest.fn();

            const result =
              await generateUniqueJobSlug(
                undefined,
                findBySlug
              );

            expect(result).toBeNull();

            expect(
              findBySlug
            ).not.toHaveBeenCalled();
          }
        );

        test(
          "returns the base slug when available",
          async () => {
            const findBySlug =
              jest.fn()
                .mockResolvedValue(
                  null
                );

            const result =
              await generateUniqueJobSlug(
                "Backend Developer",
                findBySlug
              );

            expect(result).toBe(
              "backend-developer"
            );
          }
        );

        test(
          "adds a numeric suffix after collisions",
          async () => {
            const findBySlug =
              jest.fn()
                .mockResolvedValueOnce({
                  id: "job-1"
                })
                .mockResolvedValueOnce({
                  id: "job-2"
                })
                .mockResolvedValueOnce(
                  null
                );

            const result =
              await generateUniqueJobSlug(
                "Backend Developer",
                findBySlug
              );

            expect(result).toBe(
              "backend-developer-3"
            );
          }
        );

        test(
          "requires a lookup function",
          async () => {
            await expect(
              generateUniqueJobSlug(
                "Backend Developer"
              )
            ).rejects.toThrow(
              "findBySlug must be a function."
            );
          }
        );
      }
    );
  }
);
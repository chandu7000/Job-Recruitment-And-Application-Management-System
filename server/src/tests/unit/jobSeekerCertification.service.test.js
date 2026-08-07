import {
  jest
} from "@jest/globals";

const findProfileMock =
  jest.fn();

const createCertificationMock =
  jest.fn();

const findCertificationsMock =
  jest.fn();

const findCertificationByIdMock =
  jest.fn();

const updateCertificationMock =
  jest.fn();

const deleteCertificationMock =
  jest.fn();

jest.unstable_mockModule(
  "../../repositories/jobSeekerProfile.repository.js",
  () => ({
    findJobSeekerProfileByUserId:
      findProfileMock
  })
);

jest.unstable_mockModule(
  "../../repositories/jobSeekerCertification.repository.js",
  () => ({
    default: {
      create:
        createCertificationMock,

      findAllByProfileId:
        findCertificationsMock,

      findByIdAndProfileId:
        findCertificationByIdMock,

      update:
        updateCertificationMock,

      delete:
        deleteCertificationMock
    }
  })
);

const {
  default: certificationService
} = await import(
  "../../services/jobSeekerCertification.service.js"
);

describe(
  "Job seeker certification service",
  () => {
    const userId = "user-1";
    const profileId = "profile-1";
    const certificationId =
      "certification-1";

    beforeEach(() => {
      jest.clearAllMocks();

      findProfileMock.mockResolvedValue({
        id: profileId,
        userId
      });
    });

    test(
      "throws when profile does not exist",
      async () => {
        findProfileMock.mockResolvedValue(
          null
        );

        await expect(
          certificationService
            .getCertifications(userId)
        ).rejects.toEqual(
          expect.objectContaining({
            code:
              "JOB_SEEKER_PROFILE_NOT_FOUND"
          })
        );
      }
    );

    test(
      "rejects expiry date when certification does not expire",
      () => {
        expect(() =>
          certificationService
            .validateCertificationDates(
              "2024-01-01",
              "2025-01-01",
              true
            )
        ).toThrow(
          expect.objectContaining({
            code:
              "CERTIFICATION_EXPIRY_NOT_ALLOWED"
          })
        );
      }
    );

    test(
      "rejects expiry date earlier than issue date",
      () => {
        expect(() =>
          certificationService
            .validateCertificationDates(
              "2025-01-01",
              "2024-01-01",
              false
            )
        ).toThrow(
          expect.objectContaining({
            code:
              "INVALID_CERTIFICATION_DATE_RANGE"
          })
        );
      }
    );

    test(
      "creates a certification",
      async () => {
        const certificationData = {
          certificationName:
            "Java",

          issueDate:
            "2024-01-01",

          expiryDate:
            "2026-01-01",

          doesNotExpire:
            false
        };

        createCertificationMock
          .mockResolvedValue({
            id: certificationId
          });

        await certificationService
          .createCertification(
            userId,
            certificationData
          );

        expect(
          createCertificationMock
        ).toHaveBeenCalledWith({
          jobSeekerProfileId:
            profileId,
          ...certificationData
        });
      }
    );

    test(
      "sets expiry date to null for non-expiring certification",
      async () => {
        createCertificationMock
          .mockResolvedValue({
            id: certificationId
          });

        await certificationService
          .createCertification(
            userId,
            {
              certificationName:
                "Lifetime Certificate",

              doesNotExpire:
                true,

              expiryDate:
                null
            }
          );

        expect(
          createCertificationMock
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            doesNotExpire: true,
            expiryDate: null
          })
        );
      }
    );

    test(
      "returns all certifications",
      async () => {
        const certifications = [
          {
            id: certificationId
          }
        ];

        findCertificationsMock
          .mockResolvedValue(
            certifications
          );

        const result =
          await certificationService
            .getCertifications(userId);

        expect(result).toBe(
          certifications
        );
      }
    );

    test(
      "throws when certification does not exist",
      async () => {
        findCertificationByIdMock
          .mockResolvedValue(
            null
          );

        await expect(
          certificationService
            .getCertificationById(
              userId,
              certificationId
            )
        ).rejects.toEqual(
          expect.objectContaining({
            code:
              "JOB_SEEKER_CERTIFICATION_NOT_FOUND"
          })
        );
      }
    );

    test(
      "updates a certification",
      async () => {
        const certification = {
          id: certificationId,

          get: jest.fn(() => ({
            issueDate:
              "2024-01-01",

            expiryDate:
              "2026-01-01",

            doesNotExpire:
              false
          }))
        };

        findCertificationByIdMock
          .mockResolvedValue(
            certification
          );

        updateCertificationMock
          .mockResolvedValue({
            id: certificationId
          });

        await certificationService
          .updateCertification(
            userId,
            certificationId,
            {
              expiryDate:
                "2027-01-01"
            }
          );

        expect(
          updateCertificationMock
        ).toHaveBeenCalledWith(
          certification,
          {
            expiryDate:
              "2027-01-01"
          }
        );
      }
    );

    test(
      "sets expiry date to null when updated as non-expiring",
      async () => {
        const certification = {
          id: certificationId,

          get: jest.fn(() => ({
            issueDate:
              "2024-01-01",

            expiryDate:
              "2026-01-01",

            doesNotExpire:
              false
          }))
        };

        findCertificationByIdMock
          .mockResolvedValue(
            certification
          );

        await certificationService
          .updateCertification(
            userId,
            certificationId,
            {
              doesNotExpire:
                true
            }
          );

        expect(
          updateCertificationMock
        ).toHaveBeenCalledWith(
          certification,
          {
            doesNotExpire: true,
            expiryDate: null
          }
        );
      }
    );

    test(
      "deletes a certification",
      async () => {
        const certification = {
          id: certificationId
        };

        findCertificationByIdMock
          .mockResolvedValue(
            certification
          );

        const result =
          await certificationService
            .deleteCertification(
              userId,
              certificationId
            );

        expect(
          deleteCertificationMock
        ).toHaveBeenCalledWith(
          certification
        );

        expect(result).toEqual({
          message:
            "Certification deleted successfully"
        });
      }
    );
  }
);
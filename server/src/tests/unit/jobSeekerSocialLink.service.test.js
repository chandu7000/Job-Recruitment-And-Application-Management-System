import {
  jest
} from "@jest/globals";

const findProfileMock =
  jest.fn();

const createSocialLinkMock =
  jest.fn();

const findSocialLinksMock =
  jest.fn();

const findSocialLinkByIdMock =
  jest.fn();

const findByPlatformMock =
  jest.fn();

const updateSocialLinkMock =
  jest.fn();

const deleteSocialLinkMock =
  jest.fn();

jest.unstable_mockModule(
  "../../repositories/jobSeekerProfile.repository.js",
  () => ({
    findJobSeekerProfileByUserId:
      findProfileMock
  })
);

jest.unstable_mockModule(
  "../../repositories/jobSeekerSocialLink.repository.js",
  () => ({
    default: {
      create:
        createSocialLinkMock,

      findAllByProfileId:
        findSocialLinksMock,

      findByIdAndProfileId:
        findSocialLinkByIdMock,

      findByProfileIdAndPlatform:
        findByPlatformMock,

      update:
        updateSocialLinkMock,

      delete:
        deleteSocialLinkMock
    }
  })
);

const {
  default: socialLinkService
} = await import(
  "../../services/jobSeekerSocialLink.service.js"
);

describe(
  "Job seeker social link service",
  () => {
    const userId = "user-1";
    const profileId = "profile-1";
    const socialLinkId =
      "social-link-1";

    beforeEach(() => {
      jest.clearAllMocks();

      findProfileMock.mockResolvedValue({
        id: profileId,
        userId
      });

      findByPlatformMock
        .mockResolvedValue(
          null
        );
    });

    test(
      "throws when profile does not exist",
      async () => {
        findProfileMock.mockResolvedValue(
          null
        );

        await expect(
          socialLinkService
            .getSocialLinks(userId)
        ).rejects.toEqual(
          expect.objectContaining({
            code:
              "JOB_SEEKER_PROFILE_NOT_FOUND"
          })
        );
      }
    );

    test(
      "creates a social link",
      async () => {
        const socialLinkData = {
          platform:
            "LINKEDIN",

          url:
            "https://linkedin.com/in/user"
        };

        createSocialLinkMock
          .mockResolvedValue({
            id: socialLinkId
          });

        await socialLinkService
          .createSocialLink(
            userId,
            socialLinkData
          );

        expect(
          findByPlatformMock
        ).toHaveBeenCalledWith(
          profileId,
          "LINKEDIN"
        );

        expect(
          createSocialLinkMock
        ).toHaveBeenCalledWith({
          jobSeekerProfileId:
            profileId,
          ...socialLinkData
        });
      }
    );

    test(
      "rejects duplicate platform",
      async () => {
        findByPlatformMock
          .mockResolvedValue({
            id: socialLinkId
          });

        await expect(
          socialLinkService
            .createSocialLink(
              userId,
              {
                platform:
                  "LINKEDIN"
              }
            )
        ).rejects.toEqual(
          expect.objectContaining({
            statusCode: 409,
            code:
              "SOCIAL_LINK_ALREADY_EXISTS"
          })
        );

        expect(
          createSocialLinkMock
        ).not.toHaveBeenCalled();
      }
    );

    test(
      "returns all social links",
      async () => {
        const links = [
          {
            id: socialLinkId
          }
        ];

        findSocialLinksMock
          .mockResolvedValue(
            links
          );

        const result =
          await socialLinkService
            .getSocialLinks(userId);

        expect(result).toBe(
          links
        );
      }
    );

    test(
      "throws when social link does not exist",
      async () => {
        findSocialLinkByIdMock
          .mockResolvedValue(
            null
          );

        await expect(
          socialLinkService
            .getSocialLinkById(
              userId,
              socialLinkId
            )
        ).rejects.toEqual(
          expect.objectContaining({
            code:
              "SOCIAL_LINK_NOT_FOUND"
          })
        );
      }
    );

    test(
      "updates a social link",
      async () => {
        const socialLink = {
          id: socialLinkId,
          jobSeekerProfileId:
            profileId,
          platform:
            "LINKEDIN"
        };

        findSocialLinkByIdMock
          .mockResolvedValue(
            socialLink
          );

        updateSocialLinkMock
          .mockResolvedValue({
            ...socialLink,
            url:
              "https://updated.example"
          });

        await socialLinkService
          .updateSocialLink(
            userId,
            socialLinkId,
            {
              url:
                "https://updated.example"
            }
          );

        expect(
          updateSocialLinkMock
        ).toHaveBeenCalledWith(
          socialLink,
          {
            url:
              "https://updated.example"
          }
        );
      }
    );

    test(
      "rejects duplicate platform during update",
      async () => {
        const socialLink = {
          id: socialLinkId,
          jobSeekerProfileId:
            profileId,
          platform:
            "LINKEDIN"
        };

        findSocialLinkByIdMock
          .mockResolvedValue(
            socialLink
          );

        findByPlatformMock
          .mockResolvedValue({
            id:
              "different-link"
          });

        await expect(
          socialLinkService
            .updateSocialLink(
              userId,
              socialLinkId,
              {
                platform:
                  "GITHUB"
              }
            )
        ).rejects.toEqual(
          expect.objectContaining({
            code:
              "SOCIAL_LINK_ALREADY_EXISTS"
          })
        );

        expect(
          updateSocialLinkMock
        ).not.toHaveBeenCalled();
      }
    );

    test(
      "deletes a social link",
      async () => {
        const socialLink = {
          id: socialLinkId
        };

        findSocialLinkByIdMock
          .mockResolvedValue(
            socialLink
          );

        const result =
          await socialLinkService
            .deleteSocialLink(
              userId,
              socialLinkId
            );

        expect(
          deleteSocialLinkMock
        ).toHaveBeenCalledWith(
          socialLink
        );

        expect(result).toEqual({
          message:
            "Social link deleted successfully"
        });
      }
    );
  }
);
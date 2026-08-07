import {
  jest
} from "@jest/globals";

const transactionMock =
  jest.fn();

const findOrCreateJobSeekerProfileMock =
  jest.fn();

const createJobSeekerSkillMock =
  jest.fn();

const findJobSeekerSkillsByProfileIdMock =
  jest.fn();

const findJobSeekerSkillByIdAndProfileIdMock =
  jest.fn();

const findJobSeekerSkillByNameAndProfileIdMock =
  jest.fn();

const updateJobSeekerSkillMock =
  jest.fn();

const deleteJobSeekerSkillMock =
  jest.fn();

const countJobSeekerSkillsByProfileIdMock =
  jest.fn();

jest.unstable_mockModule(
  "../../config/database.js",
  () => ({
    sequelize: {
      transaction:
        transactionMock
    }
  })
);

jest.unstable_mockModule(
  "../../repositories/jobSeekerProfile.repository.js",
  () => ({
    findOrCreateJobSeekerProfile:
      findOrCreateJobSeekerProfileMock
  })
);

jest.unstable_mockModule(
  "../../repositories/jobSeekerSkill.repository.js",
  () => ({
    createJobSeekerSkill:
      createJobSeekerSkillMock,

    findJobSeekerSkillsByProfileId:
      findJobSeekerSkillsByProfileIdMock,

    findJobSeekerSkillByIdAndProfileId:
      findJobSeekerSkillByIdAndProfileIdMock,

    findJobSeekerSkillByNameAndProfileId:
      findJobSeekerSkillByNameAndProfileIdMock,

    updateJobSeekerSkill:
      updateJobSeekerSkillMock,

    deleteJobSeekerSkill:
      deleteJobSeekerSkillMock,

    countJobSeekerSkillsByProfileId:
      countJobSeekerSkillsByProfileIdMock
  })
);

const {
  getMySkills,
  addMySkill,
  updateMySkill,
  removeMySkill
} = await import(
  "../../services/jobSeekerSkill.service.js"
);

describe(
  "Job seeker skill service",
  () => {
    const userId =
      "11111111-1111-1111-1111-111111111111";

    const profileId =
      "22222222-2222-2222-2222-222222222222";

    const skillId =
      "33333333-3333-3333-3333-333333333333";

    const transaction = {
      LOCK: {
        UPDATE:
          "UPDATE"
      }
    };

    const profileResult = {
      profile: {
        id:
          profileId,

        userId
      },

      created:
        false
    };

    beforeEach(() => {
      jest.clearAllMocks();

      transactionMock
        .mockImplementation(
          async (callback) =>
            callback(
              transaction
            )
        );

      findOrCreateJobSeekerProfileMock
        .mockResolvedValue(
          profileResult
        );

      countJobSeekerSkillsByProfileIdMock
        .mockResolvedValue(
          0
        );

      findJobSeekerSkillByNameAndProfileIdMock
        .mockResolvedValue(
          null
        );
    });

    describe(
      "getMySkills",
      () => {
        test(
          "returns all skills for the job seeker profile",
          async () => {
            const skills = [
              {
                id:
                  skillId,

                jobSeekerProfileId:
                  profileId,

                skillName:
                  "Java"
              }
            ];

            findJobSeekerSkillsByProfileIdMock
              .mockResolvedValue(
                skills
              );

            const result =
              await getMySkills({
                userId
              });

            expect(
              findOrCreateJobSeekerProfileMock
            ).toHaveBeenCalledWith(
              userId
            );

            expect(
              findJobSeekerSkillsByProfileIdMock
            ).toHaveBeenCalledWith(
              profileId
            );

            expect(result).toBe(
              skills
            );
          }
        );

        test(
          "returns an empty list when profile has no skills",
          async () => {
            findJobSeekerSkillsByProfileIdMock
              .mockResolvedValue([]);

            const result =
              await getMySkills({
                userId
              });

            expect(result).toEqual([]);
          }
        );

        test(
          "propagates profile repository errors",
          async () => {
            const repositoryError =
              new Error(
                "Profile lookup failed"
              );

            findOrCreateJobSeekerProfileMock
              .mockRejectedValue(
                repositoryError
              );

            await expect(
              getMySkills({
                userId
              })
            ).rejects.toBe(
              repositoryError
            );

            expect(
              findJobSeekerSkillsByProfileIdMock
            ).not.toHaveBeenCalled();
          }
        );
      }
    );

    describe(
      "addMySkill",
      () => {
        test(
          "normalizes and creates a new skill",
          async () => {
            const createdSkill = {
              id:
                skillId,

              jobSeekerProfileId:
                profileId,

              skillName:
                "Java Spring Boot"
            };

            createJobSeekerSkillMock
              .mockResolvedValue(
                createdSkill
              );

            const result =
              await addMySkill({
                userId,

                skillName:
                  "  Java   Spring   Boot  "
              });

            expect(
              findOrCreateJobSeekerProfileMock
            ).toHaveBeenCalledWith(
              userId,
              {
                transaction
              }
            );

            expect(
              countJobSeekerSkillsByProfileIdMock
            ).toHaveBeenCalledWith(
              profileId,
              {
                transaction
              }
            );

            expect(
              findJobSeekerSkillByNameAndProfileIdMock
            ).toHaveBeenCalledWith(
              "Java Spring Boot",
              profileId,
              {
                transaction
              }
            );

            expect(
              createJobSeekerSkillMock
            ).toHaveBeenCalledWith(
              {
                jobSeekerProfileId:
                  profileId,

                skillName:
                  "Java Spring Boot"
              },
              {
                transaction
              }
            );

            expect(result).toBe(
              createdSkill
            );
          }
        );

        test(
          "rejects adding a skill when the maximum limit is reached",
          async () => {
            countJobSeekerSkillsByProfileIdMock
              .mockResolvedValue(
                30
              );

            await expect(
              addMySkill({
                userId,

                skillName:
                  "Java"
              })
            ).rejects.toEqual(
              expect.objectContaining({
                statusCode:
                  400,

                code:
                  "JOB_SEEKER_SKILL_LIMIT_REACHED"
              })
            );

            expect(
              findJobSeekerSkillByNameAndProfileIdMock
            ).not.toHaveBeenCalled();

            expect(
              createJobSeekerSkillMock
            ).not.toHaveBeenCalled();
          }
        );

        test(
          "rejects a duplicate skill",
          async () => {
            findJobSeekerSkillByNameAndProfileIdMock
              .mockResolvedValue({
                id:
                  skillId,

                skillName:
                  "Java"
              });

            await expect(
              addMySkill({
                userId,

                skillName:
                  " Java "
              })
            ).rejects.toEqual(
              expect.objectContaining({
                statusCode:
                  409,

                code:
                  "JOB_SEEKER_SKILL_ALREADY_EXISTS"
              })
            );

            expect(
              createJobSeekerSkillMock
            ).not.toHaveBeenCalled();
          }
        );

        test(
          "allows adding the thirtieth skill",
          async () => {
            countJobSeekerSkillsByProfileIdMock
              .mockResolvedValue(
                29
              );

            createJobSeekerSkillMock
              .mockResolvedValue({
                id:
                  skillId,

                skillName:
                  "Docker"
              });

            const result =
              await addMySkill({
                userId,

                skillName:
                  "Docker"
              });

            expect(result).toEqual(
              expect.objectContaining({
                skillName:
                  "Docker"
              })
            );

            expect(
              createJobSeekerSkillMock
            ).toHaveBeenCalled();
          }
        );

        test(
          "propagates skill creation errors",
          async () => {
            const repositoryError =
              new Error(
                "Skill creation failed"
              );

            createJobSeekerSkillMock
              .mockRejectedValue(
                repositoryError
              );

            await expect(
              addMySkill({
                userId,

                skillName:
                  "Java"
              })
            ).rejects.toBe(
              repositoryError
            );
          }
        );
      }
    );

    describe(
      "updateMySkill",
      () => {
        test(
          "normalizes and updates an existing skill",
          async () => {
            const skill = {
              id:
                skillId,

              jobSeekerProfileId:
                profileId,

              skillName:
                "Java"
            };

            const updatedSkill = {
              ...skill,

              skillName:
                "Spring Boot"
            };

            findJobSeekerSkillByIdAndProfileIdMock
              .mockResolvedValue(
                skill
              );

            updateJobSeekerSkillMock
              .mockResolvedValue(
                updatedSkill
              );

            const result =
              await updateMySkill({
                userId,
                skillId,

                skillName:
                  "  Spring   Boot "
              });

            expect(
              findJobSeekerSkillByIdAndProfileIdMock
            ).toHaveBeenCalledWith(
              skillId,
              profileId,
              {
                transaction,

                lock:
                  transaction.LOCK.UPDATE
              }
            );

            expect(
              findJobSeekerSkillByNameAndProfileIdMock
            ).toHaveBeenCalledWith(
              "Spring Boot",
              profileId,
              {
                transaction
              }
            );

            expect(
              updateJobSeekerSkillMock
            ).toHaveBeenCalledWith(
              skill,
              {
                skillName:
                  "Spring Boot"
              },
              {
                transaction
              }
            );

            expect(result).toBe(
              updatedSkill
            );
          }
        );

        test(
          "throws when skill does not exist",
          async () => {
            findJobSeekerSkillByIdAndProfileIdMock
              .mockResolvedValue(
                null
              );

            await expect(
              updateMySkill({
                userId,
                skillId,

                skillName:
                  "Java"
              })
            ).rejects.toEqual(
              expect.objectContaining({
                statusCode:
                  404,

                code:
                  "JOB_SEEKER_SKILL_NOT_FOUND"
              })
            );

            expect(
              findJobSeekerSkillByNameAndProfileIdMock
            ).not.toHaveBeenCalled();

            expect(
              updateJobSeekerSkillMock
            ).not.toHaveBeenCalled();
          }
        );

        test(
          "rejects changing a skill to another existing skill",
          async () => {
            const skill = {
              id:
                skillId,

              skillName:
                "Java"
            };

            findJobSeekerSkillByIdAndProfileIdMock
              .mockResolvedValue(
                skill
              );

            findJobSeekerSkillByNameAndProfileIdMock
              .mockResolvedValue({
                id:
                  "different-skill-id",

                skillName:
                  "Python"
              });

            await expect(
              updateMySkill({
                userId,
                skillId,

                skillName:
                  "Python"
              })
            ).rejects.toEqual(
              expect.objectContaining({
                statusCode:
                  409,

                code:
                  "JOB_SEEKER_SKILL_ALREADY_EXISTS"
              })
            );

            expect(
              updateJobSeekerSkillMock
            ).not.toHaveBeenCalled();
          }
        );

        test(
          "allows updating when duplicate lookup returns the same skill",
          async () => {
            const skill = {
              id:
                skillId,

              jobSeekerProfileId:
                profileId,

              skillName:
                "Java"
            };

            findJobSeekerSkillByIdAndProfileIdMock
              .mockResolvedValue(
                skill
              );

            findJobSeekerSkillByNameAndProfileIdMock
              .mockResolvedValue(
                skill
              );

            updateJobSeekerSkillMock
              .mockResolvedValue({
                ...skill,

                skillName:
                  "Java"
              });

            const result =
              await updateMySkill({
                userId,
                skillId,

                skillName:
                  " Java "
              });

            expect(
              updateJobSeekerSkillMock
            ).toHaveBeenCalled();

            expect(result).toEqual(
              expect.objectContaining({
                skillName:
                  "Java"
              })
            );
          }
        );

        test(
          "propagates skill update errors",
          async () => {
            const repositoryError =
              new Error(
                "Skill update failed"
              );

            findJobSeekerSkillByIdAndProfileIdMock
              .mockResolvedValue({
                id:
                  skillId,

                skillName:
                  "Java"
              });

            updateJobSeekerSkillMock
              .mockRejectedValue(
                repositoryError
              );

            await expect(
              updateMySkill({
                userId,
                skillId,

                skillName:
                  "Spring"
              })
            ).rejects.toBe(
              repositoryError
            );
          }
        );
      }
    );

    describe(
      "removeMySkill",
      () => {
        test(
          "deletes an existing skill",
          async () => {
            const skill = {
              id:
                skillId,

              jobSeekerProfileId:
                profileId,

              skillName:
                "Java"
            };

            findJobSeekerSkillByIdAndProfileIdMock
              .mockResolvedValue(
                skill
              );

            deleteJobSeekerSkillMock
              .mockResolvedValue(
                undefined
              );

            const result =
              await removeMySkill({
                userId,
                skillId
              });

            expect(
              findJobSeekerSkillByIdAndProfileIdMock
            ).toHaveBeenCalledWith(
              skillId,
              profileId,
              {
                transaction,

                lock:
                  transaction.LOCK.UPDATE
              }
            );

            expect(
              deleteJobSeekerSkillMock
            ).toHaveBeenCalledWith(
              skill,
              {
                transaction
              }
            );

            expect(result).toBeUndefined();
          }
        );

        test(
          "throws when skill to remove does not exist",
          async () => {
            findJobSeekerSkillByIdAndProfileIdMock
              .mockResolvedValue(
                null
              );

            await expect(
              removeMySkill({
                userId,
                skillId
              })
            ).rejects.toEqual(
              expect.objectContaining({
                statusCode:
                  404,

                code:
                  "JOB_SEEKER_SKILL_NOT_FOUND"
              })
            );

            expect(
              deleteJobSeekerSkillMock
            ).not.toHaveBeenCalled();
          }
        );

        test(
          "propagates skill deletion errors",
          async () => {
            const repositoryError =
              new Error(
                "Skill deletion failed"
              );

            findJobSeekerSkillByIdAndProfileIdMock
              .mockResolvedValue({
                id:
                  skillId,

                skillName:
                  "Java"
              });

            deleteJobSeekerSkillMock
              .mockRejectedValue(
                repositoryError
              );

            await expect(
              removeMySkill({
                userId,
                skillId
              })
            ).rejects.toBe(
              repositoryError
            );
          }
        );
      }
    );
  }
);
import {
  jest
} from "@jest/globals";

const findProfileMock =
  jest.fn();

const createProjectMock =
  jest.fn();

const findProjectsMock =
  jest.fn();

const findProjectByIdMock =
  jest.fn();

const updateProjectMock =
  jest.fn();

const deleteProjectMock =
  jest.fn();

jest.unstable_mockModule(
  "../../repositories/jobSeekerProfile.repository.js",
  () => ({
    findJobSeekerProfileByUserId:
      findProfileMock
  })
);

jest.unstable_mockModule(
  "../../repositories/jobSeekerProject.repository.js",
  () => ({
    default: {
      create:
        createProjectMock,

      findAllByProfileId:
        findProjectsMock,

      findByIdAndProfileId:
        findProjectByIdMock,

      update:
        updateProjectMock,

      delete:
        deleteProjectMock
    }
  })
);

const {
  default: projectService
} = await import(
  "../../services/jobSeekerProject.service.js"
);

describe(
  "Job seeker project service",
  () => {
    const userId = "user-1";
    const profileId = "profile-1";
    const projectId = "project-1";

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
          projectService.getProjects(
            userId
          )
        ).rejects.toEqual(
          expect.objectContaining({
            statusCode: 404,
            code:
              "JOB_SEEKER_PROFILE_NOT_FOUND"
          })
        );
      }
    );

    test(
      "creates a project",
      async () => {
        const projectData = {
          projectName:
            "CareerForge"
        };

        createProjectMock.mockResolvedValue({
          id: projectId,
          ...projectData
        });

        await projectService.createProject(
          userId,
          projectData
        );

        expect(
          createProjectMock
        ).toHaveBeenCalledWith({
          jobSeekerProfileId:
            profileId,
          ...projectData
        });
      }
    );

    test(
      "returns all projects",
      async () => {
        const projects = [
          {
            id: projectId
          }
        ];

        findProjectsMock.mockResolvedValue(
          projects
        );

        const result =
          await projectService.getProjects(
            userId
          );

        expect(
          findProjectsMock
        ).toHaveBeenCalledWith(
          profileId
        );

        expect(result).toBe(
          projects
        );
      }
    );

    test(
      "returns a project by ID",
      async () => {
        const project = {
          id: projectId
        };

        findProjectByIdMock
          .mockResolvedValue(
            project
          );

        const result =
          await projectService.getProjectById(
            userId,
            projectId
          );

        expect(
          findProjectByIdMock
        ).toHaveBeenCalledWith(
          projectId,
          profileId
        );

        expect(result).toBe(
          project
        );
      }
    );

    test(
      "throws when project does not exist",
      async () => {
        findProjectByIdMock
          .mockResolvedValue(
            null
          );

        await expect(
          projectService.getProjectById(
            userId,
            projectId
          )
        ).rejects.toEqual(
          expect.objectContaining({
            statusCode: 404,
            code:
              "JOB_SEEKER_PROJECT_NOT_FOUND"
          })
        );
      }
    );

    test(
      "updates a project",
      async () => {
        const project = {
          id: projectId
        };

        const projectData = {
          projectName:
            "Updated Project"
        };

        findProjectByIdMock
          .mockResolvedValue(
            project
          );

        updateProjectMock
          .mockResolvedValue({
            ...project,
            ...projectData
          });

        const result =
          await projectService.updateProject(
            userId,
            projectId,
            projectData
          );

        expect(
          updateProjectMock
        ).toHaveBeenCalledWith(
          project,
          projectData
        );

        expect(result.projectName).toBe(
          "Updated Project"
        );
      }
    );

    test(
      "deletes a project",
      async () => {
        const project = {
          id: projectId
        };

        findProjectByIdMock
          .mockResolvedValue(
            project
          );

        const result =
          await projectService.deleteProject(
            userId,
            projectId
          );

        expect(
          deleteProjectMock
        ).toHaveBeenCalledWith(
          project
        );

        expect(result).toEqual({
          message:
            "Project deleted successfully"
        });
      }
    );
  }
);
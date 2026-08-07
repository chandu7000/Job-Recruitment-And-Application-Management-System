import request from "supertest";
import { Op } from "sequelize";

import app from "../../app.js";

import User from "../../models/user.model.js";
import UserSession from "../../models/userSession.model.js";
import Company from "../../models/company.model.js";
import Job from "../../models/job.model.js";
import JobSeekerProfile from "../../models/jobSeekerProfile.model.js";
import Application from "../../models/application.model.js";
import ApplicationStatusHistory from "../../models/applicationStatusHistory.model.js";

import { hashPassword } from "../../utils/password.util.js";

const PASSWORD = "Strong@Password123";
const EMAIL_PREFIX = "p8app.";
const SLUG_PREFIX = "phase8-application-";

const uniqueValue = (label) =>
    `${label}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 10)}`;

const createEmail = (label) =>
    `${EMAIL_PREFIX}${uniqueValue(label)}@example.com`;

const createUser = async ({
    email,
    role
}) => {
    const passwordHash =
        await hashPassword(PASSWORD);

    return User.create({
        email,
        passwordHash,
        role,
        status: "ACTIVE",
        emailVerifiedAt: new Date()
    });
};

const login = async (email) => {
    const response =
        await request(app)
            .post("/api/auth/login")
            .set(
                "User-Agent",
                "CareerForge Phase 8 Application Integration Test"
            )
            .send({
                email,
                password: PASSWORD
            })
            .expect(200);

    return response.body.data.accessToken;
};

const createCandidateProfile = async (
    candidateId
) => {
    return JobSeekerProfile.create({
        userId: candidateId,
        firstName: "Chandra",
        lastName: "Sekhar",
        phoneNumber: "9876543210",
        location: "Vijayawada",
        headline:
            "Backend Developer",
        resumeUrl:
            "https://example.com/resume.pdf",
        resumePublicId:
            "phase8-resume-public-id",
        resumeOriginalName:
            "resume.pdf"
    });
};

const createCompany = async (
    recruiterId
) => {
    return Company.create({
        ownerId: recruiterId,
        companyName:
            "Phase 8 Application Company",
        slug:
            `${SLUG_PREFIX}${uniqueValue(
                "company"
            )}`,
        status: "VERIFIED"
    });
};

const createPublishedJob = async ({
    recruiterId,
    companyId
}) => {
    return Job.create({
        companyId,
        createdBy: recruiterId,
        title:
            "Phase 8 Software Engineer",
        slug:
            `${SLUG_PREFIX}${uniqueValue(
                "job"
            )}`,
        description:
            "Application integration test job.",
        responsibilities:
            "Develop backend services.",
        requirements:
            "Node.js and SQL knowledge.",
        skills: [
            "Node.js",
            "SQL"
        ],
        location: "Bengaluru",
        workMode: "HYBRID",
        employmentType: "FULL_TIME",
        experienceLevel: "JUNIOR",
        minimumExperience: 0,
        maximumExperience: 2,
        minimumSalary: 500000,
        maximumSalary: 900000,
        salaryCurrency: "INR",
        vacancies: 2,
        applicationDeadline:
            new Date(
                Date.now() +
                7 * 24 * 60 * 60 * 1000
            ),
        status: "PUBLISHED",
        publishedAt: new Date()
    });
};

const cleanup = async () => {
    const users =
        await User.unscoped().findAll({
            where: {
                email: {
                    [Op.like]:
                        `${EMAIL_PREFIX}%`
                }
            },
            attributes: ["id"]
        });

    const userIds =
        users.map((user) => user.id);

    if (userIds.length === 0) {
        return;
    }

    const applications =
        await Application.findAll({
            where: {
                candidateId: {
                    [Op.in]: userIds
                }
            },
            attributes: ["id"]
        });

    const applicationIds =
        applications.map(
            (application) =>
                application.id
        );

    if (
        applicationIds.length > 0
    ) {
        await ApplicationStatusHistory.destroy({
            where: {
                applicationId: {
                    [Op.in]:
                        applicationIds
                }
            },
            force: true
        });

        await Application.destroy({
            where: {
                id: {
                    [Op.in]:
                        applicationIds
                }
            },
            force: true
        });
    }

    await JobSeekerProfile.destroy({
        where: {
            userId: {
                [Op.in]: userIds
            }
        },
        force: true
    });

    await Job.unscoped().destroy({
        where: {
            createdBy: {
                [Op.in]: userIds
            }
        },
        force: true
    });

    await Company.unscoped().destroy({
        where: {
            ownerId: {
                [Op.in]: userIds
            }
        },
        force: true
    });

    await UserSession.unscoped().destroy({
        where: {
            userId: {
                [Op.in]: userIds
            }
        },
        force: true
    });

    await User.unscoped().destroy({
        where: {
            id: {
                [Op.in]: userIds
            }
        },
        force: true
    });
};

describe(
    "Phase 8 Candidate Applications API",
    () => {
        beforeEach(cleanup);
        afterEach(cleanup);

        test(
            "eligible job seeker can apply and retrieve application details",
            async () => {
                const recruiterEmail =
                    createEmail("recruiter");

                const candidateEmail =
                    createEmail("candidate");

                const recruiter =
                    await createUser({
                        email:
                            recruiterEmail,
                        role: "RECRUITER"
                    });

                const candidate =
                    await createUser({
                        email:
                            candidateEmail,
                        role: "JOB_SEEKER"
                    });

                await createCandidateProfile(
                    candidate.id
                );

                const company =
                    await createCompany(
                        recruiter.id
                    );

                const job =
                    await createPublishedJob({
                        recruiterId:
                            recruiter.id,
                        companyId:
                            company.id
                    });

                const token =
                    await login(
                        candidateEmail
                    );

                const applyResponse =
                    await request(app)
                        .post(
                            `/api/job-seeker/applications/jobs/${job.id}`
                        )
                        .set(
                            "Authorization",
                            `Bearer ${token}`
                        )
                        .send({
                            coverLetter:
                                "I am interested in this role."
                        })
                        .expect(201);

                expect(
                    applyResponse.body.success
                ).toBe(true);

                expect(
                    applyResponse.body.data
                        .application.status
                ).toBe("APPLIED");

                const applicationId =
                    applyResponse.body.data
                        .application.id;

                const application =
                    await Application.findByPk(
                        applicationId
                    );

                expect(
                    application
                ).not.toBeNull();

                expect(
                    application.resumeSnapshot
                ).toBeDefined();

                expect(
                    application.jobSnapshot
                ).toBeDefined();

                const history =
                    await ApplicationStatusHistory.findAll({
                        where: {
                            applicationId
                        }
                    });

                expect(history).toHaveLength(1);

                expect(
                    history[0].newStatus
                ).toBe("APPLIED");

                const listResponse =
                    await request(app)
                        .get(
                            "/api/job-seeker/applications"
                        )
                        .set(
                            "Authorization",
                            `Bearer ${token}`
                        )
                        .expect(200);

                expect(
                    listResponse.body.data
                        .applications
                ).toHaveLength(1);

                const detailsResponse =
                    await request(app)
                        .get(
                            `/api/job-seeker/applications/${applicationId}`
                        )
                        .set(
                            "Authorization",
                            `Bearer ${token}`
                        )
                        .expect(200);

                expect(
                    detailsResponse.body.data
                        .application.id
                ).toBe(applicationId);

                expect(
                    detailsResponse.body.data
                        .application
                        .statusHistory
                ).toHaveLength(1);
            }
        );

        test(
            "prevents duplicate applications",
            async () => {
                const recruiterEmail =
                    createEmail("duplicate-recruiter");

                const candidateEmail =
                    createEmail("duplicate-candidate");

                const recruiter =
                    await createUser({
                        email:
                            recruiterEmail,
                        role: "RECRUITER"
                    });

                const candidate =
                    await createUser({
                        email:
                            candidateEmail,
                        role: "JOB_SEEKER"
                    });

                await createCandidateProfile(
                    candidate.id
                );

                const company =
                    await createCompany(
                        recruiter.id
                    );

                const job =
                    await createPublishedJob({
                        recruiterId:
                            recruiter.id,
                        companyId:
                            company.id
                    });

                const token =
                    await login(
                        candidateEmail
                    );

                await request(app)
                    .post(
                        `/api/job-seeker/applications/jobs/${job.id}`
                    )
                    .set(
                        "Authorization",
                        `Bearer ${token}`
                    )
                    .send({})
                    .expect(201);

                const response =
                    await request(app)
                        .post(
                            `/api/job-seeker/applications/jobs/${job.id}`
                        )
                        .set(
                            "Authorization",
                            `Bearer ${token}`
                        )
                        .send({})
                        .expect(409);

                expect(
                    response.body.code
                ).toBe(
                    "APPLICATION_ALREADY_EXISTS"
                );
            }
        );

        test(
            "rejects an applicant without a completed profile and resume",
            async () => {
                const recruiterEmail =
                    createEmail("invalid-recruiter");

                const candidateEmail =
                    createEmail("invalid-candidate");

                const recruiter =
                    await createUser({
                        email:
                            recruiterEmail,
                        role: "RECRUITER"
                    });

                await createUser({
                    email: candidateEmail,
                    role: "JOB_SEEKER"
                });

                const company =
                    await createCompany(
                        recruiter.id
                    );

                const job =
                    await createPublishedJob({
                        recruiterId:
                            recruiter.id,
                        companyId:
                            company.id
                    });

                const token =
                    await login(
                        candidateEmail
                    );

                const response =
                    await request(app)
                        .post(
                            `/api/job-seeker/applications/jobs/${job.id}`
                        )
                        .set(
                            "Authorization",
                            `Bearer ${token}`
                        )
                        .send({})
                        .expect(422);

                expect(
                    response.body.code
                ).toBe(
                    "APPLICANT_PROFILE_REQUIRED"
                );
            }
        );
    }
);
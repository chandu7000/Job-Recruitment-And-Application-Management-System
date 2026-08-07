import request from "supertest";
import { Op } from "sequelize";

import app from "../../app.js";

import User from "../../models/user.model.js";
import UserSession from "../../models/userSession.model.js";
import Company from "../../models/company.model.js";
import Job from "../../models/job.model.js";
import Application from "../../models/application.model.js";
import ApplicationStatusHistory from "../../models/applicationStatusHistory.model.js";

import { hashPassword } from "../../utils/password.util.js";

const PASSWORD = "Strong@Password123";
const EMAIL_PREFIX = "p8ra.";
const SLUG_PREFIX =
    "phase8-recruiter-application-";

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
                "CareerForge Recruiter Application Integration Test"
            )
            .send({
                email,
                password: PASSWORD
            })
            .expect(200);

    return response.body.data.accessToken;
};

const createCompany = async (
    recruiterId
) => {
    return Company.create({
        ownerId: recruiterId,
        companyName:
            "Recruiter Application Test Company",
        slug:
            `${SLUG_PREFIX}${uniqueValue(
                "company"
            )}`,
        status: "VERIFIED"
    });
};

const createJob = async ({
    recruiterId,
    companyId
}) => {
    return Job.create({
        companyId,
        createdBy: recruiterId,
        title:
            "Recruiter Applicant Test Job",
        slug:
            `${SLUG_PREFIX}${uniqueValue(
                "job"
            )}`,
        description:
            "Recruiter application integration test.",
        skills: ["Node.js"],
        location: "Hyderabad",
        workMode: "REMOTE",
        employmentType: "FULL_TIME",
        experienceLevel: "JUNIOR",
        minimumExperience: 0,
        maximumExperience: 2,
        minimumSalary: 400000,
        maximumSalary: 700000,
        salaryCurrency: "INR",
        vacancies: 1,
        applicationDeadline:
            new Date(
                Date.now() +
                7 * 24 * 60 * 60 * 1000
            ),
        status: "PUBLISHED",
        publishedAt: new Date()
    });
};

const createApplication = async ({
    candidateId,
    job,
    company
}) => {
    const application =
        await Application.create({
            candidateId,
            jobId: job.id,
            companyId: company.id,
            status: "APPLIED",
            coverLetter:
                "Recruiter integration test cover letter.",
            resumeSnapshot: {
                url:
                    "https://example.com/resume.pdf",
                originalName:
                    "resume.pdf"
            },
            candidateSnapshot: {
                firstName: "Test",
                lastName: "Candidate",
                email:
                    "candidate@example.com",
                skills: [
                    "Node.js",
                    "SQL"
                ],
                experience: 1
            },
            jobSnapshot: {
                id: job.id,
                title: job.title,
                location: job.location
            },
            companySnapshot: {
                id: company.id,
                name:
                    company.companyName
            },
            salarySnapshot: {
                minimum: 400000,
                maximum: 700000,
                currency: "INR"
            }
        });

    await ApplicationStatusHistory.create({
        applicationId:
            application.id,
        previousStatus: null,
        newStatus: "APPLIED",
        changedBy: candidateId,
        reason:
            "Application submitted."
    });

    return application;
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
    "Phase 8 Recruiter Applications API",
    () => {
        beforeEach(cleanup);
        afterEach(cleanup);

        test(
            "recruiter can list and view applicants for an owned job",
            async () => {
                const recruiterEmail =
                    createEmail("owner");

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

                const company =
                    await createCompany(
                        recruiter.id
                    );

                const job =
                    await createJob({
                        recruiterId:
                            recruiter.id,
                        companyId:
                            company.id
                    });

                const application =
                    await createApplication({
                        candidateId:
                            candidate.id,
                        job,
                        company
                    });

                const token =
                    await login(
                        recruiterEmail
                    );

                const listResponse =
                    await request(app)
                        .get(
                            "/api/recruiter/applications"
                        )
                        .set(
                            "Authorization",
                            `Bearer ${token}`
                        )
                        .expect(200);

                expect(
                    listResponse.body.success
                ).toBe(true);

                expect(
                    listResponse.body.data
                        .applications
                ).toHaveLength(1);

                const detailsResponse =
                    await request(app)
                        .get(
                            `/api/recruiter/applications/${application.id}`
                        )
                        .set(
                            "Authorization",
                            `Bearer ${token}`
                        )
                        .expect(200);

                expect(
                    detailsResponse.body.data
                        .application.id
                ).toBe(application.id);

                expect(
                    detailsResponse.body.data
                        .application
                        .statusHistory
                ).toHaveLength(1);
            }
        );

        test(
            "recruiter can add, update, and clear private notes",
            async () => {
                const recruiterEmail =
                    createEmail("notes-owner");

                const candidateEmail =
                    createEmail("notes-candidate");

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

                const company =
                    await createCompany(
                        recruiter.id
                    );

                const job =
                    await createJob({
                        recruiterId:
                            recruiter.id,
                        companyId:
                            company.id
                    });

                const application =
                    await createApplication({
                        candidateId:
                            candidate.id,
                        job,
                        company
                    });

                const token =
                    await login(
                        recruiterEmail
                    );

                const notesResponse =
                    await request(app)
                        .put(
                            `/api/recruiter/applications/${application.id}/notes`
                        )
                        .set(
                            "Authorization",
                            `Bearer ${token}`
                        )
                        .send({
                            notes:
                                "Strong backend candidate."
                        })
                        .expect(200);

                expect(
                    notesResponse.body.data
                        .application
                        .recruiterNotes
                ).toBe(
                    "Strong backend candidate."
                );

                const clearResponse =
                    await request(app)
                        .put(
                            `/api/recruiter/applications/${application.id}/notes`
                        )
                        .set(
                            "Authorization",
                            `Bearer ${token}`
                        )
                        .send({
                            notes: null
                        })
                        .expect(200);

                expect(
                    clearResponse.body.data
                        .application
                        .recruiterNotes
                ).toBeNull();
            }
        );

        test(
            "another recruiter cannot access an application they do not own",
            async () => {
                const ownerEmail =
                    createEmail("real-owner");

                const otherEmail =
                    createEmail("other-recruiter");

                const candidateEmail =
                    createEmail("ownership-candidate");

                const owner =
                    await createUser({
                        email: ownerEmail,
                        role: "RECRUITER"
                    });

                await createUser({
                    email: otherEmail,
                    role: "RECRUITER"
                });

                const candidate =
                    await createUser({
                        email:
                            candidateEmail,
                        role: "JOB_SEEKER"
                    });

                const company =
                    await createCompany(
                        owner.id
                    );

                const job =
                    await createJob({
                        recruiterId:
                            owner.id,
                        companyId:
                            company.id
                    });

                const application =
                    await createApplication({
                        candidateId:
                            candidate.id,
                        job,
                        company
                    });

                const otherToken =
                    await login(otherEmail);

                const response =
                    await request(app)
                        .get(
                            `/api/recruiter/applications/${application.id}`
                        )
                        .set(
                            "Authorization",
                            `Bearer ${otherToken}`
                        )
                        .expect(403);

                expect(
                    response.body.code
                ).toBe(
                    "APPLICATION_OWNERSHIP_REQUIRED"
                );
            }
        );
    }
);
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
const EMAIL_PREFIX = "p8as.";
const SLUG_PREFIX =
    "phase8-application-status-";

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
                "CareerForge Application Status Integration Test"
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
            "Application Status Company",
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
            "Application Status Test Job",
        slug:
            `${SLUG_PREFIX}${uniqueValue(
                "job"
            )}`,
        description:
            "Application status integration test.",
        skills: ["JavaScript"],
        location: "Chennai",
        workMode: "HYBRID",
        employmentType: "FULL_TIME",
        experienceLevel: "JUNIOR",
        minimumExperience: 0,
        maximumExperience: 2,
        minimumSalary: 400000,
        maximumSalary: 800000,
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
            resumeSnapshot: {
                url:
                    "https://example.com/resume.pdf"
            },
            candidateSnapshot: {
                firstName: "Status",
                lastName: "Candidate",
                email:
                    "status.candidate@example.com"
            },
            jobSnapshot: {
                id: job.id,
                title: job.title
            },
            companySnapshot: {
                id: company.id,
                name:
                    company.companyName
            },
            salarySnapshot: {
                minimum: 400000,
                maximum: 800000,
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
    "Phase 8 Application Status Workflow API",
    () => {
        beforeEach(cleanup);
        afterEach(cleanup);

        test(
            "recruiter can move an application from APPLIED to UNDER_REVIEW",
            async () => {
                const recruiterEmail =
                    createEmail("status-owner");

                const candidateEmail =
                    createEmail("status-candidate");

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

                const response =
                    await request(app)
                        .patch(
                            `/api/recruiter/applications/${application.id}/status`
                        )
                        .set(
                            "Authorization",
                            `Bearer ${token}`
                        )
                        .send({
                            status:
                                "UNDER_REVIEW",
                            reason:
                                "Profile review started."
                        })
                        .expect(200);

                expect(
                    response.body.data
                        .application.status
                ).toBe("UNDER_REVIEW");

                await application.reload();

                expect(
                    application.status
                ).toBe("UNDER_REVIEW");

                const history =
                    await ApplicationStatusHistory.findAll({
                        where: {
                            applicationId:
                                application.id
                        },
                        order: [
                            [
                                "createdAt",
                                "ASC"
                            ]
                        ]
                    });

                expect(history).toHaveLength(2);

                const updatedHistory =
                    history.find(
                        (item) =>
                            item.newStatus ===
                            "UNDER_REVIEW"
                    );

                expect(updatedHistory).toBeDefined();

                expect(
                    updatedHistory.previousStatus
                ).toBe("APPLIED");

                expect(
                    updatedHistory.newStatus
                ).toBe("UNDER_REVIEW");
            }
        );

        test(
            "rejects an invalid application status transition",
            async () => {
                const recruiterEmail =
                    createEmail("invalid-owner");

                const candidateEmail =
                    createEmail("invalid-candidate");

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

                await application.update({
                    status: "REJECTED"
                });

                const token =
                    await login(
                        recruiterEmail
                    );

                const response =
                    await request(app)
                        .patch(
                            `/api/recruiter/applications/${application.id}/status`
                        )
                        .set(
                            "Authorization",
                            `Bearer ${token}`
                        )
                        .send({
                            status:
                                "UNDER_REVIEW"
                        })
                        .expect(409);

                expect(
                    response.body.code
                ).toBe(
                    "INVALID_APPLICATION_STATUS_TRANSITION"
                );
            }
        );

        test(
            "recruiter can retrieve complete application status history",
            async () => {
                const recruiterEmail =
                    createEmail("history-owner");

                const candidateEmail =
                    createEmail("history-candidate");

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

                await request(app)
                    .patch(
                        `/api/recruiter/applications/${application.id}/status`
                    )
                    .set(
                        "Authorization",
                        `Bearer ${token}`
                    )
                    .send({
                        status:
                            "UNDER_REVIEW",
                        reason:
                            "Initial review."
                    })
                    .expect(200);

                const response =
                    await request(app)
                        .get(
                            `/api/recruiter/applications/${application.id}/history`
                        )
                        .set(
                            "Authorization",
                            `Bearer ${token}`
                        )
                        .expect(200);

                expect(
                    response.body.data
                        .history
                ).toHaveLength(2);

                const historyStatuses =
                    response.body.data.history.map(
                        (historyItem) =>
                            historyItem.newStatus
                    );

                expect(historyStatuses).toEqual(
                    expect.arrayContaining([
                        "APPLIED",
                        "UNDER_REVIEW"
                    ])
                );
            }
        );
    }
);
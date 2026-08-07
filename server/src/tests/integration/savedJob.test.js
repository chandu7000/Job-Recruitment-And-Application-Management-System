import request from "supertest";
import { Op } from "sequelize";

import app from "../../app.js";

import User from "../../models/user.model.js";
import UserSession from "../../models/userSession.model.js";
import Company from "../../models/company.model.js";
import Job from "../../models/job.model.js";
import SavedJob from "../../models/savedJob.model.js";

import { hashPassword } from "../../utils/password.util.js";

const PASSWORD = "Strong@Password123";
const EMAIL_PREFIX = "p8sj.";
const SLUG_PREFIX = "phase8-saved-job-";

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
                "CareerForge Phase 8 Saved Job Integration Test"
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
            "Phase 8 Saved Job Company",
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
            "Phase 8 Backend Developer",
        slug:
            `${SLUG_PREFIX}${uniqueValue(
                "job"
            )}`,
        description:
            "Backend developer integration test job.",
        responsibilities:
            "Develop and maintain backend APIs.",
        requirements:
            "JavaScript and Node.js knowledge.",
        skills: [
            "JavaScript",
            "Node.js"
        ],
        location: "Hyderabad",
        workMode: "HYBRID",
        employmentType: "FULL_TIME",
        experienceLevel: "JUNIOR",
        minimumExperience: 0,
        maximumExperience: 2,
        minimumSalary: 400000,
        maximumSalary: 700000,
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

    await SavedJob.destroy({
        where: {
            candidateId: {
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
    "Phase 8 Saved Jobs API",
    () => {
        beforeEach(cleanup);
        afterEach(cleanup);

        test(
            "job seeker can save, list, and remove a published job",
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

                const saveResponse =
                    await request(app)
                        .post(
                            `/api/job-seeker/saved-jobs/${job.id}`
                        )
                        .set(
                            "Authorization",
                            `Bearer ${token}`
                        )
                        .expect(201);

                expect(
                    saveResponse.body.success
                ).toBe(true);

                expect(
                    saveResponse.body.data
                        .savedJob.jobId
                ).toBe(job.id);

                const savedRecord =
                    await SavedJob.findOne({
                        where: {
                            candidateId:
                                candidate.id,
                            jobId: job.id
                        }
                    });

                expect(
                    savedRecord
                ).not.toBeNull();

                const listResponse =
                    await request(app)
                        .get(
                            "/api/job-seeker/saved-jobs"
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
                        .savedJobs
                ).toHaveLength(1);

                await request(app)
                    .delete(
                        `/api/job-seeker/saved-jobs/${job.id}`
                    )
                    .set(
                        "Authorization",
                        `Bearer ${token}`
                    )
                    .expect(200);

                const removedRecord =
                    await SavedJob.findOne({
                        where: {
                            candidateId:
                                candidate.id,
                            jobId: job.id
                        }
                    });

                expect(
                    removedRecord
                ).toBeNull();
            }
        );

        test(
            "prevents a duplicate saved job",
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

                await request(app)
                    .post(
                        `/api/job-seeker/saved-jobs/${job.id}`
                    )
                    .set(
                        "Authorization",
                        `Bearer ${token}`
                    )
                    .expect(201);

                const response =
                    await request(app)
                        .post(
                            `/api/job-seeker/saved-jobs/${job.id}`
                        )
                        .set(
                            "Authorization",
                            `Bearer ${token}`
                        )
                        .expect(409);

                expect(
                    response.body.code
                ).toBe(
                    "JOB_ALREADY_SAVED"
                );
            }
        );

        test(
            "rejects unauthenticated saved-job access",
            async () => {
                await request(app)
                    .get(
                        "/api/job-seeker/saved-jobs"
                    )
                    .expect(401);
            }
        );
    }
);
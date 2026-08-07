import {
    jest
} from "@jest/globals";

const findByPkMock =
    jest.fn();

const findOneMock =
    jest.fn();

const incrementMock =
    jest.fn();

jest.unstable_mockModule(
    "../../models/job.model.js",
    () => ({
        default: {
            findByPk:
                findByPkMock,

            findOne:
                findOneMock,

            increment:
                incrementMock
        }
    })
);

const {
    PUBLIC_JOB_DETAIL_ATTRIBUTES,
    PUBLIC_COMPANY_DETAIL_ATTRIBUTES,
    buildPublicCompanyDetailInclude,
    findPublicJobCandidateById,
    findPublicJobCandidateBySlug,
    incrementPublicJobView
} = await import(
    "../../repositories/publicJob.repository.js"
);

describe(
    "Public job details repository",
    () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        test(
            "defines safe detail query attributes",
            () => {
                expect(
                    PUBLIC_JOB_DETAIL_ATTRIBUTES
                ).toEqual(
                    expect.arrayContaining([
                        "id",
                        "description",
                        "responsibilities",
                        "requirements",
                        "status",
                        "deletedAt",
                    ])
                );

                expect(
                    PUBLIC_JOB_DETAIL_ATTRIBUTES
                ).not.toContain(
                    "createdBy"
                );

                expect(
                    PUBLIC_JOB_DETAIL_ATTRIBUTES
                ).not.toContain(
                    "removalReason"
                );
            }
        );

        test(
            "defines company eligibility attributes without owner data",
            () => {
                expect(
                    PUBLIC_COMPANY_DETAIL_ATTRIBUTES
                ).toEqual(
                    expect.arrayContaining([
                        "id",
                        "companyName",
                        "status",
                        "deletedAt"
                    ])
                );

                expect(
                    PUBLIC_COMPANY_DETAIL_ATTRIBUTES
                ).not.toContain(
                    "ownerId"
                );

                expect(
                    PUBLIC_COMPANY_DETAIL_ATTRIBUTES
                ).not.toContain(
                    "verificationReason"
                );
            }
        );

        test(
            "builds an optional non-paranoid company include",
            () => {
                expect(
                    buildPublicCompanyDetailInclude()
                ).toEqual(
                    expect.objectContaining({
                        association:
                            "company",

                        required:
                            false,

                        paranoid:
                            false
                    })
                );
            }
        );

        test(
            "finds a public job candidate by ID",
            async () => {
                const job = {
                    id:
                        "11111111-1111-4111-8111-111111111111"
                };

                findByPkMock
                    .mockResolvedValue(
                        job
                    );

                const result =
                    await findPublicJobCandidateById(
                        job.id
                    );

                expect(result).toBe(
                    job
                );

                expect(
                    findByPkMock
                ).toHaveBeenCalledWith(
                    job.id,
                    expect.objectContaining({
                        paranoid:
                            false,

                        attributes:
                            PUBLIC_JOB_DETAIL_ATTRIBUTES
                    })
                );
            }
        );

        test(
            "finds a public job candidate by slug",
            async () => {
                findOneMock
                    .mockResolvedValue({
                        id:
                            "11111111-1111-4111-8111-111111111111"
                    });

                await findPublicJobCandidateBySlug(
                    "java-developer"
                );

                expect(
                    findOneMock
                ).toHaveBeenCalledWith(
                    expect.objectContaining({
                        where: {
                            slug:
                                "java-developer"
                        },

                        paranoid:
                            false
                    })
                );
            }
        );

        test(
            "increments a public job view atomically",
            async () => {
                incrementMock
                    .mockResolvedValue([
                        1
                    ]);

                const jobId =
                    "11111111-1111-4111-8111-111111111111";

                await expect(
                    incrementPublicJobView(
                        jobId
                    )
                ).resolves.toBe(true);

                expect(
                    incrementMock
                ).toHaveBeenCalledWith(
                    "viewCount",
                    {
                        by: 1,

                        where: {
                            id:
                                jobId
                        },

                        transaction:
                            undefined
                    }
                );
            }
        );

        test(
            "propagates repository failures",
            async () => {
                const error =
                    new Error(
                        "Database unavailable"
                    );

                findByPkMock
                    .mockRejectedValue(
                        error
                    );

                await expect(
                    findPublicJobCandidateById(
                        "11111111-1111-4111-8111-111111111111"
                    )
                ).rejects.toBe(
                    error
                );
            }
        );
    }
);
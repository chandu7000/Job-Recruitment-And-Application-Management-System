import {
    jest
} from "@jest/globals";

const findByIdMock =
    jest.fn();

const findBySlugMock =
    jest.fn();

const incrementViewMock =
    jest.fn();

const sanitizeDetailMock =
    jest.fn();

const validateEligibilityMock =
    jest.fn();

jest.unstable_mockModule(
    "../../repositories/publicJob.repository.js",
    () => ({
        findEligiblePublicJobs:
            jest.fn(),

        countEligiblePublicJobs:
            jest.fn(),

        findPublicJobCandidateById:
            findByIdMock,

        findPublicJobCandidateBySlug:
            findBySlugMock,

        incrementPublicJobView:
            incrementViewMock
    })
);

jest.unstable_mockModule(
    "../../utils/publicResponseSanitizer.js",
    () => ({
        sanitizePublicJobList:
            jest.fn(),

        sanitizePublicJobDetail:
            sanitizeDetailMock
    })
);

jest.unstable_mockModule(
    "../../utils/publicJobEligibility.js",
    () => ({
        validatePublicJobEligibility:
            validateEligibilityMock
    })
);

const {
    getPublicJobById,
    getPublicJobBySlug
} = await import(
    "../../services/publicJob.service.js"
);

describe(
    "Public job details service",
    () => {
        const company = {
            id:
                "22222222-2222-4222-8222-222222222222",

            status:
                "VERIFIED"
        };

        const job = {
            id:
                "11111111-1111-4111-8111-111111111111",

            slug:
                "java-developer",

            status:
                "PUBLISHED",

            viewCount:
                7,

            company
        };

        beforeEach(() => {
            jest.clearAllMocks();

            validateEligibilityMock
                .mockImplementation(
                    () => true
                );

            findByIdMock
                .mockResolvedValue(
                    job
                );

            findBySlugMock
                .mockResolvedValue(
                    job
                );

            incrementViewMock
                .mockResolvedValue(
                    true
                );

            sanitizeDetailMock
                .mockReturnValue({
                    id:
                        job.id,

                    slug:
                        job.slug,

                    viewCount:
                        7,

                    company: {
                        id:
                            company.id
                    }
                });
        });

        test(
            "fetches an eligible job by ID",
            async () => {
                const now =
                    new Date(
                        "2026-08-04T10:00:00.000Z"
                    );

                const result =
                    await getPublicJobById({
                        jobId:
                            job.id,

                        now
                    });

                expect(
                    findByIdMock
                ).toHaveBeenCalledWith(
                    job.id
                );

                expect(
                    validateEligibilityMock
                ).toHaveBeenCalledWith(
                    job,
                    company,
                    {
                        now
                    }
                );

                expect(
                    incrementViewMock
                ).toHaveBeenCalledWith(
                    job.id
                );

                expect(
                    result.viewCount
                ).toBe(8);
            }
        );

        test(
            "fetches an eligible job by slug",
            async () => {
                await getPublicJobBySlug({
                    slug:
                        job.slug
                });

                expect(
                    findBySlugMock
                ).toHaveBeenCalledWith(
                    job.slug
                );
            }
        );

        test(
            "does not increment when eligibility fails",
            async () => {
                validateEligibilityMock
                    .mockImplementation(() => {
                        const error =
                            new Error(
                                "Public job not found."
                            );

                        error.statusCode =
                            404;

                        error.code =
                            "PUBLIC_JOB_NOT_FOUND";

                        throw error;
                    });

                await expect(
                    getPublicJobById({
                        jobId:
                            job.id
                    })
                ).rejects.toMatchObject({
                    statusCode:
                        404,

                    code:
                        "PUBLIC_JOB_NOT_FOUND"
                });

                expect(
                    incrementViewMock
                ).not.toHaveBeenCalled();
            }
        );

        test(
            "maps lookup failures to a controlled error",
            async () => {
                findByIdMock
                    .mockRejectedValue(
                        new Error(
                            "Database failed"
                        )
                    );

                await expect(
                    getPublicJobById({
                        jobId:
                            job.id
                    })
                ).rejects.toMatchObject({
                    statusCode:
                        500,

                    code:
                        "PUBLIC_JOB_DETAILS_FETCH_FAILED"
                });
            }
        );

        test(
            "maps view update failures to a controlled error",
            async () => {
                incrementViewMock
                    .mockRejectedValue(
                        new Error(
                            "Increment failed"
                        )
                    );

                await expect(
                    getPublicJobById({
                        jobId:
                            job.id
                    })
                ).rejects.toMatchObject({
                    statusCode:
                        500,

                    code:
                        "PUBLIC_JOB_VIEW_UPDATE_FAILED"
                });
            }
        );

        test(
            "sanitizes the public detail response",
            async () => {
                const result =
                    await getPublicJobById({
                        jobId:
                            job.id
                    });

                expect(
                    sanitizeDetailMock
                ).toHaveBeenCalledWith(
                    job
                );

                expect(result).toEqual({
                    id:
                        job.id,

                    slug:
                        job.slug,

                    viewCount:
                        8,

                    company: {
                        id:
                            company.id
                    }
                });
            }
        );
    }
);
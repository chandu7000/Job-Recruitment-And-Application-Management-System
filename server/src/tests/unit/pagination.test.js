import {
    getPagination,
    getPaginationMeta
} from "../../utils/pagination.js";

describe(
    "Pagination utility",
    () => {
        describe(
            "getPagination",
            () => {
                test(
                    "returns default pagination values",
                    () => {
                        expect(
                            getPagination()
                        ).toEqual({
                            page:
                                1,

                            limit:
                                10,

                            offset:
                                0
                        });
                    }
                );

                test(
                    "parses page and limit from query",
                    () => {
                        expect(
                            getPagination({
                                page:
                                    "3",

                                limit:
                                    "20"
                            })
                        ).toEqual({
                            page:
                                3,

                            limit:
                                20,

                            offset:
                                40
                        });
                    }
                );

                test(
                    "calculates offset correctly",
                    () => {
                        const result =
                            getPagination({
                                page:
                                    "5",

                                limit:
                                    "15"
                            });

                        expect(
                            result.offset
                        ).toBe(
                            60
                        );
                    }
                );

                test(
                    "uses default limit when limit is zero",
                    () => {
                        expect(
                            getPagination({
                                limit:
                                    "0"
                            }).limit
                        ).toBe(
                            10
                        );
                    }
                );



                test.each([
                    "",
                    "abc",
                    null,
                    undefined
                ])(
                    "uses default page for invalid page value %p",
                    (page) => {
                        expect(
                            getPagination({
                                page
                            }).page
                        ).toBe(
                            1
                        );
                    }
                );



                test.each([
                    "",
                    "abc",
                    null,
                    undefined
                ])(
                    "uses default limit for invalid limit value %p",
                    (limit) => {
                        expect(
                            getPagination({
                                limit
                            }).limit
                        ).toBe(
                            10
                        );
                    }
                );

                test(
                    "caps limit at maximum 100",
                    () => {
                        expect(
                            getPagination({
                                limit:
                                    "500"
                            }).limit
                        ).toBe(
                            100
                        );
                    }
                );

                test(
                    "allows maximum limit 100",
                    () => {
                        expect(
                            getPagination({
                                limit:
                                    "100"
                            }).limit
                        ).toBe(
                            100
                        );
                    }
                );

                test(
                    "parses integer part of decimal-like strings",
                    () => {
                        expect(
                            getPagination({
                                page:
                                    "3.9",

                                limit:
                                    "20.8"
                            })
                        ).toEqual({
                            page:
                                3,

                            limit:
                                20,

                            offset:
                                40
                        });
                    }
                );

                test(
                    "handles query object with unrelated fields",
                    () => {
                        expect(
                            getPagination({
                                search:
                                    "Java"
                            })
                        ).toEqual({
                            page:
                                1,

                            limit:
                                10,

                            offset:
                                0
                        });
                    }
                );
            }
        );

        describe(
            "getPaginationMeta",
            () => {
                test(
                    "returns metadata for the first page",
                    () => {
                        expect(
                            getPaginationMeta(
                                1,
                                10,
                                35
                            )
                        ).toEqual({
                            page:
                                1,

                            limit:
                                10,

                            offset:
                                0,

                            totalRecords:
                                35,

                            totalPages:
                                4,

                            hasPreviousPage:
                                false,

                            hasNextPage:
                                true
                        });
                    }
                );

                test(
                    "returns metadata for a middle page",
                    () => {
                        expect(
                            getPaginationMeta(
                                2,
                                10,
                                35
                            )
                        ).toEqual({
                            page:
                                2,

                            limit:
                                10,

                            offset:
                                10,

                            totalRecords:
                                35,

                            totalPages:
                                4,

                            hasPreviousPage:
                                true,

                            hasNextPage:
                                true
                        });
                    }
                );

                test(
                    "returns metadata for the last page",
                    () => {
                        expect(
                            getPaginationMeta(
                                4,
                                10,
                                35
                            )
                        ).toEqual({
                            page:
                                4,

                            limit:
                                10,

                            offset:
                                30,

                            totalRecords:
                                35,

                            totalPages:
                                4,

                            hasPreviousPage:
                                true,

                            hasNextPage:
                                false
                        });
                    }
                );

                test(
                    "returns one total page when there are no records",
                    () => {
                        expect(
                            getPaginationMeta(
                                1,
                                10,
                                0
                            )
                        ).toEqual({
                            page:
                                1,

                            limit:
                                10,

                            offset:
                                0,

                            totalRecords:
                                0,

                            totalPages:
                                1,

                            hasPreviousPage:
                                false,

                            hasNextPage:
                                false
                        });
                    }
                );

                test(
                    "calculates exact page division",
                    () => {
                        expect(
                            getPaginationMeta(
                                2,
                                10,
                                20
                            )
                        ).toEqual({
                            page:
                                2,

                            limit:
                                10,

                            offset:
                                10,

                            totalRecords:
                                20,

                            totalPages:
                                2,

                            hasPreviousPage:
                                true,

                            hasNextPage:
                                false
                        });
                    }
                );

                test(
                    "calculates one page for fewer records than limit",
                    () => {
                        expect(
                            getPaginationMeta(
                                1,
                                10,
                                5
                            )
                        ).toEqual({
                            page:
                                1,

                            limit:
                                10,

                            offset:
                                0,

                            totalRecords:
                                5,

                            totalPages:
                                1,

                            hasPreviousPage:
                                false,

                            hasNextPage:
                                false
                        });
                    }
                );

                test(
                    "marks a page greater than one as having a previous page",
                    () => {
                        const result =
                            getPaginationMeta(
                                3,
                                10,
                                100
                            );

                        expect(
                            result.hasPreviousPage
                        ).toBe(true);
                    }
                );

                test(
                    "marks a page before total pages as having a next page",
                    () => {
                        const result =
                            getPaginationMeta(
                                3,
                                10,
                                100
                            );

                        expect(
                            result.hasNextPage
                        ).toBe(true);
                    }
                );
            }
        );
    }
);
import {
    DEFAULT_TOKEN_BYTES,
    TOKEN_HASH_ALGORITHM,
    generateSecureToken,
    hashToken,
    generateTokenId,
    generateTokenFamilyId
} from "../../utils/token.util.js";

describe(
    "token utility",
    () => {
        describe(
            "constants",
            () => {
                test(
                    "uses the expected default token byte length",
                    () => {
                        expect(
                            DEFAULT_TOKEN_BYTES
                        ).toBe(32);
                    }
                );

                test(
                    "uses SHA-256 for token hashing",
                    () => {
                        expect(
                            TOKEN_HASH_ALGORITHM
                        ).toBe("sha256");
                    }
                );
            }
        );

        describe(
            "generateSecureToken",
            () => {
                test(
                    "generates a token using the default byte length",
                    () => {
                        const token =
                            generateSecureToken();

                        expect(
                            typeof token
                        ).toBe("string");

                        expect(token).toMatch(
                            /^[a-f0-9]+$/
                        );

                        expect(
                            token.length
                        ).toBe(
                            DEFAULT_TOKEN_BYTES * 2
                        );
                    }
                );

                test(
                    "generates a token using a custom valid byte length",
                    () => {
                        const token =
                            generateSecureToken(16);

                        expect(token).toMatch(
                            /^[a-f0-9]{32}$/
                        );
                    }
                );

                test(
                    "generates different tokens on separate calls",
                    () => {
                        const firstToken =
                            generateSecureToken();

                        const secondToken =
                            generateSecureToken();

                        expect(
                            firstToken
                        ).not.toBe(
                            secondToken
                        );
                    }
                );

                test.each([
                    15,
                    129,
                    16.5,
                    "32",
                    null,
                    undefined
                ])(
                    "rejects invalid byte length: %p",
                    (byteLength) => {
                        if (
                            byteLength === undefined
                        ) {
                            return;
                        }

                        expect(() =>
                            generateSecureToken(
                                byteLength
                            )
                        ).toThrow(
                            TypeError
                        );

                        expect(() =>
                            generateSecureToken(
                                byteLength
                            )
                        ).toThrow(
                            "Token byte length must be an integer between 16 and 128."
                        );
                    }
                );

                test(
                    "allows the minimum supported byte length",
                    () => {
                        const token =
                            generateSecureToken(16);

                        expect(
                            token.length
                        ).toBe(32);
                    }
                );

                test(
                    "allows the maximum supported byte length",
                    () => {
                        const token =
                            generateSecureToken(128);

                        expect(
                            token.length
                        ).toBe(256);
                    }
                );
            }
        );

        describe(
            "hashToken",
            () => {
                test(
                    "returns the expected SHA-256 hash",
                    () => {
                        const result =
                            hashToken(
                                "sample-token"
                            );

                        expect(result).toBe(
                            "0f35d0ae14518b96bd6d3fec3ca15801fd58c9e048b1ccdea11a71378f2acdc9"
                        );
                    }
                );

                test(
                    "returns the same hash for the same token",
                    () => {
                        const firstHash =
                            hashToken(
                                "same-token"
                            );

                        const secondHash =
                            hashToken(
                                "same-token"
                            );

                        expect(
                            firstHash
                        ).toBe(
                            secondHash
                        );
                    }
                );

                test(
                    "returns different hashes for different tokens",
                    () => {
                        const firstHash =
                            hashToken(
                                "token-one"
                            );

                        const secondHash =
                            hashToken(
                                "token-two"
                            );

                        expect(
                            firstHash
                        ).not.toBe(
                            secondHash
                        );
                    }
                );

                test.each([
                    "",
                    "   ",
                    null,
                    undefined,
                    123,
                    {},
                    []
                ])(
                    "rejects invalid token value: %p",
                    (token) => {
                        expect(() =>
                            hashToken(token)
                        ).toThrow(
                            TypeError
                        );

                        expect(() =>
                            hashToken(token)
                        ).toThrow(
                            "Token must be a non-empty string."
                        );
                    }
                );
            }
        );

        describe(
            "generateTokenId",
            () => {
                test(
                    "generates a valid UUID",
                    () => {
                        const tokenId =
                            generateTokenId();

                        expect(tokenId).toMatch(
                            /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
                        );
                    }
                );

                test(
                    "generates unique token IDs",
                    () => {
                        expect(
                            generateTokenId()
                        ).not.toBe(
                            generateTokenId()
                        );
                    }
                );
            }
        );

        describe(
            "generateTokenFamilyId",
            () => {
                test(
                    "generates a valid UUID",
                    () => {
                        const familyId =
                            generateTokenFamilyId();

                        expect(familyId).toMatch(
                            /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
                        );
                    }
                );

                test(
                    "generates unique token family IDs",
                    () => {
                        expect(
                            generateTokenFamilyId()
                        ).not.toBe(
                            generateTokenFamilyId()
                        );
                    }
                );
            }
        );
    }
);
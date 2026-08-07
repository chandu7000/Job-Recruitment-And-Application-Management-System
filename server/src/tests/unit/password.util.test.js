import {
  jest
} from "@jest/globals";

const bcryptHashMock =
  jest.fn();

const bcryptCompareMock =
  jest.fn();

jest.unstable_mockModule(
  "bcrypt",
  () => ({
    default: {
      hash:
        bcryptHashMock,

      compare:
        bcryptCompareMock
    }
  })
);

const {
  PASSWORD_RULES,
  validatePasswordStrength,
  hashPassword,
  comparePassword
} = await import(
  "../../utils/password.util.js"
);

describe(
  "password utility",
  () => {
    beforeEach(() => {
      jest.clearAllMocks();

      bcryptHashMock
        .mockResolvedValue(
          "generated-password-hash"
        );

      bcryptCompareMock
        .mockResolvedValue(
          true
        );
    });

    describe(
      "PASSWORD_RULES",
      () => {
        test(
          "uses the expected password length limits",
          () => {
            expect(
              PASSWORD_RULES
            ).toEqual({
              minLength: 8,
              maxLength: 72
            });
          }
        );
      }
    );

    describe(
      "validatePasswordStrength",
      () => {
        test(
          "accepts a strong password",
          () => {
            expect(
              validatePasswordStrength(
                "StrongPassword@123"
              )
            ).toBe(true);
          }
        );

        test(
          "rejects a non-string password",
          () => {
            expect(() =>
              validatePasswordStrength(
                null
              )
            ).toThrow(
              expect.objectContaining({
                statusCode: 400,
                code:
                  "INVALID_PASSWORD"
              })
            );
          }
        );

        test(
          "rejects a password shorter than 8 characters",
          () => {
            expect(() =>
              validatePasswordStrength(
                "Abc@123"
              )
            ).toThrow(
              expect.objectContaining({
                statusCode: 400,
                code:
                  "WEAK_PASSWORD"
              })
            );
          }
        );

        test(
          "rejects a password longer than 72 characters",
          () => {
            const password =
              `A1@${"a".repeat(70)}`;

            expect(
              password.length
            ).toBeGreaterThan(72);

            expect(() =>
              validatePasswordStrength(
                password
              )
            ).toThrow(
              expect.objectContaining({
                statusCode: 400,
                code:
                  "PASSWORD_TOO_LONG"
              })
            );
          }
        );

        test(
          "rejects a password without an uppercase letter",
          () => {
            expect(() =>
              validatePasswordStrength(
                "password@123"
              )
            ).toThrow(
              expect.objectContaining({
                statusCode: 400,
                code:
                  "WEAK_PASSWORD"
              })
            );
          }
        );

        test(
          "rejects a password without a lowercase letter",
          () => {
            expect(() =>
              validatePasswordStrength(
                "PASSWORD@123"
              )
            ).toThrow(
              expect.objectContaining({
                statusCode: 400,
                code:
                  "WEAK_PASSWORD"
              })
            );
          }
        );

        test(
          "rejects a password without a number",
          () => {
            expect(() =>
              validatePasswordStrength(
                "Password@Test"
              )
            ).toThrow(
              expect.objectContaining({
                statusCode: 400,
                code:
                  "WEAK_PASSWORD"
              })
            );
          }
        );

        test(
          "rejects a password without a special character",
          () => {
            expect(() =>
              validatePasswordStrength(
                "Password123"
              )
            ).toThrow(
              expect.objectContaining({
                statusCode: 400,
                code:
                  "WEAK_PASSWORD"
              })
            );
          }
        );

        test.each([
          "Password@1",
          "Valid#Password2",
          "Secure_Password3",
          "Strong-Password4",
          "Example!Pass5"
        ])(
          "accepts valid password: %s",
          (password) => {
            expect(
              validatePasswordStrength(
                password
              )
            ).toBe(true);
          }
        );
      }
    );

    describe(
      "hashPassword",
      () => {
        test(
          "validates and hashes a strong password",
          async () => {
            const result =
              await hashPassword(
                "StrongPassword@123"
              );

            expect(
              bcryptHashMock
            ).toHaveBeenCalledWith(
              "StrongPassword@123",
              12
            );

            expect(result).toBe(
              "generated-password-hash"
            );
          }
        );

        test(
          "does not call bcrypt when password validation fails",
          async () => {
            await expect(
              hashPassword(
                "weak"
              )
            ).rejects.toEqual(
              expect.objectContaining({
                statusCode: 400,
                code:
                  "WEAK_PASSWORD"
              })
            );

            expect(
              bcryptHashMock
            ).not.toHaveBeenCalled();
          }
        );

        test(
          "propagates bcrypt hashing errors",
          async () => {
            const bcryptError =
              new Error(
                "bcrypt hashing failed"
              );

            bcryptHashMock
              .mockRejectedValue(
                bcryptError
              );

            await expect(
              hashPassword(
                "StrongPassword@123"
              )
            ).rejects.toBe(
              bcryptError
            );
          }
        );
      }
    );

    describe(
      "comparePassword",
      () => {
        test(
          "returns true when password matches",
          async () => {
            bcryptCompareMock
              .mockResolvedValue(
                true
              );

            const result =
              await comparePassword(
                "StrongPassword@123",
                "stored-password-hash"
              );

            expect(
              bcryptCompareMock
            ).toHaveBeenCalledWith(
              "StrongPassword@123",
              "stored-password-hash"
            );

            expect(result).toBe(true);
          }
        );

        test(
          "returns false when password does not match",
          async () => {
            bcryptCompareMock
              .mockResolvedValue(
                false
              );

            const result =
              await comparePassword(
                "WrongPassword@123",
                "stored-password-hash"
              );

            expect(result).toBe(false);
          }
        );

        test.each([
          [
            null,
            "stored-password-hash"
          ],
          [
            undefined,
            "stored-password-hash"
          ],
          [
            123,
            "stored-password-hash"
          ],
          [
            "Password@123",
            null
          ],
          [
            "Password@123",
            undefined
          ],
          [
            "Password@123",
            123
          ]
        ])(
          "returns false for invalid input values",
          async (
            plainPassword,
            passwordHash
          ) => {
            const result =
              await comparePassword(
                plainPassword,
                passwordHash
              );

            expect(result).toBe(false);

            expect(
              bcryptCompareMock
            ).not.toHaveBeenCalled();
          }
        );

        test(
          "propagates bcrypt comparison errors",
          async () => {
            const bcryptError =
              new Error(
                "bcrypt comparison failed"
              );

            bcryptCompareMock
              .mockRejectedValue(
                bcryptError
              );

            await expect(
              comparePassword(
                "StrongPassword@123",
                "stored-password-hash"
              )
            ).rejects.toBe(
              bcryptError
            );
          }
        );
      }
    );
  }
);
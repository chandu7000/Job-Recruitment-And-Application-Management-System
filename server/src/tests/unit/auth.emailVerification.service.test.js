import {
  jest
} from "@jest/globals";

const transactionMock =
  jest.fn();

const logAuthEventMock =
  jest.fn();

const sendPasswordResetEmailMock =
  jest.fn();

const sendVerificationEmailMock =
  jest.fn();

const sendEmailChangeVerificationEmailMock =
  jest.fn();

const getDeviceInfoMock =
  jest.fn();

const createUserMock =
  jest.fn();

const findUserByEmailMock =
  jest.fn();

const findUserByIdMock =
  jest.fn();

const findUserByIdWithPasswordMock =
  jest.fn();

const savePasswordResetTokenMock =
  jest.fn();

const findUserByPasswordResetTokenMock =
  jest.fn();

const updatePasswordMock =
  jest.fn();

const updateUserPasswordMock =
  jest.fn();

const saveEmailVerificationTokenMock =
  jest.fn();

const findUserByEmailVerificationTokenMock =
  jest.fn();

const verifyUserEmailMock =
  jest.fn();

const incrementFailedLoginAttemptsMock =
  jest.fn();

const resetFailedLoginAttemptsMock =
  jest.fn();

const updateLastLoginMock =
  jest.fn();

const clearPasswordResetTokenMock =
  jest.fn();

const saveEmailChangeRequestMock =
  jest.fn();

const findUserByEmailChangeTokenMock =
  jest.fn();

const completeEmailChangeMock =
  jest.fn();

const clearEmailChangeRequestMock =
  jest.fn();

const createJobSeekerProfileMock =
  jest.fn();

const createUserSessionMock =
  jest.fn();

const getSessionByRefreshTokenMock =
  jest.fn();

const revokeUserSessionMock =
  jest.fn();

const revokeEveryUserSessionMock =
  jest.fn();

const generateAccessTokenMock =
  jest.fn();

const generateRefreshTokenMock =
  jest.fn();

const verifyRefreshTokenMock =
  jest.fn();

const hashPasswordMock =
  jest.fn();

const comparePasswordMock =
  jest.fn();

const generateSecureTokenMock =
  jest.fn();

const hashTokenMock =
  jest.fn();

jest.unstable_mockModule(
  "../../config/database.js",
  () => ({
    sequelize: {
      transaction:
        transactionMock
    }
  })
);

jest.unstable_mockModule(
  "../../services/authAudit.service.js",
  () => ({
    logAuthEvent:
      logAuthEventMock
  })
);

jest.unstable_mockModule(
  "../../utils/email.js",
  () => ({
    sendPasswordResetEmail:
      sendPasswordResetEmailMock,

    sendVerificationEmail:
      sendVerificationEmailMock,

    sendEmailChangeVerificationEmail:
      sendEmailChangeVerificationEmailMock
  })
);

jest.unstable_mockModule(
  "../../utils/deviceInfo.js",
  () => ({
    getDeviceInfo:
      getDeviceInfoMock
  })
);

jest.unstable_mockModule(
  "../../repositories/auth.repository.js",
  () => ({
    createUser:
      createUserMock,

    findUserByEmail:
      findUserByEmailMock,

    findUserById:
      findUserByIdMock,

    findUserByIdWithPassword:
      findUserByIdWithPasswordMock,

    savePasswordResetToken:
      savePasswordResetTokenMock,

    findUserByPasswordResetToken:
      findUserByPasswordResetTokenMock,

    updatePassword:
      updatePasswordMock,

    updateUserPassword:
      updateUserPasswordMock,

    saveEmailVerificationToken:
      saveEmailVerificationTokenMock,

    findUserByEmailVerificationToken:
      findUserByEmailVerificationTokenMock,

    verifyUserEmail:
      verifyUserEmailMock,

    incrementFailedLoginAttempts:
      incrementFailedLoginAttemptsMock,

    resetFailedLoginAttempts:
      resetFailedLoginAttemptsMock,

    updateLastLogin:
      updateLastLoginMock,

    clearPasswordResetToken:
      clearPasswordResetTokenMock,

    saveEmailChangeRequest:
      saveEmailChangeRequestMock,

    findUserByEmailChangeToken:
      findUserByEmailChangeTokenMock,

    completeEmailChange:
      completeEmailChangeMock,

    clearEmailChangeRequest:
      clearEmailChangeRequestMock
  })
);

jest.unstable_mockModule(
  "../../repositories/jobSeekerProfile.repository.js",
  () => ({
    createJobSeekerProfile:
      createJobSeekerProfileMock
  })
);

jest.unstable_mockModule(
  "../../services/userSession.service.js",
  () => ({
    createUserSession:
      createUserSessionMock,

    getSessionByRefreshToken:
      getSessionByRefreshTokenMock,

    revokeUserSession:
      revokeUserSessionMock,

    revokeEveryUserSession:
      revokeEveryUserSessionMock
  })
);

jest.unstable_mockModule(
  "../../utils/jwt.js",
  () => ({
    generateAccessToken:
      generateAccessTokenMock,

    generateRefreshToken:
      generateRefreshTokenMock,

    verifyRefreshToken:
      verifyRefreshTokenMock
  })
);

jest.unstable_mockModule(
  "../../utils/password.util.js",
  () => ({
    hashPassword:
      hashPasswordMock,

    comparePassword:
      comparePasswordMock
  })
);

jest.unstable_mockModule(
  "../../utils/token.util.js",
  () => ({
    generateSecureToken:
      generateSecureTokenMock,

    hashToken:
      hashTokenMock
  })
);

const {
  sendEmailVerification,
  verifyEmail
} = await import(
  "../../services/auth.service.js"
);

const {
  ACCOUNT_STATUS
} = await import(
  "../../constants/app.constants.js"
);

describe(
  "Authentication email verification service",
  () => {
    const transaction = {
      LOCK: {
        UPDATE:
          "UPDATE"
      }
    };

    const user = {
      id:
        "11111111-1111-1111-1111-111111111111",

      email:
        "user@example.com",

      status:
        ACCOUNT_STATUS
          .PENDING_VERIFICATION,

      emailVerifiedAt:
        null,

      emailVerificationExpiresAt:
        new Date(
          Date.now() +
          60 * 60 * 1000
        )
    };

    const genericResponse = {
      message:
        "If an account exists and requires verification, a verification email has been sent."
    };

    beforeEach(() => {
      jest.clearAllMocks();

      transactionMock
        .mockImplementation(
          async (callback) =>
            callback(
              transaction
            )
        );

      generateSecureTokenMock
        .mockReturnValue(
          "raw-verification-token"
        );

      hashTokenMock
        .mockReturnValue(
          "hashed-verification-token"
        );

      saveEmailVerificationTokenMock
        .mockResolvedValue([
          1
        ]);

      verifyUserEmailMock
        .mockResolvedValue([
          1
        ]);

      revokeEveryUserSessionMock
        .mockResolvedValue([
          1
        ]);

      sendVerificationEmailMock
        .mockResolvedValue(
          undefined
        );

      logAuthEventMock
        .mockResolvedValue(
          undefined
        );
    });

    describe(
      "sendEmailVerification",
      () => {
        test(
          "returns the generic response when user does not exist",
          async () => {
            findUserByEmailMock
              .mockResolvedValue(
                null
              );

            const result =
              await sendEmailVerification({
                email:
                  "missing@example.com"
              });

            expect(result).toEqual(
              genericResponse
            );

            expect(
              generateSecureTokenMock
            ).not.toHaveBeenCalled();

            expect(
              saveEmailVerificationTokenMock
            ).not.toHaveBeenCalled();

            expect(
              sendVerificationEmailMock
            ).not.toHaveBeenCalled();
          }
        );

        test(
          "returns the generic response when email is already verified",
          async () => {
            findUserByEmailMock
              .mockResolvedValue({
                ...user,

                status:
                  ACCOUNT_STATUS.ACTIVE,

                emailVerifiedAt:
                  new Date()
              });

            const result =
              await sendEmailVerification({
                email:
                  user.email
              });

            expect(result).toEqual(
              genericResponse
            );

            expect(
              generateSecureTokenMock
            ).not.toHaveBeenCalled();

            expect(
              sendVerificationEmailMock
            ).not.toHaveBeenCalled();
          }
        );

        test(
          "creates and sends an email verification token",
          async () => {
            findUserByEmailMock
              .mockResolvedValue(
                user
              );

            const result =
              await sendEmailVerification({
                email:
                  user.email
              });

            expect(
              generateSecureTokenMock
            ).toHaveBeenCalledTimes(
              1
            );

            expect(
              hashTokenMock
            ).toHaveBeenCalledWith(
              "raw-verification-token"
            );

            expect(
              saveEmailVerificationTokenMock
            ).toHaveBeenCalledWith({
              userId:
                user.id,

              token:
                "hashed-verification-token",

              expiresAt:
                expect.any(Date)
            });

            expect(
              sendVerificationEmailMock
            ).toHaveBeenCalledWith(
              user.email,
              "raw-verification-token"
            );

            expect(
              logAuthEventMock
            ).toHaveBeenCalledWith({
              userId:
                user.id,

              email:
                user.email,

              event:
                "EMAIL_VERIFICATION_SENT",

              status:
                "SUCCESS"
            });

            expect(result).toEqual(
              genericResponse
            );
          }
        );
      }
    );

    describe(
      "verifyEmail",
      () => {
        test(
          "rejects an invalid verification token",
          async () => {
            findUserByEmailVerificationTokenMock
              .mockResolvedValue(
                null
              );

            await expect(
              verifyEmail({
                token:
                  "invalid-token"
              })
            ).rejects.toEqual(
              expect.objectContaining({
                statusCode:
                  400,

                code:
                  "INVALID_VERIFICATION_TOKEN"
              })
            );

            expect(
              hashTokenMock
            ).toHaveBeenCalledWith(
              "invalid-token"
            );

            expect(
              transactionMock
            ).not.toHaveBeenCalled();
          }
        );

        test(
          "rejects a verification token without an expiry value",
          async () => {
            findUserByEmailVerificationTokenMock
              .mockResolvedValue({
                ...user,

                emailVerificationExpiresAt:
                  null
              });

            await expect(
              verifyEmail({
                token:
                  "verification-token"
              })
            ).rejects.toEqual(
              expect.objectContaining({
                statusCode:
                  400,

                code:
                  "VERIFICATION_TOKEN_EXPIRED"
              })
            );

            expect(
              verifyUserEmailMock
            ).not.toHaveBeenCalled();
          }
        );

        test(
          "rejects an expired verification token",
          async () => {
            findUserByEmailVerificationTokenMock
              .mockResolvedValue({
                ...user,

                emailVerificationExpiresAt:
                  new Date(
                    Date.now() -
                    60 * 1000
                  )
              });

            await expect(
              verifyEmail({
                token:
                  "expired-token"
              })
            ).rejects.toEqual(
              expect.objectContaining({
                statusCode:
                  400,

                code:
                  "VERIFICATION_TOKEN_EXPIRED"
              })
            );

            expect(
              transactionMock
            ).not.toHaveBeenCalled();
          }
        );

        test(
          "verifies the email and revokes all existing sessions",
          async () => {
            findUserByEmailVerificationTokenMock
              .mockResolvedValue({
                ...user,

                emailVerificationExpiresAt:
                  new Date(
                    Date.now() +
                    60 * 60 * 1000
                  )
              });

            const result =
              await verifyEmail({
                token:
                  "valid-verification-token"
              });

            expect(
              hashTokenMock
            ).toHaveBeenCalledWith(
              "valid-verification-token"
            );

            expect(
              findUserByEmailVerificationTokenMock
            ).toHaveBeenCalledWith(
              "hashed-verification-token"
            );

            expect(
              verifyUserEmailMock
            ).toHaveBeenCalledWith(
              user.id,
              {
                transaction
              }
            );

            expect(
              revokeEveryUserSessionMock
            ).toHaveBeenCalledWith(
              {
                userId:
                  user.id,

                reason:
                  "EMAIL_VERIFIED"
              },
              {
                transaction
              }
            );

            expect(
              logAuthEventMock
            ).toHaveBeenCalledWith({
              userId:
                user.id,

              email:
                user.email,

              event:
                "EMAIL_VERIFIED",

              status:
                "SUCCESS"
            });

            expect(result).toEqual({
              message:
                "Email verified successfully."
            });
          }
        );
      }
    );
  }
);
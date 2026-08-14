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

const deletePendingUserByIdMock =
  jest.fn();

const createJobSeekerProfileMock =
  jest.fn();

const createRecruiterProfileMock =
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
      clearEmailChangeRequestMock,

    deletePendingUserById:
      deletePendingUserByIdMock
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
  "../../repositories/recruiterProfile.repository.js",
  () => ({
    createRecruiterProfile:
      createRecruiterProfileMock
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
  requestEmailChange,
  verifyEmailChange
} = await import(
  "../../services/auth.service.js"
);

describe(
  "Authentication email change service",
  () => {
    const transaction = {
      LOCK: {
        UPDATE:
          "UPDATE"
      }
    };

    const userId =
      "11111111-1111-1111-1111-111111111111";

    const user = {
      id:
        userId,

      email:
        "current@example.com",

      passwordHash:
        "stored-password-hash",

      pendingEmail:
        "new@example.com",

      emailChangeExpiresAt:
        new Date(
          Date.now() +
          30 * 60 * 1000
        )
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

      comparePasswordMock
        .mockResolvedValue(
          true
        );

      generateSecureTokenMock
        .mockReturnValue(
          "raw-email-change-token"
        );

      hashTokenMock
        .mockReturnValue(
          "hashed-email-change-token"
        );

      saveEmailChangeRequestMock
        .mockResolvedValue([
          1
        ]);

      clearEmailChangeRequestMock
        .mockResolvedValue([
          1
        ]);

      completeEmailChangeMock
        .mockResolvedValue([
          1
        ]);

      revokeEveryUserSessionMock
        .mockResolvedValue([
          1
        ]);

      sendEmailChangeVerificationEmailMock
        .mockResolvedValue(
          undefined
        );

      logAuthEventMock
        .mockResolvedValue(
          undefined
        );
    });

    describe(
      "requestEmailChange",
      () => {
        test(
          "rejects when user does not exist",
          async () => {
            findUserByIdWithPasswordMock
              .mockResolvedValue(
                null
              );

            await expect(
              requestEmailChange({
                userId,

                newEmail:
                  "new@example.com",

                currentPassword:
                  "Password@123"
              })
            ).rejects.toEqual(
              expect.objectContaining({
                statusCode:
                  404,

                code:
                  "USER_NOT_FOUND"
              })
            );

            expect(
              comparePasswordMock
            ).not.toHaveBeenCalled();
          }
        );

        test(
          "rejects when current password is incorrect",
          async () => {
            findUserByIdWithPasswordMock
              .mockResolvedValue(
                user
              );

            comparePasswordMock
              .mockResolvedValue(
                false
              );

            await expect(
              requestEmailChange({
                userId,

                newEmail:
                  "new@example.com",

                currentPassword:
                  "WrongPassword@123"
              })
            ).rejects.toEqual(
              expect.objectContaining({
                statusCode:
                  400,

                code:
                  "INVALID_CURRENT_PASSWORD"
              })
            );

            expect(
              logAuthEventMock
            ).toHaveBeenCalledWith({
              userId:
                user.id,

              email:
                user.email,

              event:
                "EMAIL_CHANGE_REQUEST",

              status:
                "FAILED",

              metadata: {
                reason:
                  "INVALID_CURRENT_PASSWORD"
              }
            });

            expect(
              saveEmailChangeRequestMock
            ).not.toHaveBeenCalled();
          }
        );

        test(
          "rejects when new email is the same as current email",
          async () => {
            findUserByIdWithPasswordMock
              .mockResolvedValue(
                user
              );

            await expect(
              requestEmailChange({
                userId,

                newEmail:
                  " CURRENT@example.com ",

                currentPassword:
                  "Password@123"
              })
            ).rejects.toEqual(
              expect.objectContaining({
                statusCode:
                  400,

                code:
                  "EMAIL_CHANGE_SAME_AS_CURRENT"
              })
            );

            expect(
              findUserByEmailMock
            ).not.toHaveBeenCalled();
          }
        );

        test(
          "rejects when new email is already registered",
          async () => {
            findUserByIdWithPasswordMock
              .mockResolvedValue(
                user
              );

            findUserByEmailMock
              .mockResolvedValue({
                id:
                  "another-user-id",

                email:
                  "new@example.com"
              });

            await expect(
              requestEmailChange({
                userId,

                newEmail:
                  "new@example.com",

                currentPassword:
                  "Password@123"
              })
            ).rejects.toEqual(
              expect.objectContaining({
                statusCode:
                  409,

                code:
                  "EMAIL_ALREADY_EXISTS"
              })
            );

            expect(
              saveEmailChangeRequestMock
            ).not.toHaveBeenCalled();
          }
        );

        test(
          "clears the request when sending verification email fails",
          async () => {
            findUserByIdWithPasswordMock
              .mockResolvedValue(
                user
              );

            findUserByEmailMock
              .mockResolvedValue(
                null
              );

            sendEmailChangeVerificationEmailMock
              .mockRejectedValue(
                new Error(
                  "SMTP failed"
                )
              );

            await expect(
              requestEmailChange({
                userId,

                newEmail:
                  "NEW@example.com",

                currentPassword:
                  "Password@123"
              })
            ).rejects.toEqual(
              expect.objectContaining({
                statusCode:
                  500,

                code:
                  "EMAIL_CHANGE_EMAIL_FAILED"
              })
            );

            expect(
              saveEmailChangeRequestMock
            ).toHaveBeenCalledWith({
              userId:
                user.id,

              pendingEmail:
                "new@example.com",

              emailChangeToken:
                "hashed-email-change-token",

              emailChangeExpiresAt:
                expect.any(Date)
            });

            expect(
              clearEmailChangeRequestMock
            ).toHaveBeenCalledWith(
              user.id
            );

            expect(
              logAuthEventMock
            ).not.toHaveBeenCalled();
          }
        );

        test(
          "creates and sends an email change request successfully",
          async () => {
            findUserByIdWithPasswordMock
              .mockResolvedValue(
                user
              );

            findUserByEmailMock
              .mockResolvedValue(
                null
              );

            const result =
              await requestEmailChange({
                userId,

                newEmail:
                  " NEW@example.com ",

                currentPassword:
                  "Password@123"
              });

            expect(
              comparePasswordMock
            ).toHaveBeenCalledWith(
              "Password@123",
              user.passwordHash
            );

            expect(
              generateSecureTokenMock
            ).toHaveBeenCalledTimes(
              1
            );

            expect(
              hashTokenMock
            ).toHaveBeenCalledWith(
              "raw-email-change-token"
            );

            expect(
              saveEmailChangeRequestMock
            ).toHaveBeenCalledWith({
              userId:
                user.id,

              pendingEmail:
                "new@example.com",

              emailChangeToken:
                "hashed-email-change-token",

              emailChangeExpiresAt:
                expect.any(Date)
            });

            expect(
              sendEmailChangeVerificationEmailMock
            ).toHaveBeenCalledWith(
              "new@example.com",
              "raw-email-change-token"
            );

            expect(
              logAuthEventMock
            ).toHaveBeenCalledWith({
              userId:
                user.id,

              email:
                user.email,

              event:
                "EMAIL_CHANGE_REQUESTED",

              status:
                "SUCCESS",

              metadata: {
                pendingEmail:
                  "new@example.com"
              }
            });

            expect(result).toEqual({
              message:
                "A verification link has been sent to your new email address."
            });
          }
        );
      }
    );

    describe(
      "verifyEmailChange",
      () => {
        test(
          "rejects an invalid email change token",
          async () => {
            findUserByEmailChangeTokenMock
              .mockResolvedValue(
                null
              );

            await expect(
              verifyEmailChange({
                token:
                  "invalid-token"
              })
            ).rejects.toEqual(
              expect.objectContaining({
                statusCode:
                  400,

                code:
                  "INVALID_EMAIL_CHANGE_TOKEN"
              })
            );

            expect(
              hashTokenMock
            ).toHaveBeenCalledWith(
              "invalid-token"
            );

            expect(
              clearEmailChangeRequestMock
            ).not.toHaveBeenCalled();
          }
        );

        test(
          "clears and rejects an expired email change request",
          async () => {
            findUserByEmailChangeTokenMock
              .mockResolvedValue({
                ...user,

                emailChangeExpiresAt:
                  new Date(
                    Date.now() -
                    60 * 1000
                  )
              });

            await expect(
              verifyEmailChange({
                token:
                  "expired-token"
              })
            ).rejects.toEqual(
              expect.objectContaining({
                statusCode:
                  400,

                code:
                  "EMAIL_CHANGE_TOKEN_EXPIRED"
              })
            );

            expect(
              clearEmailChangeRequestMock
            ).toHaveBeenCalledWith(
              user.id
            );

            expect(
              transactionMock
            ).not.toHaveBeenCalled();
          }
        );

        test(
          "rejects when pending email is missing",
          async () => {
            findUserByEmailChangeTokenMock
              .mockResolvedValue({
                ...user,

                pendingEmail:
                  null,

                emailChangeExpiresAt:
                  new Date(
                    Date.now() +
                    30 * 60 * 1000
                  )
              });

            await expect(
              verifyEmailChange({
                token:
                  "valid-token"
              })
            ).rejects.toEqual(
              expect.objectContaining({
                statusCode:
                  400,

                code:
                  "EMAIL_CHANGE_REQUEST_NOT_FOUND"
              })
            );

            expect(
              findUserByEmailMock
            ).not.toHaveBeenCalled();
          }
        );

        test(
          "clears and rejects when pending email belongs to another user",
          async () => {
            findUserByEmailChangeTokenMock
              .mockResolvedValue(
                user
              );

            findUserByEmailMock
              .mockResolvedValue({
                id:
                  "another-user-id",

                email:
                  "new@example.com"
              });

            await expect(
              verifyEmailChange({
                token:
                  "valid-token"
              })
            ).rejects.toEqual(
              expect.objectContaining({
                statusCode:
                  409,

                code:
                  "EMAIL_ALREADY_EXISTS"
              })
            );

            expect(
              clearEmailChangeRequestMock
            ).toHaveBeenCalledWith(
              user.id
            );

            expect(
              completeEmailChangeMock
            ).not.toHaveBeenCalled();
          }
        );

        test(
          "converts a database unique constraint error",
          async () => {
            findUserByEmailChangeTokenMock
              .mockResolvedValue(
                user
              );

            findUserByEmailMock
              .mockResolvedValue(
                null
              );

            completeEmailChangeMock
              .mockRejectedValue({
                name:
                  "SequelizeUniqueConstraintError"
              });

            await expect(
              verifyEmailChange({
                token:
                  "valid-token"
              })
            ).rejects.toEqual(
              expect.objectContaining({
                statusCode:
                  409,

                code:
                  "EMAIL_ALREADY_EXISTS"
              })
            );

            expect(
              logAuthEventMock
            ).not.toHaveBeenCalled();
          }
        );

        test(
          "rethrows an unexpected database error",
          async () => {
            const databaseError =
              new Error(
                "Database failed"
              );

            findUserByEmailChangeTokenMock
              .mockResolvedValue(
                user
              );

            findUserByEmailMock
              .mockResolvedValue(
                null
              );

            completeEmailChangeMock
              .mockRejectedValue(
                databaseError
              );

            await expect(
              verifyEmailChange({
                token:
                  "valid-token"
              })
            ).rejects.toBe(
              databaseError
            );
          }
        );

        test(
          "changes the email and revokes every session successfully",
          async () => {
            findUserByEmailChangeTokenMock
              .mockResolvedValue({
                ...user,

                pendingEmail:
                  " NEW@example.com "
              });

            findUserByEmailMock
              .mockResolvedValue(
                null
              );

            const result =
              await verifyEmailChange({
                token:
                  "valid-email-change-token"
              });

            expect(
              hashTokenMock
            ).toHaveBeenCalledWith(
              "valid-email-change-token"
            );

            expect(
              findUserByEmailChangeTokenMock
            ).toHaveBeenCalledWith(
              "hashed-email-change-token"
            );

            expect(
              completeEmailChangeMock
            ).toHaveBeenCalledWith(
              {
                userId:
                  user.id,

                newEmail:
                  "new@example.com"
              },
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
                  "EMAIL_CHANGED"
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
                "new@example.com",

              event:
                "EMAIL_CHANGED",

              status:
                "SUCCESS",

              metadata: {
                oldEmail:
                  user.email,

                newEmail:
                  "new@example.com"
              }
            });

            expect(result).toEqual({
              message:
                "Email changed successfully. Please log in again using your new email."
            });
          }
        );

        test(
          "allows the existing email record when it belongs to the same user",
          async () => {
            findUserByEmailChangeTokenMock
              .mockResolvedValue(
                user
              );

            findUserByEmailMock
              .mockResolvedValue({
                id:
                  user.id,

                email:
                  "new@example.com"
              });

            const result =
              await verifyEmailChange({
                token:
                  "valid-token"
              });

            expect(
              completeEmailChangeMock
            ).toHaveBeenCalled();

            expect(result).toEqual({
              message:
                "Email changed successfully. Please log in again using your new email."
            });
          }
        );
      }
    );
  }
);
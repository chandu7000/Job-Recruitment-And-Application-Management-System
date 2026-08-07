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
  forgotPassword,
  resetPassword,
  changePassword
} = await import(
  "../../services/auth.service.js"
);

const {
  ACCOUNT_STATUS
} = await import(
  "../../constants/app.constants.js"
);

describe(
  "Authentication password service",
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
        "user@example.com",

      passwordHash:
        "stored-password-hash",

      status:
        ACCOUNT_STATUS.ACTIVE
    };

    const genericForgotPasswordResponse = {
      message:
        "If an account exists for this email, a password reset link has been sent."
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
          "raw-secure-token"
        );

      hashTokenMock
        .mockReturnValue(
          "hashed-secure-token"
        );

      hashPasswordMock
        .mockResolvedValue(
          "new-password-hash"
        );

      savePasswordResetTokenMock
        .mockResolvedValue([
          1
        ]);

      updatePasswordMock
        .mockResolvedValue([
          1
        ]);

      clearPasswordResetTokenMock
        .mockResolvedValue([
          1
        ]);

      updateUserPasswordMock
        .mockResolvedValue([
          1
        ]);

      revokeEveryUserSessionMock
        .mockResolvedValue([
          1
        ]);

      sendPasswordResetEmailMock
        .mockResolvedValue(
          undefined
        );

      logAuthEventMock
        .mockResolvedValue(
          undefined
        );
    });

    describe(
      "forgotPassword",
      () => {
        test(
          "returns the generic response when user does not exist",
          async () => {
            findUserByEmailMock
              .mockResolvedValue(
                null
              );

            const result =
              await forgotPassword({
                email:
                  "missing@example.com"
              });

            expect(result).toEqual(
              genericForgotPasswordResponse
            );

            expect(
              generateSecureTokenMock
            ).not.toHaveBeenCalled();

            expect(
              sendPasswordResetEmailMock
            ).not.toHaveBeenCalled();
          }
        );

        test(
          "returns the generic response for a non-active account",
          async () => {
            findUserByEmailMock
              .mockResolvedValue({
                ...user,

                status:
                  ACCOUNT_STATUS
                    .PENDING_VERIFICATION
              });

            const result =
              await forgotPassword({
                email:
                  user.email
              });

            expect(result).toEqual(
              genericForgotPasswordResponse
            );

            expect(
              savePasswordResetTokenMock
            ).not.toHaveBeenCalled();

            expect(
              sendPasswordResetEmailMock
            ).not.toHaveBeenCalled();
          }
        );

        test(
          "creates and sends a password reset token for an active user",
          async () => {
            findUserByEmailMock
              .mockResolvedValue(
                user
              );

            const result =
              await forgotPassword({
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
              "raw-secure-token"
            );

            expect(
              savePasswordResetTokenMock
            ).toHaveBeenCalledWith({
              email:
                user.email,

              passwordResetToken:
                "hashed-secure-token",

              passwordResetExpiresAt:
                expect.any(Date)
            });

            expect(
              sendPasswordResetEmailMock
            ).toHaveBeenCalledWith(
              user.email,
              "raw-secure-token"
            );

            expect(
              logAuthEventMock
            ).toHaveBeenCalledWith({
              userId:
                user.id,

              email:
                user.email,

              event:
                "PASSWORD_RESET_REQUESTED",

              status:
                "SUCCESS"
            });

            expect(result).toEqual(
              genericForgotPasswordResponse
            );
          }
        );
      }
    );

    describe(
      "resetPassword",
      () => {
        test(
          "rejects an invalid reset token",
          async () => {
            findUserByPasswordResetTokenMock
              .mockResolvedValue(
                null
              );

            await expect(
              resetPassword({
                token:
                  "invalid-token",

                password:
                  "NewPassword@123"
              })
            ).rejects.toEqual(
              expect.objectContaining({
                statusCode:
                  400,

                code:
                  "INVALID_RESET_TOKEN"
              })
            );

            expect(
              hashTokenMock
            ).toHaveBeenCalledWith(
              "invalid-token"
            );

            expect(
              hashPasswordMock
            ).not.toHaveBeenCalled();
          }
        );

        test(
          "rejects an expired reset token",
          async () => {
            findUserByPasswordResetTokenMock
              .mockResolvedValue({
                ...user,

                passwordResetExpiresAt:
                  new Date(
                    Date.now() -
                    60 * 1000
                  )
              });

            await expect(
              resetPassword({
                token:
                  "expired-token",

                password:
                  "NewPassword@123"
              })
            ).rejects.toEqual(
              expect.objectContaining({
                statusCode:
                  400,

                code:
                  "RESET_TOKEN_EXPIRED"
              })
            );

            expect(
              transactionMock
            ).not.toHaveBeenCalled();
          }
        );

        test(
          "rejects a reset token without an expiry value",
          async () => {
            findUserByPasswordResetTokenMock
              .mockResolvedValue({
                ...user,

                passwordResetExpiresAt:
                  null
              });

            await expect(
              resetPassword({
                token:
                  "reset-token",

                password:
                  "NewPassword@123"
              })
            ).rejects.toEqual(
              expect.objectContaining({
                statusCode:
                  400,

                code:
                  "RESET_TOKEN_EXPIRED"
              })
            );
          }
        );

        test(
          "resets the password and revokes every session",
          async () => {
            findUserByPasswordResetTokenMock
              .mockResolvedValue({
                ...user,

                passwordResetExpiresAt:
                  new Date(
                    Date.now() +
                    10 * 60 * 1000
                  )
              });

            const result =
              await resetPassword({
                token:
                  "valid-reset-token",

                password:
                  "NewPassword@123"
              });

            expect(
              hashTokenMock
            ).toHaveBeenCalledWith(
              "valid-reset-token"
            );

            expect(
              findUserByPasswordResetTokenMock
            ).toHaveBeenCalledWith(
              "hashed-secure-token"
            );

            expect(
              hashPasswordMock
            ).toHaveBeenCalledWith(
              "NewPassword@123"
            );

            expect(
              updatePasswordMock
            ).toHaveBeenCalledWith(
              {
                userId:
                  user.id,

                passwordHash:
                  "new-password-hash"
              },
              {
                transaction
              }
            );

            expect(
              clearPasswordResetTokenMock
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
                  "PASSWORD_RESET"
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
                "PASSWORD_RESET",

              status:
                "SUCCESS"
            });

            expect(result).toEqual({
              message:
                "Password reset successful."
            });
          }
        );
      }
    );

    describe(
      "changePassword",
      () => {
        test(
          "rejects when user does not exist",
          async () => {
            findUserByIdWithPasswordMock
              .mockResolvedValue(
                null
              );

            await expect(
              changePassword({
                userId,

                currentPassword:
                  "CurrentPassword@123",

                newPassword:
                  "NewPassword@123"
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
          "rejects when new password matches the current password",
          async () => {
            findUserByIdWithPasswordMock
              .mockResolvedValue(
                user
              );

            comparePasswordMock
              .mockResolvedValueOnce(
                true
              )
              .mockResolvedValueOnce(
                true
              );

            await expect(
              changePassword({
                userId,

                currentPassword:
                  "CurrentPassword@123",

                newPassword:
                  "CurrentPassword@123"
              })
            ).rejects.toEqual(
              expect.objectContaining({
                statusCode:
                  400,

                code:
                  "PASSWORD_REUSE_NOT_ALLOWED"
              })
            );

            expect(
              hashPasswordMock
            ).not.toHaveBeenCalled();

            expect(
              updateUserPasswordMock
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
              .mockResolvedValueOnce(
                false
              )
              .mockResolvedValueOnce(
                false
              );

            await expect(
              changePassword({
                userId,

                currentPassword:
                  "WrongPassword@123",

                newPassword:
                  "NewPassword@123"
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
                "PASSWORD_CHANGE",

              status:
                "FAILED",

              metadata: {
                reason:
                  "INVALID_CURRENT_PASSWORD"
              }
            });

            expect(
              updateUserPasswordMock
            ).not.toHaveBeenCalled();
          }
        );

        test(
          "changes the password and revokes every active session",
          async () => {
            findUserByIdWithPasswordMock
              .mockResolvedValue(
                user
              );

            comparePasswordMock
              .mockResolvedValueOnce(
                true
              )
              .mockResolvedValueOnce(
                false
              );

            const result =
              await changePassword({
                userId,

                currentPassword:
                  "CurrentPassword@123",

                newPassword:
                  "NewPassword@123"
              });

            expect(
              comparePasswordMock
            ).toHaveBeenNthCalledWith(
              1,
              "CurrentPassword@123",
              user.passwordHash
            );

            expect(
              comparePasswordMock
            ).toHaveBeenNthCalledWith(
              2,
              "NewPassword@123",
              user.passwordHash
            );

            expect(
              hashPasswordMock
            ).toHaveBeenCalledWith(
              "NewPassword@123"
            );

            expect(
              updateUserPasswordMock
            ).toHaveBeenCalledWith(
              {
                userId,

                passwordHash:
                  "new-password-hash"
              },
              {
                transaction
              }
            );

            expect(
              revokeEveryUserSessionMock
            ).toHaveBeenCalledWith(
              {
                userId,

                reason:
                  "PASSWORD_CHANGED"
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
                "PASSWORD_CHANGED",

              status:
                "SUCCESS"
            });

            expect(result).toEqual({
              message:
                "Password changed successfully."
            });
          }
        );
      }
    );
  }
);
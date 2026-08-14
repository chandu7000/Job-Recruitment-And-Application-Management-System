import {
  jest
} from "@jest/globals";

const transactionMock =
  jest.fn();

const logAuthEventMock =
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

const sendPasswordResetEmailMock =
  jest.fn();

const sendVerificationEmailMock =
  jest.fn();

const sendEmailChangeVerificationEmailMock =
  jest.fn();

const getDeviceInfoMock =
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
  refreshAccessToken,
  logoutUser,
  logoutFromAllDevices
} = await import(
  "../../services/auth.service.js"
);

const {
  ACCOUNT_STATUS,
  USER_ROLES
} = await import(
  "../../constants/app.constants.js"
);

describe(
  "Authentication refresh and logout service",
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

      role:
        USER_ROLES.JOB_SEEKER,

      status:
        ACCOUNT_STATUS.ACTIVE
    };

    const session = {
      id:
        "session-1",

      userId:
        user.id,

      userAgent:
        "Mozilla/5.0",

      ipAddress:
        "127.0.0.1",

      deviceName:
        "Desktop",

      browser:
        "Chrome",

      operatingSystem:
        "Windows"
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

      verifyRefreshTokenMock
        .mockReturnValue({
          id:
            user.id,

          email:
            user.email,

          role:
            user.role
        });

      getSessionByRefreshTokenMock
        .mockResolvedValue(
          session
        );

      findUserByEmailMock
        .mockResolvedValue(
          user
        );

      generateAccessTokenMock
        .mockReturnValue(
          "new-access-token"
        );

      generateRefreshTokenMock
        .mockReturnValue(
          "new-refresh-token"
        );

      revokeUserSessionMock
        .mockResolvedValue([
          1
        ]);

      createUserSessionMock
        .mockResolvedValue({
          id:
            "new-session"
        });

      revokeEveryUserSessionMock
        .mockResolvedValue([
          1
        ]);

      logAuthEventMock
        .mockResolvedValue(
          undefined
        );
    });

    describe(
      "refreshAccessToken",
      () => {
        test(
          "rejects when refresh token is missing",
          async () => {
            await expect(
              refreshAccessToken({
                refreshToken:
                  null
              })
            ).rejects.toEqual(
              expect.objectContaining({
                statusCode:
                  401,

                code:
                  "REFRESH_TOKEN_REQUIRED"
              })
            );

            expect(
              verifyRefreshTokenMock
            ).not.toHaveBeenCalled();

            expect(
              transactionMock
            ).not.toHaveBeenCalled();
          }
        );

        test(
          "rejects when user no longer exists",
          async () => {
            findUserByEmailMock
              .mockResolvedValue(
                null
              );

            await expect(
              refreshAccessToken({
                refreshToken:
                  "old-refresh-token"
              })
            ).rejects.toEqual(
              expect.objectContaining({
                statusCode:
                  401,

                code:
                  "USER_NOT_FOUND"
              })
            );

            expect(
              createUserSessionMock
            ).not.toHaveBeenCalled();
          }
        );

        test(
          "rejects when user account is not active",
          async () => {
            findUserByEmailMock
              .mockResolvedValue({
                ...user,

                status:
                  ACCOUNT_STATUS.SUSPENDED
              });

            await expect(
              refreshAccessToken({
                refreshToken:
                  "old-refresh-token"
              })
            ).rejects.toEqual(
              expect.objectContaining({
                statusCode:
                  403,

                code:
                  "ACCOUNT_NOT_ACTIVE"
              })
            );

            expect(
              revokeUserSessionMock
            ).not.toHaveBeenCalled();
          }
        );

        test(
          "rotates refresh token successfully",
          async () => {
            const result =
              await refreshAccessToken({
                refreshToken:
                  "old-refresh-token"
              });

            expect(
              verifyRefreshTokenMock
            ).toHaveBeenCalledWith(
              "old-refresh-token"
            );

            expect(
              getSessionByRefreshTokenMock
            ).toHaveBeenCalledWith(
              "old-refresh-token",
              {
                transaction,
                lock:
                  transaction.LOCK.UPDATE
              }
            );

            expect(
              findUserByEmailMock
            ).toHaveBeenCalledWith(
              user.email,
              false,
              {
                transaction
              }
            );

            expect(
              revokeUserSessionMock
            ).toHaveBeenCalledWith(
              {
                sessionId:
                  session.id,

                reason:
                  "TOKEN_ROTATED"
              },
              {
                transaction
              }
            );

            expect(
              createUserSessionMock
            ).toHaveBeenCalledWith(
              {
                userId:
                  user.id,

                refreshToken:
                  "new-refresh-token",

                userAgent:
                  session.userAgent,

                ipAddress:
                  session.ipAddress,

                deviceName:
                  session.deviceName,

                browser:
                  session.browser,

                operatingSystem:
                  session.operatingSystem,

                expiresAt:
                  expect.any(Date)
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
                "TOKEN_REFRESH",

              status:
                "SUCCESS",

              ipAddress:
                session.ipAddress,

              userAgent:
                session.userAgent
            });

            expect(result).toEqual({
              accessToken:
                "new-access-token",

              refreshToken:
                "new-refresh-token"
            });
          }
        );

        test(
          "detects refresh token reuse when session revoke affects no rows",
          async () => {
            revokeUserSessionMock
              .mockResolvedValue([
                0
              ]);

            await expect(
              refreshAccessToken({
                refreshToken:
                  "old-refresh-token"
              })
            ).rejects.toEqual(
              expect.objectContaining({
                statusCode:
                  401,

                code:
                  "REFRESH_TOKEN_REUSE_DETECTED"
              })
            );

            expect(
              revokeEveryUserSessionMock
            ).toHaveBeenCalledWith(
              {
                userId:
                  session.userId,

                reason:
                  "REFRESH_TOKEN_REUSE_DETECTED"
              },
              {
                transaction
              }
            );

            expect(
              logAuthEventMock
            ).toHaveBeenCalledWith({
              userId:
                session.userId,

              event:
                "REFRESH_TOKEN_REUSE_DETECTED",

              status:
                "FAILED",

              metadata: {
                sessionId:
                  session.id
              }
            });

            expect(
              createUserSessionMock
            ).not.toHaveBeenCalled();
          }
        );

        test(
          "revokes all sessions when session service reports rotated token reuse",
          async () => {
            const reuseError =
              Object.assign(
                new Error(
                  "Refresh token reuse detected."
                ),
                {
                  code:
                    "REFRESH_TOKEN_REUSE_DETECTED",

                  userId:
                    user.id,

                  sessionId:
                    session.id
                }
              );

            getSessionByRefreshTokenMock
              .mockRejectedValue(
                reuseError
              );

            await expect(
              refreshAccessToken({
                refreshToken:
                  "reused-refresh-token"
              })
            ).rejects.toBe(
              reuseError
            );

            expect(
              revokeEveryUserSessionMock
            ).toHaveBeenCalledWith(
              {
                userId:
                  user.id,

                reason:
                  "REFRESH_TOKEN_REUSE_DETECTED"
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

              event:
                "REFRESH_TOKEN_REUSE_DETECTED",

              status:
                "FAILED",

              metadata: {
                sessionId:
                  session.id
              }
            });
          }
        );
      }
    );

    describe(
      "logoutUser",
      () => {
        test(
          "rejects when refresh token is missing",
          async () => {
            await expect(
              logoutUser({
                refreshToken:
                  null
              })
            ).rejects.toEqual(
              expect.objectContaining({
                statusCode:
                  400,

                code:
                  "REFRESH_TOKEN_REQUIRED"
              })
            );

            expect(
              getSessionByRefreshTokenMock
            ).not.toHaveBeenCalled();
          }
        );

        test(
          "logs out the current session successfully",
          async () => {
            const result =
              await logoutUser({
                refreshToken:
                  "refresh-token"
              });

            expect(
              getSessionByRefreshTokenMock
            ).toHaveBeenCalledWith(
              "refresh-token"
            );

            expect(
              revokeUserSessionMock
            ).toHaveBeenCalledWith({
              sessionId:
                session.id,

              reason:
                "LOGOUT"
            });

            expect(
              logAuthEventMock
            ).toHaveBeenCalledWith({
              userId:
                session.userId,

              event:
                "LOGOUT",

              status:
                "SUCCESS",

              ipAddress:
                session.ipAddress,

              userAgent:
                session.userAgent
            });

            expect(result).toEqual({
              message:
                "Logout successful."
            });
          }
        );
      }
    );

    describe(
      "logoutFromAllDevices",
      () => {
        test(
          "rejects when user ID is missing",
          async () => {
            await expect(
              logoutFromAllDevices({
                userId:
                  null
              })
            ).rejects.toEqual(
              expect.objectContaining({
                statusCode:
                  400,

                code:
                  "USER_ID_REQUIRED"
              })
            );

            expect(
              revokeEveryUserSessionMock
            ).not.toHaveBeenCalled();
          }
        );

        test(
          "logs out the user from every device",
          async () => {
            const result =
              await logoutFromAllDevices({
                userId:
                  user.id
              });

            expect(
              revokeEveryUserSessionMock
            ).toHaveBeenCalledWith({
              userId:
                user.id,

              reason:
                "LOGOUT_ALL"
            });

            expect(
              logAuthEventMock
            ).toHaveBeenCalledWith({
              userId:
                user.id,

              event:
                "LOGOUT_ALL",

              status:
                "SUCCESS"
            });

            expect(result).toEqual({
              message:
                "Logged out from all devices successfully."
            });
          }
        );
      }
    );
  }
);
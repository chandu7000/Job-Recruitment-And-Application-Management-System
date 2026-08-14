import {
  jest
} from "@jest/globals";

const transactionMock =
  jest.fn();

const logAuthEventMock =
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

const sendPasswordResetEmailMock =
  jest.fn();

const sendVerificationEmailMock =
  jest.fn();

const sendEmailChangeVerificationEmailMock =
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
  registerUser,
  loginUser
} = await import(
  "../../services/auth.service.js"
);

const {
  USER_ROLES,
  ACCOUNT_STATUS
} = await import(
  "../../constants/app.constants.js"
);

describe(
  "Authentication registration and login service",
  () => {
    const transaction = {
      LOCK: {
        UPDATE:
          "UPDATE"
      }
    };

    const request = {
      headers: {
        "user-agent":
          "Mozilla/5.0"
      },

      ip:
        "127.0.0.1"
    };

    const deviceInfo = {
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

    const createUser = (
      overrides = {}
    ) => ({
      id:
        "11111111-1111-1111-1111-111111111111",

      email:
        "candidate@example.com",

      passwordHash:
        "stored-password-hash",

      role:
        USER_ROLES.JOB_SEEKER,

      status:
        ACCOUNT_STATUS.ACTIVE,

      lockedUntil:
        null,

      isLocked:
        jest.fn(() => false),

      ...overrides
    });

    beforeEach(() => {
      jest.clearAllMocks();

      transactionMock
        .mockImplementation(
          async (callback) =>
            callback(
              transaction
            )
        );

      getDeviceInfoMock
        .mockReturnValue(
          deviceInfo
        );

      hashPasswordMock
        .mockResolvedValue(
          "new-password-hash"
        );

      generateAccessTokenMock
        .mockReturnValue(
          "access-token"
        );

      generateRefreshTokenMock
        .mockReturnValue(
          "refresh-token"
        );

      createUserSessionMock
        .mockResolvedValue({
          id:
            "session-1"
        });

      logAuthEventMock
        .mockResolvedValue(
          undefined
        );
    });

    describe(
      "registerUser",
      () => {
        test(
          "rejects registration when email already exists",
          async () => {
            findUserByEmailMock
              .mockResolvedValue(
                createUser()
              );

            await expect(
              registerUser({
                email:
                  "candidate@example.com",

                password:
                  "Password@123",

                role:
                  USER_ROLES.JOB_SEEKER,

                req:
                  request
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
              hashPasswordMock
            ).not.toHaveBeenCalled();

            expect(
              transactionMock
            ).not.toHaveBeenCalled();
          }
        );

        test(
          "registers a job seeker and creates the default profile",
          async () => {
            const user =
              createUser({
                status:
                  ACCOUNT_STATUS
                    .PENDING_VERIFICATION
              });

            findUserByEmailMock
              .mockResolvedValue(
                null
              );

            createUserMock
              .mockResolvedValue(
                user
              );

            createJobSeekerProfileMock
              .mockResolvedValue({
                id:
                  "profile-1",

                userId:
                  user.id
              });

            const result =
              await registerUser({
                email:
                  user.email,

                password:
                  "Password@123",

                role:
                  USER_ROLES.JOB_SEEKER,

                req:
                  request
              });

            expect(
              hashPasswordMock
            ).toHaveBeenCalledWith(
              "Password@123"
            );

            expect(
              createUserMock
            ).toHaveBeenCalledWith(
              {
                email:
                  user.email,

                passwordHash:
                  "new-password-hash",

                role:
                  USER_ROLES.JOB_SEEKER,

                status:
                  ACCOUNT_STATUS
                    .PENDING_VERIFICATION
              },
              {
                transaction
              }
            );

            expect(
              createJobSeekerProfileMock
            ).toHaveBeenCalledWith(
              {
                userId:
                  user.id
              },
              {
                transaction
              }
            );

            expect(
              generateAccessTokenMock
            ).toHaveBeenCalledWith({
              id:
                user.id,

              email:
                user.email,

              role:
                user.role
            });

            expect(
              generateRefreshTokenMock
            ).toHaveBeenCalledWith({
              id:
                user.id,

              email:
                user.email,

              role:
                user.role
            });

            expect(
              createUserSessionMock
            ).toHaveBeenCalledWith(
              {
                userId:
                  user.id,

                refreshToken:
                  "refresh-token",

                ...deviceInfo,

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
                "REGISTER",

              status:
                "SUCCESS",

              ipAddress:
                deviceInfo.ipAddress,

              userAgent:
                deviceInfo.userAgent
            });

            expect(result).toEqual({
              user,

              accessToken:
                "access-token",

              refreshToken:
                "refresh-token",

              verificationEmailSent:
                true,

              existingPendingRegistration:
                false
            });
          }
        );

        test(
          "registers a recruiter without creating a job seeker profile",
          async () => {
            const recruiter =
              createUser({
                email:
                  "recruiter@example.com",

                role:
                  USER_ROLES.RECRUITER,

                status:
                  ACCOUNT_STATUS
                    .PENDING_VERIFICATION
              });

            findUserByEmailMock
              .mockResolvedValue(
                null
              );

            createUserMock
              .mockResolvedValue(
                recruiter
              );

            const result =
              await registerUser({
                email:
                  recruiter.email,

                password:
                  "Password@123",

                role:
                  USER_ROLES.RECRUITER,

                req:
                  request
              });

            expect(
              createJobSeekerProfileMock
            ).not.toHaveBeenCalled();

            expect(result.user).toBe(
              recruiter
            );
          }
        );
      }
    );

    describe(
      "loginUser",
      () => {
        test(
          "rejects login when user does not exist",
          async () => {
            findUserByEmailMock
              .mockResolvedValue(
                null
              );

            await expect(
              loginUser({
                email:
                  "missing@example.com",

                password:
                  "Password@123",

                req:
                  request
              })
            ).rejects.toEqual(
              expect.objectContaining({
                statusCode:
                  401,

                code:
                  "INVALID_CREDENTIALS"
              })
            );

            expect(
              logAuthEventMock
            ).toHaveBeenCalledWith(
              expect.objectContaining({
                email:
                  "missing@example.com",

                event:
                  "LOGIN",

                status:
                  "FAILED"
              })
            );

            expect(
              comparePasswordMock
            ).not.toHaveBeenCalled();
          }
        );

        test(
          "rejects login when account is temporarily locked",
          async () => {
            const user =
              createUser({
                lockedUntil:
                  new Date(
                    Date.now() +
                    10 * 60 * 1000
                  ),

                isLocked:
                  jest.fn(
                    () => true
                  )
              });

            findUserByEmailMock
              .mockResolvedValue(
                user
              );

            await expect(
              loginUser({
                email:
                  user.email,

                password:
                  "Password@123",

                req:
                  request
              })
            ).rejects.toEqual(
              expect.objectContaining({
                statusCode:
                  423,

                code:
                  "ACCOUNT_TEMPORARILY_LOCKED"
              })
            );

            expect(
              comparePasswordMock
            ).not.toHaveBeenCalled();
          }
        );

        test(
          "rejects login when email is not verified",
          async () => {
            const user =
              createUser({
                status:
                  ACCOUNT_STATUS
                    .PENDING_VERIFICATION
              });

            findUserByEmailMock
              .mockResolvedValue(
                user
              );

            await expect(
              loginUser({
                email:
                  user.email,

                password:
                  "Password@123",

                req:
                  request
              })
            ).rejects.toEqual(
              expect.objectContaining({
                statusCode:
                  403,

                code:
                  "EMAIL_NOT_VERIFIED"
              })
            );

            expect(
              comparePasswordMock
            ).not.toHaveBeenCalled();
          }
        );

        test(
          "rejects login for a disabled account",
          async () => {
            const user =
              createUser({
                status:
                  ACCOUNT_STATUS.DISABLED
              });

            findUserByEmailMock
              .mockResolvedValue(
                user
              );

            await expect(
              loginUser({
                email:
                  user.email,

                password:
                  "Password@123",

                req:
                  request
              })
            ).rejects.toEqual(
              expect.objectContaining({
                statusCode:
                  403,

                code:
                  "ACCOUNT_DISABLED"
              })
            );
          }
        );

        test(
          "rejects login for a suspended account",
          async () => {
            const user =
              createUser({
                status:
                  ACCOUNT_STATUS.SUSPENDED
              });

            findUserByEmailMock
              .mockResolvedValue(
                user
              );

            await expect(
              loginUser({
                email:
                  user.email,

                password:
                  "Password@123",

                req:
                  request
              })
            ).rejects.toEqual(
              expect.objectContaining({
                statusCode:
                  403,

                code:
                  "ACCOUNT_SUSPENDED"
              })
            );
          }
        );

        test(
          "increments failed attempts when password is incorrect",
          async () => {
            const user =
              createUser();

            findUserByEmailMock
              .mockResolvedValue(
                user
              );

            comparePasswordMock
              .mockResolvedValue(
                false
              );

            incrementFailedLoginAttemptsMock
              .mockResolvedValue({
                failedLoginAttempts:
                  2,

                lockedUntil:
                  null,

                accountLocked:
                  false
              });

            await expect(
              loginUser({
                email:
                  user.email,

                password:
                  "WrongPassword@123",

                req:
                  request
              })
            ).rejects.toEqual(
              expect.objectContaining({
                statusCode:
                  401,

                code:
                  "INVALID_CREDENTIALS"
              })
            );

            expect(
              incrementFailedLoginAttemptsMock
            ).toHaveBeenCalledWith({
              userId:
                user.id,

              maximumAttempts:
                5,

              lockDurationMinutes:
                15
            });

            expect(
              createUserSessionMock
            ).not.toHaveBeenCalled();
          }
        );

        test(
          "locks the account when maximum failed attempts are reached",
          async () => {
            const user =
              createUser();

            const lockedUntil =
              new Date(
                Date.now() +
                15 * 60 * 1000
              );

            findUserByEmailMock
              .mockResolvedValue(
                user
              );

            comparePasswordMock
              .mockResolvedValue(
                false
              );

            incrementFailedLoginAttemptsMock
              .mockResolvedValue({
                failedLoginAttempts:
                  5,

                lockedUntil,

                accountLocked:
                  true
              });

            await expect(
              loginUser({
                email:
                  user.email,

                password:
                  "WrongPassword@123",

                req:
                  request
              })
            ).rejects.toEqual(
              expect.objectContaining({
                statusCode:
                  423,

                code:
                  "ACCOUNT_TEMPORARILY_LOCKED"
              })
            );

            expect(
              logAuthEventMock
            ).toHaveBeenCalledWith(
              expect.objectContaining({
                event:
                  "ACCOUNT_LOCKED",

                status:
                  "FAILED",

                metadata:
                  expect.objectContaining({
                    failedLoginAttempts:
                      5,

                    lockedUntil
                  })
              })
            );
          }
        );

        test(
          "logs in an active user successfully",
          async () => {
            const user =
              createUser();

            findUserByEmailMock
              .mockResolvedValue(
                user
              );

            comparePasswordMock
              .mockResolvedValue(
                true
              );

            resetFailedLoginAttemptsMock
              .mockResolvedValue(
                user
              );

            updateLastLoginMock
              .mockResolvedValue(
                user
              );

            const result =
              await loginUser({
                email:
                  user.email,

                password:
                  "Password@123",

                req:
                  request
              });

            expect(
              findUserByEmailMock
            ).toHaveBeenCalledWith(
              user.email,
              true
            );

            expect(
              comparePasswordMock
            ).toHaveBeenCalledWith(
              "Password@123",
              user.passwordHash
            );

            expect(
              resetFailedLoginAttemptsMock
            ).toHaveBeenCalledWith(
              user.id,
              {
                transaction
              }
            );

            expect(
              updateLastLoginMock
            ).toHaveBeenCalledWith(
              user.id,
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
                  "refresh-token",

                ...deviceInfo,

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
                "LOGIN",

              status:
                "SUCCESS",

              ipAddress:
                deviceInfo.ipAddress,

              userAgent:
                deviceInfo.userAgent,

              metadata: {
                deviceName:
                  deviceInfo.deviceName,

                browser:
                  deviceInfo.browser,

                operatingSystem:
                  deviceInfo.operatingSystem
              }
            });

            expect(result).toEqual({
              user,

              accessToken:
                "access-token",

              refreshToken:
                "refresh-token"
            });
          }
        );
      }
    );
  }
);
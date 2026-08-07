import {
  jest
} from "@jest/globals";

const findAllUsersMock =
  jest.fn();

const findUserByIdMock =
  jest.fn();

const updateUserStatusMock =
  jest.fn();

const revokeEveryUserSessionMock =
  jest.fn();

jest.unstable_mockModule(
  "../../repositories/admin.repository.js",
  () => ({
    findAllUsers:
      findAllUsersMock,

    findUserById:
      findUserByIdMock,

    updateUserStatus:
      updateUserStatusMock
  })
);

jest.unstable_mockModule(
  "../../services/userSession.service.js",
  () => ({
    revokeEveryUserSession:
      revokeEveryUserSessionMock
  })
);

const {
  getAllUsers,
  getUserById,
  activateUser,
  disableUser,
  suspendUser
} = await import(
  "../../services/admin.service.js"
);

const {
  ACCOUNT_STATUS
} = await import(
  "../../constants/app.constants.js"
);

describe(
  "Admin service",
  () => {
    const userId =
      "11111111-1111-1111-1111-111111111111";

    const user = {
      id:
        userId,

      email:
        "user@example.com",

      role:
        "JOB_SEEKER",

      status:
        ACCOUNT_STATUS.ACTIVE
    };

    beforeEach(() => {
      jest.clearAllMocks();

      updateUserStatusMock
        .mockResolvedValue(
          user
        );

      revokeEveryUserSessionMock
        .mockResolvedValue([
          1
        ]);
    });

    describe(
      "getAllUsers",
      () => {
        test(
          "returns paginated users using provided page and limit",
          async () => {
            const users = [
              user,
              {
                id:
                  "22222222-2222-2222-2222-222222222222",

                email:
                  "recruiter@example.com",

                role:
                  "RECRUITER",

                status:
                  ACCOUNT_STATUS.ACTIVE
              }
            ];

            findAllUsersMock
              .mockResolvedValue({
                rows:
                  users,

                count:
                  25
              });

            const result =
              await getAllUsers({
                page:
                  2,

                limit:
                  10
              });

            expect(
              findAllUsersMock
            ).toHaveBeenCalledWith({
              limit:
                10,

              offset:
                10
            });

            expect(result).toEqual({
              users,

              pagination: {
                total:
                  25,

                page:
                  2,

                limit:
                  10
              }
            });
          }
        );

        test(
          "uses default pagination values",
          async () => {
            findAllUsersMock
              .mockResolvedValue({
                rows: [],
                count: 0
              });

            const result =
              await getAllUsers({});

            expect(
              findAllUsersMock
            ).toHaveBeenCalledWith({
              limit:
                20,

              offset:
                0
            });

            expect(result).toEqual({
              users: [],

              pagination: {
                total:
                  0,

                page:
                  1,

                limit:
                  20
              }
            });
          }
        );

        test(
          "calculates the correct offset",
          async () => {
            findAllUsersMock
              .mockResolvedValue({
                rows: [],
                count: 100
              });

            await getAllUsers({
              page:
                4,

              limit:
                15
            });

            expect(
              findAllUsersMock
            ).toHaveBeenCalledWith({
              limit:
                15,

              offset:
                45
            });
          }
        );
      }
    );

    describe(
      "getUserById",
      () => {
        test(
          "returns a user by ID",
          async () => {
            findUserByIdMock
              .mockResolvedValue(
                user
              );

            const result =
              await getUserById(
                userId
              );

            expect(
              findUserByIdMock
            ).toHaveBeenCalledWith(
              userId
            );

            expect(result).toBe(
              user
            );
          }
        );

        test(
          "throws when user does not exist",
          async () => {
            findUserByIdMock
              .mockResolvedValue(
                null
              );

            await expect(
              getUserById(
                userId
              )
            ).rejects.toEqual(
              expect.objectContaining({
                statusCode:
                  404,

                code:
                  "USER_NOT_FOUND"
              })
            );
          }
        );
      }
    );

    describe(
      "activateUser",
      () => {
        test(
          "activates a user without revoking sessions",
          async () => {
            const activatedUser = {
              ...user,

              status:
                ACCOUNT_STATUS.ACTIVE
            };

            findUserByIdMock
              .mockResolvedValueOnce({
                ...user,

                status:
                  ACCOUNT_STATUS.SUSPENDED
              })
              .mockResolvedValueOnce(
                activatedUser
              );

            updateUserStatusMock
              .mockResolvedValue(
                activatedUser
              );

            const result =
              await activateUser(
                userId
              );

            expect(
              updateUserStatusMock
            ).toHaveBeenCalledWith(
              userId,
              ACCOUNT_STATUS.ACTIVE
            );

            expect(
              revokeEveryUserSessionMock
            ).not.toHaveBeenCalled();

            expect(
              findUserByIdMock
            ).toHaveBeenCalledTimes(
              2
            );

            expect(result).toBe(
              activatedUser
            );
          }
        );
      }
    );

    describe(
      "disableUser",
      () => {
        test(
          "disables a user and revokes all sessions",
          async () => {
            const disabledUser = {
              ...user,

              status:
                ACCOUNT_STATUS.DISABLED
            };

            findUserByIdMock
              .mockResolvedValueOnce(
                user
              )
              .mockResolvedValueOnce(
                disabledUser
              );

            updateUserStatusMock
              .mockResolvedValue(
                disabledUser
              );

            const result =
              await disableUser(
                userId
              );

            expect(
              updateUserStatusMock
            ).toHaveBeenCalledWith(
              userId,
              ACCOUNT_STATUS.DISABLED
            );

            expect(
              revokeEveryUserSessionMock
            ).toHaveBeenCalledWith({
              userId,

              reason:
                "ACCOUNT_DISABLED"
            });

            expect(result).toBe(
              disabledUser
            );
          }
        );
      }
    );

    describe(
      "suspendUser",
      () => {
        test(
          "suspends a user and revokes all sessions",
          async () => {
            const suspendedUser = {
              ...user,

              status:
                ACCOUNT_STATUS.SUSPENDED
            };

            findUserByIdMock
              .mockResolvedValueOnce(
                user
              )
              .mockResolvedValueOnce(
                suspendedUser
              );

            updateUserStatusMock
              .mockResolvedValue(
                suspendedUser
              );

            const result =
              await suspendUser(
                userId
              );

            expect(
              updateUserStatusMock
            ).toHaveBeenCalledWith(
              userId,
              ACCOUNT_STATUS.SUSPENDED
            );

            expect(
              revokeEveryUserSessionMock
            ).toHaveBeenCalledWith({
              userId,

              reason:
                "ACCOUNT_SUSPENDED"
            });

            expect(result).toBe(
              suspendedUser
            );
          }
        );
      }
    );

    describe(
      "status change errors",
      () => {
        test.each([
          [
            "activateUser",
            activateUser
          ],
          [
            "disableUser",
            disableUser
          ],
          [
            "suspendUser",
            suspendUser
          ]
        ])(
          "%s throws when user does not exist",
          async (
            methodName,
            serviceMethod
          ) => {
            void methodName;

            findUserByIdMock
              .mockResolvedValue(
                null
              );

            await expect(
              serviceMethod(
                userId
              )
            ).rejects.toEqual(
              expect.objectContaining({
                statusCode:
                  404,

                code:
                  "USER_NOT_FOUND"
              })
            );

            expect(
              updateUserStatusMock
            ).not.toHaveBeenCalled();

            expect(
              revokeEveryUserSessionMock
            ).not.toHaveBeenCalled();
          }
        );

        test(
          "propagates status update failures",
          async () => {
            const databaseError =
              new Error(
                "Status update failed"
              );

            findUserByIdMock
              .mockResolvedValue(
                user
              );

            updateUserStatusMock
              .mockRejectedValue(
                databaseError
              );

            await expect(
              disableUser(
                userId
              )
            ).rejects.toBe(
              databaseError
            );

            expect(
              revokeEveryUserSessionMock
            ).not.toHaveBeenCalled();
          }
        );

        test(
          "propagates session revocation failures",
          async () => {
            const revocationError =
              new Error(
                "Session revocation failed"
              );

            findUserByIdMock
              .mockResolvedValue(
                user
              );

            updateUserStatusMock
              .mockResolvedValue({
                ...user,

                status:
                  ACCOUNT_STATUS.DISABLED
              });

            revokeEveryUserSessionMock
              .mockRejectedValue(
                revocationError
              );

            await expect(
              disableUser(
                userId
              )
            ).rejects.toBe(
              revocationError
            );

            expect(
              findUserByIdMock
            ).toHaveBeenCalledTimes(
              1
            );
          }
        );
      }
    );
  }
);
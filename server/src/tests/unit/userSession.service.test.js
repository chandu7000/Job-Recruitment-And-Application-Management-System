import { jest } from "@jest/globals";
import crypto from "crypto";

jest.unstable_mockModule(
  "../../repositories/userSession.repository.js",
  () => ({
    createSession: jest.fn(),
    findSessionByRefreshTokenHash: jest.fn(),
    updateSession: jest.fn(),
    revokeSession: jest.fn(),
    revokeAllUserSessions: jest.fn(),
    findActiveSessionsByUserId: jest.fn(),
    findSessionById: jest.fn()
  })
);

const repository =
  await import(
    "../../repositories/userSession.repository.js"
  );

const {
  hashRefreshToken,
  createUserSession,
  getSessionByRefreshToken,
  revokeUserSession,
  revokeEveryUserSession,
  getUserSessions,
  revokeSpecificSession
} = await import(
  "../../services/userSession.service.js"
);

describe(
  "userSession.service",
  () => {

    beforeEach(() => {
      jest.clearAllMocks();
    });

    test(
      "hashRefreshToken hashes correctly",
      () => {

        const token = "refresh-token";

        const expected =
          crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        expect(
          hashRefreshToken(token)
        ).toBe(expected);

      }
    );

    test(
      "createUserSession stores hashed refresh token",
      async () => {

        repository.createSession.mockResolvedValue({
          id: 1
        });

        await createUserSession({
          userId: 1,
          refreshToken: "abc",
          expiresAt: new Date()
        });

        expect(
          repository.createSession
        ).toHaveBeenCalled();

        const arg =
          repository.createSession.mock.calls[0][0];

        expect(
          arg.refreshTokenHash
        ).not.toBe("abc");

      }
    );

    test(
      "getSessionByRefreshToken returns session",
      async () => {

        const session = {
          id: 1,
          userId: 2,
          revokedAt: null,
          expiresAt:
            new Date(Date.now() + 100000)
        };

        repository.findSessionByRefreshTokenHash.mockResolvedValue(
          session
        );

        repository.updateSession.mockResolvedValue(
          session
        );

        const result =
          await getSessionByRefreshToken(
            "token"
          );

        expect(result)
          .toEqual(session);

      }
    );

    test(
      "throws when refresh token missing",
      async () => {

        await expect(
          getSessionByRefreshToken()
        ).rejects.toMatchObject({
          code:
            "REFRESH_TOKEN_REQUIRED"
        });

      }
    );

    test(
      "throws when session missing",
      async () => {

        repository.findSessionByRefreshTokenHash.mockResolvedValue(
          null
        );

        await expect(
          getSessionByRefreshToken(
            "abc"
          )
        ).rejects.toMatchObject({
          code:
            "INVALID_SESSION"
        });

      }
    );

    test(
      "throws when session revoked",
      async () => {

        repository.findSessionByRefreshTokenHash.mockResolvedValue({
          revokedAt:
            new Date(),
          revocationReason:
            "LOGOUT"
        });

        await expect(
          getSessionByRefreshToken(
            "abc"
          )
        ).rejects.toMatchObject({
          code:
            "SESSION_REVOKED"
        });

      }
    );

    test(
      "throws when refresh token reuse detected",
      async () => {

        repository.findSessionByRefreshTokenHash.mockResolvedValue({
          id: 5,
          userId: 9,
          revokedAt:
            new Date(),
          revocationReason:
            "TOKEN_ROTATED"
        });

        await expect(
          getSessionByRefreshToken(
            "abc"
          )
        ).rejects.toMatchObject({
          code:
            "REFRESH_TOKEN_REUSE_DETECTED"
        });

      }
    );

    test(
      "throws when session expired",
      async () => {

        repository.findSessionByRefreshTokenHash.mockResolvedValue({
          revokedAt: null,
          expiresAt:
            new Date(Date.now() - 1000)
        });

        await expect(
          getSessionByRefreshToken(
            "abc"
          )
        ).rejects.toMatchObject({
          code:
            "SESSION_EXPIRED"
        });

      }
    );

    test(
      "revokeUserSession delegates repository",
      async () => {

        repository.revokeSession.mockResolvedValue(
          [1]
        );

        await revokeUserSession({
          sessionId: 10
        });

        expect(
          repository.revokeSession
        ).toHaveBeenCalledWith(
          10,
          "LOGOUT",
          {
            transaction:
              undefined
          }
        );

      }
    );

    test(
      "revokeEveryUserSession delegates repository",
      async () => {

        repository.revokeAllUserSessions.mockResolvedValue(
          [2]
        );

        await revokeEveryUserSession({
          userId: 5
        });

        expect(
          repository.revokeAllUserSessions
        ).toHaveBeenCalled();

      }
    );

    test(
      "getUserSessions returns active sessions",
      async () => {

        repository.findActiveSessionsByUserId.mockResolvedValue(
          [{ id: 1 }]
        );

        const result =
          await getUserSessions({
            userId: 4
          });

        expect(result)
          .toHaveLength(1);

      }
    );

    test(
      "revokeSpecificSession revokes own session",
      async () => {

        repository.findSessionById.mockResolvedValue({
          id: 8,
          userId: 1,
          revokedAt: null
        });

        repository.revokeSession.mockResolvedValue(
          [1]
        );

        const result =
          await revokeSpecificSession({
            userId: 1,
            sessionId: 8
          });

        expect(
          result.message
        ).toContain(
          "revoked"
        );

      }
    );

    test(
      "revokeSpecificSession rejects foreign session",
      async () => {

        repository.findSessionById.mockResolvedValue({
          userId: 999,
          revokedAt: null
        });

        await expect(
          revokeSpecificSession({
            userId: 1,
            sessionId: 9
          })
        ).rejects.toMatchObject({
          code:
            "FORBIDDEN"
        });

      }
    );

    test(
      "revokeSpecificSession rejects already revoked session",
      async () => {

        repository.findSessionById.mockResolvedValue({
          userId: 1,
          revokedAt:
            new Date()
        });

        await expect(
          revokeSpecificSession({
            userId: 1,
            sessionId: 5
          })
        ).rejects.toMatchObject({
          code:
            "SESSION_ALREADY_REVOKED"
        });

      }
    );

    test(
      "revokeSpecificSession rejects missing session",
      async () => {

        repository.findSessionById.mockResolvedValue(
          null
        );

        await expect(
          revokeSpecificSession({
            userId: 1,
            sessionId: 5
          })
        ).rejects.toMatchObject({
          code:
            "SESSION_NOT_FOUND"
        });

      }
    );

  }
);
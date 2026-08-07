import { jest } from "@jest/globals";
import jwt from "jsonwebtoken";

jest.unstable_mockModule(
  "../../config/env.js",
  () => ({
    default: {
      jwt: {
        accessSecret: "access-secret",
        refreshSecret: "refresh-secret",
        accessExpiresIn: "15m",
        refreshExpiresIn: "7d"
      }
    }
  })
);

const {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
} = await import(
  "../../utils/jwt.js"
);

describe(
  "jwt utility",
  () => {

    test(
      "generates access token",
      () => {

        const token =
          generateAccessToken({
            id: 1,
            email: "test@test.com",
            role: "JOB_SEEKER"
          });

        expect(typeof token)
          .toBe("string");

      }
    );

    test(
      "generates refresh token",
      () => {

        const token =
          generateRefreshToken({
            id: 1,
            email: "test@test.com",
            role: "JOB_SEEKER"
          });

        expect(typeof token)
          .toBe("string");

      }
    );

    test(
      "verifies access token",
      () => {

        const token =
          generateAccessToken({
            id: 100,
            email: "user@test.com",
            role: "ADMIN"
          });

        const payload =
          verifyAccessToken(token);

        expect(payload.id)
          .toBe(100);

        expect(payload.email)
          .toBe("user@test.com");

      }
    );

    test(
      "verifies refresh token",
      () => {

        const token =
          generateRefreshToken({
            id: 10,
            email: "abc@test.com",
            role: "RECRUITER"
          });

        const payload =
          verifyRefreshToken(token);

        expect(payload.id)
          .toBe(10);

        expect(payload.email)
          .toBe("abc@test.com");

        expect(payload.jti)
          .toBeDefined();

      }
    );

    test(
      "rejects invalid access token",
      () => {

        expect(() =>
          verifyAccessToken(
            "invalid-token"
          )
        ).toThrow(
          expect.objectContaining({
            code:
              "INVALID_ACCESS_TOKEN"
          })
        );

      }
    );

    test(
      "rejects invalid refresh token",
      () => {

        expect(() =>
          verifyRefreshToken(
            "invalid-token"
          )
        ).toThrow(
          expect.objectContaining({
            code:
              "INVALID_REFRESH_TOKEN"
          })
        );

      }
    );

    test(
      "detects expired access token",
      () => {

        const expired =
          jwt.sign(
            {
              id: 1
            },
            "access-secret",
            {
              expiresIn: -10
            }
          );

        expect(() =>
          verifyAccessToken(
            expired
          )
        ).toThrow(
          expect.objectContaining({
            code:
              "ACCESS_TOKEN_EXPIRED"
          })
        );

      }
    );

    test(
      "detects expired refresh token",
      () => {

        const expired =
          jwt.sign(
            {
              id: 1
            },
            "refresh-secret",
            {
              expiresIn: -10
            }
          );

        expect(() =>
          verifyRefreshToken(
            expired
          )
        ).toThrow(
          expect.objectContaining({
            code:
              "REFRESH_TOKEN_EXPIRED"
          })
        );

      }
    );

  }
);
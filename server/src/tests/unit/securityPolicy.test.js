import jwt from "jsonwebtoken";
import { JWT_ALGORITHM, generateAccessToken, verifyAccessToken } from "../../utils/jwt.js";
import { hasDangerousKey, pickAllowedFields, normalizeSortDirection, removeSensitiveFields } from "../../utils/securityPolicy.js";
import { refreshTokenCookieOptions, clearRefreshTokenCookieOptions } from "../../config/cookie.config.js";

describe("Security utilities", () => {
  test("uses only HS256 for project JWT tokens", () => {
    const token = generateAccessToken({ id: "user-1", role: "JOB_SEEKER" });
    expect(JWT_ALGORITHM).toBe("HS256");
    expect(jwt.decode(token, { complete: true }).header.alg).toBe("HS256");
    expect(verifyAccessToken(token).id).toBe("user-1");
  });

  test("rejects unsafe object keys and supports field whitelisting", () => {
    expect(hasDangerousKey({ passwordHash: "forged" })).toBe(true);
    expect(hasDangerousKey({ profile: { __proto__: { admin: true } } })).toBe(false);
    expect(pickAllowedFields({ name: "A", role: "ADMIN" }, ["name"])).toEqual({ name: "A" });
  });

  test("normalizes unsafe sorting and removes sensitive response values", () => {
    expect(normalizeSortDirection("DROP TABLE users", "DESC")).toBe("DESC");
    expect(removeSensitiveFields({ id: 1, passwordHash: "x", nested: { refreshTokenHash: "y" } })).toEqual({ id: 1, nested: {} });
  });

  test("uses matching secure cookie creation and clearing options", () => {
    expect(refreshTokenCookieOptions.httpOnly).toBe(true);
    expect(clearRefreshTokenCookieOptions.httpOnly).toBe(true);
    expect(clearRefreshTokenCookieOptions.path).toBe(refreshTokenCookieOptions.path);
    expect(clearRefreshTokenCookieOptions.sameSite).toBe(refreshTokenCookieOptions.sameSite);
    expect(clearRefreshTokenCookieOptions.secure).toBe(refreshTokenCookieOptions.secure);
  });
});

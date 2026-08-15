import {
  jest
} from "@jest/globals";

import {
  REFRESH_TOKEN_COOKIE_NAME
} from "../../config/cookie.config.js";

import {
  clearRefreshTokenCookie,
  getRefreshTokenCookieName,
  getRefreshTokenFromRequest,
  setRefreshTokenCookie
} from "../../utils/cookie.util.js";

describe("refresh-token cookie isolation", () => {
  const buildRequest = ({
    tabId,
    cookies = {}
  } = {}) => ({
    headers: tabId
      ? { "x-auth-tab-id": tabId }
      : {},
    cookies,
    get(name) {
      return this.headers[
        name.toLowerCase()
      ];
    }
  });

  test("uses the legacy cookie name when no tab identifier is provided", () => {
    expect(
      getRefreshTokenCookieName(
        buildRequest()
      )
    ).toBe(REFRESH_TOKEN_COOKIE_NAME);
  });

  test("uses an isolated refresh cookie for each browser tab", () => {
    const req = buildRequest({
      tabId: "11111111-2222-4333-8444-555555555555"
    });

    expect(
      getRefreshTokenCookieName(req)
    ).toBe(
      "refreshToken_11111111-2222-4333-8444-555555555555"
    );
  });

  test("sets, reads and clears the tab-specific cookie", () => {
    const tabId =
      "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";
    const cookieName =
      `refreshToken_${tabId}`;
    const req = buildRequest({
      tabId,
      cookies: {
        [cookieName]: "tab-refresh-token"
      }
    });
    const res = {
      cookie: jest.fn(),
      clearCookie: jest.fn()
    };

    setRefreshTokenCookie(
      res,
      "tab-refresh-token",
      req
    );

    expect(res.cookie).toHaveBeenCalledWith(
      cookieName,
      "tab-refresh-token",
      expect.objectContaining({
        httpOnly: true,
        path: "/api/auth"
      })
    );

    expect(
      getRefreshTokenFromRequest(req)
    ).toBe("tab-refresh-token");

    clearRefreshTokenCookie(res, req);

    expect(
      res.clearCookie
    ).toHaveBeenCalledWith(
      cookieName,
      expect.objectContaining({
        httpOnly: true,
        path: "/api/auth"
      })
    );
  });
});

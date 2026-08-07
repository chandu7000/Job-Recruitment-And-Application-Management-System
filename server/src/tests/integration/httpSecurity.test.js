import request from "supertest";
import app from "../../app.js";

describe("Phase 12 HTTP security", () => {
  test("returns hardened HTTP headers", async () => {
    const response = await request(app).get("/api/health");
    expect(response.headers["x-frame-options"]).toBe("DENY");
    expect(response.headers["x-content-type-options"]).toBe("nosniff");
    expect(response.headers["referrer-policy"]).toBe("no-referrer");
    expect(response.headers["x-powered-by"]).toBeUndefined();
  });

  test("allows configured browser origins", async () => {
    const origin = process.env.CLIENT_ORIGIN.split(",")[0];
    const response = await request(app).get("/api/health").set("Origin", origin);
    expect(response.headers["access-control-allow-origin"]).toBe(origin);
    expect(response.headers["access-control-allow-credentials"]).toBe("true");
  });

  test("blocks an unapproved browser origin", async () => {
    const response = await request(app).get("/api/health").set("Origin", "https://evil.example");
    expect(response.status).toBe(403);
    expect(response.body.code || response.body.error?.code).toBe("CORS_ORIGIN_NOT_ALLOWED");
  });

  test("rejects protected mass-assignment fields before route execution", async () => {
    const response = await request(app).post("/api/auth/register").send({ email: "security@example.com", passwordHash: "forged" });
    expect(response.status).toBe(400);
    expect(response.body.code || response.body.error?.code).toBe("UNSAFE_REQUEST_FIELDS");
  });

  test("returns a controlled invalid JSON error", async () => {
    const response = await request(app).post("/api/auth/login").set("Content-Type", "application/json").send('{"email":');
    expect(response.status).toBe(400);
    expect(response.body.code || response.body.error?.code).toBe("INVALID_JSON");
    expect(response.body.stack).toBeUndefined();
  });
});

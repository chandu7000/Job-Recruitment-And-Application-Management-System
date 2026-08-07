import request from "supertest";
import app from "../../app.js";

describe("Error Handling", () => {
  it("should return a standardized response for malformed JSON", async () => {
    const response = await request(app)
      .post("/api/health")
      .set("Content-Type", "application/json")
      .send('{"name":"John"') // Invalid JSON
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(
      "Request body contains invalid JSON"
    );
    expect(response.body.code).toBe("INVALID_JSON");
    expect(response.body.requestId).toBeDefined();
    expect(response.body.timestamp).toBeDefined();

    expect(response.headers["x-request-id"]).toBeDefined();
  });
});
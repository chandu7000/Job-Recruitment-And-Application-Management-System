import request from "supertest";
import app from "../../app.js";

describe("Health API", () => {
    describe("GET /api/health", () => {
        it("should return application health status", async () => {
            const response = await request(app)
                .get("/api/health")
                .expect("Content-Type", /json/)
                .expect(200);

            expect(response.body).toHaveProperty("success");
            expect(response.body).toHaveProperty("message");
            expect(response.body).toHaveProperty("data");
            expect(response.body).toHaveProperty("requestId");
            expect(response.body).toHaveProperty("timestamp");

            expect(typeof response.body.success).toBe("boolean");
            expect(typeof response.body.message).toBe("string");
            expect(typeof response.body.requestId).toBe("string");
            expect(typeof response.body.timestamp).toBe("string");

            expect(response.headers["content-type"]).toMatch(/application\/json/);
            expect(response.headers["x-request-id"]).toBeDefined();
        });
    });

    describe("GET /api/health/ready", () => {
        it("should return readiness status when the database is available", async () => {
            const response = await request(app)
                .get("/api/health/ready")
                .expect("Content-Type", /json/)
                .expect(200);

            expect(response.body).toHaveProperty("success");
            expect(response.body).toHaveProperty("message");
            expect(response.body).toHaveProperty("data");
            expect(response.body).toHaveProperty("requestId");
            expect(response.body).toHaveProperty("timestamp");

            expect(typeof response.body.success).toBe("boolean");
            expect(typeof response.body.message).toBe("string");
            expect(typeof response.body.requestId).toBe("string");
            expect(typeof response.body.timestamp).toBe("string");

            expect(response.headers["content-type"]).toMatch(/application\/json/);
            expect(response.headers["x-request-id"]).toBeDefined();
        });
    });

    describe("Unknown API route", () => {
        it("should return the standardized 404 response", async () => {
            const response = await request(app)
                .get("/api/unknown")
                .expect("Content-Type", /json/)
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe(
                "API endpoint not found: GET /api/unknown"
            );
            expect(response.body.code).toBeDefined();
            expect(response.body.errors).toBeDefined();
            expect(response.body.requestId).toBeDefined();
            expect(response.body.timestamp).toBeDefined();

            expect(response.headers["x-request-id"]).toBeDefined();
        });
    });
});
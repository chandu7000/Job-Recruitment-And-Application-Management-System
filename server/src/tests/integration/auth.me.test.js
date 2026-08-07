import request from "supertest";
import { Op } from "sequelize";

import app from "../../app.js";
import User from "../../models/user.model.js";
import UserSession from "../../models/userSession.model.js";

const TEST_EMAIL_PREFIX = "me.integration.";
const PASSWORD = "Strong@Password123";

const createEmail = (label) =>
    `${TEST_EMAIL_PREFIX}${label}.${Date.now()}@example.com`;

const cleanup = async () => {
    const users = await User.unscoped().findAll({
        where: {
            email: {
                [Op.like]: `${TEST_EMAIL_PREFIX}%`
            }
        },
        attributes: ["id"]
    });

    const userIds = users.map((user) => user.id);

    if (userIds.length === 0) {
        return;
    }

    await UserSession.unscoped().destroy({
        where: {
            userId: {
                [Op.in]: userIds
            }
        },
        force: true
    });

    await User.unscoped().destroy({
        where: {
            id: {
                [Op.in]: userIds
            }
        },
        force: true
    });
};

const registerUser = async (email) => {
    await request(app)
        .post("/api/auth/register/job-seeker")
        .send({
            email,
            password: PASSWORD
        })
        .expect(201);

    const user = await User.unscoped().findOne({
        where: {
            email
        }
    });

    expect(user).not.toBeNull();

    user.emailVerified = true;
    user.status = "ACTIVE";

    await user.save();

    return user;
};

const loginUser = async (email) => {
    return request(app)
        .post("/api/auth/login")
        .set("User-Agent", "CareerForge Me Integration Test")
        .send({
            email,
            password: PASSWORD
        })
        .expect(200);
};

describe("Current User API", () => {
    beforeEach(cleanup);
    afterEach(cleanup);

    describe("GET /api/auth/me", () => {
        it("should return the authenticated user profile", async () => {
            const email = createEmail("success");

            const user = await registerUser(email);

            const loginResponse = await loginUser(email);

            const accessToken =
                loginResponse.body.data.accessToken;

            expect(accessToken).toEqual(
                expect.any(String)
            );

            const response = await request(app)
                .get("/api/auth/me")
                .set(
                    "Authorization",
                    `Bearer ${accessToken}`
                )
                .expect(200);

            expect(response.body.success).toBe(true);

            expect(response.body.data).toBeDefined();

            expect(response.body.data.id).toBe(user.id);

            expect(response.body.data.email).toBe(email);

            expect(response.body.data.status).toBe(
                "ACTIVE"
            );
        });

        it("should reject request without an access token", async () => {
            const response = await request(app)
                .get("/api/auth/me")
                .expect(401);

            expect(response.body.success).toBe(false);

            expect(response.body.code).toBe(
                "AUTHENTICATION_REQUIRED"
            );
        });

        it("should reject request with an invalid access token", async () => {
            const response = await request(app)
                .get("/api/auth/me")
                .set(
                    "Authorization",
                    "Bearer invalid-access-token"
                )
                .expect(401);

            expect(response.body.success).toBe(false);

            expect(response.body.code).toBe(
                "INVALID_ACCESS_TOKEN"
            );
        });

        it("should reject request for a disabled account", async () => {
            const email = createEmail("disabled");

            const user = await registerUser(email);

            const loginResponse = await loginUser(email);

            const accessToken =
                loginResponse.body.data.accessToken;

            user.status = "DISABLED";
            await user.save();

            const response = await request(app)
                .get("/api/auth/me")
                .set(
                    "Authorization",
                    `Bearer ${accessToken}`
                )
                .expect(403);

            expect(response.body.success).toBe(false);

            expect(response.body.code).toBe(
                "ACCOUNT_DISABLED"
            );
        });

        it("should not expose sensitive user fields", async () => {
            const email = createEmail("sensitive-fields");

            await registerUser(email);

            const loginResponse = await loginUser(email);

            const accessToken =
                loginResponse.body.data.accessToken;

            const response = await request(app)
                .get("/api/auth/me")
                .set(
                    "Authorization",
                    `Bearer ${accessToken}`
                )
                .expect(200);

            expect(response.body.success).toBe(true);

            const userData = response.body.data;

            expect(userData.password).toBeUndefined();
            expect(userData.passwordHash).toBeUndefined();
            expect(userData.refreshToken).toBeUndefined();
            expect(userData.refreshTokenHash).toBeUndefined();
            expect(userData.emailVerificationToken).toBeUndefined();
            expect(userData.passwordResetToken).toBeUndefined();
            expect(userData.resetPasswordToken).toBeUndefined();
        });
    });
});
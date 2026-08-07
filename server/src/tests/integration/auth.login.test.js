import request from "supertest";
import { Op } from "sequelize";

import app from "../../app.js";
import User from "../../models/user.model.js";
import UserSession from "../../models/userSession.model.js";

const TEST_EMAIL_PREFIX = "login.integration.";
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

  const ids = users.map((u) => u.id);

  if (ids.length) {
    await UserSession.unscoped().destroy({
      where: {
        userId: {
          [Op.in]: ids
        }
      },
      force: true
    });

    await User.unscoped().destroy({
      where: {
        id: {
          [Op.in]: ids
        }
      },
      force: true
    });
  }
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
    where: { email }
  });

  user.emailVerified = true;
  user.status = "ACTIVE";

  await user.save();

  return user;
};

describe("Login API", () => {
  beforeEach(cleanup);
  afterEach(cleanup);

  describe("POST /api/auth/login", () => {

    it("should login successfully", async () => {

      const email = createEmail("success");

      await registerUser(email);

      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email,
          password: PASSWORD
        })
        .expect(200);

      expect(response.body.success).toBe(true);

      expect(response.body.data.accessToken)
        .toEqual(expect.any(String));

      expect(response.body.data.user.email)
        .toBe(email);

      expect(response.headers["set-cookie"])
        .toBeDefined();
    });

    it("should create a new session on login", async () => {

      const email = createEmail("session");

      const user = await registerUser(email);

      const beforeCount = await UserSession.count({
        where: {
          userId: user.id
        }
      });

      await request(app)
        .post("/api/auth/login")
        .send({
          email,
          password: PASSWORD
        })
        .expect(200);

      const afterCount = await UserSession.count({
        where: {
          userId: user.id
        }
      });

      expect(afterCount).toBe(beforeCount + 1);

    });

    it("should reject incorrect password", async () => {

      const email = createEmail("wrong-password");

      await registerUser(email);

      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email,
          password: "WrongPassword123!"
        })
        .expect(401);

      expect(response.body.success).toBe(false);

      expect(response.body.code)
        .toBe("INVALID_CREDENTIALS");

    });

    it("should reject unknown email", async () => {

      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: createEmail("unknown"),
          password: PASSWORD
        })
        .expect(401);

      expect(response.body.success).toBe(false);

      expect(response.body.code)
        .toBe("INVALID_CREDENTIALS");

    });

    it("should reject invalid email format", async () => {

      await request(app)
        .post("/api/auth/login")
        .send({
          email: "invalid-email",
          password: PASSWORD
        })
        .expect(422);

    });

    it("should reject missing password", async () => {

      await request(app)
        .post("/api/auth/login")
        .send({
          email: createEmail("missing-password")
        })
        .expect(422);

    });

    it("should reject missing email", async () => {

      await request(app)
        .post("/api/auth/login")
        .send({
          password: PASSWORD
        })
        .expect(422);

    });

    it("should reject unverified email", async () => {

      const email = createEmail("unverified");

      await request(app)
        .post("/api/auth/register/job-seeker")
        .send({
          email,
          password: PASSWORD
        });

      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email,
          password: PASSWORD
        })
        .expect(403);

      expect(response.body.code)
        .toBe("EMAIL_NOT_VERIFIED");

    });

    it("should reject suspended account", async () => {

      const email = createEmail("suspended");

      const user = await registerUser(email);

      user.status = "SUSPENDED";

      await user.save();

      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email,
          password: PASSWORD
        })
        .expect(403);

      expect(response.body.code)
        .toBe("ACCOUNT_SUSPENDED");

    });

    it("should reject disabled account", async () => {

      const email = createEmail("disabled");

      const user = await registerUser(email);

      user.status = "DISABLED";

      await user.save();

      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email,
          password: PASSWORD
        })
        .expect(403);

      expect(response.body.code)
        .toBe("ACCOUNT_DISABLED");

    });

  });

});
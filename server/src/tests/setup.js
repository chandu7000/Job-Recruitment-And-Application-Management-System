import { jest } from "@jest/globals";
import env from "../config/env.js";
import { closeDatabase } from "../config/database.js";

beforeAll(() => {
  if (!env.isTest) {
    throw new Error(
      "Integration tests must run with NODE_ENV=test."
    );
  }

  if (
    env.database.name ===
    env.database.developmentName
  ) {
    throw new Error(
      "TEST_DB_NAME must be different from DB_NAME."
    );
  }
});

afterEach(() => {
  jest.clearAllMocks();
});

afterAll(async () => {
  await closeDatabase();
});
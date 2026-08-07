require("dotenv").config();

const developmentDatabase =
  process.env.DB_NAME;

const testDatabase =
  process.env.TEST_DB_NAME;

if (
  !developmentDatabase ||
  !testDatabase
) {
  throw new Error(
    "DB_NAME and TEST_DB_NAME are required."
  );
}

if (
  developmentDatabase === testDatabase
) {
  throw new Error(
    "TEST_DB_NAME must be different from DB_NAME."
  );
}

const commonConfig = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  dialect: "mysql",
  logging: false
};

const productionConfig = {
  ...commonConfig,

  dialectOptions: {
    ssl: {
      rejectUnauthorized: true
    }
  }
};

module.exports = {
  development: {
    ...commonConfig,
    database: developmentDatabase
  },

  test: {
    ...commonConfig,
    database: testDatabase
  },

  production: {
    ...productionConfig,
    database: developmentDatabase
  }
};
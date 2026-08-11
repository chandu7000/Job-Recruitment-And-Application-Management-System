import { Sequelize } from "sequelize";
import fs from "fs";
import env from "./env.js";

const sequelize = new Sequelize(
  env.database.name,
  env.database.user,
  env.database.password,
  {
    host: env.database.host,
    port: env.database.port,
    dialect: "mysql",

    logging: env.isDevelopment
      ? (message) => console.log(`[Sequelize] ${message}`)
      : false,

    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },

    dialectOptions: {
      connectTimeout: 10000,

      ...(env.isProduction
        ? {
          ssl: {
            ca: fs.readFileSync(
              "/etc/secrets/ca.pem",
              "utf8"
            ),
            rejectUnauthorized: true
          }
        }
        : {})
    },

    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    },

    timezone: "+00:00",

    retry: {
      max: 3
    }
  }
);

const connectDatabase = async () => {
  try {
    await sequelize.authenticate();

    console.log(
      `MySQL Connected Successfully using Sequelize: ${env.database.name}`
    );
  } catch (error) {
    console.error(
      "Unable to connect to the MySQL database:",
      error.message
    );

    throw error;
  }
};

const closeDatabase = async () => {
  try {
    await sequelize.close();
    console.log("Sequelize database connection closed");
  } catch (error) {
    console.error(
      "Failed to close Sequelize connection:",
      error.message
    );

    throw error;
  }
};

export {
  sequelize,
  connectDatabase,
  closeDatabase
};
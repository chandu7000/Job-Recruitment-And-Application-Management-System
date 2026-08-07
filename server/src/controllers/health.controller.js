import { sequelize } from "../config/database.js";
import asyncHandler from "../middlewares/asyncHandler.middleware.js";
import { sendSuccess } from "../utils/apiResponse.js";

const getHealthStatus = (req, res) => {
  return sendSuccess(
    res,
    200,
    "CareerForge backend is healthy",
    {
      status: "UP",
      service: "careerforge-server",
      timestamp: new Date().toISOString()
    }
  );
};

const getReadinessStatus = asyncHandler(
  async (req, res) => {
    await sequelize.authenticate();

    return sendSuccess(
      res,
      200,
      "CareerForge backend is ready",
      {
        status: "READY",
        application: "UP",
        database: "UP",
        timestamp: new Date().toISOString()
      }
    );
  }
);

export {
  getHealthStatus,
  getReadinessStatus
};
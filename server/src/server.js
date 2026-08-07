import app from "./app.js";
import env from "./config/env.js";
import "./models/associations.js";

import {
  connectDatabase,
  closeDatabase
} from "./config/database.js";

import runSessionCleanup from "./jobs/sessionCleanup.job.js";

let httpServer;
let sessionCleanupInterval;
let isShuttingDown = false;

const shutdownServer = async (
  signal,
  exitCode = 0
) => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;

  console.log(
    `\n${signal} received. Shutting down safely...`
  );

  try {
    if (sessionCleanupInterval) {
      clearInterval(sessionCleanupInterval);
      sessionCleanupInterval = null;

      console.log(
        "✅ Session cleanup interval stopped"
      );
    }

    if (httpServer) {
      await new Promise((resolve, reject) => {
        httpServer.close((error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      });

      console.log("✅ HTTP server closed");
    }

    await closeDatabase();

    console.log(
      "✅ CareerForge shutdown completed"
    );

    process.exit(exitCode);
  } catch (error) {
    console.error(
      "❌ Error during graceful shutdown:",
      error.message
    );

    process.exit(1);
  }
};

const startServer = async () => {
  try {
    await connectDatabase();

    await runSessionCleanup();

    sessionCleanupInterval = setInterval(
      () => {
        void runSessionCleanup();
      },
      60 * 60 * 1000
    );

    sessionCleanupInterval.unref();

    httpServer = app.listen(env.port, () => {
      console.log(
        `🚀 CareerForge Server Running on Port ${env.port}`
      );
    });

    httpServer.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        console.error(
          `❌ Port ${env.port} is already in use`
        );
      } else if (error.code === "EACCES") {
        console.error(
          `❌ Permission denied while using port ${env.port}`
        );
      } else {
        console.error(
          "❌ HTTP server error:",
          error.message
        );
      }

      shutdownServer(
        "HTTP_SERVER_ERROR",
        1
      );
    });
  } catch (error) {
    console.error(
      "❌ CareerForge startup failed:",
      error.message
    );

    try {
      await closeDatabase();
    } catch (closeError) {
      console.error(
        "❌ Database cleanup failed:",
        closeError.message
      );
    }

    process.exit(1);
  }
};

process.on("SIGINT", () => {
  shutdownServer("SIGINT");
});

process.on("SIGTERM", () => {
  shutdownServer("SIGTERM");
});

process.on("unhandledRejection", (reason) => {
  const message =
    reason instanceof Error
      ? reason.message
      : String(reason);

  console.error(
    "❌ Unhandled promise rejection:",
    message
  );

  shutdownServer(
    "UNHANDLED_REJECTION",
    1
  );
});

process.on("uncaughtException", (error) => {
  console.error(
    "❌ Uncaught exception:",
    error.message
  );

  shutdownServer(
    "UNCAUGHT_EXCEPTION",
    1
  );
});

startServer();
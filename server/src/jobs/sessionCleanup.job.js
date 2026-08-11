import {
  deleteStaleSessions
} from "../repositories/userSession.repository.js";

const REVOKED_SESSION_RETENTION_DAYS = 30;

let cleanupRunning = false;

const runSessionCleanup = async () => {
  if (cleanupRunning) {
    console.warn(
      "Session cleanup skipped because a previous cleanup is still running."
    );

    return {
      skipped: true,
      deletedCount: 0
    };
  }

  cleanupRunning = true;

  try {
    const currentTime = new Date();

    const revokedBefore = new Date(
      currentTime.getTime() -
      REVOKED_SESSION_RETENTION_DAYS *
      24 *
      60 *
      60 *
      1000
    );

    const deletedCount =
      await deleteStaleSessions({
        currentTime,
        revokedBefore
      });

    console.log(
      `Session cleanup completed. Deleted ${deletedCount} stale sessions.`
    );

    return {
      skipped: false,
      deletedCount
    };
  } catch (error) {
    console.error(
      "Session cleanup failed:",
      error.message
    );

    return {
      skipped: false,
      deletedCount: 0,
      error
    };
  } finally {
    cleanupRunning = false;
  }
};

export default runSessionCleanup;
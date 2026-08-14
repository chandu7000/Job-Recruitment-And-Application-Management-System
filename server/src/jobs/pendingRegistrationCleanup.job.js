import { deleteExpiredPendingUsers } from "../repositories/auth.repository.js";

const PENDING_REGISTRATION_LIFETIME_MS = 24 * 60 * 60 * 1000;
let cleanupRunning = false;

const runPendingRegistrationCleanup = async () => {
  if (cleanupRunning) return { skipped: true, deletedCount: 0 };
  cleanupRunning = true;
  try {
    const createdBefore = new Date(Date.now() - PENDING_REGISTRATION_LIFETIME_MS);
    const deletedCount = await deleteExpiredPendingUsers(createdBefore);
    console.log(`Pending registration cleanup completed. Deleted ${deletedCount} expired unverified accounts.`);
    return { skipped: false, deletedCount };
  } catch (error) {
    console.error("Pending registration cleanup failed:", error.message);
    return { skipped: false, deletedCount: 0, error };
  } finally {
    cleanupRunning = false;
  }
};

export default runPendingRegistrationCleanup;

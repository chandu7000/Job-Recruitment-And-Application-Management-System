process.env.NODE_ENV = "test";

// Higher limits only for automated integration tests.
process.env.REGISTER_RATE_LIMIT_MAX_REQUESTS = "100";
process.env.LOGIN_RATE_LIMIT_MAX_REQUESTS = "100";
process.env.FORGOT_PASSWORD_RATE_LIMIT_MAX_REQUESTS = "100";
process.env.RESET_PASSWORD_RATE_LIMIT_MAX_REQUESTS = "100";
process.env.EMAIL_VERIFICATION_RATE_LIMIT_MAX_REQUESTS = "100";
process.env.REFRESH_TOKEN_RATE_LIMIT_MAX_REQUESTS = "100";
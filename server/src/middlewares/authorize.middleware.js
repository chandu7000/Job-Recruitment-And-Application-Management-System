import AppError from "../utils/AppError.js";

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(
        new AppError(
          "Authentication required.",
          401,
          "AUTHENTICATION_REQUIRED"
        )
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          "You are not authorized to access this resource.",
          403,
          "ACCESS_DENIED"
        )
      );
    }

    next();
  };
};

export default authorize;
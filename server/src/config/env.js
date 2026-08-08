import dotenv from "dotenv";

dotenv.config({
  quiet: true
});

const ALLOWED_NODE_ENVIRONMENTS = [
  "development",
  "test",
  "production"
];

const UNSAFE_SECRET_VALUES = [
  "secret",
  "changeme",
  "change_this",
  "password",
  "default",
  "test-secret",
  "your_super_secure"
];

const getRequiredEnvironmentVariable = (
  variableName
) => {
  const value = process.env[variableName];

  if (
    typeof value !== "string" ||
    value.trim() === ""
  ) {
    throw new Error(
      `Missing required environment variable: ${variableName}`
    );
  }

  return value.trim();
};

const getNumberEnvironmentVariable = (
  variableName,
  options = {}
) => {
  const {
    defaultValue,
    minimum = 0,
    maximum = Number.MAX_SAFE_INTEGER
  } = options;

  const rawValue =
    process.env[variableName];

  if (
    (
      rawValue === undefined ||
      rawValue.trim() === ""
    ) &&
    defaultValue !== undefined
  ) {
    return defaultValue;
  }

  if (
    rawValue === undefined ||
    rawValue.trim() === ""
  ) {
    throw new Error(
      `Missing required environment variable: ${variableName}`
    );
  }

  const parsedValue = Number(rawValue);

  if (
    !Number.isInteger(parsedValue) ||
    parsedValue < minimum ||
    parsedValue > maximum
  ) {
    throw new Error(
      `${variableName} must be an integer between ${minimum} and ${maximum}`
    );
  }

  return parsedValue;
};

const validateSecretStrength = (
  variableName,
  value,
  isProduction
) => {
  if (!isProduction) {
    return value;
  }

  if (value.length < 32) {
    throw new Error(
      `${variableName} must contain at least 32 characters in production`
    );
  }

  const normalizedValue =
    value.toLowerCase();

  if (
    UNSAFE_SECRET_VALUES.some(
      (unsafeValue) =>
        normalizedValue.includes(unsafeValue)
    )
  ) {
    throw new Error(
      `${variableName} contains an unsafe production value`
    );
  }

  return value;
};

const nodeEnvironment =
  process.env.NODE_ENV?.trim() ||
  "development";

if (
  !ALLOWED_NODE_ENVIRONMENTS.includes(
    nodeEnvironment
  )
) {
  throw new Error(
    `NODE_ENV must be one of: ${ALLOWED_NODE_ENVIRONMENTS.join(", ")}`
  );
}

const isProduction =
  nodeEnvironment === "production";

const env = {
  nodeEnvironment,

  isDevelopment:
    nodeEnvironment === "development",

  isTest:
    nodeEnvironment === "test",

  isProduction,

  port:
    getNumberEnvironmentVariable(
      "PORT",
      {
        defaultValue: 5000,
        minimum: 1,
        maximum: 65535
      }
    ),

  database: {
    host:
      getRequiredEnvironmentVariable(
        "DB_HOST"
      ),

    port:
      getNumberEnvironmentVariable(
        "DB_PORT",
        {
          minimum: 1,
          maximum: 65535
        }
      ),

    name:
      nodeEnvironment === "test"
        ? getRequiredEnvironmentVariable(
            "TEST_DB_NAME"
          )
        : getRequiredEnvironmentVariable(
            "DB_NAME"
          ),

    developmentName:
      getRequiredEnvironmentVariable(
        "DB_NAME"
      ),

    testName:
      getRequiredEnvironmentVariable(
        "TEST_DB_NAME"
      ),

    user:
      getRequiredEnvironmentVariable(
        "DB_USER"
      ),

    password:
      getRequiredEnvironmentVariable(
        "DB_PASSWORD"
      )
  },

  cors: {
    clientOrigins:
      getRequiredEnvironmentVariable(
        "CLIENT_ORIGIN"
      )
        .split(",")
        .map((origin) =>
          origin.trim()
        )
        .filter(Boolean)
  },

  clientUrl:
    getRequiredEnvironmentVariable(
      "CLIENT_URL"
    ),

  rateLimit: {
    windowMs:
      getNumberEnvironmentVariable(
        "RATE_LIMIT_WINDOW_MS",
        {
          defaultValue:
            15 * 60 * 1000,
          minimum: 1000
        }
      ),

    maxRequests:
      getNumberEnvironmentVariable(
        "RATE_LIMIT_MAX_REQUESTS",
        {
          defaultValue: 100,
          minimum: 1
        }
      )
  },

  authRateLimit: {
    login: {
      windowMinutes:
        getNumberEnvironmentVariable(
          "LOGIN_RATE_LIMIT_WINDOW_MINUTES",
          {
            defaultValue: 15,
            minimum: 1
          }
        ),

      maxRequests:
        getNumberEnvironmentVariable(
          "LOGIN_RATE_LIMIT_MAX_REQUESTS",
          {
            defaultValue: 5,
            minimum: 1
          }
        )
    },

    register: {
      windowMinutes:
        getNumberEnvironmentVariable(
          "REGISTER_RATE_LIMIT_WINDOW_MINUTES",
          {
            defaultValue: 60,
            minimum: 1
          }
        ),

      maxRequests:
        getNumberEnvironmentVariable(
          "REGISTER_RATE_LIMIT_MAX_REQUESTS",
          {
            defaultValue: 5,
            minimum: 1
          }
        )
    },

    forgotPassword: {
      windowMinutes:
        getNumberEnvironmentVariable(
          "FORGOT_PASSWORD_RATE_LIMIT_WINDOW_MINUTES",
          {
            defaultValue: 60,
            minimum: 1
          }
        ),

      maxRequests:
        getNumberEnvironmentVariable(
          "FORGOT_PASSWORD_RATE_LIMIT_MAX_REQUESTS",
          {
            defaultValue: 3,
            minimum: 1
          }
        )
    },

    resetPassword: {
      windowMinutes:
        getNumberEnvironmentVariable(
          "RESET_PASSWORD_RATE_LIMIT_WINDOW_MINUTES",
          {
            defaultValue: 15,
            minimum: 1
          }
        ),

      maxRequests:
        getNumberEnvironmentVariable(
          "RESET_PASSWORD_RATE_LIMIT_MAX_REQUESTS",
          {
            defaultValue: 5,
            minimum: 1
          }
        )
    },

    emailVerification: {
      windowMinutes:
        getNumberEnvironmentVariable(
          "EMAIL_VERIFICATION_RATE_LIMIT_WINDOW_MINUTES",
          {
            defaultValue: 60,
            minimum: 1
          }
        ),

      maxRequests:
        getNumberEnvironmentVariable(
          "EMAIL_VERIFICATION_RATE_LIMIT_MAX_REQUESTS",
          {
            defaultValue: 5,
            minimum: 1
          }
        )
    },

    emailChangeRequest: {
      windowMinutes:
        getNumberEnvironmentVariable(
          "EMAIL_CHANGE_REQUEST_RATE_LIMIT_WINDOW_MINUTES",
          {
            defaultValue: 60,
            minimum: 1
          }
        ),

      maxRequests:
        getNumberEnvironmentVariable(
          "EMAIL_CHANGE_REQUEST_RATE_LIMIT_MAX_REQUESTS",
          {
            defaultValue: 5,
            minimum: 1
          }
        )
    },

    emailChangeVerification: {
      windowMinutes:
        getNumberEnvironmentVariable(
          "EMAIL_CHANGE_VERIFICATION_RATE_LIMIT_WINDOW_MINUTES",
          {
            defaultValue: 15,
            minimum: 1
          }
        ),

      maxRequests:
        getNumberEnvironmentVariable(
          "EMAIL_CHANGE_VERIFICATION_RATE_LIMIT_MAX_REQUESTS",
          {
            defaultValue: 10,
            minimum: 1
          }
        )
    },

    refreshToken: {
      windowMinutes:
        getNumberEnvironmentVariable(
          "REFRESH_TOKEN_RATE_LIMIT_WINDOW_MINUTES",
          {
            defaultValue: 15,
            minimum: 1
          }
        ),

      maxRequests:
        getNumberEnvironmentVariable(
          "REFRESH_TOKEN_RATE_LIMIT_MAX_REQUESTS",
          {
            defaultValue: 30,
            minimum: 1
          }
        )
    }
  },

  sensitiveRouteRateLimit: {
    report: {
      windowMinutes:
        getNumberEnvironmentVariable(
          "REPORT_RATE_LIMIT_WINDOW_MINUTES",
          {
            defaultValue: 60,
            minimum: 1
          }
        ),

      maxRequests:
        getNumberEnvironmentVariable(
          "REPORT_RATE_LIMIT_MAX_REQUESTS",
          {
            defaultValue: 10,
            minimum: 1
          }
        )
    },

    upload: {
      windowMinutes:
        getNumberEnvironmentVariable(
          "UPLOAD_RATE_LIMIT_WINDOW_MINUTES",
          {
            defaultValue: 15,
            minimum: 1
          }
        ),

      maxRequests:
        getNumberEnvironmentVariable(
          "UPLOAD_RATE_LIMIT_MAX_REQUESTS",
          {
            defaultValue: 20,
            minimum: 1
          }
        )
    }
  },

  jwt: {
    accessSecret:
      validateSecretStrength(
        "JWT_ACCESS_SECRET",
        getRequiredEnvironmentVariable(
          "JWT_ACCESS_SECRET"
        ),
        isProduction
      ),

    accessExpiresIn:
      getRequiredEnvironmentVariable(
        "JWT_ACCESS_EXPIRES_IN"
      ),

    refreshSecret:
      validateSecretStrength(
        "JWT_REFRESH_SECRET",
        getRequiredEnvironmentVariable(
          "JWT_REFRESH_SECRET"
        ),
        isProduction
      ),

    refreshExpiresIn:
      getRequiredEnvironmentVariable(
        "JWT_REFRESH_EXPIRES_IN"
      )
  },

  cloudinary: {
    cloudName:
      getRequiredEnvironmentVariable(
        "CLOUDINARY_CLOUD_NAME"
      ),

    apiKey:
      getRequiredEnvironmentVariable(
        "CLOUDINARY_API_KEY"
      ),

    apiSecret:
      getRequiredEnvironmentVariable(
        "CLOUDINARY_API_SECRET"
      ),

    profileImageFolder:
      getRequiredEnvironmentVariable(
        "CLOUDINARY_PROFILE_IMAGE_FOLDER"
      ),

    resumeFolder:
      getRequiredEnvironmentVariable(
        "CLOUDINARY_RESUME_FOLDER"
      ),

    companyLogoFolder:
      getRequiredEnvironmentVariable(
        "CLOUDINARY_COMPANY_LOGO_FOLDER"
      )
  },

  email: {
    brevoApiKey:
      getRequiredEnvironmentVariable(
        "BREVO_API_KEY"
      ),

    senderEmail:
      getRequiredEnvironmentVariable(
        "BREVO_SENDER_EMAIL"
      )
  }
};

export default env;
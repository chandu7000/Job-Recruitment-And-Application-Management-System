import {
  DataTypes
} from "sequelize";

import {
  sequelize
} from "../config/database.js";

import User from "./user.model.js";

import {
  COMPANY_STATUSES,
  COMPANY_STATUS_VALUES
} from "../constants/company.constants.js";

const Company = sequelize.define(
  "Company",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },

    ownerId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "owner_id",

      references: {
        model: User,
        key: "id"
      },

      onDelete: "CASCADE",
      onUpdate: "CASCADE"
    },

    companyName: {
      type: DataTypes.STRING(200),
      allowNull: false,
      field: "company_name",

      validate: {
        notEmpty: {
          msg: "Company name is required."
        },

        len: {
          args: [2, 200],
          msg: "Company name must be between 2 and 200 characters."
        }
      }
    },

    slug: {
      type: DataTypes.STRING(220),
      allowNull: false,
      unique: true,

      validate: {
        notEmpty: {
          msg: "Company slug is required."
        },

        len: {
          args: [2, 220],
          msg: "Company slug must be between 2 and 220 characters."
        },

        is: {
          args: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
          msg: "Company slug must contain lowercase letters, numbers, and hyphens only."
        }
      }
    },

    companyEmail: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
      field: "company_email",

      validate: {
        isEmail: {
          msg: "Company email must be valid."
        }
      }
    },

    companyPhone: {
      type: DataTypes.STRING(30),
      allowNull: true,
      field: "company_phone",

      validate: {
        len: {
          args: [7, 30],
          msg: "Company phone number must be between 7 and 30 characters."
        }
      }
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,

      validate: {
        len: {
          args: [0, 10000],
          msg: "Company description must not exceed 10000 characters."
        }
      }
    },

    website: {
      type: DataTypes.STRING(500),
      allowNull: true,

      validate: {
        isUrl: {
          msg: "Company website must be a valid URL."
        }
      }
    },

    industry: {
      type: DataTypes.STRING(150),
      allowNull: true,

      validate: {
        len: {
          args: [1, 150],
          msg: "Industry must not exceed 150 characters."
        }
      }
    },

    companySize: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "company_size",

      validate: {
        len: {
          args: [1, 50],
          msg: "Company size must not exceed 50 characters."
        }
      }
    },

    foundedYear: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: "founded_year",

      validate: {
        min: {
          args: [1000],
          msg: "Founded year must be valid."
        },

        max(value) {
          const currentYear =
            new Date().getUTCFullYear();

          if (
            value !== null &&
            value !== undefined &&
            value > currentYear
          ) {
            throw new Error(
              "Founded year cannot be in the future."
            );
          }
        }
      }
    },

    location: {
      type: DataTypes.STRING(255),
      allowNull: true,

      validate: {
        len: {
          args: [1, 255],
          msg: "Location must not exceed 255 characters."
        }
      }
    },

    address: {
      type: DataTypes.STRING(500),
      allowNull: true,

      validate: {
        len: {
          args: [1, 500],
          msg: "Address must not exceed 500 characters."
        }
      }
    },

    city: {
      type: DataTypes.STRING(100),
      allowNull: true
    },

    state: {
      type: DataTypes.STRING(100),
      allowNull: true
    },

    country: {
      type: DataTypes.STRING(100),
      allowNull: true
    },

    postalCode: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: "postal_code"
    },

    logoUrl: {
      type: DataTypes.STRING(1000),
      allowNull: true,
      field: "logo_url",

      validate: {
        isUrl: {
          msg: "Company logo URL must be valid."
        }
      }
    },

    logoPublicId: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: "logo_public_id"
    },

    status: {
      type: DataTypes.ENUM(
        ...COMPANY_STATUS_VALUES
      ),

      allowNull: false,

      defaultValue:
        COMPANY_STATUSES.DRAFT,

      validate: {
        isIn: {
          args: [
            COMPANY_STATUS_VALUES
          ],

          msg:
            "Company status is invalid."
        }
      }
    },

    verificationReason: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "verification_reason",

      validate: {
        len: {
          args: [0, 2000],
          msg: "Verification reason must not exceed 2000 characters."
        }
      }
    },

    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "deleted_at"
    }
  },
  {
    tableName: "companies",

    timestamps: true,

    paranoid: true,

    createdAt: "created_at",

    updatedAt: "updated_at",

    deletedAt: "deleted_at",

    indexes: [
      {
        name: "idx_companies_owner_id",
        fields: ["owner_id"]
      },

      {
        name: "uq_companies_slug",
        unique: true,
        fields: ["slug"]
      },

      {
        name: "idx_companies_status",
        fields: ["status"]
      },

      {
        name: "idx_companies_industry",
        fields: ["industry"]
      }
    ]
  }
);

export default Company;
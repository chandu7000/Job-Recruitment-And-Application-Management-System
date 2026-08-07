export async function up(
  queryInterface,
  Sequelize
) {
  await queryInterface.createTable(
    "companies",
    {
      id: {
        type:
          Sequelize.UUID,
        allowNull:
          false,
        primaryKey:
          true
      },

      owner_id: {
        type:
          Sequelize.UUID,
        allowNull:
          false,

        references: {
          model:
            "users",
          key:
            "id"
        },

        onUpdate:
          "CASCADE",

        onDelete:
          "CASCADE"
      },

      company_name: {
        type:
          Sequelize.STRING(200),
        allowNull:
          false
      },

      slug: {
        type:
          Sequelize.STRING(220),
        allowNull:
          false
      },

      company_email: {
        type:
          Sequelize.STRING(255),
        allowNull:
          true
      },

      company_phone: {
        type:
          Sequelize.STRING(30),
        allowNull:
          true
      },

      description: {
        type:
          Sequelize.TEXT,
        allowNull:
          true
      },

      website: {
        type:
          Sequelize.STRING(500),
        allowNull:
          true
      },

      industry: {
        type:
          Sequelize.STRING(150),
        allowNull:
          true
      },

      company_size: {
        type:
          Sequelize.STRING(50),
        allowNull:
          true
      },

      founded_year: {
        type:
          Sequelize.INTEGER.UNSIGNED,
        allowNull:
          true
      },

      location: {
        type:
          Sequelize.STRING(255),
        allowNull:
          true
      },

      address: {
        type:
          Sequelize.STRING(500),
        allowNull:
          true
      },

      city: {
        type:
          Sequelize.STRING(100),
        allowNull:
          true
      },

      state: {
        type:
          Sequelize.STRING(100),
        allowNull:
          true
      },

      country: {
        type:
          Sequelize.STRING(100),
        allowNull:
          true
      },

      postal_code: {
        type:
          Sequelize.STRING(20),
        allowNull:
          true
      },

      logo_url: {
        type:
          Sequelize.STRING(1000),
        allowNull:
          true
      },

      logo_public_id: {
        type:
          Sequelize.STRING(500),
        allowNull:
          true
      },

      status: {
        type:
          Sequelize.ENUM(
            "DRAFT",
            "PENDING_VERIFICATION",
            "VERIFIED",
            "REJECTED"
          ),
        allowNull:
          false,
        defaultValue:
          "DRAFT"
      },

      verification_reason: {
        type:
          Sequelize.TEXT,
        allowNull:
          true
      },

      created_at: {
        type:
          Sequelize.DATE,
        allowNull:
          false,
        defaultValue:
          Sequelize.literal(
            "CURRENT_TIMESTAMP"
          )
      },

      updated_at: {
        type:
          Sequelize.DATE,
        allowNull:
          false,
        defaultValue:
          Sequelize.literal(
            "CURRENT_TIMESTAMP"
          )
      },

      deleted_at: {
        type:
          Sequelize.DATE,
        allowNull:
          true
      }
    }
  );

  await queryInterface.addIndex(
    "companies",
    ["owner_id"],
    {
      name:
        "idx_companies_owner_id"
    }
  );

  await queryInterface.addIndex(
    "companies",
    ["slug"],
    {
      name:
        "uq_companies_slug",
      unique:
        true
    }
  );

  await queryInterface.addIndex(
    "companies",
    ["company_email"],
    {
      name:
        "uq_companies_company_email",
      unique:
        true
    }
  );

  await queryInterface.addIndex(
    "companies",
    ["status"],
    {
      name:
        "idx_companies_status"
    }
  );

  await queryInterface.addIndex(
    "companies",
    ["industry"],
    {
      name:
        "idx_companies_industry"
    }
  );
}

export async function down(
  queryInterface
) {
  await queryInterface.dropTable(
    "companies"
  );
}
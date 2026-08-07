export async function up(
  queryInterface,
  Sequelize
) {
  await queryInterface.createTable(
    "company_verification_history",
    {
      id: {
        type:
          Sequelize.BIGINT.UNSIGNED,
        allowNull:
          false,
        autoIncrement:
          true,
        primaryKey:
          true
      },

      company_id: {
        type:
          Sequelize.UUID,
        allowNull:
          false,

        references: {
          model:
            "companies",
          key:
            "id"
        },

        onUpdate:
          "CASCADE",

        onDelete:
          "CASCADE"
      },

      old_status: {
        type:
          Sequelize.ENUM(
            "DRAFT",
            "PENDING_VERIFICATION",
            "VERIFIED",
            "REJECTED"
          ),
        allowNull:
          false
      },

      new_status: {
        type:
          Sequelize.ENUM(
            "DRAFT",
            "PENDING_VERIFICATION",
            "VERIFIED",
            "REJECTED"
          ),
        allowNull:
          false
      },

      reason: {
        type:
          Sequelize.TEXT,
        allowNull:
          true
      },

      performed_by: {
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
          "RESTRICT"
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
      }
    }
  );

  await queryInterface.addIndex(
    "company_verification_history",
    [
      "company_id"
    ],
    {
      name:
        "idx_company_verification_history_company_id"
    }
  );

  await queryInterface.addIndex(
    "company_verification_history",
    [
      "performed_by"
    ],
    {
      name:
        "idx_company_verification_history_performed_by"
    }
  );

  await queryInterface.addIndex(
    "company_verification_history",
    [
      "created_at"
    ],
    {
      name:
        "idx_company_verification_history_created_at"
    }
  );
}

export async function down(
  queryInterface
) {
  await queryInterface.dropTable(
    "company_verification_history"
  );
}
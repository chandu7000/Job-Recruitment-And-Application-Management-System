/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("users", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true
      },

      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },

      password_hash: {
        type: Sequelize.STRING(255),
        allowNull: false
      },

      role: {
        type: Sequelize.ENUM(
          "ADMIN",
          "RECRUITER",
          "JOB_SEEKER"
        ),
        allowNull: false,
        defaultValue: "JOB_SEEKER"
      },

      status: {
        type: Sequelize.ENUM(
          "PENDING_VERIFICATION",
          "ACTIVE",
          "DISABLED",
          "SUSPENDED"
        ),
        allowNull: false,
        defaultValue: "PENDING_VERIFICATION"
      },

      email_verified_at: {
        type: Sequelize.DATE,
        allowNull: true
      },

      failed_login_attempts: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },

      locked_until: {
        type: Sequelize.DATE,
        allowNull: true
      },

      last_login_at: {
        type: Sequelize.DATE,
        allowNull: true
      },

      password_changed_at: {
        type: Sequelize.DATE,
        allowNull: true
      },

      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
      },

      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        )
      }
    });

    await queryInterface.addIndex("users", ["email"], {
      unique: true,
      name: "idx_users_email_unique"
    });

    await queryInterface.addIndex("users", ["role"], {
      name: "idx_users_role"
    });

    await queryInterface.addIndex("users", ["status"], {
      name: "idx_users_status"
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex(
      "users",
      "idx_users_status"
    );

    await queryInterface.removeIndex(
      "users",
      "idx_users_role"
    );

    await queryInterface.removeIndex(
      "users",
      "idx_users_email_unique"
    );

    await queryInterface.dropTable("users");

    await queryInterface.sequelize.query(
      "DROP TYPE IF EXISTS enum_users_role;"
    ).catch(() => {});

    await queryInterface.sequelize.query(
      "DROP TYPE IF EXISTS enum_users_status;"
    ).catch(() => {});
  }
};
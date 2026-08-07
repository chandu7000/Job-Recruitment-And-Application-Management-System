export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("job_seeker_job_preferences", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },

      job_seeker_profile_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: "job_seeker_profiles",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },

      preferred_job_roles: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: []
      },

      preferred_locations: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: []
      },

      employment_types: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: []
      },

      work_modes: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: []
      },

      expected_salary: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true
      },

      salary_currency: {
        type: Sequelize.STRING(10),
        allowNull: false,
        defaultValue: "INR"
      },

      notice_period_days: {
        type: Sequelize.INTEGER,
        allowNull: true
      },

      willing_to_relocate: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },

      availability_status: {
        type: Sequelize.ENUM(
          "IMMEDIATELY_AVAILABLE",
          "OPEN_TO_OPPORTUNITIES",
          "SERVING_NOTICE_PERIOD",
          "NOT_LOOKING"
        ),
        allowNull: false,
        defaultValue: "OPEN_TO_OPPORTUNITIES"
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        onUpdate: Sequelize.literal("CURRENT_TIMESTAMP")
      }
    });

    await queryInterface.addIndex(
      "job_seeker_job_preferences",
      ["job_seeker_profile_id"],
      {
        name: "idx_job_preferences_profile"
      }
    );

    await queryInterface.addIndex(
      "job_seeker_job_preferences",
      ["availability_status"],
      {
        name: "idx_job_preferences_availability"
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable("job_seeker_job_preferences");
  }
};
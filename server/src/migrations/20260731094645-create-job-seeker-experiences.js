/** @type {import("sequelize-cli").Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "job_seeker_experiences",
      {
        id: {
          type: Sequelize.UUID,
          allowNull: false,
          primaryKey: true,
          defaultValue: Sequelize.literal("(UUID())")
        },

        job_seeker_profile_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: "job_seeker_profiles",
            key: "id"
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE"
        },

        company: {
          type: Sequelize.STRING(200),
          allowNull: false
        },

        role: {
          type: Sequelize.STRING(150),
          allowNull: false
        },

        employment_type: {
          type: Sequelize.ENUM(
            "FULL_TIME",
            "PART_TIME",
            "CONTRACT",
            "INTERNSHIP",
            "FREELANCE",
            "TEMPORARY"
          ),
          allowNull: false
        },

        location: {
          type: Sequelize.STRING(150),
          allowNull: true
        },

        start_date: {
          type: Sequelize.DATEONLY,
          allowNull: false
        },

        end_date: {
          type: Sequelize.DATEONLY,
          allowNull: true
        },

        is_current: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },

        description: {
          type: Sequelize.TEXT,
          allowNull: true
        },

        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal(
            "CURRENT_TIMESTAMP"
          )
        },

        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal(
            "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
          )
        }
      }
    );

    await queryInterface.addIndex(
      "job_seeker_experiences",
      ["job_seeker_profile_id"],
      {
        name: "idx_job_seeker_experiences_profile_id"
      }
    );

    await queryInterface.addIndex(
      "job_seeker_experiences",
      ["company"],
      {
        name: "idx_job_seeker_experiences_company"
      }
    );

    await queryInterface.addIndex(
      "job_seeker_experiences",
      ["employment_type"],
      {
        name: "idx_job_seeker_experiences_employment_type"
      }
    );

    await queryInterface.addIndex(
      "job_seeker_experiences",
      ["start_date", "end_date"],
      {
        name: "idx_job_seeker_experiences_dates"
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable(
      "job_seeker_experiences"
    );
  }
};
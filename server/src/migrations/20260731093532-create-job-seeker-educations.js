/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "job_seeker_educations",
      {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          allowNull: false,
          primaryKey: true
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

        institution: {
          type: Sequelize.STRING(200),
          allowNull: false
        },

        degree: {
          type: Sequelize.STRING(150),
          allowNull: false
        },

        field_of_study: {
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

        grade: {
          type: Sequelize.STRING(50),
          allowNull: true
        },

        description: {
          type: Sequelize.TEXT,
          allowNull: true
        },

        created_at: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal(
            "CURRENT_TIMESTAMP"
          )
        },

        updated_at: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal(
            "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
          )
        }
      }
    );

    await queryInterface.addIndex(
      "job_seeker_educations",
      ["job_seeker_profile_id"],
      {
        name: "idx_job_seeker_educations_profile_id"
      }
    );

    await queryInterface.addIndex(
      "job_seeker_educations",
      ["institution"],
      {
        name: "idx_job_seeker_educations_institution"
      }
    );

    await queryInterface.addIndex(
      "job_seeker_educations",
      ["start_date", "end_date"],
      {
        name: "idx_job_seeker_educations_dates"
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(
      "job_seeker_educations",
      "idx_job_seeker_educations_dates"
    );

    await queryInterface.removeIndex(
      "job_seeker_educations",
      "idx_job_seeker_educations_institution"
    );

    await queryInterface.removeIndex(
      "job_seeker_educations",
      "idx_job_seeker_educations_profile_id"
    );

    await queryInterface.dropTable(
      "job_seeker_educations"
    );
  }
};
/** @type {import("sequelize-cli").Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "job_seeker_projects",
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

        title: {
          type: Sequelize.STRING(200),
          allowNull: false
        },

        description: {
          type: Sequelize.TEXT,
          allowNull: true
        },

        technologies: {
          type: Sequelize.JSON,
          allowNull: true
        },

        project_url: {
          type: Sequelize.STRING(500),
          allowNull: true
        },

        repository_url: {
          type: Sequelize.STRING(500),
          allowNull: true
        },

        start_date: {
          type: Sequelize.DATEONLY,
          allowNull: true
        },

        end_date: {
          type: Sequelize.DATEONLY,
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
      "job_seeker_projects",
      ["job_seeker_profile_id"],
      {
        name: "idx_job_seeker_projects_profile_id"
      }
    );

    await queryInterface.addIndex(
      "job_seeker_projects",
      ["title"],
      {
        name: "idx_job_seeker_projects_title"
      }
    );

    await queryInterface.addIndex(
      "job_seeker_projects",
      ["start_date", "end_date"],
      {
        name: "idx_job_seeker_projects_dates"
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable(
      "job_seeker_projects"
    );
  }
};
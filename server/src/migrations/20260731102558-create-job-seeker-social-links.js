export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "job_seeker_social_links",
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

        platform: {
          type: Sequelize.ENUM(
            "LINKEDIN",
            "GITHUB",
            "PORTFOLIO",
            "LEETCODE",
            "HACKERRANK",
            "STACK_OVERFLOW",
            "PERSONAL_WEBSITE",
            "OTHER"
          ),
          allowNull: false
        },

        url: {
          type: Sequelize.STRING(500),
          allowNull: false
        },

        display_name: {
          type: Sequelize.STRING(150),
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
            "CURRENT_TIMESTAMP"
          )
        }
      }
    );

    await queryInterface.addIndex(
      "job_seeker_social_links",
      ["job_seeker_profile_id"],
      {
        name:
          "idx_job_seeker_social_links_profile_id"
      }
    );

    await queryInterface.addIndex(
      "job_seeker_social_links",
      ["platform"],
      {
        name:
          "idx_job_seeker_social_links_platform"
      }
    );

    await queryInterface.addIndex(
      "job_seeker_social_links",
      [
        "job_seeker_profile_id",
        "platform"
      ],
      {
        unique: true,
        name:
          "uq_job_seeker_social_links_profile_platform"
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable(
      "job_seeker_social_links"
    );
  }
};
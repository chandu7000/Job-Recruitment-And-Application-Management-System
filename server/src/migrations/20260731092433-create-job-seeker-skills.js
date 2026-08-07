/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("job_seeker_skills", {
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

      skill_name: {
        type: Sequelize.STRING(100),
        allowNull: false
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

    await queryInterface.addIndex(
      "job_seeker_skills",
      ["job_seeker_profile_id"],
      {
        name: "idx_job_seeker_skills_profile_id"
      }
    );

    await queryInterface.addIndex(
      "job_seeker_skills",
      ["skill_name"],
      {
        name: "idx_job_seeker_skills_skill_name"
      }
    );

    await queryInterface.addIndex(
      "job_seeker_skills",
      ["job_seeker_profile_id", "skill_name"],
      {
        unique: true,
        name: "idx_job_seeker_skills_unique_profile_skill"
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(
      "job_seeker_skills",
      "idx_job_seeker_skills_unique_profile_skill"
    );

    await queryInterface.removeIndex(
      "job_seeker_skills",
      "idx_job_seeker_skills_skill_name"
    );

    await queryInterface.removeIndex(
      "job_seeker_skills",
      "idx_job_seeker_skills_profile_id"
    );

    await queryInterface.dropTable(
      "job_seeker_skills"
    );
  }
};
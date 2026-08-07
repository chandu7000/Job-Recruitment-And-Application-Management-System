export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "job_seeker_certifications",
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

        name: {
          type: Sequelize.STRING(200),
          allowNull: false
        },

        issuing_organization: {
          type: Sequelize.STRING(200),
          allowNull: false
        },

        credential_id: {
          type: Sequelize.STRING(200),
          allowNull: true
        },

        credential_url: {
          type: Sequelize.STRING(500),
          allowNull: true
        },

        issue_date: {
          type: Sequelize.DATEONLY,
          allowNull: false
        },

        expiry_date: {
          type: Sequelize.DATEONLY,
          allowNull: true
        },

        does_not_expire: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
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
      "job_seeker_certifications",
      ["job_seeker_profile_id"],
      {
        name: "idx_job_seeker_certifications_profile_id"
      }
    );

    await queryInterface.addIndex(
      "job_seeker_certifications",
      ["name"],
      {
        name: "idx_job_seeker_certifications_name"
      }
    );

    await queryInterface.addIndex(
      "job_seeker_certifications",
      ["issuing_organization"],
      {
        name:
          "idx_job_seeker_certifications_issuing_organization"
      }
    );

    await queryInterface.addIndex(
      "job_seeker_certifications",
      ["issue_date", "expiry_date"],
      {
        name: "idx_job_seeker_certifications_dates"
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable(
      "job_seeker_certifications"
    );
  }
};
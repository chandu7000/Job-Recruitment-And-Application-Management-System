/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("job_seeker_profiles", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true
      },

      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: "users",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },

      first_name: {
        type: Sequelize.STRING(100),
        allowNull: true
      },

      last_name: {
        type: Sequelize.STRING(100),
        allowNull: true
      },

      phone_number: {
        type: Sequelize.STRING(30),
        allowNull: true
      },

      location: {
        type: Sequelize.STRING(255),
        allowNull: true
      },

      address_line_1: {
        type: Sequelize.STRING(255),
        allowNull: true
      },

      address_line_2: {
        type: Sequelize.STRING(255),
        allowNull: true
      },

      city: {
        type: Sequelize.STRING(100),
        allowNull: true
      },

      state: {
        type: Sequelize.STRING(100),
        allowNull: true
      },

      country: {
        type: Sequelize.STRING(100),
        allowNull: true
      },

      postal_code: {
        type: Sequelize.STRING(20),
        allowNull: true
      },

      headline: {
        type: Sequelize.STRING(255),
        allowNull: true
      },

      biography: {
        type: Sequelize.TEXT,
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

    await queryInterface.addIndex(
      "job_seeker_profiles",
      ["user_id"],
      {
        unique: true,
        name: "idx_job_seeker_profiles_user_id_unique"
      }
    );

    await queryInterface.addIndex(
      "job_seeker_profiles",
      ["city"],
      {
        name: "idx_job_seeker_profiles_city"
      }
    );

    await queryInterface.addIndex(
      "job_seeker_profiles",
      ["country"],
      {
        name: "idx_job_seeker_profiles_country"
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(
      "job_seeker_profiles",
      "idx_job_seeker_profiles_country"
    );

    await queryInterface.removeIndex(
      "job_seeker_profiles",
      "idx_job_seeker_profiles_city"
    );

    await queryInterface.removeIndex(
      "job_seeker_profiles",
      "idx_job_seeker_profiles_user_id_unique"
    );

    await queryInterface.dropTable("job_seeker_profiles");
  }
};
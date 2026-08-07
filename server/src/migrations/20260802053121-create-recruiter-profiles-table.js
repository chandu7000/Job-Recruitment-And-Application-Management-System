export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("recruiter_profiles", {
    id: {
      type: Sequelize.BIGINT.UNSIGNED,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },

    user_id: {
      type: Sequelize.UUID,
      allowNull: false,
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

    designation: {
      type: Sequelize.STRING(150),
      allowNull: true
    },

    phone_number: {
      type: Sequelize.STRING(20),
      allowNull: true
    },

    biography: {
      type: Sequelize.TEXT,
      allowNull: true
    },

    linkedin_url: {
      type: Sequelize.STRING(500),
      allowNull: true
    },

    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
    },

    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal(
        "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
      )
    }
  });

  await queryInterface.addIndex(
    "recruiter_profiles",
    ["user_id"],
    {
      name: "uq_recruiter_profiles_user_id",
      unique: true
    }
  );

  await queryInterface.addIndex(
    "recruiter_profiles",
    ["phone_number"],
    {
      name: "idx_recruiter_profiles_phone_number"
    }
  );
}

export async function down(queryInterface) {
  await queryInterface.dropTable("recruiter_profiles");
}
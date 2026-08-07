export async function up(
  queryInterface,
  Sequelize
) {
  await queryInterface.createTable(
    "interview_history",
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },

      interview_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "interviews",
          key: "id"
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      },

      previous_status: {
        type: Sequelize.ENUM(
          "SCHEDULED",
          "RESCHEDULED",
          "CONFIRMED",
          "DECLINED",
          "CANCELLED",
          "COMPLETED"
        ),
        allowNull: true
      },

      new_status: {
        type: Sequelize.ENUM(
          "SCHEDULED",
          "RESCHEDULED",
          "CONFIRMED",
          "DECLINED",
          "CANCELLED",
          "COMPLETED"
        ),
        allowNull: false
      },

      previous_schedule: {
        type: Sequelize.JSON,
        allowNull: true
      },

      new_schedule: {
        type: Sequelize.JSON,
        allowNull: true
      },

      previous_meeting_info: {
        type: Sequelize.JSON,
        allowNull: true
      },

      new_meeting_info: {
        type: Sequelize.JSON,
        allowNull: true
      },

      changed_by: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id"
        },
        onDelete: "RESTRICT",
        onUpdate: "CASCADE"
      },

      reason: {
        type: Sequelize.STRING(1000),
        allowNull: true
      },

      event: {
        type: Sequelize.STRING(100),
        allowNull: false
      },

      created_at: {
        type: Sequelize.DATE(6),
        allowNull: false
      }
    }
  );

  await queryInterface.addIndex(
    "interview_history",
    ["interview_id", "created_at"],
    {
      name:
        "idx_interview_history_interview_created"
    }
  );
}

export async function down(
  queryInterface
) {
  await queryInterface.dropTable(
    "interview_history"
  );
}
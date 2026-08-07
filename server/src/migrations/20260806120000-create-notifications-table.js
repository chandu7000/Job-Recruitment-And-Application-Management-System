"use strict";

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("notifications", {
    id: { type: Sequelize.UUID, allowNull: false, primaryKey: true },
    recipient_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: "users", key: "id" },
      onDelete: "CASCADE",
      onUpdate: "CASCADE"
    },
    type: { type: Sequelize.STRING(80), allowNull: false },
    title: { type: Sequelize.STRING(180), allowNull: false },
    message: { type: Sequelize.STRING(1000), allowNull: false },
    resource_type: { type: Sequelize.STRING(40), allowNull: true },
    resource_id: { type: Sequelize.UUID, allowNull: true },
    metadata: { type: Sequelize.JSON, allowNull: true },
    deduplication_key: { type: Sequelize.STRING(255), allowNull: true, unique: true },
    is_read: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
    read_at: { type: Sequelize.DATE, allowNull: true },
    created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
    updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") }
  });

  await queryInterface.addIndex("notifications", ["recipient_id"], { name: "idx_notifications_recipient" });
  await queryInterface.addIndex("notifications", ["recipient_id", "is_read"], { name: "idx_notifications_recipient_read" });
  await queryInterface.addIndex("notifications", ["recipient_id", "type"], { name: "idx_notifications_recipient_type" });
  await queryInterface.addIndex("notifications", ["recipient_id", "created_at"], { name: "idx_notifications_recipient_created" });
}

export async function down(queryInterface) {
  await queryInterface.dropTable("notifications");
}

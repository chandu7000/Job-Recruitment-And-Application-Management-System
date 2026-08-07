import { DataTypes } from "sequelize";

export async function up(queryInterface) {
  await queryInterface.addColumn("users", "password_reset_token", {
    type: DataTypes.STRING(255),
    allowNull: true
  });

  await queryInterface.addColumn("users", "password_reset_expires_at", {
    type: DataTypes.DATE,
    allowNull: true
  });
}

export async function down(queryInterface) {
  await queryInterface.removeColumn(
    "users",
    "password_reset_token"
  );

  await queryInterface.removeColumn(
    "users",
    "password_reset_expires_at"
  );
}
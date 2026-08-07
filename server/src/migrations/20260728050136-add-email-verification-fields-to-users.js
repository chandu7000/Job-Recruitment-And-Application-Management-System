import { DataTypes } from "sequelize";

export async function up(queryInterface) {
  await queryInterface.addColumn(
    "users",
    "email_verification_token",
    {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  );

  await queryInterface.addColumn(
    "users",
    "email_verification_expires_at",
    {
      type: DataTypes.DATE,
      allowNull: true
    }
  );
}

export async function down(queryInterface) {
  await queryInterface.removeColumn(
    "users",
    "email_verification_token"
  );

  await queryInterface.removeColumn(
    "users",
    "email_verification_expires_at"
  );
}
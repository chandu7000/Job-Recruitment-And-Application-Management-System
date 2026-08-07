export async function up(
  queryInterface,
  Sequelize
) {
  await queryInterface.addColumn(
    "users",
    "pending_email",
    {
      type: Sequelize.STRING(255),
      allowNull: true
    }
  );

  await queryInterface.addColumn(
    "users",
    "email_change_token",
    {
      type: Sequelize.STRING(255),
      allowNull: true
    }
  );

  await queryInterface.addColumn(
    "users",
    "email_change_expires_at",
    {
      type: Sequelize.DATE,
      allowNull: true
    }
  );

  await queryInterface.addIndex(
    "users",
    ["email_change_token"],
    {
      name: "users_email_change_token_idx",
      unique: true
    }
  );
}

export async function down(
  queryInterface
) {
  await queryInterface.removeIndex(
    "users",
    "users_email_change_token_idx"
  );

  await queryInterface.removeColumn(
    "users",
    "email_change_expires_at"
  );

  await queryInterface.removeColumn(
    "users",
    "email_change_token"
  );

  await queryInterface.removeColumn(
    "users",
    "pending_email"
  );
}
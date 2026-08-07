export async function up(
  queryInterface,
  Sequelize
) {
  await queryInterface.changeColumn(
    "interview_history",
    "created_at",
    {
      type: Sequelize.DATE(6),
      allowNull: false
    }
  );
}

export async function down(
  queryInterface,
  Sequelize
) {
  await queryInterface.changeColumn(
    "interview_history",
    "created_at",
    {
      type: Sequelize.DATE,
      allowNull: false
    }
  );
}
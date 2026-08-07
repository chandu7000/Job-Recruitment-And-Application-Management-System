"use strict";

export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn("user_sessions", "device_name", {
    type: Sequelize.STRING(100),
    allowNull: true
  });

  await queryInterface.addColumn("user_sessions", "browser", {
    type: Sequelize.STRING(100),
    allowNull: true
  });

  await queryInterface.addColumn("user_sessions", "operating_system", {
    type: Sequelize.STRING(100),
    allowNull: true
  });
}

export async function down(queryInterface) {
  await queryInterface.removeColumn("user_sessions", "device_name");
  await queryInterface.removeColumn("user_sessions", "browser");
  await queryInterface.removeColumn("user_sessions", "operating_system");
}
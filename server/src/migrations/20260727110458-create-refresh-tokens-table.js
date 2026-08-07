import { DataTypes } from "sequelize";

export async function up(queryInterface) {
  await queryInterface.createTable("refresh_tokens", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true
    },

    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id"
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE"
    },

    token: {
      type: DataTypes.STRING(512),
      allowNull: false,
      unique: true
    },

    expires_at: {
      type: DataTypes.DATE,
      allowNull: false
    },

    revoked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },

    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },

    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable("refresh_tokens");
}
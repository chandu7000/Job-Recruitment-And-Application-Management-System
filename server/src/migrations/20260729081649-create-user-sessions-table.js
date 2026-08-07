"use strict";

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("user_sessions", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false
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

    refresh_token_hash: {
      type: Sequelize.STRING(255),
      allowNull: false,
      unique: true
    },

    user_agent: {
      type: Sequelize.TEXT,
      allowNull: true
    },

    ip_address: {
      type: Sequelize.STRING(45),
      allowNull: true
    },

    expires_at: {
      type: Sequelize.DATE,
      allowNull: false
    },

    revoked_at: {
      type: Sequelize.DATE,
      allowNull: true
    },

    revocation_reason: {
      type: Sequelize.STRING(100),
      allowNull: true
    },

    last_used_at: {
      type: Sequelize.DATE,
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
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
    }
  });

  await queryInterface.addIndex("user_sessions", ["user_id"], {
    name: "idx_user_sessions_user_id"
  });

  await queryInterface.addIndex("user_sessions", ["refresh_token_hash"], {
    name: "idx_user_sessions_refresh_token_hash",
    unique: true
  });

  await queryInterface.addIndex("user_sessions", ["expires_at"], {
    name: "idx_user_sessions_expires_at"
  });

  await queryInterface.addIndex("user_sessions", ["revoked_at"], {
    name: "idx_user_sessions_revoked_at"
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable("user_sessions");
}
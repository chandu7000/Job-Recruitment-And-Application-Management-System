import bcrypt from "bcrypt";

const PASSWORD_SALT_ROUNDS = 12;

export default {
  async up(queryInterface, Sequelize) {
    const adminEmail =
      process.env.ADMIN_EMAIL
        ?.trim()
        .toLowerCase();

    const adminPassword =
      process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      throw new Error(
        "ADMIN_EMAIL and ADMIN_PASSWORD are required to create the initial admin."
      );
    }

    if (adminPassword.length < 8) {
      throw new Error(
        "ADMIN_PASSWORD must contain at least 8 characters."
      );
    }

    const existingAdmins =
      await queryInterface.sequelize.query(
        `
          SELECT id, email
          FROM users
          WHERE email = :adminEmail
          LIMIT 1
        `,
        {
          replacements: {
            adminEmail
          },
          type: Sequelize.QueryTypes.SELECT
        }
      );

    if (existingAdmins.length > 0) {
      console.log(
        `Initial ADMIN already exists: ${adminEmail}`
      );

      return;
    }

    const passwordHash =
      await bcrypt.hash(
        adminPassword,
        PASSWORD_SALT_ROUNDS
      );

    const adminId =
      Sequelize.Utils.toDefaultValue(
        Sequelize.UUIDV4
      );

    const now = new Date();

    await queryInterface.bulkInsert(
      "users",
      [
        {
          id: adminId,
          email: adminEmail,
          password_hash: passwordHash,
          role: "ADMIN",
          status: "ACTIVE",
          email_verified_at: now,
          failed_login_attempts: 0,
          locked_until: null,
          last_login_at: null,
          password_changed_at: now,
          created_at: now,
          updated_at: now
        }
      ]
    );

    console.log(
      `Initial ADMIN created successfully: ${adminEmail}`
    );
  },

  async down(queryInterface, Sequelize) {
    const adminEmail =
      process.env.ADMIN_EMAIL
        ?.trim()
        .toLowerCase();

    if (!adminEmail) {
      throw new Error(
        "ADMIN_EMAIL is required to remove the seeded admin."
      );
    }

    await queryInterface.bulkDelete(
      "users",
      {
        email: adminEmail,
        role: "ADMIN"
      }
    );

    console.log(
      `Seeded ADMIN removed: ${adminEmail}`
    );
  }
};
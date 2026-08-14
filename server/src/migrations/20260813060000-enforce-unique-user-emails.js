/**
 * Repairs legacy duplicate user emails and restores a hard unique index.
 *
 * Safe cleanup policy:
 * - Normalize email casing/whitespace.
 * - If exactly one verified account exists for an email, keep it and remove
 *   only duplicate pending/unverified rows.
 * - If no verified account exists and every duplicate is pending/unverified,
 *   keep the oldest pending row and remove the newer duplicates.
 * - Abort instead of guessing if multiple verified/non-pending accounts exist.
 */
export async function up(queryInterface) {
  const sequelize = queryInterface.sequelize;

  await sequelize.transaction(async (transaction) => {
    await sequelize.query(
      `
        UPDATE users
        SET email = LOWER(TRIM(email))
      `,
      { transaction }
    );

    const [duplicateGroups] =
      await sequelize.query(
        `
          SELECT email, COUNT(*) AS duplicate_count
          FROM users
          GROUP BY email
          HAVING COUNT(*) > 1
        `,
        { transaction }
      );

    for (const group of duplicateGroups) {
      const [rows] =
        await sequelize.query(
          `
            SELECT
              id,
              email,
              status,
              email_verified_at,
              created_at
            FROM users
            WHERE email = :email
            ORDER BY created_at ASC, id ASC
          `,
          {
            replacements: {
              email: group.email
            },
            transaction
          }
        );

      const verified = rows.filter(
        (row) => Boolean(row.email_verified_at)
      );

      const pendingUnverified = rows.filter(
        (row) =>
          !row.email_verified_at &&
          row.status ===
            "PENDING_VERIFICATION"
      );

      let keepId = null;

      if (verified.length === 1) {
        keepId = verified[0].id;

        const unsafeRows = rows.filter(
          (row) =>
            row.id !== keepId &&
            !(
              !row.email_verified_at &&
              row.status ===
                "PENDING_VERIFICATION"
            )
        );

        if (unsafeRows.length > 0) {
          throw new Error(
            `Cannot safely deduplicate users for ${group.email}: multiple non-pending accounts exist.`
          );
        }
      } else if (
        verified.length === 0 &&
        pendingUnverified.length === rows.length
      ) {
        keepId = rows[0].id;
      } else {
        throw new Error(
          `Cannot safely deduplicate users for ${group.email}: ambiguous verified/non-pending accounts exist.`
        );
      }

      const removeIds = rows
        .filter((row) => row.id !== keepId)
        .map((row) => row.id);

      if (removeIds.length > 0) {
        await queryInterface.bulkDelete(
          "users",
          {
            id: removeIds
          },
          { transaction }
        );
      }
    }

    const indexes =
      await queryInterface.showIndex(
        "users",
        { transaction }
      );

    const hasUniqueEmailIndex =
      indexes.some(
        (index) =>
          index.unique &&
          index.fields?.length === 1 &&
          index.fields[0]?.attribute === "email"
      );

    if (!hasUniqueEmailIndex) {
      await queryInterface.addIndex(
        "users",
        ["email"],
        {
          name: "users_email_unique_idx",
          unique: true,
          transaction
        }
      );
    }
  });
}

export async function down(queryInterface) {
  const indexes =
    await queryInterface.showIndex("users");

  const namedIndex = indexes.find(
    (index) =>
      index.name ===
      "users_email_unique_idx"
  );

  if (namedIndex) {
    await queryInterface.removeIndex(
      "users",
      "users_email_unique_idx"
    );
  }
}

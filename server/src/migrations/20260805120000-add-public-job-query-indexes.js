const JOBS_TABLE =
  "jobs";

const INDEX_DEFINITIONS =
  Object.freeze([
    {
      name:
        "idx_jobs_status_application_deadline",

      fields: [
        "status",
        "application_deadline"
      ]
    },

    {
      name:
        "idx_jobs_status_published_at",

      fields: [
        "status",
        "published_at"
      ]
    },

    {
      name:
        "idx_jobs_company_status_application_deadline",

      fields: [
        "company_id",
        "status",
        "application_deadline"
      ]
    }
  ]);

export async function up(
  queryInterface
) {
  for (
    const index of
    INDEX_DEFINITIONS
  ) {
    await queryInterface.addIndex(
      JOBS_TABLE,
      index.fields,
      {
        name:
          index.name
      }
    );
  }
}

export async function down(
  queryInterface
) {
  for (
    const index of
    [...INDEX_DEFINITIONS]
      .reverse()
  ) {
    await queryInterface.removeIndex(
      JOBS_TABLE,
      index.name
    );
  }
}

export {
  JOBS_TABLE,
  INDEX_DEFINITIONS
};
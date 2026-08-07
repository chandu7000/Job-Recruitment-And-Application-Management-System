const INDEXES = [
  [
    "refresh_tokens",
    ["token"],
    "idx_refresh_tokens_token"
  ],
  [
    "refresh_tokens",
    ["user_id", "revoked"],
    "idx_refresh_tokens_user_revoked"
  ],
  [
    "user_sessions",
    ["user_id", "revoked_at", "expires_at"],
    "idx_user_sessions_revoked_expiry"
  ],
  [
    "companies",
    ["status", "slug"],
    "idx_companies_status_slug"
  ],
  [
    "jobs",
    ["status", "company_id", "application_deadline"],
    "idx_jobs_status_company_deadline"
  ],
  [
    "jobs",
    ["created_by", "status", "published_at"],
    "idx_jobs_creator_status_published"
  ],
  [
    "saved_jobs",
    ["candidate_id", "created_at"],
    "idx_saved_jobs_candidate_created"
  ],
  [
    "applications",
    ["candidate_id", "status", "created_at"],
    "idx_applications_candidate_status_created_security"
  ],
  [
    "applications",
    ["company_id", "status", "created_at"],
    "idx_applications_company_status_created"
  ],
  [
    "interviews",
    ["candidate_id", "status", "scheduled_start_at"],
    "idx_interviews_candidate_status_schedule"
  ],
  [
    "interviews",
    ["recruiter_id", "status", "scheduled_start_at"],
    "idx_interviews_recruiter_status_schedule"
  ],
  [
    "notifications",
    ["recipient_id", "is_read", "created_at"],
    "idx_notifications_recipient_read_created_security"
  ],
  [
    "reports",
    ["status", "target_type", "created_at"],
    "idx_reports_status_target_created"
  ],
  [
    "reports",
    ["reporter_id", "status"],
    "idx_reports_reporter_status"
  ],
  [
    "audit_logs",
    ["actor_user_id", "created_at"],
    "idx_audit_actor_created"
  ],
  [
    "audit_logs",
    ["action", "resource_type", "created_at"],
    "idx_audit_action_resource_created"
  ]
];

const tableExists = async (queryInterface, tableName) => {
  const tables = await queryInterface.showAllTables();
  return tables.map(String).some((table) => table.toLowerCase() === tableName.toLowerCase());
};

const indexExists = async (queryInterface, tableName, indexName) => {
  const indexes = await queryInterface.showIndex(tableName);
  return indexes.some((index) => index.name === indexName);
};

export async function up(queryInterface) {
  for (const [tableName, fields, indexName] of INDEXES) {
    if (await tableExists(queryInterface, tableName) && !(await indexExists(queryInterface, tableName, indexName))) {
      await queryInterface.addIndex(tableName, fields, { name: indexName });
    }
  }
}

export async function down(queryInterface) {
  for (const [tableName, , indexName] of [...INDEXES].reverse()) {
    if (await tableExists(queryInterface, tableName) && await indexExists(queryInterface, tableName, indexName)) {
      await queryInterface.removeIndex(tableName, indexName);
    }
  }
}

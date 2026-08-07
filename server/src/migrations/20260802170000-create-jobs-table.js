export async function up(
  queryInterface,
  Sequelize
) {
  await queryInterface.createTable(
    "jobs",
    {
      id: {
        type: Sequelize.UUID,
        defaultValue:
          Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true
      },

      company_id: {
        type: Sequelize.UUID,
        allowNull: false,

        references: {
          model: "companies",
          key: "id"
        },

        onUpdate: "CASCADE",
        onDelete: "RESTRICT"
      },

      created_by: {
        type: Sequelize.UUID,
        allowNull: false,

        references: {
          model: "users",
          key: "id"
        },

        onUpdate: "CASCADE",
        onDelete: "RESTRICT"
      },

      title: {
        type:
          Sequelize.STRING(150),
        allowNull: true
      },

      slug: {
        type:
          Sequelize.STRING(180),
        allowNull: true
      },

      description: {
        type:
          Sequelize.TEXT("long"),
        allowNull: true
      },

      responsibilities: {
        type:
          Sequelize.TEXT("long"),
        allowNull: true
      },

      requirements: {
        type:
          Sequelize.TEXT("long"),
        allowNull: true
      },

      skills: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: []
      },

      location: {
        type:
          Sequelize.STRING(255),
        allowNull: true
      },

      work_mode: {
        type: Sequelize.ENUM(
          "ONSITE",
          "REMOTE",
          "HYBRID"
        ),
        allowNull: true
      },

      employment_type: {
        type: Sequelize.ENUM(
          "FULL_TIME",
          "PART_TIME",
          "INTERNSHIP",
          "CONTRACT",
          "FREELANCE"
        ),
        allowNull: true
      },

      experience_level: {
        type: Sequelize.ENUM(
          "FRESHER",
          "JUNIOR",
          "MID",
          "SENIOR",
          "LEAD"
        ),
        allowNull: true
      },

      minimum_experience: {
        type: Sequelize.DECIMAL(
          4,
          1
        ),
        allowNull: true
      },

      maximum_experience: {
        type: Sequelize.DECIMAL(
          4,
          1
        ),
        allowNull: true
      },

      minimum_salary: {
        type: Sequelize.DECIMAL(
          15,
          2
        ),
        allowNull: true
      },

      maximum_salary: {
        type: Sequelize.DECIMAL(
          15,
          2
        ),
        allowNull: true
      },

      salary_currency: {
        type:
          Sequelize.STRING(3),
        allowNull: false,
        defaultValue: "INR"
      },

      vacancies: {
        type:
          Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 1
      },

      application_deadline: {
        type: Sequelize.DATE,
        allowNull: true
      },

      status: {
        type: Sequelize.ENUM(
          "DRAFT",
          "PUBLISHED",
          "CLOSED",
          "REMOVED"
        ),
        allowNull: false,
        defaultValue: "DRAFT"
      },

      published_at: {
        type: Sequelize.DATE,
        allowNull: true
      },

      closed_at: {
        type: Sequelize.DATE,
        allowNull: true
      },

      removed_at: {
        type: Sequelize.DATE,
        allowNull: true
      },

      removal_reason: {
        type: Sequelize.TEXT,
        allowNull: true
      },

      closure_reason: {
        type: Sequelize.TEXT,
        allowNull: true
      },

      view_count: {
        type:
          Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0
      },

      application_count: {
        type:
          Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,

        defaultValue:
          Sequelize.literal(
            "CURRENT_TIMESTAMP"
          )
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,

        defaultValue:
          Sequelize.literal(
            "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
          )
      },

      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    }
  );

  await queryInterface.addIndex(
    "jobs",
    ["company_id"],
    {
      name:
        "idx_jobs_company_id"
    }
  );

  await queryInterface.addIndex(
    "jobs",
    ["created_by"],
    {
      name:
        "idx_jobs_created_by"
    }
  );

  await queryInterface.addIndex(
    "jobs",
    ["slug"],
    {
      name: "uq_jobs_slug",
      unique: true
    }
  );

  await queryInterface.addIndex(
    "jobs",
    ["status"],
    {
      name:
        "idx_jobs_status"
    }
  );

  await queryInterface.addIndex(
    "jobs",
    ["location"],
    {
      name:
        "idx_jobs_location"
    }
  );

  await queryInterface.addIndex(
    "jobs",
    ["work_mode"],
    {
      name:
        "idx_jobs_work_mode"
    }
  );

  await queryInterface.addIndex(
    "jobs",
    ["employment_type"],
    {
      name:
        "idx_jobs_employment_type"
    }
  );

  await queryInterface.addIndex(
    "jobs",
    ["experience_level"],
    {
      name:
        "idx_jobs_experience_level"
    }
  );

  await queryInterface.addIndex(
    "jobs",
    ["application_deadline"],
    {
      name:
        "idx_jobs_application_deadline"
    }
  );

  await queryInterface.addIndex(
    "jobs",
    ["published_at"],
    {
      name:
        "idx_jobs_published_at"
    }
  );

  await queryInterface.addIndex(
    "jobs",
    [
      "company_id",
      "status"
    ],
    {
      name:
        "idx_jobs_company_status"
    }
  );
}

export async function down(
  queryInterface
) {
  await queryInterface.dropTable(
    "jobs"
  );
}
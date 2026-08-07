export async function up(
  queryInterface,
  Sequelize
) {
  await queryInterface.addColumn(
    "job_seeker_profiles",
    "profile_image_url",
    {
      type: Sequelize.STRING(2048),
      allowNull: true
    }
  );

  await queryInterface.addColumn(
    "job_seeker_profiles",
    "profile_image_public_id",
    {
      type: Sequelize.STRING(500),
      allowNull: true
    }
  );

  await queryInterface.addColumn(
    "job_seeker_profiles",
    "resume_url",
    {
      type: Sequelize.STRING(2048),
      allowNull: true
    }
  );

  await queryInterface.addColumn(
    "job_seeker_profiles",
    "resume_public_id",
    {
      type: Sequelize.STRING(500),
      allowNull: true
    }
  );

  await queryInterface.addColumn(
    "job_seeker_profiles",
    "resume_original_name",
    {
      type: Sequelize.STRING(255),
      allowNull: true
    }
  );
}

export async function down(
  queryInterface
) {
  await queryInterface.removeColumn(
    "job_seeker_profiles",
    "resume_original_name"
  );

  await queryInterface.removeColumn(
    "job_seeker_profiles",
    "resume_public_id"
  );

  await queryInterface.removeColumn(
    "job_seeker_profiles",
    "resume_url"
  );

  await queryInterface.removeColumn(
    "job_seeker_profiles",
    "profile_image_public_id"
  );

  await queryInterface.removeColumn(
    "job_seeker_profiles",
    "profile_image_url"
  );
}
# Automated Testing Strategy

## Environment

Jest runs in Node mode with ES-module support. `src/tests/setEnv.js` sets `NODE_ENV=test` before application imports. `src/tests/setup.js` rejects non-test execution, rejects identical development/test database names, clears mocks and closes Sequelize after suites.

## Test database workflow

```bash
npm run db:migrate:test
npm test
```

Or:

```bash
npm run test:full
```

The test environment uses `TEST_DB_NAME` and must never equal `DB_NAME`. Schema changes use migrations; `sequelize.sync({ alter: true })` is not used as a migration strategy.

## Inventory

- Unit suites: 69
- Integration suites: 35
- Total suites: 104

### Unit suites

- `admin.service.test.js`
- `adminCandidate.service.test.js`
- `adminCompany.service.test.js`
- `adminManagement.service.test.js`
- `applicantEligibility.test.js`
- `applicationStatusTransition.test.js`
- `audit.service.test.js`
- `auth.emailChange.service.test.js`
- `auth.emailVerification.service.test.js`
- `auth.password.service.test.js`
- `auth.refreshLogout.service.test.js`
- `auth.registrationLogin.service.test.js`
- `company.service.test.js`
- `companyJobEligibility.test.js`
- `companyLogo.service.test.js`
- `companyOwnership.test.js`
- `companyStatusTransition.test.js`
- `companyVerificationDetails.test.js`
- `companyVerificationHistory.service.test.js`
- `email.service.test.js`
- `email.templates.test.js`
- `fileValidation.test.js`
- `interviewConflict.test.js`
- `interviewEligibility.test.js`
- `interviewStatusTransition.test.js`
- `interviewValidation.test.js`
- `job.repository.test.js`
- `job.service.test.js`
- `jobApplicationEligibility.test.js`
- `jobClose.service.test.js`
- `jobDelete.service.test.js`
- `jobExpiry.service.test.js`
- `jobPublicationEligibility.test.js`
- `jobPublish.service.test.js`
- `jobSeekerCertification.service.test.js`
- `jobSeekerEducation.service.test.js`
- `jobSeekerExperience.service.test.js`
- `jobSeekerJobPreference.service.test.js`
- `jobSeekerProfile.service.test.js`
- `jobSeekerProfileCompletion.service.test.js`
- `jobSeekerProject.service.test.js`
- `jobSeekerSkill.service.test.js`
- `jobSeekerSocialLink.service.test.js`
- `jobSeekerUpload.service.test.js`
- `jobSlug.test.js`
- `jobStatusTransition.test.js`
- `jobUpdate.service.test.js`
- `jwt.test.js`
- `notification.service.test.js`
- `pagination.test.js`
- `password.util.test.js`
- `publicCompany.repository.test.js`
- `publicCompany.service.test.js`
- `publicCompanyEligibility.test.js`
- `publicCompanyJob.service.test.js`
- `publicJob.repository.test.js`
- `publicJob.service.test.js`
- `publicJobDetails.repository.test.js`
- `publicJobDetails.service.test.js`
- `publicJobEligibility.test.js`
- `publicResponseSanitizer.test.js`
- `publicSimilarJob.repository.test.js`
- `publicSimilarJob.service.test.js`
- `recruiterCandidate.service.test.js`
- `recruiterProfile.service.test.js`
- `report.service.test.js`
- `securityPolicy.test.js`
- `token.util.test.js`
- `userSession.service.test.js`

### Integration suites

- `adminManagement.test.js`
- `application.test.js`
- `applicationStatus.test.js`
- `auth.changePassword.test.js`
- `auth.emailVerification.test.js`
- `auth.forgotPassword.test.js`
- `auth.login.test.js`
- `auth.logout.test.js`
- `auth.logoutAll.test.js`
- `auth.me.test.js`
- `auth.refresh.test.js`
- `auth.registration.test.js`
- `auth.resetPassword.test.js`
- `auth.sessions.test.js`
- `candidateInterview.test.js`
- `error.test.js`
- `health.test.js`
- `httpSecurity.test.js`
- `interview.test.js`
- `interviewStatus.test.js`
- `job.close.test.js`
- `job.createDraft.test.js`
- `job.delete.test.js`
- `job.expiry.test.js`
- `job.getOwn.test.js`
- `job.listOwn.test.js`
- `job.publish.test.js`
- `job.update.test.js`
- `notification.test.js`
- `publicCompany.details.test.js`
- `publicJob.details.test.js`
- `publicJob.list.test.js`
- `recruiterApplication.test.js`
- `recruiterInterview.test.js`
- `savedJob.test.js`

## Fixture/helper review

The integration suites contain workflow-specific fixture and cleanup logic. A broad mechanical centralization of these fixtures is intentionally avoided because many suites encode different ownership graphs, deletion order, mock boundaries and negative-state setup. Keeping those fixtures local preserves readability and the verified 1284-test baseline. New shared helpers should be introduced only when multiple suites can consume the same behavior without hiding business intent.

## Coverage expectations

Critical endpoints should cover the relevant combination of success, validation, missing/invalid authentication, wrong role, ownership failure, not found, conflict/duplicate, invalid transition, invalid query values and rate limiting.

## Verification order

1. Run affected targeted suites.
2. Run `npm run lint`.
3. Run `npm run db:migrate:test`.
4. Run `npm test` or `npm run test:full`.

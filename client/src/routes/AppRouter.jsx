import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AccountRestrictedPage from '../pages/AccountRestrictedPage'
import DashboardPlaceholderPage from '../pages/DashboardPlaceholderPage'
import NotFoundPage from '../pages/NotFoundPage'
import UnauthorizedPage from '../pages/UnauthorizedPage'
import AdminLayout from '../layouts/AdminLayout'
import AuthLayout from '../layouts/AuthLayout'
import JobSeekerLayout from '../layouts/JobSeekerLayout'
import PublicLayout from '../layouts/PublicLayout'
import RecruiterLayout from '../layouts/RecruiterLayout'
import ForgotPasswordPage from '../features/auth/pages/ForgotPasswordPage'
import LoginPage from '../features/auth/pages/LoginPage'
import RegistrationChoicePage from '../features/auth/pages/RegistrationChoicePage'
import RegistrationPage from '../features/auth/pages/RegistrationPage'
import ResetPasswordPage from '../features/auth/pages/ResetPasswordPage'
import SecuritySettingsPage from '../features/auth/pages/SecuritySettingsPage'
import VerifyEmailChangePage from '../features/auth/pages/VerifyEmailChangePage'
import VerifyEmailPage from '../features/auth/pages/VerifyEmailPage'
import PageLoader from '../components/feedback/PageLoader'
import AccountStatusGuard from './guards/AccountStatusGuard'
import GuestOnlyRoute from './guards/GuestOnlyRoute'
import ProtectedRoute from './guards/ProtectedRoute'
import RoleRoute from './guards/RoleRoute'
import { SavedJobsProvider } from '../features/applications/context/SavedJobsContext'

const HomePage = lazy(() => import('../pages/HomePage'))
const JobsPage = lazy(() => import('../features/publicJobs/pages/JobsPage'))
const JobDetailsPage = lazy(() => import('../features/publicJobs/pages/JobDetailsPage'))
const CompanyDetailsPage = lazy(() => import('../features/publicJobs/pages/CompanyDetailsPage'))
const JobSeekerDashboardPage = lazy(() => import('../features/jobSeeker/pages/JobSeekerDashboardPage'))
const ProfilePage = lazy(() => import('../features/jobSeeker/pages/ProfilePage'))
const ProfileEditPage = lazy(() => import('../features/jobSeeker/pages/ProfileEditPage'))
const ResourceManagementPage = lazy(() => import('../features/jobSeeker/pages/ResourceManagementPage'))
const JobPreferencesPage = lazy(() => import('../features/jobSeeker/pages/JobPreferencesPage'))
const DocumentsPage = lazy(() => import('../features/jobSeeker/pages/DocumentsPage'))
const SavedJobsPage = lazy(() => import('../features/applications/pages/SavedJobsPage'))
const ApplyPage = lazy(() => import('../features/applications/pages/ApplyPage'))
const ApplicationSuccessPage = lazy(() => import('../features/applications/pages/ApplicationSuccessPage'))
const MyApplicationsPage = lazy(() => import('../features/applications/pages/MyApplicationsPage'))
const ApplicationDetailsPage = lazy(() => import('../features/applications/pages/ApplicationDetailsPage'))
const RecruiterDashboardPage = lazy(() => import('../features/recruiter/pages/RecruiterDashboardPage'))
const RecruiterProfilePage = lazy(() => import('../features/recruiter/pages/RecruiterProfilePage'))
const RecruiterProfileEditPage = lazy(() => import('../features/recruiter/pages/RecruiterProfileEditPage'))
const CompanyCreatePage = lazy(() => import('../features/recruiter/pages/CompanyCreatePage'))
const CompanyPage = lazy(() => import('../features/recruiter/pages/CompanyPage'))
const CompanyEditPage = lazy(() => import('../features/recruiter/pages/CompanyEditPage'))
const RecruiterJobsPage = lazy(() => import('../features/recruiterJobs/pages/RecruiterJobsPage'))
const RecruiterJobCreatePage = lazy(() => import('../features/recruiterJobs/pages/JobCreatePage'))
const RecruiterJobDetailsPage = lazy(() => import('../features/recruiterJobs/pages/JobDetailsPage'))
const RecruiterJobEditPage = lazy(() => import('../features/recruiterJobs/pages/JobEditPage'))
const RecruiterApplicantsPage = lazy(() => import('../features/applications/pages/RecruiterApplicantsPage'))
const RecruiterApplicationDetailsPage = lazy(() => import('../features/applications/pages/RecruiterApplicationDetailsPage'))
const RecruiterInterviewsPage = lazy(() => import('../features/interviews/pages/RecruiterInterviewsPage'))
const RecruiterInterviewDetailsPage = lazy(() => import('../features/interviews/pages/RecruiterInterviewDetailsPage'))
const ScheduleInterviewPage = lazy(() => import('../features/interviews/pages/ScheduleInterviewPage'))
const RescheduleInterviewPage = lazy(() => import('../features/interviews/pages/RescheduleInterviewPage'))
const MyInterviewsPage = lazy(() => import('../features/interviews/pages/MyInterviewsPage'))
const InterviewDetailsPage = lazy(() => import('../features/interviews/pages/InterviewDetailsPage'))
const NotificationsPage = lazy(() => import('../features/notifications/pages/NotificationsPage'))

function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader label="Loading page" />}>
        <SavedJobsProvider>
        <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="jobs" element={<JobsPage />} />
          <Route path="jobs/:jobSlug" element={<JobDetailsPage />} />
          <Route path="companies/:companySlug" element={<CompanyDetailsPage />} />
          <Route path="unauthorized" element={<UnauthorizedPage />} />
          <Route path="account-restricted" element={<AccountRestrictedPage />} />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="verify-email" element={<VerifyEmailPage />} />
          <Route path="verify-email-change" element={<VerifyEmailChangePage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />
          <Route element={<GuestOnlyRoute />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegistrationChoicePage />} />
            <Route path="register/job-seeker" element={<RegistrationPage accountType="job-seeker" />} />
            <Route path="register/recruiter" element={<RegistrationPage accountType="recruiter" />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AccountStatusGuard />}>
            <Route element={<RoleRoute allowedRoles={['JOB_SEEKER']} />}>
              <Route path="job-seeker" element={<JobSeekerLayout />}>
                <Route path="dashboard" element={<JobSeekerDashboardPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="saved-jobs" element={<SavedJobsPage />} />
                <Route path="applications" element={<MyApplicationsPage />} />
                <Route path="applications/:applicationId" element={<ApplicationDetailsPage />} />
                <Route path="interviews" element={<MyInterviewsPage />} />
                <Route path="interviews/:interviewId" element={<InterviewDetailsPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="apply/:jobId" element={<ApplyPage />} />
                <Route path="application-success/:applicationId" element={<ApplicationSuccessPage />} />
                <Route path="profile/edit" element={<ProfileEditPage />} />
                <Route path="education" element={<ResourceManagementPage resource="education" />} />
                <Route path="experience" element={<ResourceManagementPage resource="experience" />} />
                <Route path="skills" element={<ResourceManagementPage resource="skills" />} />
                <Route path="projects" element={<ResourceManagementPage resource="projects" />} />
                <Route path="certifications" element={<ResourceManagementPage resource="certifications" />} />
                <Route path="social-links" element={<ResourceManagementPage resource="social-links" />} />
                <Route path="job-preferences" element={<JobPreferencesPage />} />
                <Route path="documents" element={<DocumentsPage />} />
                <Route path="settings" element={<SecuritySettingsPage />} />
              </Route>
            </Route>
            <Route element={<RoleRoute allowedRoles={['RECRUITER']} />}>
              <Route path="recruiter" element={<RecruiterLayout />}>
                <Route path="dashboard" element={<RecruiterDashboardPage />} />
                <Route path="profile" element={<RecruiterProfilePage />} />
                <Route path="profile/edit" element={<RecruiterProfileEditPage />} />
                <Route path="company" element={<CompanyPage />} />
                <Route path="company/new" element={<CompanyCreatePage />} />
                <Route path="company/edit" element={<CompanyEditPage />} />
                <Route path="jobs" element={<RecruiterJobsPage />} />
                <Route path="jobs/create" element={<RecruiterJobCreatePage />} />
                <Route path="jobs/:jobId" element={<RecruiterJobDetailsPage />} />
                <Route path="jobs/:jobId/edit" element={<RecruiterJobEditPage />} />
                <Route path="jobs/:jobId/applicants" element={<RecruiterApplicantsPage />} />
                <Route path="applications/:applicationId" element={<RecruiterApplicationDetailsPage />} />
                <Route path="applications/:applicationId/schedule-interview" element={<ScheduleInterviewPage />} />
                <Route path="interviews" element={<RecruiterInterviewsPage />} />
                <Route path="interviews/:interviewId" element={<RecruiterInterviewDetailsPage />} />
                <Route path="interviews/:interviewId/reschedule" element={<RescheduleInterviewPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="settings" element={<SecuritySettingsPage />} />
              </Route>
            </Route>
            <Route element={<RoleRoute allowedRoles={['ADMIN']} />}>
              <Route path="admin" element={<AdminLayout />}>
                <Route path="dashboard" element={<DashboardPlaceholderPage title="Admin dashboard" />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="settings" element={<SecuritySettingsPage />} />
              </Route>
            </Route>
          </Route>
        </Route>

        <Route element={<PublicLayout />}><Route path="*" element={<NotFoundPage />} /></Route>
        </Routes>
        </SavedJobsProvider>
      </Suspense>
    </BrowserRouter>
  )
}

export default AppRouter

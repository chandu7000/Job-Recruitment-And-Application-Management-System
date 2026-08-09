import DashboardLayout from './DashboardLayout'

const navigationItems = [
  { label: 'Dashboard', to: '/job-seeker/dashboard' },
  { label: 'Profile', to: '/job-seeker/profile' },
  { label: 'Education', to: '/job-seeker/education' },
  { label: 'Experience', to: '/job-seeker/experience' },
  { label: 'Skills', to: '/job-seeker/skills' },
  { label: 'Projects', to: '/job-seeker/projects' },
  { label: 'Certifications', to: '/job-seeker/certifications' },
  { label: 'Social links', to: '/job-seeker/social-links' },
  { label: 'Preferences', to: '/job-seeker/job-preferences' },
  { label: 'Documents', to: '/job-seeker/documents' },
  { label: 'Settings', to: '/job-seeker/settings' },
]

function JobSeekerLayout() {
  return (
    <DashboardLayout
      roleLabel="Job Seeker"
      navigationItems={navigationItems}
    />
  )
}

export default JobSeekerLayout

import DashboardLayout from './DashboardLayout'

const navigationItems = [
  { label: 'Dashboard', to: '/recruiter/dashboard' },
  { label: 'Profile', to: '/recruiter/profile' },
  { label: 'Company', to: '/recruiter/company' },
  { label: 'Jobs', to: '/recruiter/jobs' },
  { label: 'Interviews', to: '/recruiter/interviews' },
  { label: 'Notifications', to: '/recruiter/notifications' },
  { label: 'Settings', to: '/recruiter/settings' },
]

function RecruiterLayout() {
  return (
    <DashboardLayout
      roleLabel="Recruiter"
      navigationItems={navigationItems}
    />
  )
}

export default RecruiterLayout

import DashboardLayout from './DashboardLayout'

const navigationItems = [
  { label: 'Dashboard', to: '/admin/dashboard' },
  { label: 'Users', to: '/admin/users' },
  { label: 'Companies', to: '/admin/companies' },
  { label: 'Jobs', to: '/admin/jobs' },
  { label: 'Reports', to: '/admin/reports' },
  { label: 'Audit Logs', to: '/admin/audit-logs' },
  { label: 'Notifications', to: '/admin/notifications' },
  { label: 'Settings', to: '/admin/settings' },
]

function AdminLayout() {
  return (
    <DashboardLayout roleLabel="Administrator" navigationItems={navigationItems} />
  )
}

export default AdminLayout
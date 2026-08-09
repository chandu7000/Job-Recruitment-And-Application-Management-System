import PageHeader from '../../../components/common/PageHeader'
import ChangeEmailForm from '../components/ChangeEmailForm'
import ChangePasswordForm from '../components/ChangePasswordForm'
import SessionManager from '../components/SessionManager'

function SettingsSection({ title, description, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-bold text-slate-950">{title}</h2>
      <p className="mt-1 mb-5 text-sm leading-6 text-slate-600">{description}</p>
      {children}
    </section>
  )
}

function SecuritySettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Security settings" description="Manage your password, email address, and signed-in devices." />
      <SettingsSection title="Change password" description="Changing your password signs out every active session."><ChangePasswordForm /></SettingsSection>
      <SettingsSection title="Change email" description="Your new address must be verified before it replaces the current email."><ChangeEmailForm /></SettingsSection>
      <SettingsSection title="Active sessions" description="Revoke access for devices you no longer use."><SessionManager /></SettingsSection>
    </div>
  )
}

export default SecuritySettingsPage

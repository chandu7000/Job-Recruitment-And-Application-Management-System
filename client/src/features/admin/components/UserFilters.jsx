import AppButton from '../../../components/common/AppButton'
import AppInput from '../../../components/forms/AppInput'
import AppSelect from '../../../components/forms/AppSelect'
import {
  ADMIN_USER_ROLES,
  ADMIN_USER_STATUSES,
  ADMIN_VERIFICATION_FILTERS,
  roleLabel,
  statusLabel,
} from '../constants/adminConstants'

function UserFilters({ query, onChange, onClear }) {
  const submit = (event) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const search = String(formData.get('search') || '').trim()

    onChange({ ...query, search, page: 1 })
  }

  const update = (key, value) => {
    onChange({ ...query, [key]: value, page: 1 })
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4">
      <form
        className="grid gap-3 lg:grid-cols-[2fr_1fr_1fr_1fr_auto]"
        onSubmit={submit}
      >
        <AppInput
          key={query.search}
          name="search"
          aria-label="Search users by email"
          placeholder="Search by email"
          defaultValue={query.search || ''}
        />

        <AppSelect
          aria-label="Filter users by role"
          value={query.role || ''}
          onChange={(event) => update('role', event.target.value)}
        >
          <option value="">All roles</option>
          {ADMIN_USER_ROLES.map((role) => (
            <option key={role} value={role}>
              {roleLabel(role)}
            </option>
          ))}
        </AppSelect>

        <AppSelect
          aria-label="Filter users by status"
          value={query.status || ''}
          onChange={(event) => update('status', event.target.value)}
        >
          <option value="">All statuses</option>
          {ADMIN_USER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {statusLabel(status)}
            </option>
          ))}
        </AppSelect>

        <AppSelect
          aria-label="Filter users by verification"
          value={query.verified || ''}
          onChange={(event) => update('verified', event.target.value)}
        >
          <option value="">Any verification</option>
          {ADMIN_VERIFICATION_FILTERS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </AppSelect>

        <div className="flex gap-2">
          <AppButton type="submit">Search</AppButton>
          <AppButton type="button" variant="secondary" onClick={onClear}>
            Clear
          </AppButton>
        </div>
      </form>
    </section>
  )
}

export default UserFilters
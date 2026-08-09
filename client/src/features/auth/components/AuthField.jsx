import FormField from '../../../components/forms/FormField'

function AuthField({ id, label, error, children, hint }) {
  return (
    <FormField id={id} label={label} required error={error?.message} hint={hint}>
      {children}
    </FormField>
  )
}

export default AuthField

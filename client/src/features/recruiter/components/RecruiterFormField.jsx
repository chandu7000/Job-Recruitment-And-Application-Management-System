import AppInput from '../../../components/forms/AppInput'
import AppTextarea from '../../../components/forms/AppTextarea'
import FormField from '../../../components/forms/FormField'

function RecruiterFormField({ name, label, register, error, textarea = false, type = 'text', required = false, ...props }) {
  const id = `recruiter-${name}`
  const fieldProps = { id, error: Boolean(error), 'aria-describedby': error ? `${id}-error` : undefined, ...register(name), ...props }
  return <FormField id={id} label={label} error={error?.message} required={required}>{textarea ? <AppTextarea {...fieldProps} /> : <AppInput type={type} {...fieldProps} />}</FormField>
}
export default RecruiterFormField

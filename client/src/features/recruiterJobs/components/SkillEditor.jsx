import { useState } from 'react'
import { X } from 'lucide-react'
import AppButton from '../../../components/common/AppButton'
import AppInput from '../../../components/forms/AppInput'
import FormField from '../../../components/forms/FormField'
import { JOB_FIELD_LIMITS } from '../constants/recruiterJobConstants'

function SkillEditor({ value = [], onChange, error, disabled = false }) {
  const [skill, setSkill] = useState('')
  const [localError, setLocalError] = useState('')

  const addSkill = () => {
    const normalized = skill.trim()
    if (!normalized) return
    if (normalized.length > JOB_FIELD_LIMITS.skillMax) {
      setLocalError(`Each skill must not exceed ${JOB_FIELD_LIMITS.skillMax} characters.`)
      return
    }
    if (value.length >= JOB_FIELD_LIMITS.skillsMax) {
      setLocalError(`Add no more than ${JOB_FIELD_LIMITS.skillsMax} skills.`)
      return
    }
    if (value.some((item) => item.toLowerCase() === normalized.toLowerCase())) {
      setLocalError('This skill is already added.')
      return
    }

    onChange([...value, normalized])
    setSkill('')
    setLocalError('')
  }

  return (
    <FormField
      id="job-skills"
      label="Skills"
      hint={`Add up to ${JOB_FIELD_LIMITS.skillsMax} unique skills.`}
      error={error || localError}
    >
      <div className="flex gap-2">
        <AppInput
          id="job-skills"
          value={skill}
          maxLength={JOB_FIELD_LIMITS.skillMax}
          disabled={disabled}
          error={Boolean(error || localError)}
          placeholder="Example: Java"
          onChange={(event) => {
            setSkill(event.target.value)
            setLocalError('')
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              addSkill()
            }
          }}
        />
        <AppButton
          variant="secondary"
          disabled={disabled || !skill.trim()}
          onClick={addSkill}
        >
          Add
        </AppButton>
      </div>

      {value.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2" aria-label="Selected skills">
          {value.map((item) => (
            <li
              key={item}
              className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700"
            >
              {item}
              {!disabled && (
                <button
                  type="button"
                  className="rounded-full p-0.5 hover:bg-slate-200"
                  aria-label={`Remove ${item}`}
                  onClick={() => onChange(value.filter((skillValue) => skillValue !== item))}
                >
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </FormField>
  )
}

export default SkillEditor

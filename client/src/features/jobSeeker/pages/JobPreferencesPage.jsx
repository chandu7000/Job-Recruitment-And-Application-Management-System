import {
  Check,
  ChevronDown,
  Search,
  X,
} from 'lucide-react'
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react'
import { toast } from 'sonner'
import AppButton from '../../../components/common/AppButton'
import ErrorState from '../../../components/feedback/ErrorState'
import PageLoader from '../../../components/feedback/PageLoader'
import { getApiErrorMessage } from '../../../api/errorMapper'
import {
  AVAILABILITY,
  EMPLOYMENT_TYPES,
  INDIA_JOB_LOCATIONS,
  PREFERRED_JOB_ROLES,
  WORK_MODES,
  formatLabel,
} from '../constants/jobSeekerConstants'
import { useJobSeekerResource } from '../hooks/useJobSeekerResource'
import { jobSeekerApi } from '../services/jobSeekerApi'

const initial = {
  preferredJobRoles: [],
  preferredLocations: [],
  employmentTypes: [],
  workModes: [],
  expectedSalary: '',
  salaryCurrency: 'INR',
  noticePeriodDays: '',
  willingToRelocate: false,
  availabilityStatus:
    'OPEN_TO_OPPORTUNITIES',
}

const emptyErrors = {
  preferredJobRoles: '',
  preferredLocations: '',
  employmentTypes: '',
  workModes: '',
  expectedSalary: '',
  noticePeriodDays: '',
  availabilityStatus: '',
}

const VALID_NOTICE_PERIODS = [
  15,
  30,
  45,
  60,
  90,
]

function normalizeArray(value) {
  return Array.isArray(value)
    ? value.filter(Boolean)
    : []
}

function normalizePreferencesForCompare(
  preferences,
) {
  return {
    preferredJobRoles: [
      ...(preferences.preferredJobRoles ?? []),
    ].sort(),

    preferredLocations: [
      ...(preferences.preferredLocations ?? []),
    ].sort(),

    employmentTypes: [
      ...(preferences.employmentTypes ?? []),
    ].sort(),

    workModes: [
      ...(preferences.workModes ?? []),
    ].sort(),

    expectedSalary:
      preferences.expectedSalary === ''
        ? ''
        : Number(
            preferences.expectedSalary,
          ),

    noticePeriodDays:
      preferences.noticePeriodDays === ''
        ? ''
        : Number(
            preferences.noticePeriodDays,
          ),

    salaryCurrency:
      preferences.salaryCurrency ??
      'INR',

    willingToRelocate:
      Boolean(
        preferences.willingToRelocate,
      ),

    availabilityStatus:
      preferences.availabilityStatus ??
      '',
  }
}

function buildPreferencesState(data) {
  return {
    ...initial,
    ...data,

    preferredJobRoles:
      normalizeArray(
        data?.preferredJobRoles,
      ),

    preferredLocations:
      normalizeArray(
        data?.preferredLocations,
      ),

    employmentTypes:
      normalizeArray(
        data?.employmentTypes,
      ),

    workModes:
      normalizeArray(
        data?.workModes,
      ),

    expectedSalary:
      data?.expectedSalary ??
      '',

    noticePeriodDays:
      data?.noticePeriodDays ??
      '',
  }
}

function SearchableMultiSelect({
  label,
  placeholder,
  searchPlaceholder,
  options,
  values,
  onChange,
  error,
}) {
  const wrapperRef =
    useRef(null)

  const searchInputRef =
    useRef(null)

  const buttonId =
    useId()

  const listboxId =
    useId()

  const [
    open,
    setOpen,
  ] = useState(false)

  const [
    search,
    setSearch,
  ] = useState('')

  useEffect(() => {
    const handlePointerDown = (
      event,
    ) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(
          event.target,
        )
      ) {
        setOpen(false)
        setSearch('')
      }
    }

    const handleKeyDown = (
      event,
    ) => {
      if (
        event.key ===
        'Escape'
      ) {
        setOpen(false)
        setSearch('')
      }
    }

    document.addEventListener(
      'mousedown',
      handlePointerDown,
    )

    document.addEventListener(
      'keydown',
      handleKeyDown,
    )

    return () => {
      document.removeEventListener(
        'mousedown',
        handlePointerDown,
      )

      document.removeEventListener(
        'keydown',
        handleKeyDown,
      )
    }
  }, [])

  useEffect(() => {
    if (open) {
      window.setTimeout(
        () => {
          searchInputRef.current?.focus()
        },
        0,
      )
    }
  }, [open])

  const availableOptions =
    useMemo(
      () =>
        Array.from(
          new Set([
            ...options,
            ...values,
          ]),
        ),
      [
        options,
        values,
      ],
    )

  const filteredOptions =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase()

      if (
        !normalizedSearch
      ) {
        return availableOptions
      }

      return availableOptions.filter(
        (option) =>
          option
            .toLowerCase()
            .includes(
              normalizedSearch,
            ),
      )
    }, [
      availableOptions,
      search,
    ])

  const toggleOption = (
    option,
  ) => {
    if (
      values.includes(
        option,
      )
    ) {
      onChange(
        values.filter(
          (value) =>
            value !== option,
        ),
      )

      return
    }

    onChange([
      ...values,
      option,
    ])
  }

  const removeOption = (
    option,
  ) => {
    onChange(
      values.filter(
        (value) =>
          value !== option,
      ),
    )
  }

  return (
    <div
      ref={wrapperRef}
      className="relative min-w-0"
    >
      <label
        htmlFor={buttonId}
        className="text-sm font-medium text-slate-900"
      >
        {label}{' '}

        <span className="text-red-600">
          *
        </span>
      </label>

      <button
        id={buttonId}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={
          listboxId
        }
        aria-invalid={
          Boolean(error)
        }
        onClick={() =>
          setOpen(
            (current) =>
              !current,
          )
        }
        className={[
          'mt-1 flex min-h-12 w-full items-center justify-between gap-3 rounded-lg border bg-white px-3 py-2 text-left transition focus:outline-none focus:ring-2',
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
            : 'border-slate-400 hover:border-slate-500 focus:border-brand-500 focus:ring-brand-100',
        ].join(' ')}
      >
        <span
          className={
            values.length
              ? 'text-slate-900'
              : 'text-slate-500'
          }
        >
          {values.length
            ? `${values.length} selected`
            : placeholder}
        </span>

        <ChevronDown
          className={[
            'size-4 shrink-0 text-slate-500 transition',
            open
              ? 'rotate-180'
              : '',
          ].join(' ')}
          aria-hidden="true"
        />
      </button>

      {error ? (
        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      ) : null}

      {values.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {values.map(
            (value) => (
              <span
                key={value}
                className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-sm font-medium text-brand-700"
              >
                <span className="min-w-0 break-words">
                  {value}
                </span>

                <button
                  type="button"
                  aria-label={`Remove ${value}`}
                  onClick={() =>
                    removeOption(
                      value,
                    )
                  }
                  className="shrink-0 rounded-full p-0.5 transition hover:bg-brand-100"
                >
                  <X
                    className="size-3.5"
                    aria-hidden="true"
                  />
                </button>
              </span>
            ),
          )}
        </div>
      ) : null}

      {open ? (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          <div className="border-b border-slate-200 p-3">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />

              <input
                ref={
                  searchInputRef
                }
                type="search"
                value={search}
                onChange={(
                  event,
                ) =>
                  setSearch(
                    event.target
                      .value,
                  )
                }
                placeholder={
                  searchPlaceholder
                }
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </div>
          </div>

          <div
            id={listboxId}
            role="listbox"
            aria-multiselectable="true"
            className="max-h-72 overflow-y-auto p-2"
          >
            {filteredOptions.length ? (
              filteredOptions.map(
                (option) => {
                  const selected =
                    values.includes(
                      option,
                    )

                  return (
                    <button
                      key={
                        option
                      }
                      type="button"
                      role="option"
                      aria-selected={
                        selected
                      }
                      onClick={() =>
                        toggleOption(
                          option,
                        )
                      }
                      className={[
                        'flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition',
                        selected
                          ? 'bg-brand-50 font-medium text-brand-700'
                          : 'text-slate-700 hover:bg-slate-50',
                      ].join(' ')}
                    >
                      <span className="min-w-0 break-words">
                        {option}
                      </span>

                      {selected ? (
                        <Check
                          className="size-4 shrink-0"
                          aria-hidden="true"
                        />
                      ) : null}
                    </button>
                  )
                },
              )
            ) : (
              <p className="px-3 py-6 text-center text-sm text-slate-500">
                No matching options found.
              </p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function PreferencesForm({
  data,
  reload,
}) {
  const [
    form,
    setForm,
  ] = useState(
    () =>
      buildPreferencesState(
        data,
      ),
  )

  const [
    errors,
    setErrors,
  ] = useState({
    ...emptyErrors,
  })

  const [
    saving,
    setSaving,
  ] = useState(false)

  const [
    resetting,
    setResetting,
  ] = useState(false)

  const originalPreferences =
    useMemo(
      () =>
        normalizePreferencesForCompare(
          buildPreferencesState(
            data,
          ),
        ),
      [data],
    )

  const hasChanges =
    useMemo(() => {
      const currentPreferences =
        normalizePreferencesForCompare(
          form,
        )

      return (
        JSON.stringify(
          currentPreferences,
        ) !==
        JSON.stringify(
          originalPreferences,
        )
      )
    }, [
      form,
      originalPreferences,
    ])

  const updateField = (
    field,
    value,
  ) => {
    setForm(
      (current) => ({
        ...current,
        [field]: value,
      }),
    )

    setErrors(
      (current) => ({
        ...current,
        [field]: '',
      }),
    )
  }

  const toggle = (
    field,
    value,
  ) => {
    setForm(
      (current) => ({
        ...current,

        [field]:
          current[
            field
          ].includes(
            value,
          )
            ? current[
                field
              ].filter(
                (item) =>
                  item !==
                  value,
              )
            : [
                ...current[
                  field
                ],
                value,
              ],
      }),
    )

    setErrors(
      (current) => ({
        ...current,
        [field]: '',
      }),
    )
  }

  const validate = () => {
    const nextErrors = {
      ...emptyErrors,
    }

    if (
      !form.preferredJobRoles.length
    ) {
      nextErrors.preferredJobRoles =
        'Select at least one preferred role.'
    }

    if (
      !form.preferredLocations.length
    ) {
      nextErrors.preferredLocations =
        'Select at least one preferred location.'
    }

    if (
      !form.employmentTypes.length
    ) {
      nextErrors.employmentTypes =
        'Select at least one employment type.'
    }

    if (
      !form.workModes.length
    ) {
      nextErrors.workModes =
        'Select at least one work mode.'
    }

    if (
      form.expectedSalary === ''
    ) {
      nextErrors.expectedSalary =
        'Expected salary is required.'
    } else {
      const salary =
        Number(
          form.expectedSalary,
        )

      if (
        !Number.isFinite(
          salary,
        ) ||
        salary <= 0
      ) {
        nextErrors.expectedSalary =
          'Enter an expected salary greater than 0.'
      }
    }

    if (
      form.noticePeriodDays === ''
    ) {
      nextErrors.noticePeriodDays =
        'Select your notice period.'
    } else {
      const days =
        Number(
          form.noticePeriodDays,
        )

      if (
        !VALID_NOTICE_PERIODS.includes(
          days,
        )
      ) {
        nextErrors.noticePeriodDays =
          'Select a valid notice period.'
      }
    }

    if (
      !form.availabilityStatus
    ) {
      nextErrors.availabilityStatus =
        'Select your availability.'
    }

    setErrors(nextErrors)

    return !Object.values(
      nextErrors,
    ).some(Boolean)
  }

  const submit = async (
    event,
  ) => {
    event.preventDefault()

    if (!validate()) {
      toast.error(
        'Please complete all required job preferences.',
      )

      return
    }

    if (!hasChanges) {
      toast.info(
        'Job preferences are already up to date.',
      )

      return
    }

    setSaving(true)

    try {
      await jobSeekerApi.updatePreferences(
        {
          ...form,

          preferredJobRoles:
            form.preferredJobRoles,

          preferredLocations:
            form.preferredLocations,

          expectedSalary:
            Number(
              form.expectedSalary,
            ),

          noticePeriodDays:
            Number(
              form.noticePeriodDays,
            ),
        },
      )

      toast.success(
        'Job preferences saved',
      )

      await reload()
    } catch (
      requestError
    ) {
      toast.error(
        getApiErrorMessage(
          requestError,
        ),
      )
    } finally {
      setSaving(false)
    }
  }

  const reset = async () => {
    if (
      !window.confirm(
        'Reset all job preferences?',
      )
    ) {
      return
    }

    setResetting(true)

    try {
      await jobSeekerApi.resetPreferences()

      setForm({
        ...initial,
      })

      setErrors({
        ...emptyErrors,
      })

      toast.success(
        'Preferences reset',
      )

      await reload()
    } catch (
      requestError
    ) {
      toast.error(
        getApiErrorMessage(
          requestError,
        ),
      )
    } finally {
      setResetting(false)
    }
  }

  return (
    <form
      onSubmit={submit}
      noValidate
      className="w-full space-y-6"
    >
      <div>
        <p className="text-sm font-semibold text-brand-700">
          Job Seeker
        </p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
          Job preferences
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
          Tell CareerForge what opportunities
          you are interested in.
        </p>
      </div>

      <div className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2">
        <SearchableMultiSelect
          label="Preferred roles"
          placeholder="Select preferred roles"
          searchPlaceholder="Search job roles..."
          options={
            PREFERRED_JOB_ROLES
          }
          values={
            form.preferredJobRoles
          }
          error={
            errors.preferredJobRoles
          }
          onChange={(
            value,
          ) =>
            updateField(
              'preferredJobRoles',
              value,
            )
          }
        />

        <SearchableMultiSelect
          label="Preferred locations"
          placeholder="Select preferred locations"
          searchPlaceholder="Search Indian locations..."
          options={
            INDIA_JOB_LOCATIONS
          }
          values={
            form.preferredLocations
          }
          error={
            errors.preferredLocations
          }
          onChange={(
            value,
          ) =>
            updateField(
              'preferredLocations',
              value,
            )
          }
        />

        <fieldset>
          <legend className="text-sm font-medium text-slate-900">
            Employment types{' '}

            <span className="text-red-600">
              *
            </span>
          </legend>

          <div className="mt-2 flex flex-wrap gap-2">
            {EMPLOYMENT_TYPES.map(
              (option) => (
                <label
                  key={
                    option
                  }
                  className={[
                    'flex cursor-pointer items-center rounded-full border px-3 py-2 text-sm transition hover:bg-slate-50',
                    errors.employmentTypes
                      ? 'border-red-400'
                      : 'border-slate-400',
                  ].join(' ')}
                >
                  <input
                    className="mr-2"
                    type="checkbox"
                    checked={
                      form.employmentTypes.includes(
                        option,
                      )
                    }
                    onChange={() =>
                      toggle(
                        'employmentTypes',
                        option,
                      )
                    }
                  />

                  {formatLabel(
                    option,
                  )}
                </label>
              ),
            )}
          </div>

          {errors.employmentTypes ? (
            <p className="mt-2 text-sm text-red-600">
              {
                errors.employmentTypes
              }
            </p>
          ) : null}
        </fieldset>

        <fieldset>
          <legend className="text-sm font-medium text-slate-900">
            Work modes{' '}

            <span className="text-red-600">
              *
            </span>
          </legend>

          <div className="mt-2 flex flex-wrap gap-2">
            {WORK_MODES.map(
              (option) => (
                <label
                  key={
                    option
                  }
                  className={[
                    'flex cursor-pointer items-center rounded-full border px-3 py-2 text-sm transition hover:bg-slate-50',
                    errors.workModes
                      ? 'border-red-400'
                      : 'border-slate-400',
                  ].join(' ')}
                >
                  <input
                    className="mr-2"
                    type="checkbox"
                    checked={
                      form.workModes.includes(
                        option,
                      )
                    }
                    onChange={() =>
                      toggle(
                        'workModes',
                        option,
                      )
                    }
                  />

                  {formatLabel(
                    option,
                  )}
                </label>
              ),
            )}
          </div>

          {errors.workModes ? (
            <p className="mt-2 text-sm text-red-600">
              {errors.workModes}
            </p>
          ) : null}
        </fieldset>

        <label>
          <span className="text-sm font-medium text-slate-900">
            Expected salary{' '}

            <span className="text-red-600">
              *
            </span>
          </span>

          <div
            className={[
              'mt-1 flex overflow-hidden rounded-lg border bg-white focus-within:ring-2',
              errors.expectedSalary
                ? 'border-red-500 focus-within:border-red-500 focus-within:ring-red-100'
                : 'border-slate-400 focus-within:border-brand-500 focus-within:ring-brand-100',
            ].join(' ')}
          >
            <span className="flex items-center border-r border-slate-300 bg-slate-50 px-3 text-sm font-medium text-slate-600">
              ₹
            </span>

            <input
              type="number"
              min="1"
              value={
                form.expectedSalary
              }
              onChange={(
                event,
              ) =>
                updateField(
                  'expectedSalary',
                  event.target
                    .value,
                )
              }
              className="min-w-0 flex-1 border-0 p-3 outline-none"
            />
          </div>

          {errors.expectedSalary ? (
            <p className="mt-1 text-sm text-red-600">
              {
                errors.expectedSalary
              }
            </p>
          ) : null}
        </label>

        <label>
          <span className="text-sm font-medium text-slate-900">
            Notice period{' '}

            <span className="text-red-600">
              *
            </span>
          </span>

          <select
            value={
              form.noticePeriodDays
            }
            onChange={(
              event,
            ) =>
              updateField(
                'noticePeriodDays',
                event.target
                  .value,
              )
            }
            className={[
              'mt-1 w-full rounded-lg border bg-white p-3 outline-none transition focus:ring-2',
              errors.noticePeriodDays
                ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
                : 'border-slate-400 focus:border-brand-500 focus:ring-brand-100',
            ].join(' ')}
          >
            <option value="">
              Select notice period
            </option>

            <option value="15">
              15 days
            </option>

            <option value="30">
              30 days
            </option>

            <option value="45">
              45 days
            </option>

            <option value="60">
              60 days
            </option>

            <option value="90">
              90 days
            </option>
          </select>

          {errors.noticePeriodDays ? (
            <p className="mt-1 text-sm text-red-600">
              {
                errors.noticePeriodDays
              }
            </p>
          ) : null}
        </label>

        <label>
          <span className="text-sm font-medium text-slate-900">
            Availability{' '}

            <span className="text-red-600">
              *
            </span>
          </span>

          <select
            value={
              form.availabilityStatus
            }
            onChange={(
              event,
            ) =>
              updateField(
                'availabilityStatus',
                event.target
                  .value,
              )
            }
            className={[
              'mt-1 w-full rounded-lg border bg-white p-3 outline-none transition focus:ring-2',
              errors.availabilityStatus
                ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
                : 'border-slate-400 focus:border-brand-500 focus:ring-brand-100',
            ].join(' ')}
          >
            {AVAILABILITY.map(
              (option) => (
                <option
                  key={
                    option
                  }
                  value={
                    option
                  }
                >
                  {formatLabel(
                    option,
                  )}
                </option>
              ),
            )}
          </select>

          {errors.availabilityStatus ? (
            <p className="mt-1 text-sm text-red-600">
              {
                errors.availabilityStatus
              }
            </p>
          ) : null}
        </label>

        <label className="flex cursor-pointer items-center gap-2 self-end py-3">
          <input
            type="checkbox"
            checked={
              form.willingToRelocate
            }
            onChange={(
              event,
            ) =>
              updateField(
                'willingToRelocate',
                event.target
                  .checked,
              )
            }
          />

          <span>
            Willing to relocate
          </span>
        </label>
      </div>

      <div className="flex flex-wrap gap-3">
        <AppButton
          type="submit"
          loading={saving}
          disabled={
            saving ||
            resetting
          }
        >
          Save preferences
        </AppButton>

        <AppButton
          type="button"
          variant="danger"
          loading={resetting}
          disabled={
            saving ||
            resetting
          }
          onClick={reset}
        >
          Reset
        </AppButton>
      </div>
    </form>
  )
}

function JobPreferencesPage() {
  const loader =
    useCallback(
      (signal) =>
        jobSeekerApi.preferences(
          signal,
        ),
      [],
    )

  const {
    data,
    loading,
    error,
    reload,
  } =
    useJobSeekerResource(
      loader,
    )

  if (
    loading &&
    !data
  ) {
    return (
      <PageLoader label="Loading job preferences" />
    )
  }

  if (error) {
    return (
      <ErrorState
        message={getApiErrorMessage(
          error,
        )}
        onRetry={reload}
      />
    )
  }

  return (
    <PreferencesForm
      key={
        data?.updatedAt ??
        data?.id ??
        'empty'
      }
      data={data}
      reload={reload}
    />
  )
}

export default JobPreferencesPage
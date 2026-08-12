import { zodResolver } from '@hookform/resolvers/zod'
import {
  CheckCircle2,
  Image as ImageIcon,
  Minus,
  Plus,
  Upload,
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
import Cropper from 'react-easy-crop'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import AppButton from '../../../components/common/AppButton'
import ErrorState from '../../../components/feedback/ErrorState'
import PageLoader from '../../../components/feedback/PageLoader'
import { getApiErrorMessage } from '../../../api/errorMapper'
import { API_ENDPOINTS } from '../../../api/endpoints'
import { useAuth } from '../../auth/hooks/useAuth'
import SectionCard from '../components/SectionCard'
import { useJobSeekerResource } from '../hooks/useJobSeekerResource'
import { jobSeekerApi } from '../services/jobSeekerApi'
import {
  professionalSchema,
  profileSchema,
} from '../validation/jobSeekerSchemas'

const personalFields = [
  ['firstName', 'First name'],
  ['lastName', 'Last name'],
  ['phoneNumber', 'Phone number'],
  ['location', 'Location'],
  ['addressLine1', 'Address line 1'],
  ['addressLine2', 'Address line 2'],
  ['city', 'City'],
  ['state', 'State'],
  ['country', 'Country'],
  ['postalCode', 'Postal code'],
]

const IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
]

const MAX_PROFILE_IMAGE_SIZE =
  5 * 1024 * 1024

const createImageElement = (
  source,
) =>
  new Promise((resolve, reject) => {
    const image = new Image()

    image.onload = () =>
      resolve(image)

    image.onerror = reject
    image.src = source
  })

const createCroppedImage = async (
  source,
  cropPixels,
  originalName,
) => {
  const image =
    await createImageElement(
      source,
    )

  const canvas =
    document.createElement(
      'canvas',
    )

  const context =
    canvas.getContext('2d')

  if (!context) {
    throw new Error(
      'Unable to prepare the profile photo',
    )
  }

  canvas.width =
    cropPixels.width

  canvas.height =
    cropPixels.height

  context.drawImage(
    image,
    cropPixels.x,
    cropPixels.y,
    cropPixels.width,
    cropPixels.height,
    0,
    0,
    cropPixels.width,
    cropPixels.height,
  )

  const blob =
    await new Promise(
      (resolve, reject) => {
        canvas.toBlob(
          (result) => {
            if (result) {
              resolve(result)
              return
            }

            reject(
              new Error(
                'Unable to crop the profile photo',
              ),
            )
          },
          'image/jpeg',
          0.9,
        )
      },
    )

  const baseName =
    originalName
      ?.replace(/\.[^.]+$/, '')
      .trim() ||
    'profile-photo'

  return new File(
    [
      blob,
    ],
    `${baseName}-cropped.jpg`,
    {
      type: 'image/jpeg',
    },
  )
}

function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
      <CheckCircle2
        className="size-4"
        aria-hidden="true"
      />

      Verified
    </span>
  )
}

function AccountInformation({
  user,
  profile,
}) {
  const email =
    user?.email ||
    profile?.email ||
    'Not available'

  const rawPhone =
    profile?.phoneNumber ||
    user?.phoneNumber ||
    ''

  const phone =
    rawPhone
      ? `+91 ${rawPhone.replace(
          /^(\+?91)?0?/,
          '',
        )}`
      : 'Not provided'

  const emailVerified =
    user?.emailVerified === true ||
    user?.isEmailVerified === true

  const phoneVerified =
    user?.phoneVerified === true ||
    user?.isPhoneVerified === true

  return (
    <SectionCard title="Personal information">
      <dl className="grid gap-5 sm:grid-cols-2">
        <div className="min-w-0">
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Email address
          </dt>

          <dd className="mt-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="break-all font-medium text-slate-900">
                {email}
              </span>

              {emailVerified ? (
                <VerifiedBadge />
              ) : null}
            </div>
          </dd>
        </div>

        <div className="min-w-0">
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Phone number
          </dt>

          <dd className="mt-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="break-words font-medium text-slate-900">
                {phone}
              </span>

              {phoneVerified ? (
                <VerifiedBadge />
              ) : null}
            </div>
          </dd>
        </div>
      </dl>
    </SectionCard>
  )
}

function ProfileImageCropDialog({
  imageUrl,
  originalName,
  onCancel,
  onConfirm,
}) {
  const cancelButtonRef =
    useRef(null)

  const [crop, setCrop] =
    useState({
      x: 0,
      y: 0,
    })

  const [zoom, setZoom] =
    useState(1)

  const [
    croppedAreaPixels,
    setCroppedAreaPixels,
  ] = useState(null)

  const [processing, setProcessing] =
    useState(false)

  const handleCropComplete =
    useCallback(
      (
        _croppedArea,
        croppedPixels,
      ) => {
        setCroppedAreaPixels(
          croppedPixels,
        )
      },
      [],
    )

  useEffect(() => {
    const previousOverflow =
      document.body.style.overflow

    document.body.style.overflow =
      'hidden'

    cancelButtonRef.current?.focus()

    const handleKeyDown = (
      event,
    ) => {
      if (
        event.key === 'Escape' &&
        !processing
      ) {
        onCancel()
      }
    }

    document.addEventListener(
      'keydown',
      handleKeyDown,
    )

    return () => {
      document.body.style.overflow =
        previousOverflow

      document.removeEventListener(
        'keydown',
        handleKeyDown,
      )
    }
  }, [
    onCancel,
    processing,
  ])

  const confirmCrop = async () => {
    if (
      !croppedAreaPixels ||
      processing
    ) {
      return
    }

    setProcessing(true)

    try {
      const croppedFile =
        await createCroppedImage(
          imageUrl,
          croppedAreaPixels,
          originalName,
        )

      onConfirm(croppedFile)
    } catch (error) {
      toast.error(
        error?.message ||
          'Unable to crop the profile photo',
      )
    } finally {
      setProcessing(false)
    }
  }

  const decreaseZoom = () => {
    setZoom((current) =>
      Math.max(
        1,
        Number(
          (
            current -
            0.1
          ).toFixed(1),
        ),
      ),
    )
  }

  const increaseZoom = () => {
    setZoom((current) =>
      Math.min(
        3,
        Number(
          (
            current +
            0.1
          ).toFixed(1),
        ),
      ),
    )
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (
          event.target ===
            event.currentTarget &&
          !processing
        ) {
          onCancel()
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-photo-crop-title"
        aria-describedby="profile-photo-crop-description"
        className="flex max-h-[calc(100vh-2rem)] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div>
            <h2
              id="profile-photo-crop-title"
              className="text-xl font-bold text-slate-950"
            >
              Adjust profile photo
            </h2>

            <p
              id="profile-photo-crop-description"
              className="mt-1 text-sm leading-6 text-slate-600"
            >
              Drag the image to reposition
              it and use zoom to choose
              how your profile photo will
              appear.
            </p>
          </div>

          <button
            type="button"
            aria-label="Close profile photo adjustment"
            disabled={processing}
            onClick={onCancel}
            className="shrink-0 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X
              className="size-5"
              aria-hidden="true"
            />
          </button>
        </header>

        <div className="overflow-y-auto">
          <div className="relative h-[min(58vw,22rem)] min-h-64 w-full bg-slate-950 sm:h-80">
            <Cropper
              image={imageUrl}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              minZoom={1}
              maxZoom={3}
              zoomSpeed={0.1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={
                handleCropComplete
              }
              objectFit="contain"
            />
          </div>

          <div className="space-y-3 px-5 py-5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-slate-700">
                Zoom
              </span>

              <span className="text-sm text-slate-500">
                {Math.round(
                  zoom * 100,
                )}
                %
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Zoom out"
                disabled={
                  zoom <= 1 ||
                  processing
                }
                onClick={
                  decreaseZoom
                }
                className="rounded-lg border border-slate-300 p-2 text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Minus
                  className="size-4"
                  aria-hidden="true"
                />
              </button>

              <input
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={zoom}
                aria-label="Profile photo zoom"
                disabled={processing}
                onChange={(event) =>
                  setZoom(
                    Number(
                      event.target
                        .value,
                    ),
                  )
                }
                className="min-w-0 flex-1 accent-brand-600"
              />

              <button
                type="button"
                aria-label="Zoom in"
                disabled={
                  zoom >= 3 ||
                  processing
                }
                onClick={
                  increaseZoom
                }
                className="rounded-lg border border-slate-300 p-2 text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Plus
                  className="size-4"
                  aria-hidden="true"
                />
              </button>
            </div>

            <p className="text-xs leading-5 text-slate-500">
              The circular guide shows
              how the photo will appear
              throughout CareerForge.
            </p>
          </div>
        </div>

        <footer className="flex flex-wrap justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4">
          <AppButton
            ref={cancelButtonRef}
            type="button"
            variant="ghost"
            disabled={processing}
            onClick={onCancel}
          >
            Cancel
          </AppButton>

          <AppButton
            type="button"
            loading={processing}
            disabled={
              !croppedAreaPixels ||
              processing
            }
            onClick={confirmCrop}
          >
            Use this photo
          </AppButton>
        </footer>
      </section>
    </div>
  )
}

function ProfilePhotoControl({
  profile,
  onChanged,
}) {
  const inputId = useId()

  const [file, setFile] =
    useState(null)

  const [sourceFile, setSourceFile] =
    useState(null)

  const [
    sourceImageUrl,
    setSourceImageUrl,
  ] = useState('')

  const [busy, setBusy] =
    useState(false)

  const [progress, setProgress] =
    useState(0)

  const preview = useMemo(
    () =>
      file
        ? URL.createObjectURL(file)
        : null,
    [file],
  )

  useEffect(
    () => () => {
      if (preview) {
        URL.revokeObjectURL(
          preview,
        )
      }
    },
    [preview],
  )

  useEffect(
    () => () => {
      if (sourceImageUrl) {
        URL.revokeObjectURL(
          sourceImageUrl,
        )
      }
    },
    [sourceImageUrl],
  )

  const closeCropDialog =
    useCallback(() => {
      setSourceImageUrl('')
      setSourceFile(null)
    }, [])

  const select = (event) => {
    const chosen =
      event.target.files?.[0]

    event.target.value = ''

    if (!chosen) return

    if (
      !IMAGE_TYPES.includes(
        chosen.type,
      ) ||
      chosen.size >
        MAX_PROFILE_IMAGE_SIZE
    ) {
      toast.error(
        'Choose a JPG, PNG or WebP image up to 5 MB',
      )

      return
    }

    const imageUrl =
      URL.createObjectURL(
        chosen,
      )

    setSourceFile(chosen)

    setSourceImageUrl(
      imageUrl,
    )
  }

  const confirmCrop = (
    croppedFile,
  ) => {
    setFile(croppedFile)
    setProgress(0)

    closeCropDialog()
  }

  const upload = async () => {
    if (!file || busy) return

    setBusy(true)
    setProgress(0)

    try {
      await jobSeekerApi.upload(
        API_ENDPOINTS.JOB_SEEKER
          .PROFILE_IMAGE,
        'profileImage',
        file,
        (event) => {
          setProgress(
            event.total
              ? Math.round(
                  (event.loaded *
                    100) /
                    event.total,
                )
              : 0,
          )
        },
      )

      toast.success(
        profile?.profileImageUrl
          ? 'Profile photo replaced'
          : 'Profile photo uploaded',
      )

      setFile(null)
      setProgress(0)

      onChanged()
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
        ),
      )
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    if (busy) return

    if (
      !window.confirm(
        'Remove your profile photo?',
      )
    ) {
      return
    }

    setBusy(true)

    try {
      await jobSeekerApi.deleteUpload(
        API_ENDPOINTS.JOB_SEEKER
          .PROFILE_IMAGE,
      )

      toast.success(
        'Profile photo removed',
      )

      setFile(null)
      setProgress(0)

      onChanged()
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
        ),
      )
    } finally {
      setBusy(false)
    }
  }

  const currentImage =
    preview ||
    profile?.profileImageUrl

  return (
    <>
      <SectionCard title="Profile photo">
        <div className="space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100">
              {currentImage ? (
                <img
                  src={currentImage}
                  alt="Profile preview"
                  className="size-full object-cover"
                />
              ) : (
                <ImageIcon
                  className="size-10 text-slate-400"
                  aria-hidden="true"
                />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-900">
                {file
                  ? 'Adjusted photo ready'
                  : profile?.profileImageUrl
                    ? 'Current profile photo'
                    : 'No profile photo uploaded'}
              </p>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                JPG, PNG or WebP ·
                Maximum 5 MB
              </p>

              {file ? (
                <p className="mt-1 text-sm font-medium text-brand-700">
                  Review the preview
                  and upload when ready.
                </p>
              ) : null}
            </div>
          </div>

          <input
            id={inputId}
            className="sr-only"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={select}
            disabled={busy}
          />

          <label
            htmlFor={inputId}
            className={[
              'inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition',
              'hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700',
              busy
                ? 'pointer-events-none opacity-60'
                : '',
            ].join(' ')}
          >
            <Upload
              className="size-4"
              aria-hidden="true"
            />

            {file
              ? 'Adjust another photo'
              : profile?.profileImageUrl
                ? 'Choose new photo'
                : 'Choose photo'}
          </label>

          {file ? (
            <div className="rounded-lg border border-brand-100 bg-brand-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
                Adjusted image
              </p>

              <p className="mt-1 break-all text-sm font-medium text-slate-900">
                {file.name}
              </p>

              <p className="mt-1 text-xs text-slate-600">
                {(
                  file.size /
                  (1024 * 1024)
                ).toFixed(2)}{' '}
                MB
              </p>
            </div>
          ) : null}

          {busy ? (
            <div
              className="space-y-2"
              aria-live="polite"
            >
              <div className="flex justify-between text-sm text-slate-600">
                <span>
                  Uploading
                </span>

                <span>
                  {progress}%
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-brand-600 transition-all"
                  style={{
                    width:
                      `${progress}%`,
                  }}
                />
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <AppButton
              disabled={
                !file || busy
              }
              loading={busy}
              onClick={upload}
            >
              {profile?.profileImageUrl
                ? 'Replace photo'
                : 'Upload photo'}
            </AppButton>

            {file ? (
              <AppButton
                type="button"
                variant="ghost"
                disabled={busy}
                onClick={() => {
                  setFile(null)
                  setProgress(0)
                }}
              >
                Discard adjustment
              </AppButton>
            ) : null}

            {profile?.profileImageUrl ? (
              <AppButton
                variant="danger"
                disabled={busy}
                loading={busy}
                onClick={remove}
              >
                Remove photo
              </AppButton>
            ) : null}
          </div>
        </div>
      </SectionCard>

      {sourceImageUrl &&
      sourceFile ? (
        <ProfileImageCropDialog
          imageUrl={
            sourceImageUrl
          }
          originalName={
            sourceFile.name
          }
          onCancel={
            closeCropDialog
          }
          onConfirm={
            confirmCrop
          }
        />
      ) : null}
    </>
  )
}

function EditForm({
  profile,
  schema,
  fields,
  professional = false,
  onSaved,
}) {
  const [saving, setSaving] =
    useState(false)

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: {
      errors,
      isDirty,
    },
  } = useForm({
    resolver:
      zodResolver(schema),
  })

  const values =
    useWatch({
      control,
    })

  useEffect(() => {
    reset(
      Object.fromEntries(
        fields.map(
          ([name]) => [
            name,
            profile?.[name] ??
              '',
          ],
        ),
      ),
    )
  }, [
    fields,
    profile,
    reset,
  ])

  useEffect(() => {
    const warn = (
      event,
    ) => {
      if (isDirty) {
        event.preventDefault()
        event.returnValue = ''
      }
    }

    window.addEventListener(
      'beforeunload',
      warn,
    )

    return () => {
      window.removeEventListener(
        'beforeunload',
        warn,
      )
    }
  }, [isDirty])

  const submit = async (
    formValues,
  ) => {
    const payload =
      professional
        ? formValues
        : Object.fromEntries(
            Object.entries(
              formValues,
            ).filter(
              ([
                name,
                value,
              ]) =>
                ![
                  'firstName',
                  'lastName',
                  'phoneNumber',
                ].includes(
                  name,
                ) ||
                value.trim(),
            ),
          )

    setSaving(true)

    try {
      await (
        professional
          ? jobSeekerApi.updateProfessional(
              payload,
            )
          : jobSeekerApi.updateProfile(
              payload,
            )
      )

      toast.success(
        'Profile updated',
      )

      reset(
        formValues,
      )

      onSaved()
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
        ),
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      className="grid gap-4 sm:grid-cols-2"
      onSubmit={handleSubmit(
        submit,
      )}
    >
      {fields.map(
        ([
          name,
          label,
          type,
        ]) => (
          <label
            key={name}
            className={
              type ===
              'textarea'
                ? 'sm:col-span-2'
                : ''
            }
          >
            <span className="mb-1 block text-sm font-medium">
              {label}
            </span>

            {type ===
            'textarea' ? (
              <textarea
                rows="7"
                maxLength="5000"
                {...register(
                  name,
                )}
                className="w-full rounded-lg border border-slate-300 p-3"
              />
            ) : (
              <input
                {...register(
                  name,
                )}
                maxLength={
                  name ===
                  'headline'
                    ? 255
                    : undefined
                }
                className="w-full rounded-lg border border-slate-300 p-3"
              />
            )}

            <span className="flex justify-between gap-3 text-xs">
              <span className="text-red-700">
                {
                  errors[name]
                    ?.message
                }
              </span>

              {professional ? (
                <span className="shrink-0 text-slate-500">
                  {values?.[
                    name
                  ]?.length ??
                    0}
                  /
                  {name ===
                  'headline'
                    ? 255
                    : 5000}
                </span>
              ) : null}
            </span>
          </label>
        ),
      )}

      <AppButton
        className="sm:col-span-2 sm:w-fit"
        type="submit"
        loading={saving}
        disabled={
          !isDirty ||
          saving
        }
      >
        Save changes
      </AppButton>
    </form>
  )
}

function ProfileEditPage() {
  const { user } =
    useAuth()

  const loader =
    useCallback(
      (signal) =>
        jobSeekerApi.profile(
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

  if (loading) {
    return (
      <PageLoader label="Loading profile editor" />
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
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-brand-700">
          Job Seeker
        </p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
          Edit profile
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Keep your account and
          professional information
          up to date.
        </p>
      </div>

      <AccountInformation
        user={user}
        profile={data}
      />

      <ProfilePhotoControl
        profile={data}
        onChanged={reload}
      />

      <SectionCard title="Profile details">
        <EditForm
          profile={data}
          schema={
            profileSchema
          }
          fields={
            personalFields
          }
          onSaved={
            reload
          }
        />
      </SectionCard>

      <SectionCard title="Headline and biography">
        <EditForm
          profile={data}
          schema={
            professionalSchema
          }
          fields={[
            [
              'headline',
              'Professional headline',
            ],
            [
              'biography',
              'Biography',
              'textarea',
            ],
          ]}
          professional
          onSaved={
            reload
          }
        />
      </SectionCard>
    </div>
  )
}

export default ProfileEditPage
import {
  Download,
  ExternalLink,
  FileText,
  Upload,
} from 'lucide-react'
import {
  useCallback,
  useId,
  useState,
} from 'react'
import { toast } from 'sonner'
import AppButton from '../../../components/common/AppButton'
import ErrorState from '../../../components/feedback/ErrorState'
import PageLoader from '../../../components/feedback/PageLoader'
import { getApiErrorMessage } from '../../../api/errorMapper'
import { API_ENDPOINTS } from '../../../api/endpoints'
import SectionCard from '../components/SectionCard'
import { useJobSeekerResource } from '../hooks/useJobSeekerResource'
import { jobSeekerApi } from '../services/jobSeekerApi'

const RESUME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

function ResumeUploadControl({
  current,
  onChanged,
}) {
  const inputId = useId()

  const [file, setFile] = useState(null)
  const [progress, setProgress] = useState(0)
  const [busy, setBusy] = useState(false)
  const [
    downloading,
    setDownloading,
  ] = useState(false)

  const select = (event) => {
    const chosen =
      event.target.files?.[0]

    if (!chosen) return

    if (
      !RESUME_TYPES.includes(
        chosen.type,
      ) ||
      chosen.size >
        10 * 1024 * 1024
    ) {
      toast.error(
        'Choose a PDF, DOC or DOCX file up to 10 MB',
      )

      event.target.value = ''
      return
    }

    setFile(chosen)
    setProgress(0)
  }

  const upload = async () => {
    if (!file || busy) return

    setBusy(true)
    setProgress(0)

    try {
      await jobSeekerApi.upload(
        API_ENDPOINTS.JOB_SEEKER.RESUME,
        'resume',
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
        'Resume uploaded',
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
        'Delete your resume?',
      )
    ) {
      return
    }

    setBusy(true)

    try {
      await jobSeekerApi.deleteUpload(
        API_ENDPOINTS.JOB_SEEKER.RESUME,
      )

      toast.success(
        'Resume deleted',
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

  const viewResume = () => {
    window.open(
      '/job-seeker/resume/preview',
      '_blank',
      'noopener,noreferrer',
    )
  }

  const downloadResume =
    async () => {
      if (downloading) return

      setDownloading(true)

      try {
        const {
          blob,
          fileName,
        } =
          await jobSeekerApi.downloadResume()

        const objectUrl =
          URL.createObjectURL(
            blob,
          )

        const link =
          document.createElement(
            'a',
          )

        link.href =
          objectUrl

        link.download =
          fileName ||
          'resume.pdf'

        document.body.appendChild(
          link,
        )

        link.click()
        link.remove()

        URL.revokeObjectURL(
          objectUrl,
        )
      } catch (error) {
        toast.error(
          getApiErrorMessage(
            error,
          ),
        )
      } finally {
        setDownloading(false)
      }
    }

  return (
    <SectionCard title="Resume">
      <div className="space-y-5">
        <div className="flex items-start gap-4 rounded-xl bg-slate-50 p-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm">
            <FileText
              className="size-5"
              aria-hidden="true"
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className="font-semibold text-slate-900">
              {current
                ? 'Current resume uploaded'
                : 'No resume uploaded'}
            </p>

            <p className="mt-1 text-sm text-slate-600">
              PDF, DOC or DOCX ·
              Maximum 10 MB
            </p>

            {current ? (
              <div className="mt-3 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={
                    viewResume
                  }
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline"
                >
                  <ExternalLink
                    className="size-4"
                    aria-hidden="true"
                  />

                  View current resume
                </button>

                <button
                  type="button"
                  disabled={
                    downloading
                  }
                  onClick={
                    downloadResume
                  }
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 transition hover:text-brand-700 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Download
                    className="size-4"
                    aria-hidden="true"
                  />

                  {downloading
                    ? 'Downloading...'
                    : 'Download resume'}
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <div>
          <input
            id={inputId}
            className="sr-only"
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={select}
            disabled={busy}
          />

          <label
            htmlFor={inputId}
            className={[
              'inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition',
              'hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700',
              'focus-within:ring-2 focus-within:ring-brand-500 focus-within:ring-offset-2',
              busy
                ? 'pointer-events-none opacity-60'
                : '',
            ].join(' ')}
          >
            <Upload
              className="size-4"
              aria-hidden="true"
            />

            {current
              ? 'Choose new resume'
              : 'Choose resume'}
          </label>
        </div>

        {file ? (
          <div className="rounded-lg border border-brand-100 bg-brand-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
              Selected file
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
              !file ||
              busy
            }
            loading={busy}
            onClick={upload}
          >
            {current
              ? 'Replace resume'
              : 'Upload resume'}
          </AppButton>

          {current ? (
            <AppButton
              variant="danger"
              disabled={busy}
              loading={busy}
              onClick={remove}
            >
              Remove resume
            </AppButton>
          ) : null}
        </div>
      </div>
    </SectionCard>
  )
}

function DocumentsPage() {
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
      <PageLoader label="Loading resume" />
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
    <div className="w-full space-y-6">
      <div>
        <p className="text-sm font-semibold text-brand-700">
          Job Seeker
        </p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
          Resume
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
          Keep your latest resume
          ready for job applications
          and recruiters.
        </p>
      </div>

      <div className="w-full">
        <ResumeUploadControl
          current={
            data?.resumeUrl
          }
          onChanged={reload}
        />
      </div>
    </div>
  )
}

export default DocumentsPage
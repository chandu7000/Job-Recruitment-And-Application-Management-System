import { useEffect, useState } from 'react'
import ErrorState from '../../../components/feedback/ErrorState'
import PageLoader from '../../../components/feedback/PageLoader'
import { getApiErrorMessage } from '../../../api/errorMapper'
import { jobSeekerApi } from '../services/jobSeekerApi'

function ResumePreviewPage() {
  const [previewUrl, setPreviewUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let objectUrl = ''
    let active = true

    const loadResume = async () => {
      setLoading(true)
      setError(null)

      try {
        const [profile, blob] = await Promise.all([
          jobSeekerApi.profile(),
          jobSeekerApi.viewResume(),
        ])

        if (!active) return

        if (blob.type !== 'application/pdf') {
          throw new Error(
            'Browser preview is available only for PDF resumes',
          )
        }

        objectUrl = URL.createObjectURL(blob)

        const firstName =
          profile?.firstName?.trim()

        document.title = firstName
          ? `Resume - ${firstName}`
          : 'Resume'

        setPreviewUrl(objectUrl)
      } catch (loadError) {
        if (active) {
          setError(loadError)
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadResume()

    return () => {
      active = false

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <PageLoader label="Opening resume" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-lg">
          <ErrorState
            message={getApiErrorMessage(error)}
          />
        </div>
      </div>
    )
  }

  return (
    <iframe
      src={previewUrl}
      title={document.title}
      className="block h-screen w-screen border-0"
    />
  )
}

export default ResumePreviewPage
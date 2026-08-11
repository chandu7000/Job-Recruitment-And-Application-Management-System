import { Toaster } from 'sonner'
import AppRouter from './routes/AppRouter'
import { AuthProvider } from './features/auth/context/AuthContext'
import { NotificationsProvider } from './features/notifications/context/NotificationsContext'

function App() {
  return (
    <>
      <AuthProvider>
        <NotificationsProvider>
          <AppRouter />
        </NotificationsProvider>
      </AuthProvider>

      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          duration: 4000,
        }}
      />
    </>
  )
}

export default App

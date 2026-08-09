import { Toaster } from 'sonner'
import AppRouter from './routes/AppRouter'
import { AuthProvider } from './features/auth/context/AuthContext'

function App() {
  return (
    <>
      <AuthProvider>
        <AppRouter />
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

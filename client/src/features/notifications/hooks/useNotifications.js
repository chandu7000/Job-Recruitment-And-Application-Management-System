import { useContext } from 'react'
import { NotificationsContext } from '../context/NotificationsContextDefinition'

export function useNotifications() {
  const context = useContext(NotificationsContext)
  if (!context) throw new Error('useNotifications must be used within NotificationsProvider.')
  return context
}

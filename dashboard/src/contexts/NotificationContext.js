import React, { createContext, useContext, useState } from 'react'

const NotificationContext = createContext()

export const useNotifications = () => {
  return useContext(NotificationContext)
}

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState({
    messages: 6,
    tasks: 3,
    alerts: 4
  })

  const value = {
    notifications,
    setNotifications
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
} 
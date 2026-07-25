import React, { createContext, useContext, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import API_URL from '../config/api'
import { useAuth } from './AuthContext'
import { supabase } from '../lib/supabaseClient'

const NotificationContext = createContext()

export const useNotifications = () => {
  return useContext(NotificationContext)
}

// Real open-alert count for the active org, kept live via Supabase Realtime.
// Replaces the old hardcoded { messages: 6, tasks: 3, alerts: 4 } stub.
export const NotificationProvider = ({ children }) => {
  const { activeOrg } = useAuth()
  const [notifications, setNotifications] = useState({ alerts: 0, recent: [] })

  useEffect(() => {
    if (!activeOrg) {
      setNotifications({ alerts: 0, recent: [] })
      return
    }

    let cancelled = false
    axios
      .get(`${API_URL}/alerts`, { params: { status: 'open' } })
      .then(({ data }) => {
        if (cancelled) return
        setNotifications({ alerts: data.data.length, recent: data.data.slice(0, 5) })
      })
      .catch(() => {})

    const channel = supabase
      .channel(`header-alerts-${activeOrg.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'alerts', filter: `org_id=eq.${activeOrg.id}` },
        (payload) => {
          setNotifications((prev) => ({
            alerts: prev.alerts + 1,
            recent: [payload.new, ...prev.recent].slice(0, 5),
          }))
        },
      )
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [activeOrg])

  return <NotificationContext.Provider value={{ notifications }}>{children}</NotificationContext.Provider>
}

NotificationProvider.propTypes = {
  children: PropTypes.node.isRequired,
}

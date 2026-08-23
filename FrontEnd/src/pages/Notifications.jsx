import {
  useCallback,
  useEffect,
  useState,
} from 'react'

import { useNavigate } from 'react-router-dom'
import api from '../services/api'

function Notifications() {
  const navigate = useNavigate()

  const [notifications, setNotifications] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [refreshing, setRefreshing] =
    useState(false)

  const [actionLoading, setActionLoading] =
    useState(null)

  const [error, setError] =
    useState('')

  // --------------------------------------------------
  // Notify MainLayout to refresh unread count
  // --------------------------------------------------

  const refreshNotificationCount = () => {
    window.dispatchEvent(
      new Event(
        'notifications:refresh'
      )
    )
  }

  // --------------------------------------------------
  // Load notifications
  // --------------------------------------------------

  const getNotifications = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true)
        } else {
          setLoading(true)
        }

        setError('')

        const response =
          await api.get(
            '/notifications'
          )

        setNotifications(
          response.data.data || []
        )
      } catch (error) {
        console.error(
          'Notifications error:',
          error.response?.data ||
            error
        )

        setError(
          error.response?.data
            ?.message ||
            'Unable to load notifications.'
        )
      } finally {
        if (isRefresh) {
          setRefreshing(false)
        } else {
          setLoading(false)
        }
      }
    },
    []
  )

  // --------------------------------------------------
  // Initial load
  // --------------------------------------------------

  useEffect(() => {
    getNotifications()
  }, [getNotifications])

  // --------------------------------------------------
  // Mark one notification as read
  // + open transaction
  // --------------------------------------------------

  const handleNotificationClick =
    async (notification) => {
      try {
        setActionLoading(
          notification.id
        )

        if (!notification.is_read) {
          await api.patch(
            `/notifications/${notification.id}/read`
          )

          refreshNotificationCount()
        }

        // Update locally immediately
        setNotifications(
          (currentNotifications) =>
            currentNotifications.map(
              (item) =>
                item.id ===
                notification.id
                  ? {
                      ...item,
                      is_read: true,
                      read_at:
                        new Date().toISOString(),
                    }
                  : item
            )
        )

        // Open related transaction
        if (
          notification.transaction_id
        ) {
          navigate(
            `/transactions/${notification.transaction_id}`
          )
        }
      } catch (error) {
        console.error(
          'Mark notification as read error:',
          error.response?.data ||
            error
        )

        setError(
          error.response?.data
            ?.message ||
            'Unable to mark notification as read.'
        )
      } finally {
        setActionLoading(null)
      }
    }

  // --------------------------------------------------
  // Mark all as read
  // --------------------------------------------------

  const handleMarkAllAsRead =
    async () => {
      try {
        setActionLoading('all')
        setError('')

        await api.post(
          '/notifications/read-all'
        )

        setNotifications(
          (currentNotifications) =>
            currentNotifications.map(
              (notification) => ({
                ...notification,
                is_read: true,
                read_at:
                  notification.read_at ||
                  new Date().toISOString(),
              })
            )
        )

        // Refresh sidebar badge
        refreshNotificationCount()
      } catch (error) {
        console.error(
          'Mark all notifications as read error:',
          error.response?.data ||
            error
        )

        setError(
          error.response?.data
            ?.message ||
            'Unable to mark all notifications as read.'
        )
      } finally {
        setActionLoading(null)
      }
    }

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 md:p-8 dark:bg-gray-950">

        <div className="rounded-xl bg-white p-8 shadow-sm dark:bg-gray-900">

          <p className="text-gray-500 dark:text-gray-400">
            Loading notifications...
          </p>

        </div>

      </div>
    )
  }

  // --------------------------------------------------
  // Page
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-gray-50 p-8 dark:bg-gray-950">

      {/* ==================================================
          Header
          ================================================== */}

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Notifications
          </h1>

          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Review your notifications and related transactions.
          </p>

        </div>

        <div className="flex flex-wrap items-center gap-3">

          <button
            type="button"
            onClick={() =>
              getNotifications(true)
            }
            disabled={refreshing}
            title="Refresh notifications"
            aria-label="Refresh notifications"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >

            <span
              className={
                refreshing
                  ? 'animate-spin'
                  : ''
              }
            >
              ↻
            </span>

            {refreshing
              ? 'Refreshing...'
              : 'Refresh'}

          </button>

          {notifications.some(
            (notification) =>
              !notification.is_read
          ) && (
            <button
              type="button"
              onClick={
                handleMarkAllAsRead
              }
              disabled={
                actionLoading ===
                'all'
              }
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {actionLoading ===
              'all'
                ? 'Marking...'
                : 'Mark all as read'}
            </button>
          )}

        </div>

      </div>

      {/* ==================================================
          Error
          ================================================== */}

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      {/* ==================================================
          Notifications
          ================================================== */}

      <div className="space-y-3">

        {notifications.length ===
        0 ? (

          <div className="rounded-xl bg-white p-8 text-center shadow dark:bg-gray-900">

            <p className="text-gray-500 dark:text-gray-400">
              No notifications found.
            </p>

          </div>

        ) : (

          notifications.map(
            (notification) => {

              const unread =
                !notification.is_read

              const isLoading =
                actionLoading ===
                notification.id

              return (
                <button
                  key={
                    notification.id
                  }
                  type="button"
                  onClick={() =>
                    handleNotificationClick(
                      notification
                    )
                  }
                  disabled={
                    isLoading
                  }
                  className={`w-full rounded-xl border p-5 text-left shadow-sm transition hover:shadow ${
                    unread
                      ? 'border-blue-200 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-950/30'
                      : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900'
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                >

                  <div className="flex items-start justify-between gap-4">

                    <div className="flex-1">

                      <div className="flex items-center gap-2">

                        {unread && (
                          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600 dark:bg-blue-400" />
                        )}

                        <h2 className="font-semibold text-gray-900 dark:text-white">
                          {
                            notification.title
                          }
                        </h2>

                      </div>

                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                        {
                          notification.message
                        }
                      </p>

                      <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-400 dark:text-gray-500">

                        <span>
                          {notification.created_at
                            ? new Date(
                                notification.created_at
                              ).toLocaleString()
                            : ''}
                        </span>

                        {notification.type && (
                          <span>
                            {
                              notification.type
                            }
                          </span>
                        )}

                      </div>

                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                        unread
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                      }`}
                    >
                      {unread
                        ? 'Unread'
                        : 'Read'}
                    </span>

                  </div>

                  {notification.transaction_id && (
                    <p className="mt-3 text-xs font-medium text-blue-600 dark:text-blue-400">
                      Open transaction →
                    </p>
                  )}

                </button>
              )
            }
          )

        )}

      </div>

    </div>
  )
}

export default Notifications
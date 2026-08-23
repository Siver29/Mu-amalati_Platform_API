
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  NavLink,
  Outlet,
  useNavigate,
} from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { useTheme } from '../context/ThemeContext'

function MainLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()

  // --------------------------------------------------
  // Notifications
  // --------------------------------------------------

  const [unreadCount, setUnreadCount] =
    useState(0)

  const [
    refreshingNotifications,
    setRefreshingNotifications,
  ] = useState(false)

  // --------------------------------------------------
  // Attendance
  // --------------------------------------------------

  const [attendance, setAttendance] =
    useState(null)

  const [
    attendanceLoading,
    setAttendanceLoading,
  ] = useState(false)

  const [
    attendanceActionLoading,
    setAttendanceActionLoading,
  ] = useState(false)

  const role =
    String(
      user?.role || ''
    ).toLowerCase()

  // --------------------------------------------------
  // Attendance states
  // --------------------------------------------------

  const isWorking =
    Boolean(
      attendance?.check_in_at &&
      !attendance?.check_out_at
    )

  const isCheckedOut =
    Boolean(
      attendance?.check_in_at &&
      attendance?.check_out_at
    )

  const isNotCheckedIn =
    !attendance ||
    !attendance?.check_in_at

  // --------------------------------------------------
  // Logout
  // --------------------------------------------------

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // --------------------------------------------------
  // Get unread notification count
  // --------------------------------------------------

  const getUnreadCount =
    useCallback(
      async () => {
        try {
          setRefreshingNotifications(
            true
          )

          const response =
            await api.get(
              '/notifications/unread-count'
            )

          setUnreadCount(
            response.data.data?.count ??
              response.data.data
                ?.unread_count ??
              0
          )
        } catch (error) {
          console.error(
            'Unread notifications error:',
            error.response?.data ||
              error
          )
        } finally {
          setRefreshingNotifications(
            false
          )
        }
      },
      []
    )

  // --------------------------------------------------
  // Get current attendance
  // --------------------------------------------------

  const getAttendance =
    useCallback(
      async () => {
        try {
          setAttendanceLoading(
            true
          )

          const response =
            await api.get(
              '/attendance/current'
            )

          setAttendance(
            response.data.data ||
              null
          )
        } catch (error) {
          console.error(
            'Attendance error:',
            error.response?.data ||
              error
          )
        } finally {
          setAttendanceLoading(
            false
          )
        }
      },
      []
    )

  // --------------------------------------------------
  // Check in
  // --------------------------------------------------

  const handleCheckIn =
    async () => {
      try {
        setAttendanceActionLoading(
          true
        )

        const response =
          await api.post(
            '/attendance/check-in'
          )

        setAttendance(
          response.data.data
        )
      } catch (error) {
        console.error(
          'Check-in error:',
          error.response?.data ||
            error
        )
      } finally {
        setAttendanceActionLoading(
          false
        )
      }
    }

  // --------------------------------------------------
  // Check out
  // --------------------------------------------------

  const handleCheckOut =
    async () => {
      try {
        setAttendanceActionLoading(
          true
        )

        const response =
          await api.post(
            '/attendance/check-out'
          )

        setAttendance(
          response.data.data
        )
      } catch (error) {
        console.error(
          'Check-out error:',
          error.response?.data ||
            error
        )
      } finally {
        setAttendanceActionLoading(
          false
        )
      }
    }

  // --------------------------------------------------
  // Initial load
  // --------------------------------------------------

  useEffect(() => {
    getUnreadCount()
    getAttendance()

    const handleNotificationsRefresh =
      () => {
        getUnreadCount()
      }

    window.addEventListener(
      'notifications:refresh',
      handleNotificationsRefresh
    )

    return () => {
      window.removeEventListener(
        'notifications:refresh',
        handleNotificationsRefresh
      )
    }
  }, [
    getUnreadCount,
    getAttendance,
  ])

  // --------------------------------------------------
  // Role based navigation
  // --------------------------------------------------

  const navigation =
    useMemo(() => {
      if (role === 'admin') {
        return [
          {
            section:
              'Administration',

            items: [
              {
                label: 'Dashboard',
                to: '/dashboard',
              },
              {
                label: 'Users',
                to: '/users',
              },
              {
                label:
                  'Departments',
                to: '/departments',
              },
              {
                label:
                  'Transaction Types',
                to: '/transaction-types',
              },
              {
                label:
                  'Transactions',
                to: '/transactions',
              },
            ],
          },

          {
            section: 'Account',

            items: [
              {
                label:
                  'Notifications',
                to: '/notifications',
                notification: true,
              },
              {
                label: 'Profile',
                to: '/profile',
              },
            ],
          },
        ]
      }

      if (role === 'manager') {
        return [
          {
            section: 'Management',

            items: [
              {
                label: 'Dashboard',
                to: '/dashboard',
              },
              {
                label:
                  'Transactions',
                to: '/transactions',
              },
            ],
          },

          {
            section: 'Account',

            items: [
              {
                label:
                  'Notifications',
                to: '/notifications',
                notification: true,
              },
              {
                label: 'Profile',
                to: '/profile',
              },
            ],
          },
        ]
      }

      return [
        {
          section: 'Workspace',

          items: [
            {
              label: 'Dashboard',
              to: '/dashboard',
            },
            {
              label:
                'My Transactions',
              to: '/transactions',
            },
            {
              label:
                'Create Transaction',
              to: '/transactions/create',
            },
          ],
        },

        {
          section: 'Account',

          items: [
            {
              label:
                'Notifications',
              to: '/notifications',
              notification: true,
            },
            {
              label: 'Profile',
              to: '/profile',
            },
          ],
        },
      ]
    }, [role])

  // --------------------------------------------------
  // NavLink styles
  // --------------------------------------------------

  const getNavClass = ({
    isActive,
  }) => {
    return [
      'mb-1',
      'flex',
      'flex-1',
      'items-center',
      'justify-between',
      'rounded-lg',
      'px-4',
      'py-3',
      'text-sm',
      'font-medium',
      'transition',

      isActive
        ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
    ].join(' ')
  }

  // --------------------------------------------------
  // Layout
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* ==================================================
          Sidebar
          ================================================== */}

      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">

        <div className="flex h-full flex-col">

          {/* ==================================================
              Logo
              ================================================== */}

          <div className="border-b border-gray-200 px-6 py-5 dark:border-gray-800">

            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Mu'amalati
            </h1>

            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Platform
            </p>

          </div>

          {/* ==================================================
              User
              ================================================== */}

          <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">

            <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
              {user?.name || 'User'}
            </p>

            <p className="mt-1 text-xs capitalize text-gray-500 dark:text-gray-400">
              {role || 'user'}
            </p>

          </div>

          {/* ==================================================
              Attendance
              ================================================== */}

          <div className="border-b border-gray-200 px-4 py-4 dark:border-gray-800">

            <div className="mb-3 flex items-center justify-between">

              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Attendance
              </span>

              {isWorking && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  Working
                </span>
              )}

              {isCheckedOut && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                  <span className="h-2 w-2 rounded-full bg-gray-400" />
                  Checked Out
                </span>
              )}

              {isNotCheckedIn &&
                !attendanceLoading && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                    <span className="h-2 w-2 rounded-full bg-gray-400" />
                    Not Checked In
                  </span>
                )}

            </div>

            {isWorking && (
              <button
                type="button"
                onClick={
                  handleCheckOut
                }
                disabled={
                  attendanceActionLoading
                }
                className="w-full rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700 transition hover:bg-red-100 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-950/50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {attendanceActionLoading
                  ? 'Updating...'
                  : '🔴 Check Out'}
              </button>
            )}

            {isNotCheckedIn && (
              <button
                type="button"
                onClick={
                  handleCheckIn
                }
                disabled={
                  attendanceLoading ||
                  attendanceActionLoading
                }
                className="w-full rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-700 transition hover:bg-green-100 dark:bg-green-950/30 dark:text-green-300 dark:hover:bg-green-950/50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {attendanceLoading ||
                attendanceActionLoading
                  ? 'Updating...'
                  : '🟢 Check In'}
              </button>
            )}

            {isCheckedOut && (
              <div className="rounded-lg bg-gray-50 px-4 py-3 text-center dark:bg-gray-800">

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Attendance completed for today.
                </p>

              </div>
            )}

          </div>

          {/* ==================================================
              Navigation
              ================================================== */}

          <nav className="flex-1 overflow-y-auto px-4 py-6">

            {navigation.map(
              (group) => (
                <div
                  key={
                    group.section
                  }
                  className="mb-6"
                >

                  <p className="mb-2 px-4 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    {group.section}
                  </p>

                  {group.items.map(
                    (item) => {

                      if (
                        item.notification
                      ) {
                        return (
                          <div
                            key={item.to}
                            className="mb-1 flex items-center gap-1"
                          >

                            <NavLink
                              to={
                                item.to
                              }
                              className={
                                getNavClass
                              }
                            >

                              <span>
                                {
                                  item.label
                                }
                              </span>

                              {unreadCount >
                                0 && (
                                <span className="inline-flex min-w-[24px] items-center justify-center rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                                  {unreadCount >
                                  99
                                    ? '99+'
                                    : unreadCount}
                                </span>
                              )}

                            </NavLink>

                            <button
                              type="button"
                              onClick={
                                getUnreadCount
                              }
                              disabled={
                                refreshingNotifications
                              }
                              title="Refresh notifications"
                              aria-label="Refresh notifications"
                              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              {refreshingNotifications
                                ? '...'
                                : '↻'}
                            </button>

                          </div>
                        )
                      }

                      return (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          className={
                            getNavClass
                          }
                        >

                          <span>
                            {
                              item.label
                            }
                          </span>

                        </NavLink>
                      )
                    }
                  )}

                </div>
              )
            )}

          </nav>

          {/* ==================================================
              Bottom Actions
              ================================================== */}

          <div className="border-t border-gray-200 p-4 dark:border-gray-800">

            {/* Theme */}

            <button
              type="button"
              onClick={
                toggleTheme
              }
              className="mb-2 flex w-full items-center justify-between rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            >

              <span>
                {theme === 'dark'
                  ? 'Light Mode'
                  : 'Dark Mode'}
              </span>

              <span>
                {theme === 'dark'
                  ? '☀️'
                  : '🌙'}
              </span>

            </button>

            {/* Logout */}

            <button
              type="button"
              onClick={
                handleLogout
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Logout
            </button>

          </div>

        </div>

      </aside>

      {/* ==================================================
          Main Content
          ================================================== */}

      <main className="ml-64 min-h-screen bg-gray-50 dark:bg-gray-950">

        <Outlet />

      </main>

    </div>
  )
}

export default MainLayout


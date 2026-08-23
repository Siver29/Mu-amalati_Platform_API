
import {
  useCallback,
  useEffect,
  useState,
} from 'react'

import { Link } from 'react-router-dom'
import api from '../services/api'
import DashboardSkeleton from '../components/DashboardSkeleton'

function EmployeeDashboard() {
  const [dashboard, setDashboard] =
    useState(null)

  const [attendance, setAttendance] =
    useState(null)

  const [loading, setLoading] =
    useState(true)

  const [refreshing, setRefreshing] =
    useState(false)

  const [attendanceLoading, setAttendanceLoading] =
    useState(false)

  const [
    attendanceActionLoading,
    setAttendanceActionLoading,
  ] = useState(false)

  const [error, setError] =
    useState('')

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
  // Load dashboard
  // --------------------------------------------------

  const getDashboard = useCallback(
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
            '/dashboard/employee'
          )

        setDashboard(
          response.data.data
        )
      } catch (error) {
        console.error(
          'Employee dashboard error:',
          error.response?.data ||
            error
        )

        setError(
          error.response?.data
            ?.message ||
            'Unable to load employee dashboard.'
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
  // Load attendance
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
            'Employee attendance error:',
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

        setError('')

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

        setError(
          error.response?.data
            ?.message ||
            'Unable to check in.'
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

        setError('')

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

        setError(
          error.response?.data
            ?.message ||
            'Unable to check out.'
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
    getDashboard()
    getAttendance()
  }, [
    getDashboard,
    getAttendance,
  ])

  // --------------------------------------------------
  // Status style
  // --------------------------------------------------

  const getStatusStyle = (
    status
  ) => {
    const styles = {
      draft:
        'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',

      pending:
        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',

      returned:
        'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',

      approved:
        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',

      rejected:
        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',

      completed:
        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    }

    return (
      styles[status] ||
      'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
    )
  }

  // --------------------------------------------------
  // Priority style
  // --------------------------------------------------

  const getPriorityStyle = (
    priority
  ) => {
    const styles = {
      low:
        'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',

      medium:
        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',

      high:
        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    }

    return (
      styles[priority] ||
      'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
    )
  }

  // --------------------------------------------------
  // Format attendance time
  // --------------------------------------------------

  const formatAttendanceTime =
    (value) => {
      if (!value) {
        return null
      }

      const date =
        new Date(value)

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return value
      }

      return date.toLocaleTimeString(
        [],
        {
          hour: '2-digit',
          minute: '2-digit',
        }
      )
    }

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (loading) {
    return (
      <DashboardSkeleton />
    )
  }

  // --------------------------------------------------
  // Error
  // --------------------------------------------------

  if (
    error &&
    !dashboard
  ) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 md:p-8 dark:bg-gray-950">

        <div className="rounded-xl bg-red-50 p-5 text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>

        <button
          type="button"
          onClick={() =>
            getDashboard()
          }
          className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
        >
          Try Again
        </button>

      </div>
    )
  }

  if (!dashboard) {
    return null
  }

  const {
    user,

    leave_balance = {
      remaining_leave_days: 0,
      used_leave_days: 0,
      annual_leave_days: 0,
    },

    transaction_counts = {
      total: 0,
      draft: 0,
      pending: 0,
      returned: 0,
      approved: 0,
      rejected: 0,
      completed: 0,
    },

    recent_transactions = [],

    unread_notification_count = 0,
  } = dashboard

  const visibleRecentTransactions =
    recent_transactions.slice(
      0,
      5
    )

  const annualLeaveDays =
    Number(
      leave_balance.annual_leave_days ||
        0
    )

  const usedLeaveDays =
    Number(
      leave_balance.used_leave_days ||
        0
    )

  const remainingLeaveDays =
    Number(
      leave_balance.remaining_leave_days ||
        0
    )

  const leaveProgress =
    annualLeaveDays > 0
      ? Math.min(
          (usedLeaveDays /
            annualLeaveDays) *
            100,
          100
        )
      : 0

  // --------------------------------------------------
  // Page
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8 dark:bg-gray-950">

      {/* Header */}

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

        <div>

          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Employee Dashboard
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
            Welcome, {user?.name || 'Employee'}
          </h1>

          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {user?.job_title || 'Employee'}
            {user?.department?.name
              ? ` • ${user.department.name}`
              : ''}
          </p>

        </div>

        <div className="flex flex-wrap items-center gap-3">

          {refreshing && (
            <span className="text-xs text-gray-400 dark:text-gray-500">
              Updating...
            </span>
          )}

          <button
            type="button"
            onClick={async () => {
              await getDashboard(true)
              await getAttendance()
            }}
            disabled={
              refreshing ||
              attendanceLoading
            }
            title="Refresh dashboard"
            aria-label="Refresh dashboard"
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

          <Link
            to="/transactions/create"
            className="rounded-lg bg-gray-900 px-5 py-3 text-center text-sm font-medium text-white transition hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
          >
            + New Transaction
          </Link>

        </div>

      </div>

      {/* Error while refreshing / attendance */}

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      {/* ==================================================
          ATTENDANCE
          ================================================== */}

      <div className="mb-6 rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900">

        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

          <div>

            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Today's Attendance
            </p>

            <div className="mt-2 flex items-center gap-3">

              {isWorking && (
                <>
                  <span className="h-3 w-3 rounded-full bg-green-500" />

                  <h2 className="text-2xl font-bold text-green-700 dark:text-green-400">
                    Working
                  </h2>
                </>
              )}

              {isCheckedOut && (
                <>
                  <span className="h-3 w-3 rounded-full bg-gray-400" />

                  <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200">
                    Checked Out
                  </h2>
                </>
              )}

              {isNotCheckedIn &&
                !attendanceLoading && (
                  <>
                    <span className="h-3 w-3 rounded-full bg-gray-400" />

                    <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200">
                      Not Checked In
                    </h2>
                  </>
                )}

              {attendanceLoading && (
                <h2 className="text-2xl font-bold text-gray-400 dark:text-gray-500">
                  Loading...
                </h2>
              )}

            </div>

            {attendance?.check_in_at && (
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">

                <span>
                  Check-in:{' '}
                  <span className="font-medium text-gray-900 dark:text-white">
                    {
                      formatAttendanceTime(
                        attendance.check_in_at
                      )
                    }
                  </span>
                </span>

                {attendance.check_out_at && (
                  <span>
                    Check-out:{' '}
                    <span className="font-medium text-gray-900 dark:text-white">
                      {
                        formatAttendanceTime(
                          attendance.check_out_at
                        )
                      }
                    </span>
                  </span>
                )}

              </div>
            )}

          </div>

          <div className="w-full md:w-auto">

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
                className="w-full rounded-lg bg-green-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-400 md:w-auto disabled:cursor-not-allowed disabled:opacity-50"
              >
                {attendanceActionLoading
                  ? 'Checking in...'
                  : '🟢 Check In'}
              </button>
            )}

            {isWorking && (
              <button
                type="button"
                onClick={
                  handleCheckOut
                }
                disabled={
                  attendanceActionLoading
                }
                className="w-full rounded-lg bg-red-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-400 md:w-auto disabled:cursor-not-allowed disabled:opacity-50"
              >
                {attendanceActionLoading
                  ? 'Checking out...'
                  : '🔴 Check Out'}
              </button>
            )}

            {isCheckedOut && (
              <div className="rounded-lg bg-gray-50 px-6 py-3 text-center dark:bg-gray-800">

                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Attendance completed
                </p>

                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  You cannot check in again today.
                </p>

              </div>
            )}

          </div>

        </div>

      </div>

      {/* ==================================================
          TRANSACTION OVERVIEW
          ================================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <Link
          to="/transactions"
          className="rounded-xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:bg-gray-900 dark:hover:bg-gray-800"
        >

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Total Transactions
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {transaction_counts.total}
          </p>

          <p className="mt-3 text-xs font-medium text-blue-600 dark:text-blue-400">
            View all →
          </p>

        </Link>

        <Link
          to="/transactions?status=draft"
          className="rounded-xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:bg-gray-900 dark:hover:bg-gray-800"
        >

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Drafts
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {transaction_counts.draft}
          </p>

          <p className="mt-3 text-xs font-medium text-blue-600 dark:text-blue-400">
            View drafts →
          </p>

        </Link>

        <Link
          to="/transactions?status=pending"
          className="rounded-xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:bg-gray-900 dark:hover:bg-gray-800"
        >

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Pending
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {transaction_counts.pending}
          </p>

          <p className="mt-3 text-xs font-medium text-blue-600 dark:text-blue-400">
            View pending →
          </p>

        </Link>

        <Link
          to="/transactions?status=returned"
          className="rounded-xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:bg-gray-900 dark:hover:bg-gray-800"
        >

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Returned
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {transaction_counts.returned}
          </p>

          <p className="mt-3 text-xs font-medium text-blue-600 dark:text-blue-400">
            View returned →
          </p>

        </Link>

      </div>

      {/* ==================================================
          LEAVE + NOTIFICATIONS
          ================================================== */}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Leave Balance */}

        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900">

          <div className="flex items-start justify-between">

            <div>

              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Leave Balance
              </h2>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Your current annual leave balance.
              </p>

            </div>

            <Link
              to="/transactions/create"
              className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Request leave →
            </Link>

          </div>

          <div className="mt-6 flex items-end gap-3">

            <p className="text-5xl font-bold text-gray-900 dark:text-white">
              {remainingLeaveDays}
            </p>

            <p className="pb-1 text-sm text-gray-500 dark:text-gray-400">
              days remaining
            </p>

          </div>

          <div className="mt-6">

            <div className="mb-2 flex items-center justify-between text-sm">

              <span className="text-gray-500 dark:text-gray-400">
                Used
              </span>

              <span className="font-medium text-gray-900 dark:text-white">
                {usedLeaveDays} /{' '}
                {annualLeaveDays}
              </span>

            </div>

            <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">

              <div
                className="h-full rounded-full bg-gray-900 transition-all dark:bg-white"
                style={{
                  width:
                    `${leaveProgress}%`,
                }}
              />

            </div>

          </div>

        </div>

        {/* Notifications */}

        <Link
          to="/notifications"
          className="rounded-xl bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:bg-gray-900 dark:hover:bg-gray-800"
        >

          <div className="flex items-start justify-between">

            <div>

              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Notifications
              </h2>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Messages and actions that need your attention.
              </p>

            </div>

            <span className="text-xl">
              🔔
            </span>

          </div>

          <div className="mt-6 flex items-end gap-3">

            <p className="text-5xl font-bold text-gray-900 dark:text-white">
              {unread_notification_count}
            </p>

            <p className="pb-1 text-sm text-gray-500 dark:text-gray-400">
              unread
            </p>

          </div>

          <p className="mt-5 text-sm font-medium text-blue-600 dark:text-blue-400">
            View notifications →
          </p>

        </Link>

      </div>

      {/* ==================================================
          RECENT TRANSACTIONS
          ================================================== */}

      <div className="mt-6 rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900">

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Transactions
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Your latest transaction activity.
            </p>

          </div>

          <Link
            to="/transactions"
            className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            View all →
          </Link>

        </div>

        {visibleRecentTransactions.length ===
        0 ? (

          <div className="rounded-lg bg-gray-50 p-8 text-center dark:bg-gray-800">

            <p className="text-sm text-gray-500 dark:text-gray-400">
              No recent transactions.
            </p>

            <Link
              to="/transactions/create"
              className="mt-3 inline-block text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Create your first transaction →
            </Link>

          </div>

        ) : (

          <div className="space-y-3">

            {visibleRecentTransactions.map(
              (transaction) => (
                <div
                  key={
                    transaction.id
                  }
                  className="rounded-lg border border-gray-100 p-4 transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                >

                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                    <div className="min-w-0">

                      <div className="flex flex-wrap items-center gap-2">

                        <Link
                          to={`/transactions/${transaction.id}`}
                          className="font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          {
                            transaction.transaction_number
                          }
                        </Link>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(
                            transaction.status
                          )}`}
                        >
                          {
                            transaction.status
                          }
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${getPriorityStyle(
                            transaction.priority
                          )}`}
                        >
                          {
                            transaction.priority ||
                            'medium'
                          }
                        </span>

                      </div>

                      <p className="mt-2 truncate font-medium text-gray-900 dark:text-white">
                        {
                          transaction.title
                        }
                      </p>

                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {
                          transaction.transaction_type ||
                          'Transaction'
                        }
                      </p>

                    </div>

                    <Link
                      to={`/transactions/${transaction.id}`}
                      className="shrink-0 rounded-lg border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                    >
                      View
                    </Link>

                  </div>

                </div>
              )
            )}

          </div>

        )}

      </div>

      {/* ==================================================
          QUICK ACTIONS
          ================================================== */}

      <div className="mt-6 rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900">

        <div className="mb-5">

          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Quick Actions
          </h2>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Common actions you may need.
          </p>

        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">

          <Link
            to="/transactions/create"
            className="rounded-lg border border-gray-200 p-4 transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >

            <p className="font-medium text-gray-900 dark:text-white">
              Create Transaction
            </p>

            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Start a new transaction request.
            </p>

          </Link>

          <Link
            to="/transactions?status=returned"
            className="rounded-lg border border-gray-200 p-4 transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >

            <p className="font-medium text-gray-900 dark:text-white">
              Returned Transactions
            </p>

            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Review transactions that need changes.
            </p>

          </Link>

          <Link
            to="/notifications"
            className="rounded-lg border border-gray-200 p-4 transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >

            <p className="font-medium text-gray-900 dark:text-white">
              Notifications
            </p>

            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Check unread messages and actions.
            </p>

          </Link>

        </div>

      </div>

    </div>
  )
}

export default EmployeeDashboard


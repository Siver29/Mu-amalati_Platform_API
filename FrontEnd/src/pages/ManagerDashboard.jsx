
import {
  useCallback,
  useEffect,
  useState,
} from 'react'

import { Link } from 'react-router-dom'
import api from '../services/api'
import DashboardSkeleton from '../components/DashboardSkeleton'

function ManagerDashboard() {
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
            '/dashboard/manager'
          )

        setDashboard(
          response.data.data
        )
      } catch (error) {
        console.error(
          'Manager dashboard error:',
          error.response?.data ||
            error
        )

        setError(
          error.response?.data
            ?.message ||
            'Unable to load manager dashboard.'
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
            'Manager attendance error:',
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
          'Manager check-in error:',
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
          'Manager check-out error:',
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
    manager,
    managed_departments = [],
    pending_approval_count = 0,
    approved_today_count = 0,
    returned_today_count = 0,
    rejected_today_count = 0,
    pending_transactions = [],
  } = dashboard

  const visiblePendingTransactions =
    pending_transactions.slice(
      0,
      5
    )

  // --------------------------------------------------
  // Page
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8 dark:bg-gray-950">

      {/* Header */}

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

        <div>

          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Manager Dashboard
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
            Welcome, {manager?.name || 'Manager'}
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-gray-600 dark:text-gray-400">
            Monitor pending work and review transactions assigned to your department.
          </p>

          {managed_departments.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">

              {managed_departments.map(
                (department) => (
                  <span
                    key={
                      department.id
                    }
                    className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm dark:bg-gray-900 dark:text-gray-300"
                  >
                    {
                      department.name
                    }
                  </span>
                )
              )}

            </div>
          )}

        </div>

        {/* Refresh */}

        <div className="flex items-center gap-3">

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
          KPI CARDS
          ================================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {/* Pending */}

        <Link
          to="/transactions"
          className="rounded-xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:bg-gray-900 dark:hover:bg-gray-800"
        >

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Pending Reviews
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {pending_approval_count}
          </p>

          <p className="mt-3 text-xs font-medium text-blue-600 dark:text-blue-400">
            Review transactions →
          </p>

        </Link>

        {/* Approved */}

        <div className="rounded-xl bg-white p-5 shadow-sm dark:bg-gray-900">

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Approved Today
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {approved_today_count}
          </p>

          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            Transactions approved today
          </p>

        </div>

        {/* Returned */}

        <div className="rounded-xl bg-white p-5 shadow-sm dark:bg-gray-900">

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Returned Today
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {returned_today_count}
          </p>

          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            Sent back for modification
          </p>

        </div>

        {/* Rejected */}

        <div className="rounded-xl bg-white p-5 shadow-sm dark:bg-gray-900">

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Rejected Today
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {rejected_today_count}
          </p>

          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            Transactions rejected today
          </p>

        </div>

      </div>

      {/* ==================================================
          PENDING REVIEWS
          ================================================== */}

      <div className="mt-6 rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900">

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Pending Reviews
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              The latest transactions waiting for your action.
            </p>

          </div>

          <Link
            to="/transactions"
            className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            View all →
          </Link>

        </div>

        {visiblePendingTransactions.length ===
        0 ? (

          <div className="rounded-lg bg-gray-50 p-8 text-center dark:bg-gray-800">

            <p className="text-sm text-gray-500 dark:text-gray-400">
              No transactions are waiting for your review.
            </p>

          </div>

        ) : (

          <div className="space-y-3">

            {visiblePendingTransactions.map(
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

                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">

                        <span>
                          {
                            transaction.transaction_type ||
                            'Transaction'
                          }
                        </span>

                        <span>
                          By{' '}
                          {
                            transaction.creator ||
                            'Unknown'
                          }
                        </span>

                      </div>

                    </div>

                    <Link
                      to={`/transactions/${transaction.id}`}
                      className="shrink-0 rounded-lg bg-gray-900 px-4 py-2 text-center text-sm font-medium text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
                    >
                      Review
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
            Access the tasks you use most often.
          </p>

        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">

          <Link
            to="/transactions"
            className="rounded-lg border border-gray-200 p-4 transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >

            <p className="font-medium text-gray-900 dark:text-white">
              Review Transactions
            </p>

            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Open the full transaction list.
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
              Check your latest alerts.
            </p>

          </Link>

          <Link
            to="/profile"
            className="rounded-lg border border-gray-200 p-4 transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >

            <p className="font-medium text-gray-900 dark:text-white">
              My Profile
            </p>

            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              View and update your account.
            </p>

          </Link>

        </div>

      </div>

    </div>
  )
}

export default ManagerDashboard


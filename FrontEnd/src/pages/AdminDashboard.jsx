
import {
  useCallback,
  useEffect,
  useState,
} from 'react'

import { Link } from 'react-router-dom'
import api from '../services/api'
import DashboardSkeleton from '../components/DashboardSkeleton'

function AdminDashboard() {
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
            '/dashboard/admin'
          )

        setDashboard(
          response.data.data
        )
      } catch (error) {
        console.error(
          'Admin dashboard error:',
          error.response?.data ||
            error
        )

        setError(
          error.response?.data
            ?.message ||
            'Unable to load admin dashboard.'
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
            'Admin attendance error:',
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

        await getDashboard(true)
      } catch (error) {
        console.error(
          'Admin check-in error:',
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

        await getDashboard(true)
      } catch (error) {
        console.error(
          'Admin check-out error:',
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
  // Refresh both dashboard + attendance
  // --------------------------------------------------

  const handleRefresh =
    async () => {
      try {
        setRefreshing(true)
        setError('')

        await Promise.all([
          getDashboard(true),
          getAttendance(),
        ])
      } finally {
        setRefreshing(false)
      }
    }

  // --------------------------------------------------
  // Status helpers
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

  const getWorkStatusStyle = (
    status
  ) => {
    const styles = {
      working:
        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',

      on_leave:
        'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',

      inactive:
        'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    }

    return (
      styles[status] ||
      'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
    )
  }

  const getWorkStatusLabel = (
    status
  ) => {
    const labels = {
      working: 'Working',
      on_leave: 'On Leave',
      inactive: 'Inactive',
    }

    return (
      labels[status] ||
      status ||
      'Unknown'
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
    total_employees = 0,
    total_managers = 0,
    active_users = 0,
    inactive_users = 0,
    working_employees = 0,
    employees_on_leave = 0,
    inactive_employees = 0,
    total_departments = 0,
    total_transaction_types = 0,
    total_transactions = 0,
    transactions_by_status = {},
    users_by_department = [],
    transactions_by_department = [],
    employees_currently_on_leave = [],
  } = dashboard

  const totalEmployeeAvailability =
    working_employees +
    employees_on_leave +
    inactive_employees

  // --------------------------------------------------
  // Page
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8 dark:bg-gray-950">

      {/* Header */}

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

        <div>

          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Admin Dashboard
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
            System Overview
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-gray-600 dark:text-gray-400">
            Monitor users, departments, transactions,
            attendance, and overall system activity.
          </p>

        </div>

        <div className="flex items-center gap-3">

          {refreshing && (
            <span className="text-xs text-gray-400 dark:text-gray-500">
              Updating...
            </span>
          )}

          <button
            type="button"
            onClick={
              handleRefresh
            }
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

      {/* Error while refreshing */}

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      {/* ==================================================
          ADMIN ATTENDANCE
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

        <Link
          to="/users"
          className="rounded-xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:bg-gray-900 dark:hover:bg-gray-800"
        >

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Employees
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {total_employees}
          </p>

          <p className="mt-3 text-xs font-medium text-blue-600 dark:text-blue-400">
            Manage users →
          </p>

        </Link>

        <Link
          to="/users"
          className="rounded-xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:bg-gray-900 dark:hover:bg-gray-800"
        >

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Managers
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {total_managers}
          </p>

          <p className="mt-3 text-xs font-medium text-blue-600 dark:text-blue-400">
            Manage users →
          </p>

        </Link>

        <Link
          to="/departments"
          className="rounded-xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:bg-gray-900 dark:hover:bg-gray-800"
        >

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Departments
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {total_departments}
          </p>

          <p className="mt-3 text-xs font-medium text-blue-600 dark:text-blue-400">
            Manage departments →
          </p>

        </Link>

        <Link
          to="/transactions"
          className="rounded-xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:bg-gray-900 dark:hover:bg-gray-800"
        >

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Total Transactions
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {total_transactions}
          </p>

          <p className="mt-3 text-xs font-medium text-blue-600 dark:text-blue-400">
            View transactions →
          </p>

        </Link>

      </div>

      {/* ==================================================
          SECONDARY STATS
          ================================================== */}

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <div className="rounded-xl bg-white p-5 shadow-sm dark:bg-gray-900">

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Active Accounts
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            {active_users}
          </p>

          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            Accounts allowed to access the system
          </p>

        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm dark:bg-gray-900">

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Inactive Accounts
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            {inactive_users}
          </p>

          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            Deactivated accounts
          </p>

        </div>

        <Link
          to="/transaction-types"
          className="rounded-xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:bg-gray-900 dark:hover:bg-gray-800"
        >

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Transaction Types
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            {total_transaction_types}
          </p>

          <p className="mt-3 text-xs font-medium text-blue-600 dark:text-blue-400">
            Manage types →
          </p>

        </Link>

        <div className="rounded-xl bg-white p-5 shadow-sm dark:bg-gray-900">

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Employees On Leave
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            {employees_on_leave}
          </p>

          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            Approved leave covering today
          </p>

        </div>

      </div>

      {/* ==================================================
          TRANSACTION STATUS
          ================================================== */}

      <div className="mt-6 rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900">

        <div className="mb-5">

          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Transaction Overview
          </h2>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Current distribution of transactions by status.
          </p>

        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">

          {Object.entries(
            transactions_by_status
          ).map(
            ([status, total]) => (
              <div
                key={status}
                className="rounded-lg border border-gray-100 p-4 dark:border-gray-700"
              >

                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(
                    status
                  )}`}
                >
                  {status}
                </span>

                <p className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
                  {total}
                </p>

              </div>
            )
          )}

        </div>

      </div>

      {/* ==================================================
          EMPLOYEE AVAILABILITY + DEPARTMENT ACTIVITY
          ================================================== */}

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">

        {/* Employee Availability */}

        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900">

          <div className="mb-5">

            <div className="flex items-center justify-between gap-3">

              <div>

                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Employee Availability
                </h2>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Attendance-based status for employees.
                </p>

              </div>

              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                {totalEmployeeAvailability}{' '}
                employees
              </span>

            </div>

          </div>

          <div className="grid grid-cols-3 gap-3">

            <div className="rounded-lg bg-green-50 p-4 dark:bg-green-950/30">

              <p className="text-sm text-green-700 dark:text-green-300">
                Working
              </p>

              <p className="mt-2 text-2xl font-bold text-green-900 dark:text-green-200">
                {working_employees}
              </p>

              <p className="mt-1 text-xs text-green-700 dark:text-green-400">
                Checked in
              </p>

            </div>

            <div className="rounded-lg bg-orange-50 p-4 dark:bg-orange-950/30">

              <p className="text-sm text-orange-700 dark:text-orange-300">
                On Leave
              </p>

              <p className="mt-2 text-2xl font-bold text-orange-900 dark:text-orange-200">
                {employees_on_leave}
              </p>

              <p className="mt-1 text-xs text-orange-700 dark:text-orange-400">
                Approved leave
              </p>

            </div>

            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">

              <p className="text-sm text-gray-600 dark:text-gray-300">
                Not Working
              </p>

              <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                {inactive_employees}
              </p>

              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                No active attendance
              </p>

            </div>

          </div>

        </div>

        {/* Department Summary */}

        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900">

          <div className="mb-5 flex items-center justify-between">

            <div>

              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Department Activity
              </h2>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Quick overview across departments.
              </p>

            </div>

            <Link
              to="/departments"
              className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              View all →
            </Link>

          </div>

          {transactions_by_department.length ===
          0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No transaction data available.
            </p>
          ) : (
            <div className="space-y-4">

              {transactions_by_department
                .slice(0, 5)
                .map(
                  (item) => (
                    <div
                      key={
                        item.department
                      }
                      className="flex items-center justify-between"
                    >

                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {
                          item.department ||
                          'Unknown'
                        }
                      </span>

                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                        {item.total}
                      </span>

                    </div>
                  )
                )}

            </div>
          )}

        </div>

      </div>

      {/* ==================================================
          CURRENTLY ON LEAVE
          ================================================== */}

      <div className="mt-6 rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900">

        <div className="mb-5 flex items-center justify-between">

          <div>

            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Employees Currently On Leave
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Approved leave covering today.
            </p>

          </div>

          <Link
            to="/transactions"
            className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            View transactions →
          </Link>

        </div>

        {employees_currently_on_leave.length ===
        0 ? (
          <div className="rounded-lg bg-gray-50 p-6 text-center dark:bg-gray-800">

            <p className="text-sm text-gray-500 dark:text-gray-400">
              No employees are currently on leave.
            </p>

          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">

            {employees_currently_on_leave
              .slice(0, 6)
              .map(
                (employee) => (
                  <div
                    key={
                      employee.id
                    }
                    className="rounded-lg border border-gray-100 p-4 dark:border-gray-700"
                  >

                    <div className="flex items-start justify-between gap-3">

                      <div>

                        <p className="font-medium text-gray-900 dark:text-white">
                          {
                            employee.name
                          }
                        </p>

                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {
                            employee.department ||
                            'No department'
                          }
                        </p>

                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${getWorkStatusStyle(
                          employee.work_status ||
                            'on_leave'
                        )}`}
                      >
                        {
                          getWorkStatusLabel(
                            employee.work_status ||
                              'on_leave'
                          )
                        }
                      </span>

                    </div>

                    <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">

                      {
                        employee.leave_start ||
                        '—'
                      }{' '}
                      →{' '}
                      {
                        employee.leave_end ||
                        '—'
                      }

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
            Common administration tasks.
          </p>

        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">

          <Link
            to="/users/create"
            className="rounded-lg border border-gray-200 p-4 transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >

            <p className="font-medium text-gray-900 dark:text-white">
              Add User
            </p>

            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Create a new employee or manager.
            </p>

          </Link>

          <Link
            to="/departments/create"
            className="rounded-lg border border-gray-200 p-4 transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >

            <p className="font-medium text-gray-900 dark:text-white">
              Add Department
            </p>

            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Create a new department.
            </p>

          </Link>

          <Link
            to="/transaction-types/create"
            className="rounded-lg border border-gray-200 p-4 transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >

            <p className="font-medium text-gray-900 dark:text-white">
              Add Transaction Type
            </p>

            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Create a new transaction type.
            </p>

          </Link>

          <Link
            to="/transaction-types"
            className="rounded-lg border border-gray-200 p-4 transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >

            <p className="font-medium text-gray-900 dark:text-white">
              Manage Workflows
            </p>

            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Configure transaction workflows.
            </p>

          </Link>

        </div>

      </div>

    </div>
  )
}

export default AdminDashboard


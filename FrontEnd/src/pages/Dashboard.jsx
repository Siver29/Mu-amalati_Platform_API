import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

function Dashboard() {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getDashboard = async () => {
      try {
        const response = await api.get('/dashboard/employee')

        setDashboard(response.data.data)
      } catch (error) {
        console.error(
          'Dashboard error:',
          error.response?.data || error
        )
      } finally {
        setLoading(false)
      }
    }

    getDashboard()
  }, [])

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-500">
          Loading dashboard...
        </p>
      </div>
    )
  }

  if (!dashboard) {
    return (
      <div className="p-8">
        <div className="rounded-xl bg-red-50 p-5 text-red-700">
          Unable to load dashboard.
        </div>
      </div>
    )
  }

  const {
    user,
    leave_balance,
    transaction_counts,
    recent_transactions,
    unread_notification_count,
  } = dashboard

  const getStatusStyle = (status) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-700',
      pending: 'bg-yellow-100 text-yellow-700',
      returned: 'bg-orange-100 text-orange-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      completed: 'bg-blue-100 text-blue-700',
    }

    return styles[status] || 'bg-gray-100 text-gray-700'
  }

  const getPriorityStyle = (priority) => {
    const styles = {
      low: 'bg-gray-100 text-gray-600',
      medium: 'bg-yellow-100 text-yellow-700',
      high: 'bg-red-100 text-red-700',
    }

    return styles[priority] || 'bg-gray-100 text-gray-600'
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">

      {/* Header */}

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

        <div>
          <p className="text-sm font-medium text-gray-500">
            Employee Dashboard
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            Welcome, {user.name}
          </h1>

          <p className="mt-2 text-gray-600">
            {user.job_title || 'Employee'}
            {user.department?.name
              ? ` • ${user.department.name}`
              : ''}
          </p>
        </div>

        <Link
          to="/transactions/create"
          className="rounded-lg bg-blue-600 px-5 py-3 text-center text-sm font-medium text-white transition hover:bg-blue-700"
        >
          + New Transaction
        </Link>

      </div>

      {/* Transaction Statistics */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <Link
          to="/transactions"
          className="rounded-xl bg-white p-6 shadow transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <p className="text-sm text-gray-500">
            Total Transactions
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {transaction_counts.total}
          </p>

          <p className="mt-3 text-sm font-medium text-blue-600">
            View all →
          </p>
        </Link>

        <Link
          to="/transactions?status=draft"
          className="rounded-xl bg-white p-6 shadow transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <p className="text-sm text-gray-500">
            Draft
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {transaction_counts.draft}
          </p>

          <p className="mt-3 text-sm font-medium text-blue-600">
            View drafts →
          </p>
        </Link>

        <Link
          to="/transactions?status=pending"
          className="rounded-xl bg-white p-6 shadow transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <p className="text-sm text-gray-500">
            Pending
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {transaction_counts.pending}
          </p>

          <p className="mt-3 text-sm font-medium text-blue-600">
            View pending →
          </p>
        </Link>

        <Link
          to="/transactions?status=returned"
          className="rounded-xl bg-white p-6 shadow transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <p className="text-sm text-gray-500">
            Returned
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {transaction_counts.returned}
          </p>

          <p className="mt-3 text-sm font-medium text-blue-600">
            View returned →
          </p>
        </Link>

      </div>

      {/* Leave + Notifications */}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Leave Balance */}

        <div className="rounded-xl bg-white p-6 shadow">

          <div className="flex items-start justify-between">

            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Leave Balance
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Your current annual leave balance.
              </p>
            </div>

          </div>

          <div className="mt-6 flex items-end gap-3">

            <p className="text-5xl font-bold text-gray-900">
              {leave_balance.remaining_leave_days}
            </p>

            <p className="pb-1 text-sm text-gray-500">
              days remaining
            </p>

          </div>

          <div className="mt-6">

            <div className="mb-2 flex justify-between text-sm">

              <span className="text-gray-500">
                Used
              </span>

              <span className="font-medium text-gray-900">
                {leave_balance.used_leave_days} /{' '}
                {leave_balance.annual_leave_days}
              </span>

            </div>

            <div className="h-2 overflow-hidden rounded-full bg-gray-100">

              <div
                className="h-full rounded-full bg-blue-600"
                style={{
                  width: `${
                    leave_balance.annual_leave_days > 0
                      ? Math.min(
                          (leave_balance.used_leave_days /
                            leave_balance.annual_leave_days) *
                            100,
                          100
                        )
                      : 0
                  }%`,
                }}
              />

            </div>

          </div>

        </div>

        {/* Notifications */}

        <Link
          to="/notifications"
          className="rounded-xl bg-white p-6 shadow transition hover:-translate-y-0.5 hover:shadow-md"
        >

          <div className="flex items-start justify-between">

            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Notifications
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Messages and actions that need your attention.
              </p>
            </div>

            <span className="text-xl">
              🔔
            </span>

          </div>

          <div className="mt-6 flex items-end gap-3">

            <p className="text-5xl font-bold text-gray-900">
              {unread_notification_count}
            </p>

            <p className="pb-1 text-sm text-gray-500">
              unread notifications
            </p>

          </div>

          <p className="mt-5 text-sm font-medium text-blue-600">
            View notifications →
          </p>

        </Link>

      </div>

      {/* Recent Transactions */}

      <div className="mt-6 rounded-xl bg-white p-6 shadow">

        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Transactions
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Your latest transaction activity.
            </p>
          </div>

          <Link
            to="/transactions"
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            View all →
          </Link>

        </div>

        {recent_transactions.length === 0 ? (

          <div className="rounded-lg bg-gray-50 p-8 text-center">

            <p className="text-gray-500">
              No recent transactions.
            </p>

            <Link
              to="/transactions/create"
              className="mt-3 inline-block text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              Create your first transaction →
            </Link>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead>

                <tr className="border-b text-sm text-gray-500">

                  <th className="px-4 py-3">
                    Transaction
                  </th>

                  <th className="px-4 py-3">
                    Title
                  </th>

                  <th className="px-4 py-3">
                    Type
                  </th>

                  <th className="px-4 py-3">
                    Status
                  </th>

                  <th className="px-4 py-3">
                    Priority
                  </th>

                </tr>

              </thead>

              <tbody>

                {recent_transactions.map((transaction) => (

                  <tr
                    key={transaction.id}
                    className="border-b last:border-0 hover:bg-gray-50"
                  >

                    {/* Transaction */}

                    <td className="px-4 py-4">

                      <Link
                        to={`/transactions/${transaction.id}`}
                        className="font-medium text-blue-600 hover:text-blue-800"
                      >
                        {transaction.transaction_number}
                      </Link>

                    </td>

                    {/* Title */}

                    <td className="px-4 py-4 text-gray-700">
                      {transaction.title}
                    </td>

                    {/* Type */}

                    <td className="px-4 py-4 text-gray-600">
                      {transaction.transaction_type}
                    </td>

                    {/* Status */}

                    <td className="px-4 py-4">

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(
                          transaction.status
                        )}`}
                      >
                        {transaction.status}
                      </span>

                    </td>

                    {/* Priority */}

                    <td className="px-4 py-4">

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${getPriorityStyle(
                          transaction.priority
                        )}`}
                      >
                        {transaction.priority}
                      </span>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  )
}

export default Dashboard
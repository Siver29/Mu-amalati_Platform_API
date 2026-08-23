import {
  useCallback,
  useEffect,
  useState,
} from 'react'

import { Link } from 'react-router-dom'
import api from '../services/api'
import Skeleton from '../components/Skeleton'
import TableSkeleton from '../components/TableSkeleton'

function Transactions() {
  const [transactions, setTransactions] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [refreshing, setRefreshing] =
    useState(false)

  const [error, setError] =
    useState('')

  // --------------------------------------------------
  // Load transactions
  // --------------------------------------------------

  const getTransactions = useCallback(
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
            '/transactions'
          )

        setTransactions(
          response.data.data || []
        )
      } catch (error) {
        console.error(
          'Transactions error:',
          error.response?.data ||
            error
        )

        setError(
          error.response?.data
            ?.message ||
            'Unable to load transactions.'
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
    getTransactions()
  }, [getTransactions])

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
  // Initial loading
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 md:p-8 dark:bg-gray-950">

        <div className="mb-8">

          <Skeleton className="h-9 w-48" />

          <Skeleton className="mt-3 h-4 w-72" />

        </div>

        <TableSkeleton />

      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 dark:bg-gray-950">

      {/* ==================================================
          Header
          ================================================== */}

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

        <div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Transactions
          </h1>

          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Manage and track your transactions.
          </p>

          {error && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

        </div>

        <div className="flex flex-wrap items-center gap-3">

          <button
            type="button"
            onClick={() =>
              getTransactions(true)
            }
            disabled={refreshing}
            title="Refresh transactions"
            aria-label="Refresh transactions"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
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
            className="rounded-lg bg-blue-600 px-5 py-3 text-center text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400"
          >
            + New Transaction
          </Link>

        </div>

      </div>

      {/* ==================================================
          Refresh Error
          ================================================== */}

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      {/* ==================================================
          Table
          ================================================== */}

      <div className="overflow-hidden rounded-xl bg-white shadow dark:bg-gray-900">

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead className="border-b bg-gray-50 dark:border-gray-700 dark:bg-gray-800">

              <tr className="text-sm text-gray-500 dark:text-gray-300">

                <th className="px-6 py-4">
                  Transaction
                </th>

                <th className="px-6 py-4">
                  Type
                </th>

                <th className="px-6 py-4">
                  Destination
                </th>

                <th className="px-6 py-4">
                  Status
                </th>

                <th className="px-6 py-4">
                  Priority
                </th>

                <th className="px-6 py-4">
                  Created
                </th>

                <th className="px-6 py-4">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {transactions.map(
                (transaction) => (
                  <tr
                    key={
                      transaction.id
                    }
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800"
                  >

                    {/* Transaction */}

                    <td className="px-6 py-5">

                      <p className="font-medium text-gray-900 dark:text-white">
                        {
                          transaction.transaction_number
                        }
                      </p>

                      <p className="mt-1 max-w-xs truncate text-sm text-gray-500 dark:text-gray-400">
                        {
                          transaction.title
                        }
                      </p>

                    </td>

                    {/* Type */}

                    <td className="px-6 py-5">

                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {
                          transaction
                            .transaction_type
                            ?.name_en
                        }
                      </p>

                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {
                          transaction
                            .transaction_type
                            ?.name_ar
                        }
                      </p>

                    </td>

                    {/* Destination */}

                    <td className="px-6 py-5 text-sm text-gray-600 dark:text-gray-300">

                      {
                        transaction
                          .destination_department
                          ?.name ||
                        '-'
                      }

                    </td>

                    {/* Status */}

                    <td className="px-6 py-5">

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(
                          transaction.status
                        )}`}
                      >
                        {
                          transaction.status
                        }
                      </span>

                    </td>

                    {/* Priority */}

                    <td className="px-6 py-5">

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${getPriorityStyle(
                          transaction.priority
                        )}`}
                      >
                        {
                          transaction.priority
                        }
                      </span>

                    </td>

                    {/* Created */}

                    <td className="px-6 py-5 text-sm text-gray-500 dark:text-gray-400">

                      {transaction.created_at
                        ? new Date(
                            transaction.created_at
                          ).toLocaleDateString()
                        : '-'}

                    </td>

                    {/* View */}

                    <td className="px-6 py-5">

                      <Link
                        to={`/transactions/${transaction.id}`}
                        className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        View
                      </Link>

                    </td>

                  </tr>
                )
              )}

            </tbody>

          </table>

        </div>

        {/* Empty State */}

        {transactions.length ===
          0 && (
          <div className="bg-white p-8 text-center text-gray-500 dark:bg-gray-900 dark:text-gray-400">
            No transactions found.
          </div>
        )}

      </div>

    </div>
  )
}

export default Transactions
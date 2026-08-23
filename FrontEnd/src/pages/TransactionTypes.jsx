import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

function TransactionTypes() {
  const [types, setTypes] =
    useState([])

  const [departments, setDepartments] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [actionLoading, setActionLoading] =
    useState(null)

  const [error, setError] =
    useState('')

  const [statusFilter, setStatusFilter] =
    useState('')

  const [page, setPage] =
    useState(1)

  const [pagination, setPagination] =
    useState({
      current_page: 1,
      last_page: 1,
      total: 0,
      per_page: 10,
    })

  // --------------------------------------------------
  // Load active departments
  // --------------------------------------------------

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const response =
          await api.get('/departments')

        setDepartments(
          response.data.data || []
        )
      } catch (error) {
        console.error(
          'Departments error:',
          error.response?.data ||
            error
        )
      }
    }

    loadDepartments()
  }, [])

  // --------------------------------------------------
  // Load transaction types
  // --------------------------------------------------

  const loadTypes = async () => {
    try {
      setLoading(true)
      setError('')

      const params =
        new URLSearchParams()

      params.set(
        'page',
        page
      )

      params.set(
        'per_page',
        '10'
      )

      if (statusFilter !== '') {
        params.set(
          'is_active',
          statusFilter
        )
      }

      const response =
        await api.get(
          `/admin/transaction-types?${params.toString()}`
        )

      setTypes(
        response.data.data || []
      )

      setPagination(
        response.data.meta || {
          current_page: 1,
          last_page: 1,
          total: 0,
          per_page: 10,
        }
      )
    } catch (error) {
      console.error(
        'Transaction types error:',
        error.response?.data ||
          error
      )

      setError(
        error.response?.data
          ?.message ||
          'Unable to load transaction types.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTypes()
  }, [
    page,
    statusFilter,
  ])

  // --------------------------------------------------
  // Activate
  // --------------------------------------------------

  const handleActivate =
    async (typeId) => {
      const confirmed =
        window.confirm(
          'Are you sure you want to activate this transaction type?'
        )

      if (!confirmed) {
        return
      }

      try {
        setActionLoading(typeId)
        setError('')

        await api.post(
          `/admin/transaction-types/${typeId}/activate`
        )

        await loadTypes()
      } catch (error) {
        console.error(
          'Activate transaction type error:',
          error.response?.data ||
            error
        )

        setError(
          error.response?.data
            ?.message ||
            'Unable to activate transaction type.'
        )
      } finally {
        setActionLoading(null)
      }
    }

  // --------------------------------------------------
  // Deactivate
  // --------------------------------------------------

  const handleDeactivate =
    async (typeId) => {
      const confirmed =
        window.confirm(
          'Are you sure you want to deactivate this transaction type?'
        )

      if (!confirmed) {
        return
      }

      try {
        setActionLoading(typeId)
        setError('')

        await api.post(
          `/admin/transaction-types/${typeId}/deactivate`
        )

        await loadTypes()
      } catch (error) {
        console.error(
          'Deactivate transaction type error:',
          error.response?.data ||
            error
        )

        setError(
          error.response?.data
            ?.message ||
            'Unable to deactivate transaction type.'
        )
      } finally {
        setActionLoading(null)
      }
    }

  // --------------------------------------------------
  // Delete
  // --------------------------------------------------

  const handleDelete =
    async (
      typeId,
      typeName
    ) => {
      const confirmed =
        window.confirm(
          `Are you sure you want to delete ${typeName}?`
        )

      if (!confirmed) {
        return
      }

      try {
        setActionLoading(typeId)
        setError('')

        await api.delete(
          `/admin/transaction-types/${typeId}`
        )

        await loadTypes()
      } catch (error) {
        console.error(
          'Delete transaction type error:',
          error.response?.data ||
            error
        )

        setError(
          error.response?.data
            ?.message ||
            'Unable to delete transaction type.'
        )
      } finally {
        setActionLoading(null)
      }
    }

  // --------------------------------------------------
  // Helpers
  // --------------------------------------------------

  const getStatusStyle =
    (isActive) => {
      return isActive
        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
    }

  const getDepartmentName =
    (type) => {
      if (
        type.destination_department
          ?.name
      ) {
        return type
          .destination_department
          .name
      }

      if (
        type.destinationDepartment
          ?.name
      ) {
        return type
          .destinationDepartment
          .name
      }

      if (
        type.destination_department_name
      ) {
        return type
          .destination_department_name
      }

      return '—'
    }

  const getWorkflowSteps =
    (type) => {
      if (
        !type.workflow_steps &&
        !type.workflowSteps
      ) {
        return []
      }

      return (
        type.workflow_steps ||
        type.workflowSteps ||
        []
      )
    }

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 md:p-8 dark:bg-gray-950">

        <div className="rounded-xl bg-white p-8 shadow dark:bg-gray-900">

          <p className="text-gray-500 dark:text-gray-400">
            Loading transaction types...
          </p>

        </div>

      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8 dark:bg-gray-950">

      {/* Header */}

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

        <div>

          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Administration
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
            Transaction Types
          </h1>

          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage request types, destinations, attachments, and workflows.
          </p>

        </div>

        <Link
          to="/transaction-types/create"
          className="rounded-lg bg-blue-600 px-5 py-3 text-center text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400"
        >
          + Add Transaction Type
        </Link>

      </div>

      {/* Error */}

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Filter */}

      <div className="rounded-xl bg-white p-6 shadow dark:bg-gray-900">

        <div className="max-w-xs">

          <label
            htmlFor="status-filter"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Status
          </label>

          <select
            id="status-filter"
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(
                event.target.value
              )

              setPage(1)
            }}
            className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-900/30"
          >

            <option value="">
              All Transaction Types
            </option>

            <option value="1">
              Active
            </option>

            <option value="0">
              Inactive
            </option>

          </select>

        </div>

      </div>

      {/* Table */}

      <div className="mt-6 overflow-hidden rounded-xl bg-white shadow dark:bg-gray-900">

        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing {types.length} of{' '}
            {pagination.total || 0} transaction types
          </p>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">

              <tr className="text-sm text-gray-500 dark:text-gray-300">

                <th className="px-6 py-4">
                  Type
                </th>

                <th className="px-6 py-4">
                  Destination
                </th>

                <th className="px-6 py-4">
                  Attachment
                </th>

                <th className="px-6 py-4">
                  Workflow
                </th>

                <th className="px-6 py-4">
                  Status
                </th>

                <th className="px-6 py-4">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {types.length ===
              0 ? (

                <tr>

                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    No transaction types found.
                  </td>

                </tr>

              ) : (

                types.map(
                  (type) => {

                    const isLoading =
                      actionLoading ===
                      type.id

                    const workflowSteps =
                      getWorkflowSteps(
                        type
                      )

                    return (
                      <tr
                        key={type.id}
                        className="border-b border-gray-100 last:border-0 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800"
                      >

                        {/* Type */}

                        <td className="px-6 py-5">

                          <p className="font-medium text-gray-900 dark:text-white">
                            {type.name_en}
                          </p>

                          <p
                            dir="rtl"
                            className="mt-1 text-sm text-gray-500 dark:text-gray-400"
                          >
                            {type.name_ar}
                          </p>

                          {type.description && (
                            <p className="mt-2 max-w-sm text-xs text-gray-400 dark:text-gray-500">
                              {
                                type.description
                              }
                            </p>
                          )}

                        </td>

                        {/* Destination */}

                        <td className="px-6 py-5 text-sm text-gray-600 dark:text-gray-300">
                          {
                            getDepartmentName(
                              type
                            )
                          }
                        </td>

                        {/* Attachment */}

                        <td className="px-6 py-5">

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              type.requires_attachment
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                            }`}
                          >
                            {type.requires_attachment
                              ? 'Required'
                              : 'Not required'}
                          </span>

                        </td>

                        {/* Workflow */}

                        <td className="px-6 py-5">

                          {workflowSteps.length ===
                          0 ? (

                            <span className="text-sm text-gray-400 dark:text-gray-500">
                              No workflow
                            </span>

                          ) : (

                            <div className="flex max-w-sm flex-wrap items-center gap-1">

                              {workflowSteps.map(
                                (
                                  step,
                                  index
                                ) => {

                                  const departmentName =
                                    step.department
                                      ?.name ||
                                    step.department_name ||
                                    'Department'

                                  return (
                                    <div
                                      key={
                                        step.id ||
                                        `${type.id}-${index}`
                                      }
                                      className="flex items-center"
                                    >

                                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                        {
                                          departmentName
                                        }
                                      </span>

                                      {index <
                                        workflowSteps.length -
                                          1 && (
                                        <span className="mx-1 text-gray-400 dark:text-gray-500">
                                          →
                                        </span>
                                      )}

                                    </div>
                                  )
                                }
                              )}

                            </div>

                          )}

                        </td>

                        {/* Status */}

                        <td className="px-6 py-5">

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(
                              type.is_active
                            )}`}
                          >
                            {type.is_active
                              ? 'Active'
                              : 'Inactive'}
                          </span>

                        </td>

                        {/* Actions */}

                        <td className="px-6 py-5">

                          <div className="flex flex-wrap gap-2">

                            <Link
                              to={`/transaction-types/${type.id}/edit`}
                              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                            >
                              Edit
                            </Link>

                            <Link
                              to={`/transaction-types/${type.id}/workflow`}
                              className="rounded-lg border border-blue-200 px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-50 dark:border-blue-800/60 dark:text-blue-300 dark:hover:bg-blue-950/30"
                            >
                              Workflow
                            </Link>

                            <Link
                              to={`/transaction-types/${type.id}/fields`}
                              className="rounded-lg border border-purple-200 px-3 py-2 text-xs font-medium text-purple-700 hover:bg-purple-50 dark:border-purple-800/60 dark:text-purple-300 dark:hover:bg-purple-950/30"
                            >
                              Fields
                            </Link>

                            {type.is_active ? (

                              <button
                                type="button"
                                onClick={() =>
                                  handleDeactivate(
                                    type.id
                                  )
                                }
                                disabled={
                                  isLoading
                                }
                                className="rounded-lg border border-orange-200 px-3 py-2 text-xs font-medium text-orange-700 hover:bg-orange-50 dark:border-orange-800/60 dark:text-orange-300 dark:hover:bg-orange-950/30 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {isLoading
                                  ? '...'
                                  : 'Deactivate'}
                              </button>

                            ) : (

                              <button
                                type="button"
                                onClick={() =>
                                  handleActivate(
                                    type.id
                                  )
                                }
                                disabled={
                                  isLoading
                                }
                                className="rounded-lg border border-green-200 px-3 py-2 text-xs font-medium text-green-700 hover:bg-green-50 dark:border-green-800/60 dark:text-green-300 dark:hover:bg-green-950/30 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {isLoading
                                  ? '...'
                                  : 'Activate'}
                              </button>

                            )}

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  type.id,
                                  type.name_en
                                )
                              }
                              disabled={
                                isLoading
                              }
                              className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-50 dark:border-red-800/60 dark:text-red-300 dark:hover:bg-red-950/30 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {isLoading
                                ? '...'
                                : 'Delete'}
                            </button>

                          </div>

                        </td>

                      </tr>
                    )
                  }
                )
              )}

            </tbody>

          </table>

        </div>

        {/* Pagination */}

        {pagination.last_page >
          1 && (
          <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4 dark:border-gray-700">

            <button
              type="button"
              disabled={
                pagination.current_page <=
                1
              }
              onClick={() =>
                setPage(
                  pagination.current_page -
                    1
                )
              }
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              ← Previous
            </button>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Page{' '}
              {
                pagination.current_page
              }{' '}
              of{' '}
              {
                pagination.last_page
              }
            </p>

            <button
              type="button"
              disabled={
                pagination.current_page >=
                pagination.last_page
              }
              onClick={() =>
                setPage(
                  pagination.current_page +
                    1
                )
              }
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next →
            </button>

          </div>
        )}

      </div>

    </div>
  )
}

export default TransactionTypes
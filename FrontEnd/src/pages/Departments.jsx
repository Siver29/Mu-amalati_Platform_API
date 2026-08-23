import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

function Departments() {
  const [departments, setDepartments] =
    useState([])

  const [managers, setManagers] =
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
  // Load managers
  // --------------------------------------------------

  useEffect(() => {
    const loadManagers = async () => {
      try {
        const response =
          await api.get(
            '/admin/users?role=manager&status=active&per_page=50'
          )

        setManagers(
          response.data.data || []
        )
      } catch (error) {
        console.error(
          'Managers error:',
          error.response?.data ||
            error
        )
      }
    }

    loadManagers()
  }, [])

  // --------------------------------------------------
  // Load departments
  // --------------------------------------------------

  const loadDepartments =
    async () => {
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
            `/admin/departments?${params.toString()}`
          )

        setDepartments(
          response.data.data ||
            []
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
          'Departments error:',
          error.response?.data ||
            error
        )

        setError(
          error.response?.data
            ?.message ||
            'Unable to load departments.'
        )
      } finally {
        setLoading(false)
      }
    }

  useEffect(() => {
    loadDepartments()
  }, [
    page,
    statusFilter,
  ])

  // --------------------------------------------------
  // Activate
  // --------------------------------------------------

  const handleActivate =
    async (
      departmentId
    ) => {
      const confirmed =
        window.confirm(
          'Are you sure you want to activate this department?'
        )

      if (!confirmed) {
        return
      }

      try {
        setActionLoading(
          departmentId
        )

        setError('')

        await api.post(
          `/admin/departments/${departmentId}/activate`
        )

        await loadDepartments()
      } catch (error) {
        console.error(
          'Activate department error:',
          error.response?.data ||
            error
        )

        setError(
          error.response?.data
            ?.message ||
            'Unable to activate department.'
        )
      } finally {
        setActionLoading(null)
      }
    }

  // --------------------------------------------------
  // Deactivate
  // --------------------------------------------------

  const handleDeactivate =
    async (
      departmentId
    ) => {
      const confirmed =
        window.confirm(
          'Are you sure you want to deactivate this department?'
        )

      if (!confirmed) {
        return
      }

      try {
        setActionLoading(
          departmentId
        )

        setError('')

        await api.post(
          `/admin/departments/${departmentId}/deactivate`
        )

        await loadDepartments()
      } catch (error) {
        console.error(
          'Deactivate department error:',
          error.response?.data ||
            error
        )

        setError(
          error.response?.data
            ?.message ||
            'Unable to deactivate department.'
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
      departmentId,
      departmentName
    ) => {
      const confirmed =
        window.confirm(
          `Are you sure you want to delete ${departmentName}?`
        )

      if (!confirmed) {
        return
      }

      try {
        setActionLoading(
          departmentId
        )

        setError('')

        await api.delete(
          `/admin/departments/${departmentId}`
        )

        await loadDepartments()
      } catch (error) {
        console.error(
          'Delete department error:',
          error.response?.data ||
            error
        )

        setError(
          error.response?.data
            ?.message ||
            'Unable to delete department.'
        )
      } finally {
        setActionLoading(null)
      }
    }

  // --------------------------------------------------
  // Helpers
  // --------------------------------------------------

  const getManagerName =
    (department) => {
      if (
        department.manager?.name
      ) {
        return department.manager.name
      }

      if (
        department.manager_name
      ) {
        return department.manager_name
      }

      return 'No manager assigned'
    }

  const getStatusStyle =
    (isActive) => {
      if (isActive) {
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
      }

      return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
    }

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 md:p-8 dark:bg-gray-950">

        <div className="rounded-xl bg-white p-8 shadow dark:bg-gray-900">

          <p className="text-gray-500 dark:text-gray-400">
            Loading departments...
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
            Departments
          </h1>

          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage departments and assign their managers.
          </p>

        </div>

        <Link
          to="/departments/create"
          className="rounded-lg bg-blue-600 px-5 py-3 text-center text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400"
        >
          + Add Department
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
            value={
              statusFilter
            }
            onChange={(event) => {
              setStatusFilter(
                event.target.value
              )

              setPage(1)
            }}
            className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-900/30"
          >

            <option value="">
              All Departments
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

      {/* Departments Table */}

      <div className="mt-6 overflow-hidden rounded-xl bg-white shadow dark:bg-gray-900">

        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing {departments.length} of{' '}
            {pagination.total || 0} departments
          </p>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">

              <tr className="text-sm text-gray-500 dark:text-gray-300">

                <th className="px-6 py-4">
                  Department
                </th>

                <th className="px-6 py-4">
                  Description
                </th>

                <th className="px-6 py-4">
                  Manager
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

              {departments.length ===
              0 ? (

                <tr>

                  <td
                    colSpan="5"
                    className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    No departments found.
                  </td>

                </tr>

              ) : (

                departments.map(
                  (department) => {

                    const isLoading =
                      actionLoading ===
                      department.id

                    return (
                      <tr
                        key={
                          department.id
                        }
                        className="border-b border-gray-100 last:border-0 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800"
                      >

                        {/* Department */}

                        <td className="px-6 py-5">

                          <p className="font-medium text-gray-900 dark:text-white">
                            {
                              department.name
                            }
                          </p>

                        </td>

                        {/* Description */}

                        <td className="max-w-md px-6 py-5 text-sm text-gray-600 dark:text-gray-300">

                          <p className="line-clamp-2">
                            {
                              department.description ||
                              '—'
                            }
                          </p>

                        </td>

                        {/* Manager */}

                        <td className="px-6 py-5">

                          <div>

                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {
                                getManagerName(
                                  department
                                )
                              }
                            </p>

                            {department.manager?.email && (
                              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                {
                                  department.manager
                                    .email
                                }
                              </p>
                            )}

                          </div>

                        </td>

                        {/* Status */}

                        <td className="px-6 py-5">

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(
                              department.is_active
                            )}`}
                          >
                            {department.is_active
                              ? 'Active'
                              : 'Inactive'}
                          </span>

                        </td>

                        {/* Actions */}

                        <td className="px-6 py-5">

                          <div className="flex flex-wrap gap-2">

                            <Link
                              to={`/departments/${department.id}/edit`}
                              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                            >
                              Edit
                            </Link>

                            {department.is_active ? (

                              <button
                                type="button"
                                onClick={() =>
                                  handleDeactivate(
                                    department.id
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
                                    department.id
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
                                  department.id,
                                  department.name
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

export default Departments
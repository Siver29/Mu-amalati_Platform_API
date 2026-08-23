import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

function Users() {
  const [users, setUsers] =
    useState([])

  const [departments, setDepartments] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [actionLoading, setActionLoading] =
    useState(null)

  const [error, setError] =
    useState('')

  const [search, setSearch] =
    useState('')

  const [role, setRole] =
    useState('')

  const [departmentId, setDepartmentId] =
    useState('')

  const [status, setStatus] =
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
  // Load Departments
  // --------------------------------------------------

  useEffect(() => {
    const loadDepartments =
      async () => {
        try {
          const response =
            await api.get(
              '/departments'
            )

          setDepartments(
            response.data.data ||
              []
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
  // Load Users
  // --------------------------------------------------

  const loadUsers = async () => {
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

      if (search.trim()) {
        params.set(
          'search',
          search.trim()
        )
      }

      if (role) {
        params.set(
          'role',
          role
        )
      }

      if (departmentId) {
        params.set(
          'department_id',
          departmentId
        )
      }

      if (status) {
        params.set(
          'status',
          status
        )
      }

      const response =
        await api.get(
          `/admin/users?${params.toString()}`
        )

      setUsers(
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
        'Users error:',
        error.response?.data ||
          error
      )

      setError(
        error.response?.data
          ?.message ||
          'Unable to load users.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [
    page,
    role,
    departmentId,
    status,
  ])

  // --------------------------------------------------
  // Search
  // --------------------------------------------------

  const handleSearch = (
    event
  ) => {
    event.preventDefault()

    setPage(1)
    loadUsers()
  }

  // --------------------------------------------------
  // Clear Filters
  // --------------------------------------------------

  const clearFilters = () => {
    setSearch('')
    setRole('')
    setDepartmentId('')
    setStatus('')
    setPage(1)
  }

  // --------------------------------------------------
  // Activate
  // --------------------------------------------------

  const handleActivate =
    async (userId) => {
      const confirmed =
        window.confirm(
          'Are you sure you want to activate this user?'
        )

      if (!confirmed) {
        return
      }

      try {
        setActionLoading(userId)
        setError('')

        await api.post(
          `/admin/users/${userId}/activate`
        )

        await loadUsers()
      } catch (error) {
        console.error(
          'Activate user error:',
          error.response?.data ||
            error
        )

        setError(
          error.response?.data
            ?.message ||
            'Unable to activate user.'
        )
      } finally {
        setActionLoading(null)
      }
    }

  // --------------------------------------------------
  // Deactivate
  // --------------------------------------------------

  const handleDeactivate =
    async (userId) => {
      const confirmed =
        window.confirm(
          'Are you sure you want to deactivate this user?'
        )

      if (!confirmed) {
        return
      }

      try {
        setActionLoading(userId)
        setError('')

        await api.post(
          `/admin/users/${userId}/deactivate`
        )

        await loadUsers()
      } catch (error) {
        console.error(
          'Deactivate user error:',
          error.response?.data ||
            error
        )

        setError(
          error.response?.data
            ?.message ||
            'Unable to deactivate user.'
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
      userId,
      userName
    ) => {
      const confirmed =
        window.confirm(
          `Are you sure you want to delete ${userName}?`
        )

      if (!confirmed) {
        return
      }

      try {
        setActionLoading(userId)
        setError('')

        await api.delete(
          `/admin/users/${userId}`
        )

        await loadUsers()
      } catch (error) {
        console.error(
          'Delete user error:',
          error.response?.data ||
            error
        )

        setError(
          error.response?.data
            ?.message ||
            'Unable to delete user.'
        )
      } finally {
        setActionLoading(null)
      }
    }

  // --------------------------------------------------
  // Work Status
  // --------------------------------------------------

  const getWorkStatus = (user) => {
  return user.work_status || 'inactive'
}

  const getWorkStatusLabel =
    (status) => {
      const labels = {
        working: 'Working',
        on_leave: 'On Leave',
        inactive: 'Inactive',
      }

      return (
        labels[status] ||
        status
      )
    }

  const getWorkStatusStyle =
    (status) => {
      const styles = {
        working:
          'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',

        on_leave:
          'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',

        inactive:
          'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
      }

      return (
        styles[status] ||
        'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
      )
    }

  // --------------------------------------------------
  // Account Status
  // --------------------------------------------------

  const getAccountStatusStyle =
    (status) => {
      if (
        status === 'active'
      ) {
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
            Loading users...
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
            Users
          </h1>

          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage system users, roles, departments, and account status.
          </p>

        </div>

        <Link
          to="/users/create"
          className="rounded-lg bg-blue-600 px-5 py-3 text-center text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400"
        >
          + Add User
        </Link>

      </div>

      {/* Error */}

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Filters */}

      <div className="rounded-xl bg-white p-6 shadow dark:bg-gray-900">

        <form
          onSubmit={handleSearch}
          className="grid gap-4 lg:grid-cols-5"
        >

          {/* Search */}

          <div className="lg:col-span-2">

            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Search
            </label>

            <input
              id="search"
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search by name or email..."
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-900/30"
            />

          </div>

          {/* Role */}

          <div>

            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Role
            </label>

            <select
              id="role"
              value={role}
              onChange={(
                event
              ) => {
                setRole(
                  event.target.value
                )
                setPage(1)
              }}
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-900/30"
            >

              <option value="">
                All Roles
              </option>

              <option value="employee">
                Employee
              </option>

              <option value="manager">
                Manager
              </option>

              <option value="admin">
                Admin
              </option>

            </select>

          </div>

          {/* Department */}

          <div>

            <label
              htmlFor="department"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Department
            </label>

            <select
              id="department"
              value={
                departmentId
              }
              onChange={(
                event
              ) => {
                setDepartmentId(
                  event.target.value
                )
                setPage(1)
              }}
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-900/30"
            >

              <option value="">
                All Departments
              </option>

              {departments.map(
                (department) => (
                  <option
                    key={department.id}
                    value={
                      department.id
                    }
                  >
                    {department.name}
                  </option>
                )
              )}

            </select>

          </div>

          {/* Status */}

          <div>

            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Account Status
            </label>

            <select
              id="status"
              value={status}
              onChange={(
                event
              ) => {
                setStatus(
                  event.target.value
                )
                setPage(1)
              }}
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-900/30"
            >

              <option value="">
                All Statuses
              </option>

              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>

            </select>

          </div>

          {/* Search Button */}

          <div className="flex items-end gap-2 lg:col-span-5">

            <button
              type="submit"
              className="rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
            >
              Search
            </button>

            <button
              type="button"
              onClick={
                clearFilters
              }
              className="rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Clear
            </button>

          </div>

        </form>

      </div>

      {/* Users Table */}

      <div className="mt-6 overflow-hidden rounded-xl bg-white shadow dark:bg-gray-900">

        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing {users.length} of{' '}
            {pagination.total || 0} users
          </p>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">

              <tr className="text-sm text-gray-500 dark:text-gray-300">

                <th className="px-6 py-4">
                  User
                </th>

                <th className="px-6 py-4">
                  Role
                </th>

                <th className="px-6 py-4">
                  Department
                </th>

                <th className="px-6 py-4">
                  Account
                </th>

                <th className="px-6 py-4">
                  Work Status
                </th>

                <th className="px-6 py-4">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {users.length === 0 ? (

                <tr>

                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    No users found.
                  </td>

                </tr>

              ) : (

                users.map(
                  (user) => {

                    const workStatus =
                      getWorkStatus(
                        user
                      )

                    const isLoading =
                      actionLoading ===
                      user.id

                    return (
                      <tr
                        key={user.id}
                        className="border-b border-gray-100 last:border-0 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800"
                      >

                        {/* User */}

                        <td className="px-6 py-5">

                          <p className="font-medium text-gray-900 dark:text-white">
                            {user.name}
                          </p>

                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </p>

                          {user.job_title && (
                            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                              {
                                user.job_title
                              }
                            </p>
                          )}

                        </td>

                        {/* Role */}

                        <td className="px-6 py-5">

                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                            {user.role}
                          </span>

                        </td>

                        {/* Department */}

                        <td className="px-6 py-5 text-sm text-gray-600 dark:text-gray-300">

                          {
                            user.department
                              ?.name ||
                            user.department ||
                            '—'
                          }

                        </td>

                        {/* Account */}

                        <td className="px-6 py-5">

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${getAccountStatusStyle(
                              user.status
                            )}`}
                          >
                            {user.status}
                          </span>

                        </td>

                        {/* Work Status */}

                        <td className="px-6 py-5">

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${getWorkStatusStyle(
                              workStatus
                            )}`}
                          >
                            {
                              getWorkStatusLabel(
                                workStatus
                              )
                            }
                          </span>

                        </td>

                        {/* Actions */}

                        <td className="px-6 py-5">

                          <div className="flex flex-wrap gap-2">

                            <Link
                              to={`/users/${user.id}/edit`}
                              className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                            >
                              Edit
                            </Link>

                            {user.status ===
                            'active' ? (

                              <button
                                type="button"
                                onClick={() =>
                                  handleDeactivate(
                                    user.id
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
                                    user.id
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
                                  user.id,
                                  user.name
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

export default Users
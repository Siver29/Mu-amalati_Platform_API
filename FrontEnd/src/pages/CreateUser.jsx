import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'

import api from '../services/api'
import { createUserSchema } from '../schemas/user.schema'

function CreateUser() {
  const navigate = useNavigate()

  const [departments, setDepartments] =
    useState([])

  const [loadingData, setLoadingData] =
    useState(true)

  const [saving, setSaving] =
    useState(false)

  const [submitError, setSubmitError] =
    useState('')

  const [success, setSuccess] =
    useState('')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: {
      errors,
    },
  } = useForm({
    resolver: zodResolver(
      createUserSchema
    ),

    defaultValues: {
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      phone: '',
      job_title: '',
      role: 'employee',
      department_id: '',
      status: 'active',
      annual_leave_days: '30',
      used_leave_days: '0',
    },
  })

  const role = watch('role')

  const requiresDepartment =
    role === 'employee' ||
    role === 'manager'

  // --------------------------------------------------
  // Load departments
  // --------------------------------------------------

  useEffect(() => {
    const loadDepartments =
      async () => {
        try {
          setLoadingData(true)
          setSubmitError('')

          const response =
            await api.get(
              '/departments'
            )

          setDepartments(
            response.data.data || []
          )
        } catch (error) {
          console.error(
            'Departments error:',
            error.response?.data ||
              error
          )

          setSubmitError(
            error.response?.data
              ?.message ||
              'Unable to load departments.'
          )
        } finally {
          setLoadingData(false)
        }
      }

    loadDepartments()
  }, [])

  // --------------------------------------------------
  // Submit
  // --------------------------------------------------

  const onSubmit =
    async (data) => {
      setSaving(true)
      setSubmitError('')
      setSuccess('')

      try {
        const annualLeaveDays =
          Number(
            data.annual_leave_days
          )

        const usedLeaveDays =
          Number(
            data.used_leave_days
          )

        const payload = {
          name:
            data.name.trim(),

          email:
            data.email.trim(),

          password:
            data.password,

          password_confirmation:
            data.password_confirmation,

          phone:
            data.phone?.trim() ||
            null,

          job_title:
            data.job_title?.trim() ||
            null,

          role:
            data.role,

          department_id:
            requiresDepartment
              ? Number(
                  data.department_id
                )
              : null,

          status:
            data.status,

          annual_leave_days:
            annualLeaveDays,

          used_leave_days:
            usedLeaveDays,
        }

        const response =
          await api.post(
            '/admin/users',
            payload
          )

        setSuccess(
          response.data.message ||
            'User created successfully.'
        )

        setTimeout(() => {
          navigate('/users')
        }, 700)
      } catch (error) {
        console.error(
          'Create user error:',
          error.response?.data ||
            error
        )

        const backendErrors =
          error.response?.data
            ?.errors

        if (backendErrors) {
          Object.entries(
            backendErrors
          ).forEach(
            ([field, messages]) => {
              const message =
                Array.isArray(
                  messages
                )
                  ? messages[0]
                  : String(messages)

              setError(
                field,
                {
                  type: 'server',
                  message,
                }
              )
            }
          )

          setSubmitError(
            error.response?.data
              ?.message ||
              'Please correct the highlighted fields.'
          )
        } else {
          setSubmitError(
            error.response?.data
              ?.message ||
              'Unable to create user.'
          )
        }
      } finally {
        setSaving(false)
      }
    }

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 md:p-8 dark:bg-gray-950">

        <div className="rounded-xl bg-white p-8 shadow dark:bg-gray-900">

          <p className="text-gray-500 dark:text-gray-400">
            Loading form data...
          </p>

        </div>

      </div>
    )
  }

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8 dark:bg-gray-950">

      {/* Back */}

      <button
        type="button"
        onClick={() =>
          navigate('/users')
        }
        className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
      >
        ← Back to Users
      </button>

      {/* Header */}

      <div className="mt-6">

        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Administration
        </p>

        <h1 className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
          Add User
        </h1>

        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Create a new account for the system.
        </p>

      </div>

      {/* Submit error */}

      {submitError && (
        <div className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {submitError}
        </div>
      )}

      {/* Success */}

      {success && (
        <div className="mt-6 rounded-lg bg-green-50 p-4 text-sm text-green-700 dark:bg-green-950/30 dark:text-green-300">
          {success}
        </div>
      )}

      {/* Form */}

      <form
        onSubmit={handleSubmit(
          onSubmit
        )}
        noValidate
        className="mt-6 max-w-5xl rounded-xl bg-white p-8 shadow dark:bg-gray-900"
      >

        {/* ==================================================
            Basic Information
            ================================================== */}

        <div>

          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Basic Information
          </h2>

          <div className="mt-5 grid gap-5 md:grid-cols-2">

            {/* Name */}

            <div>

              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Full Name
              </label>

              <input
                id="name"
                type="text"
                placeholder="Enter full name"
                {...register('name')}
                className={`mt-2 w-full rounded-lg border bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-900/30 ${
                  errors.name
                    ? 'border-red-400 dark:border-red-500'
                    : 'border-gray-300 dark:border-gray-700'
                }`}
              />

              {errors.name && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {errors.name.message}
                </p>
              )}

            </div>

            {/* Email */}

            <div>

              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                placeholder="name@company.com"
                autoComplete="email"
                {...register('email')}
                className={`mt-2 w-full rounded-lg border bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-900/30 ${
                  errors.email
                    ? 'border-red-400 dark:border-red-500'
                    : 'border-gray-300 dark:border-gray-700'
                }`}
              />

              {errors.email && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {errors.email.message}
                </p>
              )}

            </div>

            {/* Phone */}

            <div>

              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Phone
              </label>

              <input
                id="phone"
                type="text"
                placeholder="Phone number"
                {...register('phone')}
                className={`mt-2 w-full rounded-lg border bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-900/30 ${
                  errors.phone
                    ? 'border-red-400 dark:border-red-500'
                    : 'border-gray-300 dark:border-gray-700'
                }`}
              />

              {errors.phone && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {errors.phone.message}
                </p>
              )}

            </div>

            {/* Job Title */}

            <div>

              <label
                htmlFor="job_title"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Job Title
              </label>

              <input
                id="job_title"
                type="text"
                placeholder="e.g. HR Specialist"
                {...register('job_title')}
                className={`mt-2 w-full rounded-lg border bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-900/30 ${
                  errors.job_title
                    ? 'border-red-400 dark:border-red-500'
                    : 'border-gray-300 dark:border-gray-700'
                }`}
              />

              {errors.job_title && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {errors.job_title.message}
                </p>
              )}

            </div>

          </div>

        </div>

        {/* ==================================================
            Account Information
            ================================================== */}

        <div className="mt-8 border-t border-gray-200 pt-8 dark:border-gray-800">

          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Account Information
          </h2>

          <div className="mt-5 grid gap-5 md:grid-cols-2">

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
                {...register('role')}
                className={`mt-2 w-full rounded-lg border bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-900/30 ${
                  errors.role
                    ? 'border-red-400 dark:border-red-500'
                    : 'border-gray-300 dark:border-gray-700'
                }`}
              >

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

              {errors.role && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {errors.role.message}
                </p>
              )}

            </div>

            {/* Department */}

            <div>

              <label
                htmlFor="department_id"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Department
              </label>

              <select
                id="department_id"
                {...register(
                  'department_id'
                )}
                disabled={
                  !requiresDepartment
                }
                onChange={(
                  event
                ) => {
                  setValue(
                    'department_id',
                    event.target.value,
                    {
                      shouldValidate: true,
                      shouldDirty: true,
                    }
                  )
                }}
                className={`mt-2 w-full rounded-lg border bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-900/30 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 dark:disabled:bg-gray-700 dark:disabled:text-gray-400 ${
                  errors.department_id
                    ? 'border-red-400 dark:border-red-500'
                    : 'border-gray-300 dark:border-gray-700'
                }`}
              >

                <option value="">
                  {requiresDepartment
                    ? 'Select department'
                    : 'Not required for Admin'}
                </option>

                {departments.map(
                  (department) => (
                    <option
                      key={
                        department.id
                      }
                      value={
                        department.id
                      }
                    >
                      {
                        department.name
                      }
                    </option>
                  )
                )}

              </select>

              {errors.department_id && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {
                    errors
                      .department_id
                      .message
                  }
                </p>
              )}

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
                {...register('status')}
                className={`mt-2 w-full rounded-lg border bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-900/30 ${
                  errors.status
                    ? 'border-red-400 dark:border-red-500'
                    : 'border-gray-300 dark:border-gray-700'
                }`}
              >

                <option value="active">
                  Active
                </option>

                <option value="inactive">
                  Inactive
                </option>

              </select>

              {errors.status && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {errors.status.message}
                </p>
              )}

            </div>

          </div>

        </div>

        {/* ==================================================
            Password
            ================================================== */}

        <div className="mt-8 border-t border-gray-200 pt-8 dark:border-gray-800">

          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Password
          </h2>

          <div className="mt-5 grid gap-5 md:grid-cols-2">

            {/* Password */}

            <div>

              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="Minimum 8 characters"
                {...register('password')}
                className={`mt-2 w-full rounded-lg border bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-900/30 ${
                  errors.password
                    ? 'border-red-400 dark:border-red-500'
                    : 'border-gray-300 dark:border-gray-700'
                }`}
              />

              {errors.password && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {errors.password.message}
                </p>
              )}

            </div>

            {/* Confirmation */}

            <div>

              <label
                htmlFor="password_confirmation"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Confirm Password
              </label>

              <input
                id="password_confirmation"
                type="password"
                autoComplete="new-password"
                placeholder="Repeat password"
                {...register(
                  'password_confirmation'
                )}
                className={`mt-2 w-full rounded-lg border bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-900/30 ${
                  errors.password_confirmation
                    ? 'border-red-400 dark:border-red-500'
                    : 'border-gray-300 dark:border-gray-700'
                }`}
              />

              {errors.password_confirmation && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {
                    errors
                      .password_confirmation
                      .message
                  }
                </p>
              )}

            </div>

          </div>

        </div>

        {/* ==================================================
            Leave Balance
            ================================================== */}

        <div className="mt-8 border-t border-gray-200 pt-8 dark:border-gray-800">

          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Leave Balance
          </h2>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Configure the user's annual leave balance.
          </p>

          <div className="mt-5 grid gap-5 md:grid-cols-2">

            {/* Annual */}

            <div>

              <label
                htmlFor="annual_leave_days"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Annual Leave Days
              </label>

              <input
                id="annual_leave_days"
                type="number"
                min="0"
                max="365"
                {...register(
                  'annual_leave_days'
                )}
                className={`mt-2 w-full rounded-lg border bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-900/30 ${
                  errors.annual_leave_days
                    ? 'border-red-400 dark:border-red-500'
                    : 'border-gray-300 dark:border-gray-700'
                }`}
              />

              {errors.annual_leave_days && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {
                    errors
                      .annual_leave_days
                      .message
                  }
                </p>
              )}

            </div>

            {/* Used */}

            <div>

              <label
                htmlFor="used_leave_days"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Used Leave Days
              </label>

              <input
                id="used_leave_days"
                type="number"
                min="0"
                {...register(
                  'used_leave_days'
                )}
                className={`mt-2 w-full rounded-lg border bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-900/30 ${
                  errors.used_leave_days
                    ? 'border-red-400 dark:border-red-500'
                    : 'border-gray-300 dark:border-gray-700'
                }`}
              />

              {errors.used_leave_days && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {
                    errors
                      .used_leave_days
                      .message
                  }
                </p>
              )}

            </div>

          </div>

        </div>

        {/* ==================================================
            Actions
            ================================================== */}

        <div className="mt-8 flex flex-wrap gap-3 border-t border-gray-200 pt-8 dark:border-gray-800">

          <button
            type="button"
            onClick={() =>
              navigate('/users')
            }
            disabled={saving}
            className="rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? 'Creating...'
              : 'Create User'}
          </button>

        </div>

      </form>

    </div>
  )
}

export default CreateUser
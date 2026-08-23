import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'

import api from '../services/api'
import {
  createDepartmentSchema,
} from '../schemas/department.schema'

function CreateDepartment() {
  const navigate = useNavigate()

  const [managers, setManagers] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [saving, setSaving] =
    useState(false)

  const [pageError, setPageError] =
    useState('')

  const [success, setSuccess] =
    useState('')

  const {
    register,
    handleSubmit,
    setError: setFieldError,
    formState: {
      errors,
    },
  } = useForm({
    resolver:
      zodResolver(
        createDepartmentSchema
      ),

    defaultValues: {
      name: '',
      description: '',
      manager_id: '',
      is_active: true,
    },
  })

  // --------------------------------------------------
  // Load active managers
  // --------------------------------------------------

  useEffect(() => {
    const loadManagers =
      async () => {
        try {
          setLoading(true)
          setPageError('')

          const response =
            await api.get(
              '/admin/users?role=manager&status=active&per_page=50'
            )

          setManagers(
            response.data.data ||
              []
          )
        } catch (error) {
          console.error(
            'Managers error:',
            error.response?.data ||
              error
          )

          setPageError(
            error.response?.data
              ?.message ||
              'Unable to load managers.'
          )
        } finally {
          setLoading(false)
        }
      }

    loadManagers()
  }, [])

  // --------------------------------------------------
  // Submit
  // --------------------------------------------------

  const onSubmit =
    async (data) => {
      setSaving(true)
      setPageError('')
      setSuccess('')

      try {
        const payload = {
          name:
            data.name.trim(),

          description:
            data.description?.trim() ||
            null,

          manager_id:
            data.manager_id
              ? Number(
                  data.manager_id
                )
              : null,

          is_active:
            Boolean(
              data.is_active
            ),
        }

        await api.post(
          '/admin/departments',
          payload
        )

        setSuccess(
          'Department created successfully.'
        )

        setTimeout(() => {
          navigate('/departments')
        }, 700)
      } catch (error) {
        console.error(
          'Create department error:',
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

              setFieldError(
                field,
                {
                  type: 'server',
                  message,
                }
              )
            }
          )

          setPageError(
            error.response?.data
              ?.message ||
              'Please correct the highlighted fields.'
          )
        } else {
          setPageError(
            error.response?.data
              ?.message ||
              'Unable to create department.'
          )
        }
      } finally {
        setSaving(false)
      }
    }

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (loading) {
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
  // Page
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8 dark:bg-gray-950">

      {/* Back */}

      <button
        type="button"
        onClick={() =>
          navigate(
            '/departments'
          )
        }
        disabled={saving}
        className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white disabled:opacity-50"
      >
        ← Back to Departments
      </button>

      {/* Header */}

      <div className="mt-6">

        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Administration
        </p>

        <h1 className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
          Add Department
        </h1>

        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Create a new department and optionally assign a manager.
        </p>

      </div>

      {/* Error */}

      {pageError && (
        <div className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {pageError}
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
        className="mt-6 max-w-3xl rounded-xl bg-white p-8 shadow dark:bg-gray-900"
      >

        {/* Name */}

        <div>

          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Department Name
          </label>

          <input
            id="name"
            type="text"
            placeholder="e.g. Human Resources"
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

        {/* Description */}

        <div className="mt-6">

          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Description
          </label>

          <textarea
            id="description"
            rows="5"
            placeholder="Describe the department..."
            {...register(
              'description'
            )}
            className={`mt-2 w-full resize-none rounded-lg border bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-900/30 ${
              errors.description
                ? 'border-red-400 dark:border-red-500'
                : 'border-gray-300 dark:border-gray-700'
            }`}
          />

          {errors.description && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              {
                errors.description
                  .message
              }
            </p>
          )}

        </div>

        {/* Manager */}

        <div className="mt-6">

          <label
            htmlFor="manager_id"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Department Manager
          </label>

          <select
            id="manager_id"
            {...register(
              'manager_id'
            )}
            className={`mt-2 w-full rounded-lg border bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-900/30 ${
              errors.manager_id
                ? 'border-red-400 dark:border-red-500'
                : 'border-gray-300 dark:border-gray-700'
            }`}
          >

            <option value="">
              No manager assigned
            </option>

            {managers.map(
              (manager) => (
                <option
                  key={manager.id}
                  value={manager.id}
                >
                  {manager.name}
                  {manager.email
                    ? ` — ${manager.email}`
                    : ''}
                </option>
              )
            )}

          </select>

          {errors.manager_id && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              {
                errors.manager_id
                  .message
              }
            </p>
          )}

          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Only active managers can be assigned to a department.
          </p>

        </div>

        {/* Status */}

        <div className="mt-6">

          <label className="flex items-center gap-3">

            <input
              type="checkbox"
              {...register(
                'is_active'
              )}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
            />

            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Department is active
            </span>

          </label>

          {errors.is_active && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              {
                errors.is_active
                  .message
              }
            </p>
          )}

        </div>

        {/* Actions */}

        <div className="mt-8 flex flex-wrap gap-3 border-t border-gray-200 pt-8 dark:border-gray-800">

          <button
            type="button"
            onClick={() =>
              navigate(
                '/departments'
              )
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
              : 'Create Department'}
          </button>

        </div>

      </form>

    </div>
  )
}

export default CreateDepartment
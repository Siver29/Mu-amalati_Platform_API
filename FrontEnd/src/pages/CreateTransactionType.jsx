import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'

import api from '../services/api'

import {
  createTransactionTypeSchema,
} from '../schemas/transactionType.schema'

function CreateTransactionType() {
  const navigate = useNavigate()

  const [departments, setDepartments] =
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
        createTransactionTypeSchema
      ),

    defaultValues: {
      name_en: '',
      name_ar: '',
      description: '',
      destination_department_id: '',
      requires_attachment: false,
      is_active: true,
    },
  })

  // --------------------------------------------------
  // Load departments
  // --------------------------------------------------

  useEffect(() => {
    const loadDepartments =
      async () => {
        try {
          setLoading(true)
          setPageError('')

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

          setPageError(
            error.response?.data
              ?.message ||
              'Unable to load departments.'
          )
        } finally {
          setLoading(false)
        }
      }

    loadDepartments()
  }, [])

  // --------------------------------------------------
  // Submit
  // --------------------------------------------------

  const onSubmit = async (data) => {
    setSaving(true)
    setPageError('')
    setSuccess('')

    try {
      const payload = {
        name_en:
          data.name_en.trim(),

        name_ar:
          data.name_ar.trim(),

        description:
          data.description?.trim() ||
          null,

        destination_department_id:
          Number(
            data.destination_department_id
          ),

        requires_attachment:
          Boolean(
            data.requires_attachment
          ),

        is_active:
          Boolean(
            data.is_active
          ),
      }

      await api.post(
        '/admin/transaction-types',
        payload
      )

      setSuccess(
        'Transaction type created successfully.'
      )

      setTimeout(() => {
        navigate(
          '/transaction-types'
        )
      }, 700)
    } catch (error) {
      console.error(
        'Create transaction type error:',
        error.response?.data ||
          error
      )

      const backendErrors =
        error.response?.data?.errors

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
            'Unable to create transaction type.'
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
            '/transaction-types'
          )
        }
        disabled={saving}
        className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white disabled:opacity-50"
      >
        ← Back to Transaction Types
      </button>

      {/* Header */}

      <div className="mt-6">

        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Administration
        </p>

        <h1 className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
          Add Transaction Type
        </h1>

        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Create a new type of transaction for employees to submit.
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
        className="mt-6 max-w-4xl rounded-xl bg-white p-8 shadow dark:bg-gray-900"
      >

        {/* ==================================================
            Names
            ================================================== */}

        <div>

          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Names
          </h2>

          <div className="mt-5 grid gap-5 md:grid-cols-2">

            {/* English */}

            <div>

              <label
                htmlFor="name_en"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                English Name
              </label>

              <input
                id="name_en"
                type="text"
                placeholder="e.g. Leave Request"
                {...register(
                  'name_en'
                )}
                className={`mt-2 w-full rounded-lg border bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-900/30 ${
                  errors.name_en
                    ? 'border-red-400 dark:border-red-500'
                    : 'border-gray-300 dark:border-gray-700'
                }`}
              />

              {errors.name_en && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {
                    errors.name_en
                      .message
                  }
                </p>
              )}

            </div>

            {/* Arabic */}

            <div>

              <label
                htmlFor="name_ar"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Arabic Name
              </label>

              <input
                id="name_ar"
                type="text"
                dir="rtl"
                placeholder="مثال: طلب إجازة"
                {...register(
                  'name_ar'
                )}
                className={`mt-2 w-full rounded-lg border bg-white px-4 py-3 text-right text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-900/30 ${
                  errors.name_ar
                    ? 'border-red-400 dark:border-red-500'
                    : 'border-gray-300 dark:border-gray-700'
                }`}
              />

              {errors.name_ar && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {
                    errors.name_ar
                      .message
                  }
                </p>
              )}

            </div>

          </div>

        </div>

        {/* ==================================================
            Description
            ================================================== */}

        <div className="mt-8 border-t border-gray-200 pt-8 dark:border-gray-800">

          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Description
          </h2>

          <textarea
            id="description"
            rows="5"
            placeholder="Describe what this transaction type is used for..."
            {...register(
              'description'
            )}
            className={`mt-5 w-full resize-none rounded-lg border bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-900/30 ${
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

        {/* ==================================================
            Configuration
            ================================================== */}

        <div className="mt-8 border-t border-gray-200 pt-8 dark:border-gray-800">

          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Configuration
          </h2>

          <div className="mt-5 grid gap-5 md:grid-cols-2">

            {/* Destination */}

            <div>

              <label
                htmlFor="destination_department_id"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Destination Department
              </label>

              <select
                id="destination_department_id"
                {...register(
                  'destination_department_id'
                )}
                className={`mt-2 w-full rounded-lg border bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-900/30 ${
                  errors
                    .destination_department_id
                    ? 'border-red-400 dark:border-red-500'
                    : 'border-gray-300 dark:border-gray-700'
                }`}
              >

                <option value="">
                  Select destination department
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

              {
                errors.destination_department_id && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {
                      errors
                        .destination_department_id
                        .message
                    }
                  </p>
                )
              }

            </div>

            {/* Status */}

            <div>

              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Status
              </label>

              <label className="mt-3 flex items-center gap-3">

                <input
                  type="checkbox"
                  {...register(
                    'is_active'
                  )}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
                />

                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Transaction type is active
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

            {/* Attachment */}

            <div className="md:col-span-2">

              <label className="flex items-center gap-3">

                <input
                  type="checkbox"
                  {...register(
                    'requires_attachment'
                  )}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
                />

                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Attachment is required
                </span>

              </label>

              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Employees will be required to upload an attachment when creating this transaction type.
              </p>

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
              navigate(
                '/transaction-types'
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
              : 'Create Transaction Type'}
          </button>

        </div>

      </form>

    </div>
  )
}

export default CreateTransactionType
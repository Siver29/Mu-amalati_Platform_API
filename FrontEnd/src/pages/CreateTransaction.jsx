import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'

import api from '../services/api'
import DynamicField from '../components/DynamicField'

import {
  createTransactionSchema,
} from '../schemas/transaction.schema'

function CreateTransaction() {
  const navigate = useNavigate()

  // --------------------------------------------------
  // Reference data
  // --------------------------------------------------

  const [transactionTypes, setTransactionTypes] =
    useState([])

  const [dynamicFields, setDynamicFields] =
    useState([])

  // --------------------------------------------------
  // UI state
  // --------------------------------------------------

  const [loadingData, setLoadingData] =
    useState(true)

  const [loadingFields, setLoadingFields] =
    useState(false)

  const [saving, setSaving] =
    useState(false)

  const [pageError, setPageError] =
    useState('')

  const [success, setSuccess] =
    useState('')

  // --------------------------------------------------
  // React Hook Form
  // --------------------------------------------------

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError: setFieldError,
    formState: {
      errors,
    },
  } = useForm({
    resolver:
      zodResolver(
        createTransactionSchema
      ),

    defaultValues: {
      transaction_type_id: '',
      title: '',
      description: '',
      priority: 'medium',
      start_date: '',
      end_date: '',
      dynamic_fields: {},
    },
  })

  // --------------------------------------------------
  // Watched values
  // --------------------------------------------------

  const transactionTypeId =
    watch('transaction_type_id')

  const startDate =
    watch('start_date')

  const dynamicValues =
    watch('dynamic_fields') || {}

  // --------------------------------------------------
  // Selected transaction type
  // --------------------------------------------------

  const selectedTransactionType =
    useMemo(() => {
      return transactionTypes.find(
        (type) =>
          Number(type.id) ===
          Number(transactionTypeId)
      )
    }, [
      transactionTypes,
      transactionTypeId,
    ])

  // --------------------------------------------------
  // Legacy Leave Request
  // --------------------------------------------------

  const isLegacyLeaveRequest =
    selectedTransactionType?.name_en ===
      'Leave Request' &&
    dynamicFields.length === 0

  // --------------------------------------------------
  // Load transaction types
  // --------------------------------------------------

  useEffect(() => {
    const loadReferenceData =
      async () => {
        try {
          setLoadingData(true)
          setPageError('')

          const response =
            await api.get(
              '/transaction-types'
            )

          setTransactionTypes(
            response.data.data || []
          )
        } catch (error) {
          console.error(
            'Transaction types error:',
            error.response?.data ||
              error
          )

          setPageError(
            error.response?.data?.message ||
              'Unable to load transaction types.'
          )
        } finally {
          setLoadingData(false)
        }
      }

    loadReferenceData()
  }, [])

  // --------------------------------------------------
  // Load dynamic fields
  // --------------------------------------------------

  useEffect(() => {
    const loadDynamicFields =
      async () => {
        if (!transactionTypeId) {
          setDynamicFields([])

          setValue(
            'dynamic_fields',
            {},
            {
              shouldDirty: false,
              shouldValidate: false,
            }
          )

          return
        }

        try {
          setLoadingFields(true)
          setPageError('')

          const response =
            await api.get(
              `/transaction-types/${transactionTypeId}/fields`
            )

          const loadedFields =
            response.data.data || []

          const sortedFields =
            [...loadedFields].sort(
              (a, b) =>
                Number(
                  a.field_order
                ) -
                Number(
                  b.field_order
                )
            )

          setDynamicFields(
            sortedFields
          )

          setValue(
            'dynamic_fields',
            {},
            {
              shouldDirty: false,
              shouldValidate: false,
            }
          )

          setValue(
            'start_date',
            '',
            {
              shouldDirty: false,
              shouldValidate: false,
            }
          )

          setValue(
            'end_date',
            '',
            {
              shouldDirty: false,
              shouldValidate: false,
            }
          )
        } catch (error) {
          console.error(
            'Dynamic fields error:',
            error.response?.data ||
              error
          )

          setDynamicFields([])

          setValue(
            'dynamic_fields',
            {},
            {
              shouldDirty: false,
              shouldValidate: false,
            }
          )

          setPageError(
            error.response?.data?.message ||
              'Unable to load transaction fields.'
          )
        } finally {
          setLoadingFields(false)
        }
      }

    loadDynamicFields()
  }, [
    transactionTypeId,
    setValue,
  ])

  // --------------------------------------------------
  // Dynamic field changes
  // --------------------------------------------------

  const handleDynamicFieldChange = (
    fieldId,
    value
  ) => {
    setValue(
      `dynamic_fields.${fieldId}`,
      value,
      {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: false,
      }
    )
  }

  // --------------------------------------------------
  // Validate dynamic fields
  // --------------------------------------------------

  const validateDynamicFields = () => {
    for (const field of dynamicFields) {
      if (!field.is_required) {
        continue
      }

      const value =
        dynamicValues[field.id]

      // ------------------------------------------------
      // Required file
      // ------------------------------------------------

      if (
        field.field_type === 'file'
      ) {
        if (!(value instanceof File)) {
          setFieldError(
            `dynamic_fields.${field.id}`,
            {
              type: 'required',
              message:
                `Please complete "${field.name_en}".`,
            }
          )

          return false
        }

        continue
      }

      // ------------------------------------------------
      // Other required fields
      // ------------------------------------------------

      if (
        value === null ||
        value === undefined ||
        value === ''
      ) {
        setFieldError(
          `dynamic_fields.${field.id}`,
          {
            type: 'required',
            message:
              `Please complete "${field.name_en}".`,
          }
        )

        return false
      }

      if (
        Array.isArray(value) &&
        value.length === 0
      ) {
        setFieldError(
          `dynamic_fields.${field.id}`,
          {
            type: 'required',
            message:
              `Please complete "${field.name_en}".`,
          }
        )

        return false
      }
    }

    return true
  }

  // --------------------------------------------------
  // Build dynamic fields payload
  // --------------------------------------------------

  const buildDynamicFieldsPayload = () => {
    const dynamic_fields = {}

    for (const field of dynamicFields) {
      const value =
        dynamicValues[field.id]

      /*
       * Files are sent separately inside
       * the same FormData request.
       */
      if (
        field.field_type === 'file'
      ) {
        continue
      }

      dynamic_fields[field.id] =
        value ?? null
    }

    return dynamic_fields
  }

  // --------------------------------------------------
  // Get dynamic files
  // --------------------------------------------------

  const getDynamicFiles = () => {
    return dynamicFields
      .filter(
        (field) =>
          field.field_type === 'file' &&
          dynamicValues[field.id] instanceof
            File
      )
      .map((field) => ({
        field,
        file:
          dynamicValues[field.id],
      }))
  }

  // --------------------------------------------------
  // Build FormData
  // --------------------------------------------------

  const buildTransactionFormData = (
    data,
    dynamic_fields,
    dynamicFiles
  ) => {
    const formData =
      new FormData()

    // ----------------------------------------------
    // Basic transaction fields
    // ----------------------------------------------

    formData.append(
      'transaction_type_id',
      String(
        Number(
          data.transaction_type_id
        )
      )
    )

    formData.append(
      'title',
      data.title.trim()
    )

    formData.append(
      'description',
      data.description.trim()
    )

    formData.append(
      'priority',
      data.priority
    )

    // ----------------------------------------------
    // Legacy Leave Request
    // ----------------------------------------------

    if (
      isLegacyLeaveRequest
    ) {
      formData.append(
        'start_date',
        data.start_date
      )

      formData.append(
        'end_date',
        data.end_date
      )
    }

    // ----------------------------------------------
    // Dynamic fields
    // ----------------------------------------------

    if (
      dynamicFields.length > 0
    ) {
      Object.entries(
        dynamic_fields
      ).forEach(
        ([fieldId, value]) => {
          /*
           * Arrays must be sent as JSON,
           * just like the backend expects.
           */
          const serializedValue =
            Array.isArray(value)
              ? JSON.stringify(value)
              : value ?? ''

          formData.append(
            `dynamic_fields[${fieldId}]`,
            serializedValue
          )
        }
      )
    }

    // ----------------------------------------------
    // Attachments
    // ----------------------------------------------

    dynamicFiles.forEach(
      ({
        field,
        file,
      }) => {
        formData.append(
          'attachments[]',
          file,
          file.name
        )

        formData.append(
          'field_ids[]',
          String(field.id)
        )
      }
    )

    return formData
  }

  // --------------------------------------------------
  // Submit
  // --------------------------------------------------

  const onSubmit =
    async (data) => {
      setSaving(true)
      setPageError('')
      setSuccess('')

      // --------------------------------------------
      // Dynamic validation
      // --------------------------------------------

      const dynamicFieldsValid =
        validateDynamicFields()

      if (!dynamicFieldsValid) {
        setSaving(false)
        return
      }

      try {
        // ------------------------------------------
        // Dynamic payload
        // ------------------------------------------

        const dynamic_fields =
          buildDynamicFieldsPayload()

        // ------------------------------------------
        // Files
        // ------------------------------------------

        const dynamicFiles =
          getDynamicFiles()

        // ------------------------------------------
        // FormData
        // ------------------------------------------

        const formData =
          buildTransactionFormData(
            data,
            dynamic_fields,
            dynamicFiles
          )

        // ------------------------------------------
        // Create transaction
        //
        // The attachment is now sent in the SAME
        // request as the transaction.
        // ------------------------------------------

        const response =
          await api.post(
            '/transactions',
            formData
          )

        const createdTransaction =
          response.data.data

        const transactionId =
          createdTransaction?.id ||
          createdTransaction
            ?.transaction?.id

        // ------------------------------------------
        // Success
        // ------------------------------------------

        setSuccess(
          response.data.message ||
            'Transaction created successfully.'
        )

        // ------------------------------------------
        // Navigate
        // ------------------------------------------

        if (
          transactionId
        ) {
          setTimeout(() => {
            navigate(
              `/transactions/${transactionId}`
            )
          }, 500)
        } else {
          setTimeout(() => {
            navigate(
              '/transactions'
            )
          }, 500)
        }
      } catch (error) {
        console.error(
          'Create transaction error:',
          error.response?.data ||
            error
        )

        const backendErrors =
          error.response?.data
            ?.errors

        if (
          backendErrors
        ) {
          Object.entries(
            backendErrors
          ).forEach(
            ([
              field,
              messages,
            ]) => {
              const message =
                Array.isArray(
                  messages
                )
                  ? messages[0]
                  : String(
                      messages
                    )

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
              'Unable to create transaction.'
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
      <div className="min-h-screen bg-gray-50 p-8 dark:bg-gray-950">
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
    <div className="min-h-screen bg-gray-50 p-8 dark:bg-gray-950">

      {/* Back */}

      <button
        type="button"
        onClick={() =>
          navigate(
            '/transactions'
          )
        }
        disabled={saving}
        className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white disabled:opacity-50"
      >
        ← Back to Transactions
      </button>

      {/* Header */}

      <div className="mt-6">

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Create New Transaction
        </h1>

        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Create a new transaction and save it as a draft.
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

        {/* Transaction Type */}

        <div>

          <label
            htmlFor="transaction_type_id"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Transaction Type
          </label>

          <select
            id="transaction_type_id"
            {...register(
              'transaction_type_id'
            )}
            className={`mt-2 w-full rounded-lg border bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-900/30 ${
              errors.transaction_type_id
                ? 'border-red-400 dark:border-red-500'
                : 'border-gray-300 dark:border-gray-700'
            }`}
          >

            <option value="">
              Select transaction type
            </option>

            {transactionTypes.map(
              (type) => (
                <option
                  key={type.id}
                  value={type.id}
                >
                  {type.name_en}

                  {type.name_ar
                    ? ` — ${type.name_ar}`
                    : ''}
                </option>
              )
            )}

          </select>

          {errors.transaction_type_id && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              {
                errors
                  .transaction_type_id
                  .message
              }
            </p>
          )}

        </div>

        {/* Dynamic Loading */}

        {loadingFields && (
          <div className="mt-6 rounded-lg bg-gray-50 p-4 text-sm text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            Loading fields...
          </div>
        )}

        {/* Dynamic Fields */}

        {!loadingFields &&
          dynamicFields.length > 0 && (
            <div className="mt-6 rounded-xl border border-gray-200 p-6 dark:border-gray-700">

              <div className="mb-5">

                <h2 className="text-lg font-semibold text-gray-900">
                  Request Details
                </h2>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Please complete the required information for this transaction type.
                </p>

              </div>

              <div className="grid gap-5 md:grid-cols-2">

                {dynamicFields.map(
                  (field) => {
                    const fieldId =
                      String(
                        field.id
                      )

                    const fieldError =
                      errors
                        .dynamic_fields?.[
                        fieldId
                      ]

                    return (
                      <div
                        key={field.id}
                        className={
                          field.field_type ===
                            'textarea' ||
                          field.field_type ===
                            'file'
                            ? 'md:col-span-2'
                            : ''
                        }
                      >

                        <DynamicField
                          field={field}
                          value={
                            dynamicValues[
                              field.id
                            ]
                          }
                          onChange={
                            handleDynamicFieldChange
                          }
                        />

                        {fieldError && (
                          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                            {
                              fieldError.message
                            }
                          </p>
                        )}

                      </div>
                    )
                  }
                )}

              </div>

            </div>
          )}

        {/* Legacy Leave Request */}

        {!loadingFields &&
          isLegacyLeaveRequest && (
            <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-6">

              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                Leave Details
              </h2>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Select the start and end dates of your leave.
              </p>

              <div className="mt-5 grid gap-5 md:grid-cols-2">

                <div>

                  <label
                    htmlFor="start_date"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Start Date
                  </label>

                  <input
                    id="start_date"
                    type="date"
                    {...register(
                      'start_date'
                    )}
                    className={`mt-2 w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
                      errors.start_date
                        ? 'border-red-400 dark:border-red-500'
                        : 'border-gray-300 dark:border-gray-700'
                    }`}
                  />

                  {errors.start_date && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                      {
                        errors
                          .start_date
                          .message
                      }
                    </p>
                  )}

                </div>

                <div>

                  <label
                    htmlFor="end_date"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    End Date
                  </label>

                  <input
                    id="end_date"
                    type="date"
                    {...register(
                      'end_date'
                    )}
                    min={
                      startDate ||
                      undefined
                    }
                    className={`mt-2 w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
                      errors.end_date
                        ? 'border-red-400 dark:border-red-500'
                        : 'border-gray-300 dark:border-gray-700'
                    }`}
                  />

                  {errors.end_date && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                      {
                        errors
                          .end_date
                          .message
                      }
                    </p>
                  )}

                </div>

              </div>

            </div>
          )}

        {/* No fields */}

        {!loadingFields &&
          transactionTypeId &&
          dynamicFields.length === 0 &&
          !isLegacyLeaveRequest && (
            <div className="mt-6 rounded-lg bg-gray-50 p-4 text-sm text-gray-500 dark:bg-gray-800 dark:text-gray-400">
              No additional fields are configured for this transaction type.
            </div>
          )}

        {/* Workflow */}

        {selectedTransactionType
          ?.workflow_steps
          ?.length > 0 && (
          <div className="mt-6 rounded-lg bg-gray-50 p-5 dark:bg-gray-800">

            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Workflow
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2">

              {selectedTransactionType
                .workflow_steps
                .map(
                  (
                    step,
                    index
                  ) => (
                    <div
                      key={
                        step.id
                      }
                      className="flex items-center gap-2"
                    >

                      <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-700 shadow-sm dark:bg-gray-900 dark:text-gray-200">
                        {
                          step
                            .department
                            ?.name ||
                          `Step ${step.step_order}`
                        }
                      </span>

                      {index <
                        selectedTransactionType
                          .workflow_steps
                          .length -
                          1 && (
                        <span className="text-gray-400 dark:text-gray-500">
                          →
                        </span>
                      )}

                    </div>
                  )
                )}

            </div>

            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
              The system will automatically route this transaction according to its workflow.
            </p>

          </div>
        )}

        {/* Title */}

        <div className="mt-6">

          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Title
          </label>

          <input
            id="title"
            type="text"
            {...register('title')}
            placeholder="Enter transaction title"
            className={`mt-2 w-full rounded-lg border bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-900/30 ${
              errors.title
                ? 'border-red-400 dark:border-red-500'
                : 'border-gray-300 dark:border-gray-700'
            }`}
          />

          {errors.title && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              {errors.title.message}
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
            rows="6"
            {...register(
              'description'
            )}
            placeholder="Describe your transaction..."
            className={`mt-2 w-full resize-none rounded-lg border px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
              errors.description
                ? 'border-red-400 dark:border-red-500'
                : 'border-gray-300 dark:border-gray-700'
            }`}
          />

          {errors.description && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              {
                errors
                  .description
                  .message
              }
            </p>
          )}

        </div>

        {/* Priority */}

        <div className="mt-6">

          <label
            htmlFor="priority"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Priority
          </label>

          <select
            id="priority"
            {...register(
              'priority'
            )}
            className={`mt-2 w-full rounded-lg border bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-900/30 ${
              errors.priority
                ? 'border-red-400 dark:border-red-500'
                : 'border-gray-300 dark:border-gray-700'
            }`}
          >

            <option value="low">
              Low
            </option>

            <option value="medium">
              Medium
            </option>

            <option value="high">
              High
            </option>

          </select>

          {errors.priority && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              {
                errors
                  .priority
                  .message
              }
            </p>
          )}

        </div>

        {/* Buttons */}

        <div className="mt-8 flex flex-wrap gap-3">

          <button
            type="button"
            onClick={() =>
              navigate(
                '/transactions'
              )
            }
            disabled={saving}
            className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={
              saving ||
              loadingFields
            }
            className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? 'Creating...'
              : 'Create Transaction'}
          </button>

        </div>

      </form>

    </div>
  )
}

export default CreateTransaction
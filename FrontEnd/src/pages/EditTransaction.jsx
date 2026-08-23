import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Link,
  useNavigate,
  useParams,
} from 'react-router-dom'

import api from '../services/api'
import DynamicField from '../components/DynamicField'

import {
  editTransactionSchema,
} from '../schemas/transaction.schema'

function EditTransaction() {
  const { id } = useParams()
  const navigate = useNavigate()

  // --------------------------------------------------
  // Transaction state
  // --------------------------------------------------

  const [transaction, setTransaction] =
    useState(null)

  const [dynamicFields, setDynamicFields] =
    useState([])

  /*
   * IMPORTANT:
   * Keep existing files separate from form values.
   * This is what allows an old required file
   * to remain valid without selecting it again.
   */
  const [existingFiles, setExistingFiles] =
    useState({})

  // --------------------------------------------------
  // UI state
  // --------------------------------------------------

  const [loading, setLoading] =
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
    reset,
    setError: setFieldError,
    setValue,
    formState: {
      errors,
    },
  } = useForm({
    resolver:
      zodResolver(
        editTransactionSchema
      ),

    defaultValues: {
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

  const startDate =
    watch('start_date')

  /*
   * Dynamic values are still managed by RHF,
   * but their validation remains separate because
   * their structure comes from the API.
   */
  const dynamicValues =
    watch('dynamic_fields') || {}

  // --------------------------------------------------
  // Load transaction
  // --------------------------------------------------

  useEffect(() => {
    const getTransaction =
      async () => {
        try {
          setLoading(true)
          setPageError('')

          const response =
            await api.get(
              `/transactions/${id}`
            )

          const data =
            response.data.data

          setTransaction(data)

          reset({
            title:
              data.title || '',

            description:
              data.description || '',

            priority:
              data.priority ||
              'medium',

            start_date:
              data.start_date || '',

            end_date:
              data.end_date || '',

            dynamic_fields: {},
          })
        } catch (error) {
          console.error(
            'Transaction error:',
            error.response?.data ||
              error
          )

          setPageError(
            error.response?.data
              ?.message ||
              'Unable to load transaction.'
          )
        } finally {
          setLoading(false)
        }
      }

    getTransaction()
  }, [
    id,
    reset,
  ])

  // --------------------------------------------------
  // Load dynamic fields + values + files
  // --------------------------------------------------

  useEffect(() => {
    if (
      !transaction?.transaction_type?.id
    ) {
      return
    }

    const loadDynamicFields =
      async () => {
        try {
          setLoadingFields(true)
          setPageError('')

          const response =
            await api.get(
              `/transaction-types/${transaction.transaction_type.id}/fields`
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

          // --------------------------------------------
          // Existing dynamic values
          // --------------------------------------------

          const existingValues =
            {}

          const fieldValues =
            transaction.field_values ||
            []

          fieldValues.forEach(
            (fieldValue) => {
              const fieldId =
                Number(
                  fieldValue.field_id
                )

              existingValues[
                fieldId
              ] =
                parseDynamicValue(
                  fieldValue.value,
                  fieldValue.field
                    ?.field_type
                )
            }
          )

          setValue(
            'dynamic_fields',
            existingValues,
            {
              shouldDirty: false,
              shouldTouch: false,
              shouldValidate: false,
            }
          )

          // --------------------------------------------
          // Existing file attachments
          // --------------------------------------------

          const fileMap = {}

          const attachments =
            transaction.attachments ||
            []

          attachments.forEach(
            (attachment) => {
              const fieldId =
                attachment.transaction_type_field_id

              if (
                fieldId !== null &&
                fieldId !== undefined &&
                fieldId !== ''
              ) {
                fileMap[
                  Number(fieldId)
                ] = attachment
              }
            }
          )

          setExistingFiles(
            fileMap
          )
        } catch (error) {
          console.error(
            'Dynamic fields error:',
            error.response?.data ||
              error
          )

          setDynamicFields([])

          setExistingFiles({})

          setValue(
            'dynamic_fields',
            {},
            {
              shouldDirty: false,
              shouldTouch: false,
              shouldValidate: false,
            }
          )

          setPageError(
            error.response?.data
              ?.message ||
              'Unable to load transaction fields.'
          )
        } finally {
          setLoadingFields(false)
        }
      }

    loadDynamicFields()
  }, [
    transaction,
    setValue,
  ])

  // --------------------------------------------------
  // Parse dynamic value
  // --------------------------------------------------

  const parseDynamicValue = (
    value,
    fieldType
  ) => {
    if (
      value === null ||
      value === undefined
    ) {
      return ''
    }

    if (
      fieldType === 'checkbox'
    ) {
      return (
        value === true ||
        value === 'true' ||
        value === '1'
      )
    }

    return value
  }

  // --------------------------------------------------
  // Legacy Leave Request
  // --------------------------------------------------

  const isLegacyLeaveRequest =
    transaction?.transaction_type
      ?.name_en ===
      'Leave Request' &&
    dynamicFields.length === 0

  // --------------------------------------------------
  // Dynamic field changes
  // --------------------------------------------------

  const handleDynamicFieldChange =
    (
      fieldId,
      value
    ) => {
      /*
       * Keep the old DynamicField API:
       *
       * onChange(fieldId, value)
       *
       * but store the values in React Hook Form.
       */
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

  const validateDynamicFields =
    () => {
      for (
        const field of dynamicFields
      ) {
        if (!field.is_required) {
          continue
        }

        const fieldId =
          Number(field.id)

        const value =
          dynamicValues[fieldId]

        // --------------------------------------------
        // File
        // --------------------------------------------

        if (
          field.field_type === 'file'
        ) {
          const hasExistingFile =
            Boolean(
              existingFiles[fieldId]
            )

          const hasNewFile =
            value instanceof File

          /*
           * EXISTING FILE OR NEW FILE
           * is enough for a required field.
           */
          if (
            !hasExistingFile &&
            !hasNewFile
          ) {
            setFieldError(
              `dynamic_fields.${fieldId}`,
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

        // --------------------------------------------
        // Normal dynamic field
        // --------------------------------------------

        if (
          value === null ||
          value === undefined ||
          value === ''
        ) {
          setFieldError(
            `dynamic_fields.${fieldId}`,
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
            `dynamic_fields.${fieldId}`,
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

  const buildDynamicFieldsPayload =
    () => {
      const dynamic_fields = {}

      for (
        const field of dynamicFields
      ) {
        const fieldId =
          Number(field.id)

        const value =
          dynamicValues[fieldId]

        /*
         * Files are NOT included in the JSON
         * dynamic_fields payload.
         */
        if (
          field.field_type === 'file'
        ) {
          continue
        }

        dynamic_fields[fieldId] =
          value ?? null
      }

      return dynamic_fields
    }

  // --------------------------------------------------
  // Get newly selected files
  // --------------------------------------------------

  const getDynamicFiles = () => {
    return dynamicFields
      .filter((field) => {
        const fieldId =
          Number(field.id)

        return (
          field.field_type ===
            'file' &&
          dynamicValues[
            fieldId
          ] instanceof File
        )
      })
      .map((field) => {
        const fieldId =
          Number(field.id)

        return {
          field,
          file:
            dynamicValues[
              fieldId
            ],
        }
      })
  }

  // --------------------------------------------------
  // Upload newly selected files
  // --------------------------------------------------

  const uploadDynamicFiles =
    async (
      transactionId,
      dynamicFiles
    ) => {
      if (
        !transactionId ||
        dynamicFiles.length === 0
      ) {
        return
      }

      const formData =
        new FormData()

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

      await api.post(
        `/transactions/${transactionId}/attachments`,
        formData
      )
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

      const dynamicValid =
        validateDynamicFields()

      if (!dynamicValid) {
        setSaving(false)
        return
      }

      try {
        // ------------------------------------------
        // Build payload
        // ------------------------------------------

        const dynamic_fields =
          buildDynamicFieldsPayload()

        const payload = {
          title:
            data.title.trim(),

          description:
            data.description.trim(),

          priority:
            data.priority,
        }

        if (
          dynamicFields.length > 0
        ) {
          payload.dynamic_fields =
            dynamic_fields
        }

        if (
          isLegacyLeaveRequest
        ) {
          payload.start_date =
            data.start_date

          payload.end_date =
            data.end_date
        }

        // ------------------------------------------
        // Update transaction
        // ------------------------------------------

        await api.patch(
          `/transactions/${id}`,
          payload
        )

        // ------------------------------------------
        // Upload ONLY new files
        // ------------------------------------------

        const dynamicFiles =
          getDynamicFiles()

        if (
          dynamicFiles.length > 0
        ) {
          await uploadDynamicFiles(
            id,
            dynamicFiles
          )
        }

        // ------------------------------------------
        // Success
        // ------------------------------------------

        setSuccess(
          'Transaction updated successfully.'
        )

        setTimeout(() => {
          navigate(
            `/transactions/${id}`
          )
        }, 500)
      } catch (error) {
        console.error(
          'Update transaction error:',
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
              'Unable to update transaction.'
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
            Loading transaction...
          </p>

        </div>

      </div>
    )
  }

  // --------------------------------------------------
  // Not found
  // --------------------------------------------------

  if (!transaction) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 md:p-8 dark:bg-gray-950">

        <p className="text-red-600 dark:text-red-400">
          {pageError ||
            'Transaction not found.'}
        </p>

        <Link
          to="/transactions"
          className="mt-4 inline-block text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          ← Back to Transactions
        </Link>

      </div>
    )
  }

  // --------------------------------------------------
  // Status restriction
  // --------------------------------------------------

  if (
    transaction.status !== 'draft' &&
    transaction.status !== 'returned'
  ) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 md:p-8 dark:bg-gray-950">

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Transaction cannot be edited
        </h1>

        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Only draft or returned transactions can be edited.
        </p>

        <Link
          to={`/transactions/${id}`}
          className="mt-4 inline-block text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          ← Back to Transaction
        </Link>

      </div>
    )
  }

  // --------------------------------------------------
  // Page
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-gray-50 p-8 dark:bg-gray-950">

      <Link
        to={`/transactions/${id}`}
        className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
      >
        ← Back to Transaction
      </Link>

      <div className="mt-6 max-w-4xl rounded-xl bg-white p-8 shadow dark:bg-gray-900">

        {/* Header */}

        <div className="mb-8">

          <p className="text-sm text-gray-500 dark:text-gray-400">
            {transaction.transaction_number}
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            Edit Transaction
          </h1>

        </div>

        {/* Error */}

        {pageError && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
            {pageError}
          </div>
        )}

        {/* Success */}

        {success && (
          <div className="mb-6 rounded-lg bg-green-50 p-4 text-sm text-green-700 dark:bg-green-950/30 dark:text-green-300">
            {success}
          </div>
        )}

        <form
          onSubmit={handleSubmit(
            onSubmit
          )}
          noValidate
          className="space-y-6"
        >

          {/* ==================================================
              Title
              ================================================== */}

          <div>

            <label
              htmlFor="title"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Title
            </label>

            <input
              id="title"
              type="text"
              {...register('title')}
              className={`w-full rounded-lg border bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-900/30 ${
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

          {/* ==================================================
              Description
              ================================================== */}

          <div>

            <label
              htmlFor="description"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Description
            </label>

            <textarea
              id="description"
              rows="6"
              {...register(
                'description'
              )}
              className={`w-full resize-none rounded-lg border bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-900/30 ${
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

          {/* ==================================================
              Dynamic Fields Loading
              ================================================== */}

          {loadingFields && (
            <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-500 dark:bg-gray-800 dark:text-gray-400">
              Loading fields...
            </div>
          )}

          {/* ==================================================
              Dynamic Fields
              ================================================== */}

          {!loadingFields &&
            dynamicFields.length > 0 && (
              <div className="rounded-xl border border-gray-200 p-6 dark:border-gray-700">

                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Request Details
                </h2>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Update the information for this transaction.
                </p>

                <div className="mt-6 grid gap-5 md:grid-cols-2">

                  {dynamicFields.map(
                    (field) => {
                      const fieldId =
                        Number(
                          field.id
                        )

                      const existingFile =
                        existingFiles[
                          fieldId
                        ]

                      const currentValue =
                        field.field_type ===
                        'file'
                          ? dynamicValues[
                              fieldId
                            ] instanceof
                            File
                            ? dynamicValues[
                                fieldId
                              ]
                            : undefined
                          : dynamicValues[
                              fieldId
                            ]

                      const fieldError =
                        errors
                          .dynamic_fields?.[
                          String(
                            fieldId
                          )
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
                              currentValue
                            }
                            onChange={
                              handleDynamicFieldChange
                            }
                            isEditing={
                              true
                            }
                          />

                          {fieldError && (
                            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                              {
                                fieldError.message
                              }
                            </p>
                          )}

                          {/* Existing file */}

                          {field.field_type ===
                            'file' &&
                            existingFile &&
                            !(
                              dynamicValues[
                                fieldId
                              ] instanceof
                              File
                            ) && (
                              <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">

                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                  Current file
                                </p>

                                <div className="mt-2 flex flex-wrap items-center justify-between gap-3">

                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {
                                      existingFile.original_name ||
                                      'Existing file'
                                    }
                                  </p>

                                  {existingFile.url && (
                                    <a
                                      href={
                                        existingFile.url
                                      }
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                    >
                                      Open
                                    </a>
                                  )}

                                </div>

                                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                  Leave the file unchanged to keep the current attachment.
                                </p>

                              </div>
                            )}

                        </div>
                      )
                    }
                  )}

                </div>

              </div>
            )}

          {/* ==================================================
              Legacy Leave Request
              ================================================== */}

          {!loadingFields &&
            isLegacyLeaveRequest && (
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-6 dark:border-blue-900/50 dark:bg-blue-950/30">

                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Leave Details
                </h2>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Select the start and end dates of your leave.
                </p>

                <div className="mt-5 grid gap-5 md:grid-cols-2">

                  {/* Start */}

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
                      className={`mt-2 w-full rounded-lg border bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-900/30 ${
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

                  {/* End */}

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
                      className={`mt-2 w-full rounded-lg border bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-900/30 ${
                        errors.end_date
                          ? 'border-red-400 dark:border-red-500'
                          : 'border-gray-300 dark:border-gray-700'
                      }`}
                    />

                    {errors.end_date && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {
                          errors.end_date
                            .message
                        }
                      </p>
                    )}

                  </div>

                </div>

              </div>
            )}

          {/* ==================================================
              Priority
              ================================================== */}

          <div>

            <label
              htmlFor="priority"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Priority
            </label>

            <select
              id="priority"
              {...register(
                'priority'
              )}
              className={`w-full rounded-lg border bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-900/30 ${
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
                  errors.priority
                    .message
                }
              </p>
            )}

          </div>

          {/* ==================================================
              Buttons
              ================================================== */}

          <div className="flex gap-3">

            <Link
              to={`/transactions/${id}`}
              className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={
                saving ||
                loadingFields
              }
              className="rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? 'Saving...'
                : 'Save Changes'}
            </button>

          </div>

        </form>

      </div>

    </div>
  )
}

export default EditTransaction
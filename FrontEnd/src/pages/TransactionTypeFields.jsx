import {
  useEffect,
  useState,
} from 'react'

import {
  useForm,
} from 'react-hook-form'

import {
  zodResolver,
} from '@hookform/resolvers/zod'

import {
  Link,
  useParams,
} from 'react-router-dom'

import api from '../services/api'

import {
  transactionTypeFieldSchema,
  transactionTypeFieldDefaultValues,
} from '../schemas/transactionTypeField.schema'

const FIELD_TYPES = [
  {
    value: 'text',
    label: 'Text',
  },
  {
    value: 'textarea',
    label: 'Long Text',
  },
  {
    value: 'number',
    label: 'Number',
  },
  {
    value: 'date',
    label: 'Date',
  },
  {
    value: 'datetime',
    label: 'Date & Time',
  },
  {
    value: 'select',
    label: 'Select',
  },
  {
    value: 'radio',
    label: 'Radio',
  },
  {
    value: 'checkbox',
    label: 'Checkbox',
  },
  {
    value: 'file',
    label: 'File',
  },
  {
    value: 'currency',
    label: 'Currency',
  },
  {
    value: 'email',
    label: 'Email',
  },
  {
    value: 'phone',
    label: 'Phone',
  },
]

function TransactionTypeFields() {
  const { id } = useParams()

  // --------------------------------------------------
  // Data
  // --------------------------------------------------

  const [transactionType, setTransactionType] =
    useState(null)

  const [fields, setFields] =
    useState([])

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  const [loading, setLoading] =
    useState(true)

  const [saving, setSaving] =
    useState(false)

  const [actionLoading, setActionLoading] =
    useState(null)

  const [showForm, setShowForm] =
    useState(false)

  const [editingFieldId, setEditingFieldId] =
    useState(null)

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
    reset,
    setError: setFieldError,
    watch,
    formState: {
      errors,
    },
  } = useForm({
    resolver:
      zodResolver(
        transactionTypeFieldSchema
      ),

    defaultValues:
      transactionTypeFieldDefaultValues,
  })

  // --------------------------------------------------
  // Watched values
  // --------------------------------------------------

  const watchedFieldType =
    watch('field_type')

  const watchedOptions =
    watch('options') || ['']

  const needsOptions =
    watchedFieldType === 'select' ||
    watchedFieldType === 'radio'

  // --------------------------------------------------
  // Load data
  // --------------------------------------------------

  const loadData = async () => {
    try {
      setLoading(true)
      setPageError('')

      const [
        typeResponse,
        fieldsResponse,
      ] = await Promise.all([
        api.get(
          `/admin/transaction-types/${id}`
        ),

        api.get(
          `/admin/transaction-types/${id}/fields`
        ),
      ])

      setTransactionType(
        typeResponse.data.data
      )

      const loadedFields =
        fieldsResponse.data.data || []

      setFields(
        [...loadedFields].sort(
          (a, b) =>
            Number(
              a.field_order
            ) -
            Number(
              b.field_order
            )
        )
      )
    } catch (error) {
      console.error(
        'Transaction fields load error:',
        error.response?.data ||
          error
      )

      setPageError(
        error.response?.data?.message ||
          'Unable to load transaction fields.'
      )
    } finally {
      setLoading(false)
    }
  }

  // --------------------------------------------------
  // Initial load
  // --------------------------------------------------

  useEffect(() => {
    loadData()
  }, [id])

  // --------------------------------------------------
  // Reset form
  // --------------------------------------------------

  const resetFieldForm = () => {
    reset({
      ...transactionTypeFieldDefaultValues,
      field_order:
        fields.length + 1,
    })

    setEditingFieldId(null)
    setShowForm(false)
  }

  // --------------------------------------------------
  // Start add
  // --------------------------------------------------

  const startAdd = () => {
    setPageError('')
    setSuccess('')

    reset({
      name_en: '',
      field_type: 'text',
      is_required: false,
      placeholder_en: '',
      placeholder_ar: '',
      options: [''],
      field_order:
        fields.length + 1,
    })

    setEditingFieldId(null)
    setShowForm(true)
  }

  // --------------------------------------------------
  // Start edit
  // --------------------------------------------------

  const startEdit = (field) => {
    setPageError('')
    setSuccess('')

    const fieldOptions =
      Array.isArray(field.options) &&
      field.options.length > 0
        ? field.options
        : ['']

    reset({
      name_en:
        field.name_en || '',

      field_type:
        field.field_type || 'text',

      is_required:
        Boolean(
          field.is_required
        ),

      placeholder_en:
        field.placeholder_en || '',

      placeholder_ar:
        field.placeholder_ar || '',

      options:
        fieldOptions,

      field_order:
        Number(
          field.field_order || 1
        ),
    })

    setEditingFieldId(field.id)
    setShowForm(true)
  }

  // --------------------------------------------------
  // Options helpers
  // --------------------------------------------------

  const handleOptionChange = (
    index,
    value
  ) => {
    const currentOptions =
      [...watchedOptions]

    currentOptions[index] =
      value

    reset(
      {
        ...watch(),
        options:
          currentOptions,
      },
      {
        keepErrors: true,
        keepDirty: true,
        keepTouched: true,
      }
    )
  }

  const addOption = () => {
    reset(
      {
        ...watch(),
        options: [
          ...watchedOptions,
          '',
        ],
      },
      {
        keepErrors: true,
        keepDirty: true,
        keepTouched: true,
      }
    )
  }

  const removeOption = (
    index
  ) => {
    if (
      watchedOptions.length ===
      1
    ) {
      return
    }

    reset(
      {
        ...watch(),
        options:
          watchedOptions.filter(
            (_, optionIndex) =>
              optionIndex !== index
          ),
      },
      {
        keepErrors: true,
        keepDirty: true,
        keepTouched: true,
      }
    )
  }

  // --------------------------------------------------
  // Save field
  // --------------------------------------------------

  const onSubmit = async (data) => {
    setPageError('')
    setSuccess('')

    try {
      setSaving(true)

      const options =
        needsOptions
          ? data.options
              .map((option) =>
                option.trim()
              )
              .filter(Boolean)
          : null

      const payload = {
        name_en:
          data.name_en.trim(),

        field_type:
          data.field_type,

        is_required:
          Boolean(
            data.is_required
          ),

        placeholder_en:
          data.placeholder_en
            ?.trim() || null,

        placeholder_ar:
          data.placeholder_ar
            ?.trim() || null,

        options,

        field_order:
          Number(
            data.field_order
          ),
      }

      if (editingFieldId) {
        await api.patch(
          `/admin/transaction-type-fields/${editingFieldId}`,
          payload
        )

        setSuccess(
          'Field updated successfully.'
        )
      } else {
        await api.post(
          `/admin/transaction-types/${id}/fields`,
          payload
        )

        setSuccess(
          'Field created successfully.'
        )
      }

      await loadData()

      resetFieldForm()
    } catch (error) {
      console.error(
        'Save field error:',
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
          error.response?.data?.message ||
            'Please correct the highlighted fields.'
        )
      } else {
        setPageError(
          error.response?.data?.message ||
            'Unable to save field.'
        )
      }
    } finally {
      setSaving(false)
    }
  }

  // --------------------------------------------------
  // Delete
  // --------------------------------------------------

  const handleDelete = async (
    field
  ) => {
    const confirmed =
      window.confirm(
        `Delete "${field.name_en}"?`
      )

    if (!confirmed) {
      return
    }

    try {
      setActionLoading(field.id)
      setPageError('')
      setSuccess('')

      await api.delete(
        `/admin/transaction-type-fields/${field.id}`
      )

      setSuccess(
        'Field deleted successfully.'
      )

      await loadData()
    } catch (error) {
      console.error(
        'Delete field error:',
        error.response?.data ||
          error
      )

      setPageError(
        error.response?.data
          ?.message ||
          'Unable to delete field.'
      )
    } finally {
      setActionLoading(null)
    }
  }

  // --------------------------------------------------
  // Move field
  // --------------------------------------------------

  const moveField = (
    index,
    direction
  ) => {
    const newIndex =
      index + direction

    if (
      newIndex < 0 ||
      newIndex >=
        fields.length
    ) {
      return
    }

    const reordered =
      [...fields]

    const temp =
      reordered[index]

    reordered[index] =
      reordered[newIndex]

    reordered[newIndex] =
      temp

    setFields(
      reordered.map(
        (
          field,
          fieldIndex
        ) => ({
          ...field,
          field_order:
            fieldIndex + 1,
        })
      )
    )
  }

  // --------------------------------------------------
  // Save order
  // --------------------------------------------------

  const saveOrder =
    async () => {
      if (
        fields.length === 0
      ) {
        return
      }

      try {
        setSaving(true)
        setPageError('')
        setSuccess('')

        const payload = {
          fields:
            fields.map(
              (field, index) => ({
                id: field.id,

                field_order:
                  index + 1,
              })
            ),
        }

        await api.put(
          `/admin/transaction-types/${id}/fields/reorder`,
          payload
        )

        setSuccess(
          'Field order saved successfully.'
        )

        await loadData()
      } catch (error) {
        console.error(
          'Save field order error:',
          error.response?.data ||
            error
        )

        setPageError(
          error.response?.data
            ?.message ||
            'Unable to save field order.'
        )
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
            Loading fields...
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

      <Link
        to="/transaction-types"
        className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
      >
        ← Back to Transaction Types
      </Link>

      {/* Header */}

      <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

        <div>

          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Administration
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
            {transactionType?.name_en}
          </h1>

          <p
            dir="rtl"
            className="mt-1 text-lg text-gray-500 dark:text-gray-400"
          >
            {transactionType?.name_ar}
          </p>

          <p className="mt-3 text-gray-600 dark:text-gray-400">
            Configure the fields employees must complete for this transaction type.
          </p>

        </div>

        <div className="flex flex-wrap gap-3">

          <button
            type="button"
            onClick={startAdd}
            className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400"
          >
            + Add Field
          </button>

          <button
            type="button"
            onClick={saveOrder}
            disabled={
              saving ||
              fields.length === 0
            }
            className="rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? 'Saving...'
              : 'Save Order'}
          </button>

        </div>

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

      {/* Add / Edit Form */}

      {showForm && (
        <div className="mt-6 rounded-xl bg-white p-6 shadow dark:bg-gray-900">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingFieldId
                  ? 'Edit Field'
                  : 'Add Field'}
              </h2>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Define what information the employee should enter.
              </p>

            </div>

            <button
              type="button"
              onClick={
                resetFieldForm
              }
              className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              Cancel
            </button>

          </div>

          <form
            onSubmit={handleSubmit(
              onSubmit
            )}
            noValidate
            className="mt-6 grid gap-5 md:grid-cols-2"
          >

            {/* Field name */}

            <div className="md:col-span-2">

              <label
                htmlFor="name_en"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Field Name
              </label>

              <input
                id="name_en"
                type="text"
                placeholder="e.g. Start Date"
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

            {/* Type */}

            <div>

              <label
                htmlFor="field_type"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Field Type
              </label>

              <select
                id="field_type"
                {...register(
                  'field_type'
                )}
                className={`mt-2 w-full rounded-lg border bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-900/30 ${
                  errors.field_type
                    ? 'border-red-400 dark:border-red-500'
                    : 'border-gray-300 dark:border-gray-700'
                }`}
              >

                {FIELD_TYPES.map(
                  (type) => (
                    <option
                      key={
                        type.value
                      }
                      value={
                        type.value
                      }
                    >
                      {type.label}
                    </option>
                  )
                )}

              </select>

              {errors.field_type && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {
                    errors.field_type
                      .message
                  }
                </p>
              )}

            </div>

            {/* Order */}

            <div>

              <label
                htmlFor="field_order"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Field Order
              </label>

              <input
                id="field_order"
                type="number"
                min="1"
                {...register(
                  'field_order'
                )}
                className={`mt-2 w-full rounded-lg border bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-900/30 ${
                  errors.field_order
                    ? 'border-red-400 dark:border-red-500'
                    : 'border-gray-300 dark:border-gray-700'
                }`}
              />

              {errors.field_order && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {
                    errors.field_order
                      .message
                  }
                </p>
              )}

            </div>

            {/* Placeholder */}

            <div>

              <label
                htmlFor="placeholder_en"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Placeholder
              </label>

              <input
                id="placeholder_en"
                type="text"
                placeholder="e.g. Select start date"
                {...register(
                  'placeholder_en'
                )}
                className={`mt-2 w-full rounded-lg border bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-900/30 ${
                  errors.placeholder_en
                    ? 'border-red-400 dark:border-red-500'
                    : 'border-gray-300 dark:border-gray-700'
                }`}
              />

              {errors.placeholder_en && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {
                    errors
                      .placeholder_en
                      .message
                  }
                </p>
              )}

            </div>

            {/* Arabic placeholder */}

            <div>

              <label
                htmlFor="placeholder_ar"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Arabic Placeholder
              </label>

              <input
                id="placeholder_ar"
                type="text"
                dir="rtl"
                placeholder="مثال: اختر تاريخ البدء"
                {...register(
                  'placeholder_ar'
                )}
                className={`mt-2 w-full rounded-lg border bg-white px-4 py-3 text-right text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-900/30 ${
                  errors.placeholder_ar
                    ? 'border-red-400 dark:border-red-500'
                    : 'border-gray-300 dark:border-gray-700'
                }`}
              />

              {errors.placeholder_ar && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {
                    errors
                      .placeholder_ar
                      .message
                  }
                </p>
              )}

            </div>

            {/* Required */}

            <div className="md:col-span-2">

              <label className="flex items-center gap-3">

                <input
                  type="checkbox"
                  {...register(
                    'is_required'
                  )}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
                />

                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  This field is required
                </span>

              </label>

              {errors.is_required && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {
                    errors
                      .is_required
                      .message
                  }
                </p>
              )}

            </div>

            {/* Options */}

            {needsOptions && (
              <div className="md:col-span-2">

                <div className="flex items-center justify-between">

                  <div>

                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Options
                    </label>

                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Add the values employees can choose from.
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={
                      addOption
                    }
                    className="rounded-lg border border-blue-200 px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-50 dark:border-blue-800/60 dark:text-blue-300 dark:hover:bg-blue-950/30"
                  >
                    + Add Option
                  </button>

                </div>

                {errors.options && (
                  <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                    {
                      errors.options
                        .message
                    }
                  </p>
                )}

                <div className="mt-4 space-y-3">

                  {watchedOptions.map(
                    (
                      option,
                      index
                    ) => (
                      <div
                        key={index}
                        className="flex gap-2"
                      >

                        <input
                          type="text"
                          value={
                            option
                          }
                          onChange={(
                            event
                          ) =>
                            handleOptionChange(
                              index,
                              event
                                .target
                                .value
                            )
                          }
                          placeholder={`Option ${index + 1}`}
                          className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-900/30"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removeOption(
                              index
                            )
                          }
                          disabled={
                            watchedOptions.length ===
                            1
                          }
                          className="rounded-lg border border-red-200 px-3 text-sm text-red-700 hover:bg-red-50 dark:border-red-800/60 dark:text-red-300 dark:hover:bg-red-950/30 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Remove
                        </button>

                      </div>
                    )
                  )}

                </div>

              </div>
            )}

            {/* Submit */}

            <div className="md:col-span-2">

              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? 'Saving...'
                  : editingFieldId
                    ? 'Save Changes'
                    : 'Add Field'}
              </button>

            </div>

          </form>

        </div>
      )}

      {/* Fields */}

      <div className="mt-6 rounded-xl bg-white p-6 shadow dark:bg-gray-900">

        <div className="mb-6">

          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Form Fields
          </h2>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            These fields will appear when an employee creates this transaction type.
          </p>

        </div>

        {fields.length === 0 ? (

          <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center dark:border-gray-700">

            <p className="font-medium text-gray-700 dark:text-gray-200">
              No fields configured.
            </p>

            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Add the first field to start building this form.
            </p>

            <button
              type="button"
              onClick={
                startAdd
              }
              className="mt-5 rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400"
            >
              + Add First Field
            </button>

          </div>

        ) : (

          <div className="space-y-4">

            {fields.map(
              (
                field,
                index
              ) => {

                const isLoading =
                  actionLoading ===
                  field.id

                const fieldLabel =
                  FIELD_TYPES.find(
                    (type) =>
                      type.value ===
                      field.field_type
                  )?.label ||
                  field.field_type

                return (
                  <div
                    key={
                      field.id
                    }
                    className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800"
                  >

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                      <div className="flex items-start gap-4">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white dark:bg-white dark:text-gray-900">
                          {index + 1}
                        </div>

                        <div>

                          <div className="flex flex-wrap items-center gap-2">

                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {
                                field.name_en
                              }
                            </h3>

                            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                              {
                                fieldLabel
                              }
                            </span>

                            {field.is_required && (
                              <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                                Required
                              </span>
                            )}

                          </div>

                          {field.options?.length >
                            0 && (
                            <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                              Options:{' '}
                              {field.options.join(
                                ', '
                              )}
                            </p>
                          )}

                        </div>

                      </div>

                      {/* Actions */}

                      <div className="flex flex-wrap items-center gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            moveField(
                              index,
                              -1
                            )
                          }
                          disabled={
                            index === 0
                          }
                          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          ↑
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            moveField(
                              index,
                              1
                            )
                          }
                          disabled={
                            index ===
                            fields.length - 1
                          }
                          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          ↓
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            startEdit(
                              field
                            )
                          }
                          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              field
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

                    </div>

                  </div>
                )
              }
            )}

          </div>

        )}

      </div>

    </div>
  )
}

export default TransactionTypeFields
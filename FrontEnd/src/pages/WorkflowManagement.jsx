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
  workflowStepSchema,
} from '../schemas/workflow.schema'

function WorkflowManagement() {
  const { id } = useParams()

  // --------------------------------------------------
  // Data
  // --------------------------------------------------

  const [transactionType, setTransactionType] =
    useState(null)

  const [steps, setSteps] =
    useState([])

  const [departments, setDepartments] =
    useState([])

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  const [loading, setLoading] =
    useState(true)

  const [savingOrder, setSavingOrder] =
    useState(false)

  const [actionLoading, setActionLoading] =
    useState(null)

  const [error, setError] =
    useState('')

  const [success, setSuccess] =
    useState('')

  const [showAddForm, setShowAddForm] =
    useState(false)

  const [editingStepId, setEditingStepId] =
    useState(null)

  // --------------------------------------------------
  // React Hook Form
  // --------------------------------------------------

  const {
    register,
    handleSubmit,
    reset,
    setError: setFieldError,
    formState: {
      errors,
    },
  } = useForm({
    resolver:
      zodResolver(
        workflowStepSchema
      ),

    defaultValues: {
      department_id: '',
      name: '',
      step_order: 1,
      is_final: false,
    },
  })

  // --------------------------------------------------
  // Load data
  // --------------------------------------------------

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')

      const [
        typeResponse,
        stepsResponse,
        departmentsResponse,
      ] = await Promise.all([
        api.get(
          `/admin/transaction-types/${id}`
        ),

        api.get(
          `/admin/transaction-types/${id}/workflow-steps`
        ),

        api.get(
          '/departments'
        ),
      ])

      setTransactionType(
        typeResponse.data.data
      )

      const loadedSteps =
        stepsResponse.data.data ||
        []

      setSteps(
        [...loadedSteps].sort(
          (a, b) =>
            Number(
              a.step_order
            ) -
            Number(
              b.step_order
            )
        )
      )

      setDepartments(
        departmentsResponse.data
          .data || []
      )
    } catch (error) {
      console.error(
        'Workflow load error:',
        error.response?.data ||
          error
      )

      setError(
        error.response?.data?.message ||
          'Unable to load workflow.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [id])

  // --------------------------------------------------
  // Department name
  // --------------------------------------------------

  const getDepartmentName = (
    step
  ) => {
    if (
      step.department?.name
    ) {
      return step.department.name
    }

    const department =
      departments.find(
        (item) =>
          String(item.id) ===
          String(
            step.department_id
          )
      )

    return (
      department?.name ||
      'Department'
    )
  }

  // --------------------------------------------------
  // Reset form
  // --------------------------------------------------

  const resetForm = () => {
    reset({
      department_id: '',
      name: '',
      step_order:
        steps.length + 1,
      is_final: false,
    })

    setEditingStepId(null)
    setShowAddForm(false)
  }

  // --------------------------------------------------
  // Add step
  // --------------------------------------------------

  const startAdd = () => {
    setError('')
    setSuccess('')

    reset({
      department_id: '',
      name: '',
      step_order:
        steps.length + 1,
      is_final:
        steps.length === 0,
    })

    setEditingStepId(null)
    setShowAddForm(true)
  }

  // --------------------------------------------------
  // Edit step
  // --------------------------------------------------

  const startEdit = (
    step
  ) => {
    setError('')
    setSuccess('')

    reset({
      department_id:
        String(
          step.department?.id ??
          step.department_id ??
          ''
        ),

      name:
        step.name || '',

      step_order:
        Number(
          step.step_order || 1
        ),

      is_final:
        Boolean(
          step.is_final
        ),
    })

    setEditingStepId(
      step.id
    )

    setShowAddForm(true)
  }

  // --------------------------------------------------
  // Create / update step
  // --------------------------------------------------

  const onSubmit = async (
    data
  ) => {
    setError('')
    setSuccess('')

    try {
      setActionLoading(
        editingStepId || 'new'
      )

      const payload = {
        department_id:
          Number(
            data.department_id
          ),

        name:
          data.name.trim(),

        step_order:
          Number(
            data.step_order
          ),

        is_final:
          Boolean(
            data.is_final
          ),
      }

      // ----------------------------------------------
      // Update
      // ----------------------------------------------

      if (editingStepId) {
        await api.patch(
          `/admin/workflow-steps/${editingStepId}`,
          payload
        )

        setSuccess(
          'Workflow step updated successfully.'
        )
      }

      // ----------------------------------------------
      // Create
      // ----------------------------------------------

      else {
        await api.post(
          `/admin/transaction-types/${id}/workflow-steps`,
          payload
        )

        setSuccess(
          'Workflow step created successfully.'
        )
      }

      await loadData()

      resetForm()
    } catch (error) {
      console.error(
        'Workflow step save error:',
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

        setError(
          error.response?.data
            ?.message ||
            'Please correct the highlighted fields.'
        )
      } else {
        setError(
          error.response?.data
            ?.message ||
            'Unable to save workflow step.'
        )
      }
    } finally {
      setActionLoading(null)
    }
  }

  // --------------------------------------------------
  // Delete
  // --------------------------------------------------

  const handleDelete = async (
    step
  ) => {
    const confirmed =
      window.confirm(
        `Delete "${step.name}"?`
      )

    if (!confirmed) {
      return
    }

    try {
      setActionLoading(
        step.id
      )

      setError('')
      setSuccess('')

      await api.delete(
        `/admin/workflow-steps/${step.id}`
      )

      setSuccess(
        'Workflow step deleted successfully.'
      )

      await loadData()
    } catch (error) {
      console.error(
        'Workflow step delete error:',
        error.response?.data ||
          error
      )

      setError(
        error.response?.data
          ?.message ||
          'Unable to delete workflow step.'
      )
    } finally {
      setActionLoading(null)
    }
  }

  // --------------------------------------------------
  // Move locally
  // --------------------------------------------------

  const moveStep = (
    index,
    direction
  ) => {
    const newIndex =
      index + direction

    if (
      newIndex < 0 ||
      newIndex >=
        steps.length
    ) {
      return
    }

    const reordered =
      [...steps]

    const temp =
      reordered[index]

    reordered[index] =
      reordered[newIndex]

    reordered[newIndex] =
      temp

    const updated =
      reordered.map(
        (
          step,
          stepIndex
        ) => ({
          ...step,

          step_order:
            stepIndex + 1,
        })
      )

    setSteps(updated)
  }

  // --------------------------------------------------
  // Save order
  // --------------------------------------------------

  const saveOrder =
    async () => {
      if (
        steps.length === 0
      ) {
        return
      }

      try {
        setSavingOrder(true)
        setError('')
        setSuccess('')

        const payload = {
          steps:
            steps.map(
              (
                step,
                index
              ) => ({
                id: step.id,

                step_order:
                  index + 1,
              })
            ),
        }

        await api.put(
          `/admin/transaction-types/${id}/workflow-steps/reorder`,
          payload
        )

        setSuccess(
          'Workflow order saved successfully.'
        )

        await loadData()
      } catch (error) {
        console.error(
          'Workflow reorder error:',
          error.response?.data ||
            error
        )

        setError(
          error.response?.data
            ?.message ||
            'Unable to save workflow order.'
        )
      } finally {
        setSavingOrder(false)
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
            Loading workflow...
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
            {
              transactionType?.name_en
            }
          </h1>

          <p
            dir="rtl"
            className="mt-1 text-lg text-gray-500 dark:text-gray-400"
          >
            {
              transactionType?.name_ar
            }
          </p>

          <p className="mt-3 text-gray-600 dark:text-gray-400">
            Configure the approval path for this transaction type.
          </p>

        </div>

        <div className="flex flex-wrap gap-3">

          <button
            type="button"
            onClick={startAdd}
            className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400"
          >
            + Add Step
          </button>

          <button
            type="button"
            onClick={saveOrder}
            disabled={
              savingOrder ||
              steps.length === 0
            }
            className="rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {savingOrder
              ? 'Saving...'
              : 'Save Order'}
          </button>

        </div>

      </div>

      {/* Error */}

      {error && (
        <div className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Success */}

      {success && (
        <div className="mt-6 rounded-lg bg-green-50 p-4 text-sm text-green-700 dark:bg-green-950/30 dark:text-green-300">
          {success}
        </div>
      )}

      {/* Add / Edit form */}

      {showAddForm && (
        <div className="mt-6 rounded-xl bg-white p-6 shadow dark:bg-gray-900">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingStepId
                  ? 'Edit Workflow Step'
                  : 'Add Workflow Step'}
              </h2>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Define where this step is handled and what it is called.
              </p>

            </div>

            <button
              type="button"
              onClick={
                resetForm
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
                className={`mt-2 w-full rounded-lg border bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-900/30 ${
                  errors.department_id
                    ? 'border-red-400 dark:border-red-500'
                    : 'border-gray-300 dark:border-gray-700'
                }`}
              >

                <option value="">
                  Select department
                </option>

                {departments.map(
                  (
                    department
                  ) => (
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

            {/* Step Order */}

            <div>

              <label
                htmlFor="step_order"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Step Order
              </label>

              <input
                id="step_order"
                type="number"
                min="1"
                {...register(
                  'step_order'
                )}
                className={`mt-2 w-full rounded-lg border bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-900/30 ${
                  errors.step_order
                    ? 'border-red-400 dark:border-red-500'
                    : 'border-gray-300 dark:border-gray-700'
                }`}
              />

              {errors.step_order && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {
                    errors
                      .step_order
                      .message
                  }
                </p>
              )}

            </div>

            {/* Step Name */}

            <div className="md:col-span-2">

              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Step Name
              </label>

              <input
                id="name"
                type="text"
                placeholder="e.g. Human Resources Review"
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

            {/* Final Step */}

            <div className="md:col-span-2">

              <label className="flex items-center gap-3">

                <input
                  type="checkbox"
                  {...register(
                    'is_final'
                  )}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
                />

                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  This is the final approval step
                </span>

              </label>

              {errors.is_final && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {
                    errors.is_final
                      .message
                  }
                </p>
              )}

            </div>

            {/* Submit */}

            <div className="md:col-span-2">

              <button
                type="submit"
                disabled={
                  actionLoading !==
                  null
                }
                className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {actionLoading
                  ? 'Saving...'
                  : editingStepId
                    ? 'Save Step'
                    : 'Add Step'}
              </button>

            </div>

          </form>

        </div>
      )}

      {/* Workflow */}

      <div className="mt-6 rounded-xl bg-white p-6 shadow dark:bg-gray-900">

        <div className="mb-6">

          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Approval Workflow
          </h2>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            The transaction will move through these steps in order.
          </p>

        </div>

        {steps.length === 0 ? (

          <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center dark:border-gray-700">

            <p className="font-medium text-gray-700 dark:text-gray-200">
              No workflow steps configured.
            </p>

            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Add the first approval step to define the workflow.
            </p>

            <button
              type="button"
              onClick={startAdd}
              className="mt-5 rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400"
            >
              + Add First Step
            </button>

          </div>

        ) : (

          <div className="space-y-4">

            {steps.map(
              (
                step,
                index
              ) => {

                const isLoading =
                  actionLoading ===
                  step.id

                return (
                  <div
                    key={step.id}
                    className="relative"
                  >

                    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">

                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                        {/* Step info */}

                        <div className="flex items-start gap-4">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white dark:bg-white dark:text-gray-900">
                            {index + 1}
                          </div>

                          <div>

                            <div className="flex flex-wrap items-center gap-2">

                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {
                                  step.name
                                }
                              </h3>

                              {step.is_final && (
                                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
                                  Final Step
                                </span>
                              )}

                            </div>

                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                              {getDepartmentName(
                                step
                              )}
                            </p>

                          </div>

                        </div>

                        {/* Actions */}

                        <div className="flex flex-wrap items-center gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              moveStep(
                                index,
                                -1
                              )
                            }
                            disabled={
                              index ===
                              0
                            }
                            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            ↑
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              moveStep(
                                index,
                                1
                              )
                            }
                            disabled={
                              index ===
                              steps.length -
                                1
                            }
                            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            ↓
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              startEdit(
                                step
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
                                step
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

                    {index <
                      steps.length -
                        1 && (
                      <div className="flex justify-center py-2 text-xl text-gray-300 dark:text-gray-600">
                        ↓
                      </div>
                    )}

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

export default WorkflowManagement
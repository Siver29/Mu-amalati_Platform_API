import { useEffect, useState } from 'react'
import {
  Link,
  useParams,
} from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import api from '../services/api'

function TransactionDetails() {
  const { id } = useParams()

  const { user } = useAuth()

  const [transaction, setTransaction] =
    useState(null)

  const [loading, setLoading] =
    useState(true)

  const [submitting, setSubmitting] =
    useState(false)

  const [error, setError] =
    useState('')

  const [submitError, setSubmitError] =
    useState('')

  const [comment, setComment] =
    useState('')

  // --------------------------------------------------
  // Refresh notification count
  // --------------------------------------------------

  const refreshNotifications = () => {
    window.dispatchEvent(
      new Event(
        'notifications:refresh'
      )
    )
  }

  // --------------------------------------------------
  // Load transaction
  // --------------------------------------------------

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')

      const response =
        await api.get(
          `/transactions/${id}`
        )

      setTransaction(
        response.data.data
      )
    } catch (error) {
      console.error(
        'Transaction error:',
        error.response?.data ||
          error
      )

      setError(
        error.response?.data
          ?.message ||
          'Unable to load transaction.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [id])

  // --------------------------------------------------
  // Check if current user is manager
  // --------------------------------------------------

  const isManager =
    user?.role === 'manager'

  // --------------------------------------------------
  // Check if manager can review
  // --------------------------------------------------

  const canReview =
    isManager &&
    transaction?.status === 'pending' &&
    transaction?.current_department?.id ===
      user?.department?.id

  // --------------------------------------------------
  // Submit Draft Transaction
  // --------------------------------------------------

  const handleSubmit = async () => {
    const confirmed =
      window.confirm(
        'Are you sure you want to submit this transaction?'
      )

    if (!confirmed) {
      return
    }

    setSubmitting(true)
    setSubmitError('')

    try {
      await api.post(
        `/transactions/${transaction.id}/submit`
      )

      // Update sidebar notification count
      refreshNotifications()

      await loadData()
    } catch (error) {
      console.error(
        'Submit transaction error:',
        error.response?.data ||
          error
      )

      setSubmitError(
        error.response?.data
          ?.message ||
          'Unable to submit transaction.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  // --------------------------------------------------
  // Resubmit Returned Transaction
  // --------------------------------------------------

  const handleResubmit = async () => {
    const confirmed =
      window.confirm(
        'Are you sure you want to resubmit this transaction?'
      )

    if (!confirmed) {
      return
    }

    setSubmitting(true)
    setSubmitError('')

    try {
      await api.post(
        `/transactions/${transaction.id}/resubmit`
      )

      // Update sidebar notification count
      refreshNotifications()

      await loadData()
    } catch (error) {
      console.error(
        'Resubmit transaction error:',
        error.response?.data ||
          error
      )

      setSubmitError(
        error.response?.data
          ?.message ||
          'Unable to resubmit transaction.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  // --------------------------------------------------
  // Manager Approve
  // --------------------------------------------------

  const handleApprove = async () => {
    const confirmed =
      window.confirm(
        'Are you sure you want to approve this transaction?'
      )

    if (!confirmed) {
      return
    }

    setSubmitting(true)
    setSubmitError('')

    try {
      await api.post(
        `/manager/transactions/${transaction.id}/approve`,
        {
          comment:
            comment || null,
        }
      )

      setComment('')

      // Update sidebar notification count
      refreshNotifications()

      await loadData()
    } catch (error) {
      console.error(
        'Approve transaction error:',
        error.response?.data ||
          error
      )

      setSubmitError(
        error.response?.data
          ?.message ||
          'Unable to approve transaction.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  // --------------------------------------------------
  // Manager Return
  // --------------------------------------------------

  const handleReturn = async () => {
    if (!comment.trim()) {
      setSubmitError(
        'Please enter a comment before returning the transaction.'
      )

      return
    }

    const confirmed =
      window.confirm(
        'Are you sure you want to return this transaction?'
      )

    if (!confirmed) {
      return
    }

    setSubmitting(true)
    setSubmitError('')

    try {
      await api.post(
        `/manager/transactions/${transaction.id}/return`,
        {
          comment:
            comment.trim(),
        }
      )

      setComment('')

      // Update sidebar notification count
      refreshNotifications()

      await loadData()
    } catch (error) {
      console.error(
        'Return transaction error:',
        error.response?.data ||
          error
      )

      setSubmitError(
        error.response?.data
          ?.message ||
          'Unable to return transaction.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  // --------------------------------------------------
  // Manager Reject
  // --------------------------------------------------

  const handleReject = async () => {
    if (!comment.trim()) {
      setSubmitError(
        'Please enter a comment before rejecting the transaction.'
      )

      return
    }

    const confirmed =
      window.confirm(
        'Are you sure you want to reject this transaction?'
      )

    if (!confirmed) {
      return
    }

    setSubmitting(true)
    setSubmitError('')

    try {
      await api.post(
        `/manager/transactions/${transaction.id}/reject`,
        {
          comment:
            comment.trim(),
        }
      )

      setComment('')

      // Update sidebar notification count
      refreshNotifications()

      await loadData()
    } catch (error) {
      console.error(
        'Reject transaction error:',
        error.response?.data ||
          error
      )

      setSubmitError(
        error.response?.data
          ?.message ||
          'Unable to reject transaction.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  // --------------------------------------------------
  // Workflow Step Helpers
  // --------------------------------------------------

  const getStepIcon = (
    status
  ) => {
    switch (status) {
      case 'approved':
        return '✓'

      case 'pending':
        return '●'

      case 'returned':
        return '↩'

      case 'rejected':
        return '✕'

      case 'skipped':
        return '—'

      case 'waiting':
      default:
        return '○'
    }
  }

  const getStepColor = (
    status
  ) => {
    switch (status) {
      case 'approved':
        return {
          circle:
            'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
          badge:
            'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
        }

      case 'pending':
        return {
          circle:
            'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
          badge:
            'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
        }

      case 'returned':
        return {
          circle:
            'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
          badge:
            'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
        }

      case 'rejected':
        return {
          circle:
            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
          badge:
            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
        }

      case 'skipped':
        return {
          circle:
            'bg-gray-100 text-gray-500',
          badge:
            'bg-gray-100 text-gray-500',
        }

      case 'waiting':
      default:
        return {
          circle:
            'bg-gray-100 text-gray-500',
          badge:
            'bg-gray-100 text-gray-500',
        }
    }
  }

  // --------------------------------------------------
  // Dynamic field value formatter
  // --------------------------------------------------

  const formatFieldValue = (
    fieldValue
  ) => {
    const type =
      fieldValue.field?.field_type

    const value =
      fieldValue.value

    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      return '—'
    }

    if (
      type === 'checkbox'
    ) {
      return (
        value === true ||
        value === '1' ||
        value === 'true'
      )
        ? 'Yes'
        : 'No'
    }

    if (
      type === 'date'
    ) {
      const date =
        new Date(value)

      if (
        !Number.isNaN(
          date.getTime()
        )
      ) {
        return date.toLocaleDateString()
      }
    }

    if (
      type === 'datetime'
    ) {
      const date =
        new Date(value)

      if (
        !Number.isNaN(
          date.getTime()
        )
      ) {
        return date.toLocaleString()
      }
    }

    return String(value)
  }

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 md:p-8 dark:bg-gray-950">

        <p className="text-gray-500 dark:text-gray-400">
          Loading transaction...
        </p>

      </div>
    )
  }

  // --------------------------------------------------
  // Error / Not Found
  // --------------------------------------------------

  if (
    error ||
    !transaction
  ) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 md:p-8 dark:bg-gray-950">

        <div className="rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {error ||
            'Transaction not found.'}
        </div>

        <Link
          to="/transactions"
          className="mt-6 inline-block text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          ← Back to Transactions
        </Link>

      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 dark:bg-gray-950">

      {/* Back */}

      <Link
        to="/transactions"
        className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
      >
        ← Back to Transactions
      </Link>

      {/* Header */}

      <div className="mt-6 rounded-xl bg-white p-8 shadow dark:bg-gray-900">

        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">

          <div>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              {
                transaction.transaction_number
              }
            </p>

            <h1 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
              {transaction.title}
            </h1>

          </div>

          <div className="flex flex-wrap items-center gap-3">

            <span
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                transaction.status ===
                'draft'
                  ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                  : transaction.status ===
                      'pending'
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                    : transaction.status ===
                        'returned'
                      ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                      : transaction.status ===
                          'approved'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        : transaction.status ===
                            'rejected'
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                          : transaction.status ===
                              'completed'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
              }`}
            >
              {transaction.status}
            </span>

            {!isManager &&
              (
                transaction.status ===
                  'draft' ||
                transaction.status ===
                  'returned'
              ) && (
                <Link
                  to={`/transactions/${transaction.id}/edit`}
                  className="rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
                >
                  Edit Transaction
                </Link>
              )}

            {!isManager &&
              transaction.status ===
                'draft' && (
                <button
                  type="button"
                  onClick={
                    handleSubmit
                  }
                  disabled={
                    submitting
                  }
                  className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting
                    ? 'Submitting...'
                    : 'Submit Transaction'}
                </button>
              )}

            {!isManager &&
              transaction.status ===
                'returned' && (
                <button
                  type="button"
                  onClick={
                    handleResubmit
                  }
                  disabled={
                    submitting
                  }
                  className="rounded-lg bg-orange-600 px-5 py-3 text-sm font-medium text-white hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting
                    ? 'Resubmitting...'
                    : 'Resubmit Transaction'}
                </button>
              )}

          </div>

        </div>

        {submitError && (
          <div className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
            {submitError}
          </div>
        )}

      </div>

      {/* Manager Actions */}

      {canReview && (
        <div className="mt-6 rounded-xl bg-white p-8 shadow dark:bg-gray-900">

          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Manager Actions
          </h2>

          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            This transaction is waiting for your review.
          </p>

          <div className="mt-6">

            <label
              htmlFor="manager-comment"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Comment
            </label>

            <textarea
              id="manager-comment"
              value={comment}
              onChange={(event) =>
                setComment(
                  event.target.value
                )
              }
              rows={4}
              placeholder="Write a comment..."
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-blue-400"
            />

          </div>

          <div className="mt-6 flex flex-wrap gap-3">

            <button
              type="button"
              onClick={
                handleApprove
              }
              disabled={
                submitting
              }
              className="rounded-lg bg-green-600 px-5 py-3 text-sm font-medium text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? 'Processing...'
                : 'Approve'}
            </button>

            <button
              type="button"
              onClick={
                handleReturn
              }
              disabled={
                submitting
              }
              className="rounded-lg bg-orange-600 px-5 py-3 text-sm font-medium text-white hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Return
            </button>

            <button
              type="button"
              onClick={
                handleReject
              }
              disabled={
                submitting
              }
              className="rounded-lg bg-red-600 px-5 py-3 text-sm font-medium text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Reject
            </button>

          </div>

        </div>
      )}

      {/* Main Content */}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">

        {/* Main Information */}

        <div className="lg:col-span-2">

          <div className="rounded-xl bg-white p-8 shadow dark:bg-gray-900">

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Transaction Details
            </h2>

            {/* Description */}

            <div className="mt-6">

              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Description
              </p>

              <p className="mt-2 whitespace-pre-wrap text-gray-900 dark:text-white">
                {
                  transaction.description ||
                  'No description'
                }
              </p>

            </div>

            {/* Transaction Type */}

            <div className="mt-6">

              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Transaction Type
              </p>

              <p className="mt-2 text-gray-900 dark:text-white">
                {
                  transaction
                    .transaction_type
                    ?.name_en ||
                  '—'
                }
              </p>

              {transaction
                .transaction_type
                ?.name_ar && (
                <p
                  dir="rtl"
                  className="mt-1 text-sm text-gray-500 dark:text-gray-400"
                >
                  {
                    transaction
                      .transaction_type
                      .name_ar
                  }
                </p>
              )}

            </div>

            {/* Priority */}

            <div className="mt-6">

              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Priority
              </p>

              <span
                className={`mt-2 inline-block rounded-full px-3 py-1 text-sm font-medium ${
                  transaction.priority ===
                  'high'
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                    : transaction.priority ===
                        'medium'
                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                      : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                }`}
              >
                {
                  transaction.priority
                }
              </span>

            </div>

          </div>

          {/* Dynamic Request Details */}

          {transaction.field_values?.length >
            0 && (
            <div className="mt-6 rounded-xl bg-white p-8 shadow dark:bg-gray-900">

              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Request Details
              </h2>

              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Information provided for this transaction type.
              </p>

              <div className="mt-6 grid gap-5 md:grid-cols-2">

                {transaction.field_values.map(
                  (fieldValue) => (
                    <div
                      key={
                        fieldValue.id
                      }
                      className={
                        fieldValue.field
                          ?.field_type ===
                          'textarea'
                          ? 'md:col-span-2'
                          : ''
                      }
                    >

                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {
                          fieldValue
                            .field
                            ?.name_en
                        }
                      </p>

                      <p className="mt-2 whitespace-pre-wrap text-gray-900 dark:text-white">
                        {formatFieldValue(
                          fieldValue
                        )}
                      </p>

                    </div>
                  )
                )}

              </div>

            </div>
          )}

          {/* Attachments */}

          {transaction.attachments?.length >
            0 && (
            <div className="mt-6 rounded-xl bg-white p-8 shadow dark:bg-gray-900">

              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Attachments
              </h2>

              <div className="mt-6 space-y-3">

                {transaction.attachments.map(
                  (attachment) => (
                    <div
                      key={
                        attachment.id
                      }
                      className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                    >

                      <div>

                        <p className="font-medium text-gray-900 dark:text-white">
                          {
                            attachment.original_name ||
                            attachment.name ||
                            'Attachment'
                          }
                        </p>

                        {attachment.file_size && (
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {
                              attachment.file_size
                            }{' '}
                            bytes
                          </p>
                        )}

                      </div>

                      {attachment.url && (
                        <a
                          href={
                            attachment.url
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Open
                        </a>
                      )}

                    </div>
                  )
                )}

              </div>

            </div>
          )}

        </div>

        {/* Side Information */}

        <div className="space-y-6">

          {/* Creator */}

          <div className="rounded-xl bg-white p-6 shadow dark:bg-gray-900">

            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Creator
            </h2>

            <div className="mt-4">

              <p className="font-medium text-gray-900 dark:text-white">
                {
                  transaction.creator
                    ?.name || '—'
                }
              </p>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {
                  transaction.creator
                    ?.job_title || '—'
                }
              </p>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {
                  transaction.creator
                    ?.department
                    ?.name || '—'
                }
              </p>

            </div>

          </div>

          {/* Departments */}

          <div className="rounded-xl bg-white p-6 shadow dark:bg-gray-900">

            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Departments
            </h2>

            <div className="mt-4 space-y-4">

              <div>

                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Source Department
                </p>

                <p className="mt-1 font-medium text-gray-900 dark:text-white">
                  {
                    transaction
                      .source_department
                      ?.name || '—'
                  }
                </p>

              </div>

              <div>

                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Destination Department
                </p>

                <p className="mt-1 font-medium text-gray-900 dark:text-white">
                  {
                    transaction
                      .destination_department
                      ?.name || '—'
                  }
                </p>

              </div>

              <div>

                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Current Department
                </p>

                <p className="mt-1 font-medium text-gray-900 dark:text-white">
                  {
                    transaction
                      .current_department
                      ?.name || '—'
                  }
                </p>

              </div>

            </div>

          </div>

          {/* Current Workflow Step */}

          <div className="rounded-xl bg-white p-6 shadow dark:bg-gray-900">

            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Current Workflow Step
            </h2>

            {transaction.current_workflow_step ? (
              <div className="mt-4">

                <p className="font-medium text-gray-900 dark:text-white">
                  {
                    transaction
                      .current_workflow_step
                      .name
                  }
                </p>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Step{' '}
                  {
                    transaction
                      .current_workflow_step
                      .step_order
                  }
                </p>

                <span
                  className={`mt-3 inline-block rounded-full px-3 py-1 text-sm font-medium ${
                    transaction
                      .current_workflow_step
                      .status ===
                    'pending'
                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                      : transaction
                            .current_workflow_step
                            .status ===
                          'approved'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        : transaction
                              .current_workflow_step
                              .status ===
                            'returned'
                          ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                          : transaction
                                .current_workflow_step
                                .status ===
                              'rejected'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                  }`}
                >
                  {
                    transaction
                      .current_workflow_step
                      .status
                  }
                </span>

              </div>
            ) : (
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                No active workflow step.
              </p>
            )}

          </div>

        </div>

      </div>

      {/* Workflow Progress */}

      <div className="mt-6 rounded-xl bg-white p-8 shadow dark:bg-gray-900">

        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Workflow Progress
        </h2>

        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Track the progress of this transaction through all workflow steps.
        </p>

        {transaction.workflow_steps?.length ? (
          <div className="mt-8">

            {transaction.workflow_steps.map(
              (step, index) => {
                const isLast =
                  index ===
                  transaction
                    .workflow_steps
                    .length -
                    1

                const colors =
                  getStepColor(
                    step.status
                  )

                return (
                  <div
                    key={step.id}
                    className="relative flex gap-4"
                  >

                    {!isLast && (
                      <div className="absolute left-4 top-8 h-full w-px bg-gray-200 dark:bg-gray-700" />
                    )}

                    <div
                      className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${colors.circle}`}
                    >
                      {
                        getStepIcon(
                          step.status
                        )
                      }
                    </div>

                    <div className="min-w-0 flex-1 pb-8">

                      <div className="flex flex-wrap items-center gap-2">

                        <p className="font-semibold text-gray-900 dark:text-white">
                          Step{' '}
                          {
                            step.step_order
                          }:{' '}
                          {
                            step.name
                          }
                        </p>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${colors.badge}`}
                        >
                          {
                            step.status
                          }
                        </span>

                      </div>

                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Department:{' '}
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {
                            step
                              .department
                              ?.name ||
                            '—'
                          }
                        </span>
                      </p>

                      {step.reviewer?.name && (
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                          Reviewed by:{' '}
                          <span className="font-medium text-gray-900 dark:text-white">
                            {
                              step
                                .reviewer
                                .name
                            }
                          </span>
                        </p>
                      )}

                      {step.comment && (
                        <div className="mt-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">

                          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                            Comment
                          </p>

                          <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                            {
                              step.comment
                            }
                          </p>

                        </div>
                      )}

                      {step.reviewed_at && (
                        <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
                          Reviewed:{' '}
                          {new Date(
                            step.reviewed_at
                          ).toLocaleString()}
                        </p>
                      )}

                      {step.status ===
                        'waiting' && (
                        <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
                          Waiting for the previous workflow step.
                        </p>
                      )}

                      {step.status ===
                        'pending' && (
                        <p className="mt-3 text-xs text-yellow-600 dark:text-yellow-400">
                          Waiting for this department's review.
                        </p>
                      )}

                    </div>

                  </div>
                )
              }
            )}

          </div>
        ) : (
          <div className="mt-6 rounded-lg bg-gray-50 p-6 text-center dark:bg-gray-800">

            <p className="text-sm text-gray-500 dark:text-gray-400">
              No workflow steps available.
            </p>

          </div>
        )}

      </div>

      {/* Timeline */}

      <div className="mt-6 rounded-xl bg-white p-8 shadow dark:bg-gray-900">

        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Timeline
        </h2>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

          <div>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Created
            </p>

            <p className="mt-1 text-gray-900 dark:text-white">
              {transaction.created_at
                ? new Date(
                    transaction.created_at
                  ).toLocaleString()
                : '—'}
            </p>

          </div>

          <div>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Submitted
            </p>

            <p className="mt-1 text-gray-900 dark:text-white">
              {transaction.submitted_at
                ? new Date(
                    transaction.submitted_at
                  ).toLocaleString()
                : '—'}
            </p>

          </div>

          <div>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Approved
            </p>

            <p className="mt-1 text-gray-900 dark:text-white">
              {transaction.approved_at
                ? new Date(
                    transaction.approved_at
                  ).toLocaleString()
                : '—'}
            </p>

          </div>

          <div>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Returned
            </p>

            <p className="mt-1 text-gray-900 dark:text-white">
              {transaction.returned_at
                ? new Date(
                    transaction.returned_at
                  ).toLocaleString()
                : '—'}
            </p>

          </div>

          <div>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Rejected
            </p>

            <p className="mt-1 text-gray-900 dark:text-white">
              {transaction.rejected_at
                ? new Date(
                    transaction.rejected_at
                  ).toLocaleString()
                : '—'}
            </p>

          </div>

          <div>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Completed
            </p>

            <p className="mt-1 text-gray-900 dark:text-white">
              {transaction.completed_at
                ? new Date(
                    transaction.completed_at
                  ).toLocaleString()
                : '—'}
            </p>

          </div>

        </div>

      </div>

    </div>
  )
}

export default TransactionDetails
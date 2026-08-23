import { useEffect, useState } from 'react'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { useAuth } from '../context/AuthContext'
import api from '../services/api'

import {
  profileSchema,
  changePasswordSchema,
} from '../schemas/profile.schema'

function Profile() {
  // ==================================================
  // Auth user
  // ==================================================

  const {
    user: authUser,
    loading: authLoading,
  } = useAuth()

  const [user, setUser] =
    useState(authUser)

  // ==================================================
  // UI state
  // ==================================================

  const [savingProfile, setSavingProfile] =
    useState(false)

  const [savingPassword, setSavingPassword] =
    useState(false)

  const [profileMessage, setProfileMessage] =
    useState('')

  const [profileError, setProfileError] =
    useState('')

  const [passwordMessage, setPasswordMessage] =
    useState('')

  const [passwordError, setPasswordError] =
    useState('')

  // ==================================================
  // Keep local profile in sync with AuthContext
  // ==================================================

  useEffect(() => {
    if (!authUser) {
      return
    }

    setUser(authUser)

    resetProfile({
      name: authUser.name || '',
      phone: authUser.phone || '',
      job_title: authUser.job_title || '',
    })
  }, [authUser])

  // ==================================================
  // Profile Form
  // ==================================================

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    reset: resetProfile,
    setError: setProfileFieldError,
    formState: {
      errors: profileErrors,
    },
  } = useForm({
    resolver:
      zodResolver(
        profileSchema
      ),

    defaultValues: {
      name: '',
      phone: '',
      job_title: '',
    },
  })

  // ==================================================
  // Password Form
  // ==================================================

  const {
    register: registerPassword,
    handleSubmit:
      handleSubmitPassword,
    reset: resetPassword,
    setError:
      setPasswordFieldError,
    formState: {
      errors: passwordErrors,
    },
  } = useForm({
    resolver:
      zodResolver(
        changePasswordSchema
      ),

    defaultValues: {
      current_password: '',
      password: '',
      password_confirmation: '',
    },
  })

  // ==================================================
  // Server Error Helper
  // ==================================================

  const applyServerErrors = (
    backendErrors,
    setFieldError
  ) => {
    if (!backendErrors) {
      return false
    }

    Object.entries(
      backendErrors
    ).forEach(
      ([field, messages]) => {
        const message =
          Array.isArray(messages)
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

    return true
  }

  // ==================================================
  // Save Profile
  // ==================================================

  const onProfileSubmit =
    async (data) => {
      setSavingProfile(true)

      setProfileMessage('')
      setProfileError('')

      try {
        const response =
          await api.patch(
            '/auth/me',
            {
              name:
                data.name.trim(),

              phone:
                data.phone?.trim() ||
                null,

              job_title:
                data.job_title
                  ?.trim() ||
                null,
            }
          )

        const updatedUser =
          response.data.data

        setUser(updatedUser)

        resetProfile({
          name:
            updatedUser.name ||
            '',

          phone:
            updatedUser.phone ||
            '',

          job_title:
            updatedUser.job_title ||
            '',
        })

        setProfileMessage(
          response.data.message ||
            'Profile updated successfully.'
        )
      } catch (error) {
        console.error(
          'Profile update error:',
          error.response?.data ||
            error
        )

        const handled =
          applyServerErrors(
            error.response?.data
              ?.errors,
            setProfileFieldError
          )

        if (handled) {
          setProfileError(
            error.response?.data
              ?.message ||
              'Please correct the highlighted fields.'
          )
        } else {
          setProfileError(
            error.response?.data
              ?.message ||
              'Unable to update profile.'
          )
        }
      } finally {
        setSavingProfile(false)
      }
    }

  // ==================================================
  // Change Password
  // ==================================================

  const onPasswordSubmit =
    async (data) => {
      setSavingPassword(true)

      setPasswordMessage('')
      setPasswordError('')

      try {
        const response =
          await api.patch(
            '/auth/password',
            {
              current_password:
                data.current_password,

              password:
                data.password,

              password_confirmation:
                data.password_confirmation,
            }
          )

        resetPassword()

        setPasswordMessage(
          response.data.message ||
            'Password changed successfully.'
        )
      } catch (error) {
        console.error(
          'Password update error:',
          error.response?.data ||
            error
        )

        const handled =
          applyServerErrors(
            error.response?.data
              ?.errors,
            setPasswordFieldError
          )

        if (handled) {
          setPasswordError(
            error.response?.data
              ?.message ||
              'Please correct the highlighted fields.'
          )
        } else {
          setPasswordError(
            error.response?.data
              ?.message ||
              'Unable to change password.'
          )
        }
      } finally {
        setSavingPassword(false)
      }
    }

  // ==================================================
  // Loading
  // ==================================================

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 md:p-8 dark:bg-gray-950">

        <div className="rounded-xl bg-white p-8 shadow-sm dark:bg-gray-900">

          <p className="text-gray-500 dark:text-gray-400">
            Loading profile...
          </p>

        </div>

      </div>
    )
  }

  // ==================================================
  // No user
  // ==================================================

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 md:p-8 dark:bg-gray-950">

        <div className="rounded-xl bg-red-50 p-5 text-red-700 dark:bg-red-950/40 dark:text-red-300">
          Unable to load profile.
        </div>

      </div>
    )
  }

  // ==================================================
  // Labels
  // ==================================================

  const roleLabel = {
    admin: 'Admin',
    manager: 'Manager',
    employee: 'Employee',
  }

  const statusLabel = {
    active: 'Active',
    inactive: 'Inactive',
  }

  // ==================================================
  // Render
  // ==================================================

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8 dark:bg-gray-950">

      {/* ==================================================
          Header
          ================================================== */}

      <div className="mb-8">

        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Account
        </p>

        <h1 className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
          My Profile
        </h1>

        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          View and manage your personal account information.
        </p>

      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

        {/* ==================================================
            Personal Information
            ================================================== */}

        <div className="xl:col-span-2 rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900">

          <div className="mb-6">

            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Personal Information
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Update the information you can edit.
            </p>

          </div>

          {profileMessage && (
            <div className="mb-5 rounded-lg bg-green-50 p-4 text-sm text-green-700 dark:bg-green-950/30 dark:text-green-300">
              {profileMessage}
            </div>
          )}

          {profileError && (
            <div className="mb-5 rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
              {profileError}
            </div>
          )}

          <form
            onSubmit={handleSubmitProfile(
              onProfileSubmit
            )}
            noValidate
            className="space-y-5"
          >

            {/* Name */}

            <div>

              <label
                htmlFor="profile-name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Name
              </label>

              <input
                id="profile-name"
                type="text"
                autoComplete="name"
                {...registerProfile(
                  'name'
                )}
                className={`mt-2 w-full rounded-lg border bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-900/30 ${
                  profileErrors.name
                    ? 'border-red-400 dark:border-red-500'
                    : 'border-gray-300 dark:border-gray-700'
                }`}
              />

              {profileErrors.name && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {
                    profileErrors
                      .name.message
                  }
                </p>
              )}

            </div>

            {/* Email */}

            <div>

              <label
                htmlFor="profile-email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Email
              </label>

              <input
                id="profile-email"
                type="email"
                value={
                  user.email || ''
                }
                disabled
                className="mt-2 w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
              />

              <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                Email cannot be changed from your profile.
              </p>

            </div>

            {/* Phone */}

            <div>

              <label
                htmlFor="profile-phone"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Phone
              </label>

              <input
                id="profile-phone"
                type="tel"
                autoComplete="tel"
                {...registerProfile(
                  'phone'
                )}
                className={`mt-2 w-full rounded-lg border bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-900/30 ${
                  profileErrors.phone
                    ? 'border-red-400 dark:border-red-500'
                    : 'border-gray-300 dark:border-gray-700'
                }`}
              />

              {profileErrors.phone && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {
                    profileErrors
                      .phone.message
                  }
                </p>
              )}

            </div>

            {/* Job Title */}

            <div>

              <label
                htmlFor="profile-job-title"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Job Title
              </label>

              <input
                id="profile-job-title"
                type="text"
                {...registerProfile(
                  'job_title'
                )}
                className={`mt-2 w-full rounded-lg border bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-900/30 ${
                  profileErrors.job_title
                    ? 'border-red-400 dark:border-red-500'
                    : 'border-gray-300 dark:border-gray-700'
                }`}
              />

              {profileErrors.job_title && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {
                    profileErrors
                      .job_title
                      .message
                  }
                </p>
              )}

            </div>

            {/* Save */}

            <div className="pt-2">

              <button
                type="submit"
                disabled={
                  savingProfile
                }
                className="rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingProfile
                  ? 'Saving...'
                  : 'Save Changes'}
              </button>

            </div>

          </form>

        </div>

        {/* ==================================================
            Work Information
            ================================================== */}

        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900">

          <div className="mb-6">

            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Work Information
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Account and organization details.
            </p>

          </div>

          <div className="space-y-4">

            {/* Role */}

            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">

              <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                Role
              </p>

              <p className="mt-1 font-medium text-gray-900 dark:text-white">
                {roleLabel[
                  user.role
                ] ||
                  user.role ||
                  '—'}
              </p>

            </div>

            {/* Status */}

            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">

              <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                Status
              </p>

              <span
                className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                  user.status ===
                  'active'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                    : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {statusLabel[
                  user.status
                ] ||
                  user.status ||
                  '—'}
              </span>

            </div>

            {/* Department */}

            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">

              <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                Department
              </p>

              <p className="mt-1 font-medium text-gray-900 dark:text-white">
                {user.department?.name ||
                  'No department'}
              </p>

            </div>

            {/* Leave */}

            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">

              <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                Annual Leave
              </p>

              <div className="mt-2 flex items-end gap-2">

                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {
                    user.annual_leave_days ??
                    0
                  }
                </span>

                <span className="pb-1 text-sm text-gray-500 dark:text-gray-400">
                  days
                </span>

              </div>

              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Used:{' '}
                {
                  user.used_leave_days ??
                  0
                }{' '}
                days
              </p>

            </div>

          </div>

        </div>

        {/* ==================================================
            Change Password
            ================================================== */}

        <div className="xl:col-span-3 rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900">

          <div className="mb-6">

            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Change Password
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Update your password regularly to keep your account secure.
            </p>

          </div>

          {passwordMessage && (
            <div className="mb-5 rounded-lg bg-green-50 p-4 text-sm text-green-700 dark:bg-green-950/30 dark:text-green-300">
              {passwordMessage}
            </div>
          )}

          {passwordError && (
            <div className="mb-5 rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
              {passwordError}
            </div>
          )}

          <form
            onSubmit={handleSubmitPassword(
              onPasswordSubmit
            )}
            noValidate
            className="grid grid-cols-1 gap-5 md:grid-cols-3"
          >

            {/* Current Password */}

            <div>

              <label
                htmlFor="current-password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Current Password
              </label>

              <input
                id="current-password"
                type="password"
                autoComplete="current-password"
                {...registerPassword(
                  'current_password'
                )}
                className={`mt-2 w-full rounded-lg border bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-900/30 ${
                  passwordErrors.current_password
                    ? 'border-red-400 dark:border-red-500'
                    : 'border-gray-300 dark:border-gray-700'
                }`}
              />

              {passwordErrors.current_password && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {
                    passwordErrors
                      .current_password
                      .message
                  }
                </p>
              )}

            </div>

            {/* New Password */}

            <div>

              <label
                htmlFor="new-password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                New Password
              </label>

              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                {...registerPassword(
                  'password'
                )}
                className={`mt-2 w-full rounded-lg border bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-900/30 ${
                  passwordErrors.password
                    ? 'border-red-400 dark:border-red-500'
                    : 'border-gray-300 dark:border-gray-700'
                }`}
              />

              {passwordErrors.password && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {
                    passwordErrors
                      .password.message
                  }
                </p>
              )}

            </div>

            {/* Confirmation */}

            <div>

              <label
                htmlFor="password-confirmation"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Confirm New Password
              </label>

              <input
                id="password-confirmation"
                type="password"
                autoComplete="new-password"
                {...registerPassword(
                  'password_confirmation'
                )}
                className={`mt-2 w-full rounded-lg border bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-900/30 ${
                  passwordErrors
                    .password_confirmation
                    ? 'border-red-400 dark:border-red-500'
                    : 'border-gray-300 dark:border-gray-700'
                }`}
              />

              {passwordErrors
                .password_confirmation && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {
                    passwordErrors
                      .password_confirmation
                      .message
                  }
                </p>
              )}

            </div>

            {/* Button */}

            <div className="md:col-span-3">

              <button
                type="submit"
                disabled={
                  savingPassword
                }
                className="rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingPassword
                  ? 'Updating Password...'
                  : 'Change Password'}
              </button>

            </div>

          </form>

        </div>

      </div>

    </div>
  )
}

export default Profile
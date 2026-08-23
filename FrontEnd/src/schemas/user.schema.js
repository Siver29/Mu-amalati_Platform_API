import { z } from 'zod'

// ==================================================
// Base User Schema
// ==================================================

const baseUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(
      1,
      'Please enter the user name.'
    )
    .max(
      255,
      'Name must not exceed 255 characters.'
    ),

  email: z
    .string()
    .trim()
    .email(
      'Please enter a valid email address.'
    )
    .max(
      255,
      'Email must not exceed 255 characters.'
    ),

  phone: z
    .string()
    .trim()
    .max(
      30,
      'Phone must not exceed 30 characters.'
    )
    .optional()
    .or(z.literal('')),

  job_title: z
    .string()
    .trim()
    .max(
      255,
      'Job title must not exceed 255 characters.'
    )
    .optional()
    .or(z.literal('')),

  role: z.enum([
    'employee',
    'manager',
    'admin',
  ]),

  department_id: z
    .string()
    .optional()
    .or(z.literal('')),

  status: z.enum([
    'active',
    'inactive',
  ]),

  annual_leave_days: z
    .coerce
    .number()
    .int()
    .min(
      0,
      'Annual leave days cannot be negative.'
    )
    .max(
      365,
      'Annual leave days cannot exceed 365.'
    ),

  used_leave_days: z
    .coerce
    .number()
    .int()
    .min(
      0,
      'Used leave days cannot be negative.'
    ),
})

// ==================================================
// Create User Schema
// ==================================================

export const createUserSchema =
  baseUserSchema
    .extend({
      password: z
        .string()
        .min(
          8,
          'Password must be at least 8 characters.'
        ),

      password_confirmation:
        z.string(),
    })
    .refine(
      (data) =>
        data.password ===
        data.password_confirmation,
      {
        path: [
          'password_confirmation',
        ],
        message:
          'Password confirmation does not match.',
      }
    )
    .refine(
      (data) => {
        if (
          data.role === 'employee' ||
          data.role === 'manager'
        ) {
          return Boolean(
            data.department_id
          )
        }

        return true
      },
      {
        path: [
          'department_id',
        ],
        message:
          'Please select a department for this role.',
      }
    )
    .refine(
      (data) =>
        data.used_leave_days <=
        data.annual_leave_days,
      {
        path: [
          'used_leave_days',
        ],
        message:
          'Used leave days cannot exceed annual leave days.',
      }
    )

// ==================================================
// Edit User Schema
// ==================================================

export const editUserSchema =
  baseUserSchema
    .extend({
      password: z
        .string()
        .optional()
        .or(z.literal('')),

      password_confirmation:
        z
          .string()
          .optional()
          .or(z.literal('')),
    })
    .refine(
      (data) => {
        if (
          !data.password
        ) {
          return true
        }

        return (
          data.password.length >= 8
        )
      },
      {
        path: [
          'password',
        ],
        message:
          'Password must be at least 8 characters.',
      }
    )
    .refine(
      (data) => {
        if (
          !data.password
        ) {
          return true
        }

        return (
          data.password ===
          data.password_confirmation
        )
      },
      {
        path: [
          'password_confirmation',
        ],
        message:
          'Password confirmation does not match.',
      }
    )
    .refine(
      (data) => {
        if (
          data.role === 'employee' ||
          data.role === 'manager'
        ) {
          return Boolean(
            data.department_id
          )
        }

        return true
      },
      {
        path: [
          'department_id',
        ],
        message:
          'Please select a department for this role.',
      }
    )
    .refine(
      (data) =>
        data.used_leave_days <=
        data.annual_leave_days,
      {
        path: [
          'used_leave_days',
        ],
        message:
          'Used leave days cannot exceed annual leave days.',
      }
    )
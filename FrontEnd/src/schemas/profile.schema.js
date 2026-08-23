import { z } from 'zod'

// ==================================================
// Profile Information
// ==================================================

export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(
      1,
      'Please enter your name.'
    )
    .max(
      255,
      'Name must not exceed 255 characters.'
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
})

// ==================================================
// Change Password
// ==================================================

export const changePasswordSchema =
  z
    .object({
      current_password: z
        .string()
        .min(
          1,
          'Please enter your current password.'
        ),

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
          'New password and confirmation do not match.',
      }
    )
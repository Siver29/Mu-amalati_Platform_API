import { z } from 'zod'

// ==================================================
// Create Transaction Type
// ==================================================

export const createTransactionTypeSchema =
  z.object({
    name_en: z
      .string()
      .trim()
      .min(
        1,
        'Please enter the English name.'
      )
      .max(
        255,
        'English name must not exceed 255 characters.'
      ),

    name_ar: z
      .string()
      .trim()
      .min(
        1,
        'Please enter the Arabic name.'
      )
      .max(
        255,
        'Arabic name must not exceed 255 characters.'
      ),

    description: z
      .string()
      .trim()
      .max(
        5000,
        'Description must not exceed 5000 characters.'
      )
      .optional()
      .or(z.literal('')),

    destination_department_id:
      z
        .string()
        .min(
          1,
          'Please select a destination department.'
        ),

    requires_attachment:
      z.boolean(),

    is_active:
      z.boolean(),
  })

// ==================================================
// Edit Transaction Type
// ==================================================

export const editTransactionTypeSchema =
  z.object({
    name_en: z
      .string()
      .trim()
      .min(
        1,
        'Please enter the English name.'
      )
      .max(
        255,
        'English name must not exceed 255 characters.'
      ),

    name_ar: z
      .string()
      .trim()
      .min(
        1,
        'Please enter the Arabic name.'
      )
      .max(
        255,
        'Arabic name must not exceed 255 characters.'
      ),

    description: z
      .string()
      .trim()
      .max(
        5000,
        'Description must not exceed 5000 characters.'
      )
      .optional()
      .or(z.literal('')),

    destination_department_id:
      z
        .string()
        .min(
          1,
          'Please select a destination department.'
        ),

    requires_attachment:
      z.boolean(),

    is_active:
      z.boolean(),
  })
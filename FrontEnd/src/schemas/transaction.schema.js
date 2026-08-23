import { z } from 'zod'

export const createTransactionSchema =
  z.object({
    transaction_type_id: z
      .string()
      .min(
        1,
        'Please select a transaction type.'
      ),

    title: z
      .string()
      .trim()
      .min(
        1,
        'Please enter a transaction title.'
      )
      .max(
        255,
        'Title must not exceed 255 characters.'
      ),

    description: z
      .string()
      .trim()
      .min(
        1,
        'Please enter a description.'
      )
      .max(
        5000,
        'Description must not exceed 5000 characters.'
      ),

    priority: z.enum([
      'low',
      'medium',
      'high',
    ]),

    start_date: z
      .string()
      .optional()
      .or(z.literal('')),

    end_date: z
      .string()
      .optional()
      .or(z.literal('')),
  })
  .superRefine(
    (data, ctx) => {
      if (
        data.start_date &&
        data.end_date &&
        new Date(data.end_date) <
          new Date(data.start_date)
      ) {
        ctx.addIssue({
          code: 'custom',
          path: ['end_date'],
          message:
            'Leave end date cannot be before the start date.',
        })
      }
    }
  )
  export const editTransactionSchema =
  z
    .object({
      title: z
        .string()
        .trim()
        .min(
          1,
          'Please enter a transaction title.'
        )
        .max(
          255,
          'Title must not exceed 255 characters.'
        ),

      description: z
        .string()
        .trim()
        .min(
          1,
          'Please enter a description.'
        )
        .max(
          5000,
          'Description must not exceed 5000 characters.'
        ),

      priority: z.enum([
        'low',
        'medium',
        'high',
      ]),

      start_date: z
        .string()
        .optional()
        .or(z.literal('')),

      end_date: z
        .string()
        .optional()
        .or(z.literal('')),
    })
    .superRefine(
      (data, ctx) => {
        if (
          data.start_date &&
          data.end_date &&
          new Date(data.end_date) <
            new Date(data.start_date)
        ) {
          ctx.addIssue({
            code: 'custom',
            path: ['end_date'],
            message:
              'Leave end date cannot be before the start date.',
          })
        }
      }
    )
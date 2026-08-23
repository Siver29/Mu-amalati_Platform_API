import { z } from 'zod'

export const transactionTypeFieldSchema =
  z
    .object({
      name_en: z
        .string()
        .trim()
        .min(
          1,
          'Please enter the field name.'
        )
        .max(
          255,
          'Field name must not exceed 255 characters.'
        ),

      field_type: z.enum([
        'text',
        'textarea',
        'number',
        'date',
        'datetime',
        'select',
        'radio',
        'checkbox',
        'file',
        'currency',
        'email',
        'phone',
      ]),

      is_required: z.boolean(),

      placeholder_en: z
        .string()
        .trim()
        .max(
          255,
          'Placeholder must not exceed 255 characters.'
        )
        .optional()
        .or(z.literal('')),

      placeholder_ar: z
        .string()
        .trim()
        .max(
          255,
          'Arabic placeholder must not exceed 255 characters.'
        )
        .optional()
        .or(z.literal('')),

      options: z.array(
        z
          .string()
          .trim()
          .max(
            255,
            'Option must not exceed 255 characters.'
          )
      ),

      field_order: z.coerce
        .number({
          message:
            'Field order must be a number.',
        })
        .int(
          'Field order must be a whole number.'
        )
        .min(
          1,
          'Field order must be at least 1.'
        ),
    })
    .superRefine(
      (data, ctx) => {
        const needsOptions =
          data.field_type === 'select' ||
          data.field_type === 'radio'

        if (!needsOptions) {
          return
        }

        const validOptions =
          data.options.filter(
            (option) =>
              option.trim() !== ''
          )

        if (
          validOptions.length === 0
        ) {
          ctx.addIssue({
            code: 'custom',
            path: ['options'],
            message:
              'Please add at least one option.',
          })
        }
      }
    )

export const transactionTypeFieldDefaultValues =
  {
    name_en: '',
    field_type: 'text',
    is_required: false,
    placeholder_en: '',
    placeholder_ar: '',
    options: [''],
    field_order: 1,
  }
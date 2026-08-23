import { z } from 'zod'

/**
 * Build a Zod schema for one dynamic field.
 *
 * The field object is expected to contain:
 * - id
 * - field_type
 * - is_required
 * - name_en
 * - options
 */
export function buildDynamicFieldSchema(field) {
  const label =
    field.name_en || 'This field'

  const required =
    Boolean(field.is_required)

  switch (field.field_type) {
    // --------------------------------------------------
    // Text
    // --------------------------------------------------

    case 'text':
      return required
        ? z
            .string()
            .trim()
            .min(
              1,
              `${label} is required.`
            )
        : z
            .string()
            .optional()
            .or(z.literal(''))

    // --------------------------------------------------
    // Textarea
    // --------------------------------------------------

    case 'textarea':
      return required
        ? z
            .string()
            .trim()
            .min(
              1,
              `${label} is required.`
            )
        : z
            .string()
            .optional()
            .or(z.literal(''))

    // --------------------------------------------------
    // Email
    // --------------------------------------------------

    case 'email':
      return required
        ? z
            .string()
            .trim()
            .min(
              1,
              `${label} is required.`
            )
            .email(
              `${label} must be a valid email address.`
            )
        : z
            .string()
            .trim()
            .email(
              `${label} must be a valid email address.`
            )
            .optional()
            .or(z.literal(''))

    // --------------------------------------------------
    // Phone
    // --------------------------------------------------

    case 'phone':
      return required
        ? z
            .string()
            .trim()
            .min(
              1,
              `${label} is required.`
            )
        : z
            .string()
            .optional()
            .or(z.literal(''))

    // --------------------------------------------------
    // Number
    // --------------------------------------------------

    case 'number':
      return required
        ? z
            .coerce
            .number({
              message: `${label} must be a number.`,
            })
        : z
            .union([
              z.coerce.number(),
              z.literal(''),
            ])
            .optional()

    // --------------------------------------------------
    // Currency
    // --------------------------------------------------

    case 'currency':
      return required
        ? z
            .coerce
            .number({
              message: `${label} must be a valid amount.`,
            })
            .min(
              0,
              `${label} cannot be negative.`
            )
        : z
            .union([
              z.coerce
                .number()
                .min(
                  0,
                  `${label} cannot be negative.`
                ),
              z.literal(''),
            ])
            .optional()

    // --------------------------------------------------
    // Date
    // --------------------------------------------------

    case 'date':
      return required
        ? z
            .string()
            .min(
              1,
              `${label} is required.`
            )
        : z
            .string()
            .optional()
            .or(z.literal(''))

    // --------------------------------------------------
    // Datetime
    // --------------------------------------------------

    case 'datetime':
      return required
        ? z
            .string()
            .min(
              1,
              `${label} is required.`
            )
        : z
            .string()
            .optional()
            .or(z.literal(''))

    // --------------------------------------------------
    // Select
    // --------------------------------------------------

    case 'select': {
      const options = Array.isArray(
        field.options
      )
        ? field.options.map(String)
        : []

      if (required) {
        return z
          .string()
          .trim()
          .min(
            1,
            `${label} is required.`
          )
          .refine(
            (value) =>
              options.length === 0 ||
              options.includes(value),
            {
              message: `${label} contains an invalid option.`,
            }
          )
      }

      return z
        .string()
        .optional()
        .or(z.literal(''))
        .refine(
          (value) =>
            !value ||
            options.length === 0 ||
            options.includes(value),
          {
            message: `${label} contains an invalid option.`,
          }
        )
    }

    // --------------------------------------------------
    // Radio
    // --------------------------------------------------

    case 'radio': {
      const options = Array.isArray(
        field.options
      )
        ? field.options.map(String)
        : []

      if (required) {
        return z
          .string()
          .min(
            1,
            `${label} is required.`
          )
          .refine(
            (value) =>
              options.length === 0 ||
              options.includes(value),
            {
              message: `${label} contains an invalid option.`,
            }
          )
      }

      return z
        .string()
        .optional()
        .or(z.literal(''))
        .refine(
          (value) =>
            !value ||
            options.length === 0 ||
            options.includes(value),
          {
            message: `${label} contains an invalid option.`,
          }
        )
    }

    // --------------------------------------------------
    // Checkbox
    // --------------------------------------------------

    case 'checkbox':
      return required
        ? z.literal(true, {
            error:
              `${label} must be accepted.`,
          })
        : z.boolean().optional()

    // --------------------------------------------------
    // File
    // --------------------------------------------------

    case 'file':
      /*
       * File validation is handled slightly
       * differently by Create/Edit because:
       *
       * Create:
       *   no existing file
       *   required => new File required
       *
       * Edit:
       *   existing attachment may already satisfy
       *   the required field
       *
       * Therefore the base schema only accepts:
       * File | null | undefined | existing attachment marker.
       */
      return z
        .unknown()
        .optional()

    // --------------------------------------------------
    // Fallback
    // --------------------------------------------------

    default:
      return required
        ? z
            .string()
            .trim()
            .min(
              1,
              `${label} is required.`
            )
        : z
            .string()
            .optional()
            .or(z.literal(''))
  }
}

/**
 * Build a complete object schema from
 * the transaction's dynamic fields.
 */
export function buildDynamicFieldsSchema(
  fields
) {
  const shape = {}

  for (const field of fields || []) {
    shape[String(field.id)] =
      buildDynamicFieldSchema(field)
  }

  return z.object(shape)
}
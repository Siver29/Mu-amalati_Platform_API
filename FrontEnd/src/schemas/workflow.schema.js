import { z } from 'zod'

export const workflowStepSchema = z.object({
  department_id: z
    .string()
    .min(
      1,
      'Please select a department.'
    ),

  name: z
    .string()
    .trim()
    .min(
      1,
      'Please enter the workflow step name.'
    )
    .max(
      255,
      'Workflow step name must not exceed 255 characters.'
    ),

  step_order: z.coerce
    .number({
      message:
        'Step order must be a number.',
    })
    .int(
      'Step order must be a whole number.'
    )
    .min(
      1,
      'Step order must be at least 1.'
    ),

  is_final: z.boolean(),
})
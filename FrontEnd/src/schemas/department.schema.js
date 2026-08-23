import { z } from 'zod'

const baseDepartmentSchema = z.object({
  name: z
    .string()
    .trim()
    .min(
      1,
      'Please enter the department name.'
    )
    .max(
      255,
      'Department name must not exceed 255 characters.'
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

  manager_id: z
    .string()
    .optional()
    .or(z.literal('')),

  is_active: z.boolean(),
})

export const createDepartmentSchema =
  baseDepartmentSchema

export const editDepartmentSchema =
  baseDepartmentSchema
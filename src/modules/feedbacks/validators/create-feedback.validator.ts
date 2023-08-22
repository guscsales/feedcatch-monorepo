import { ValidatorErrors } from '@/helpers/validators/validator-errors';
import { FeedbackTypes } from '@prisma/client';
import { z } from 'zod';

export const createFeedbackValidator = z.object({
  'fc-project-id': z.string(),
  content: z.string({ required_error: ValidatorErrors.RequiredField }),
  userEmail: z
    .string({ required_error: ValidatorErrors.RequiredField })
    .email({ message: ValidatorErrors.InvalidEmail })
    .optional()
    .nullable(),
  type: z.nativeEnum(FeedbackTypes, {
    required_error: ValidatorErrors.RequiredField,
  }),
});

import { ValidatorErrors } from '@/helpers/validators/validator-errors';
import { z } from 'zod';

export const updateProjectValidator = z.object({
  name: z.string({ required_error: ValidatorErrors.RequiredField }),
});

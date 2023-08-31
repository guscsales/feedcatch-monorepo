import { ValidatorErrors } from '@services/src/app/helpers/validators/validator-errors';
import { z } from 'zod';

export const createProjectValidator = z.object({
  name: z.string({ required_error: ValidatorErrors.RequiredField }),
});

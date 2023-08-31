import { ValidatorErrors } from '@services/src/app/helpers/validators/validator-errors';
import { z } from 'zod';

export const authenticateFromMagicLinkValidator = z.object({
  token: z.string({ required_error: ValidatorErrors.RequiredField }),
});

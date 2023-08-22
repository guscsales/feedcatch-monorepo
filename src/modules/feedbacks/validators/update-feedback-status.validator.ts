import { ValidatorErrors } from '@/helpers/validators/validator-errors';
import { FeedbackStatuses } from '@prisma/client';
import { z } from 'zod';

export const updateFeedbackStatusValidator = z.object({
  'fc-project-id': z.string(),
  status: z.nativeEnum(FeedbackStatuses, {
    required_error: ValidatorErrors.RequiredField,
  }),
});

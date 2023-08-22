import { z } from 'zod';

export const searchFeedbacksValidator = z.object({
  startDate: z.coerce.date().nullable().optional().or(z.literal('')),
  endDate: z.coerce.date().nullable().optional().or(z.literal('')),
  'fc-project-id': z.string(),
});

import { z } from 'zod';

export const createCheckoutSessionValidator = z.object({
  successURL: z.string().url(),
});

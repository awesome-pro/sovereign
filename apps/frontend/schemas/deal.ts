import * as z from 'zod';

export const relatedDealSchema = z.object({
  id: z.string(),
  referenceNumber: z.string(),
  title: z.string(),
});
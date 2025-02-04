import * as z from 'zod';

export const relatedLeadSchema = z.object({
  id: z.string(),
  referenceNumber: z.string(),
  title: z.string(),
});
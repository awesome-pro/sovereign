import * as z from 'zod';

export const relatedPropertySchema = z.object({
  id: z.string(),
  referenceNumber: z.string(),
  title: z.string(),
});
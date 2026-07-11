import { z } from 'zod';

export const customRequestSchema = z.object({
  type:    z.enum(['note', 'homework', 'pyq', 'topper_note']),
  subject: z.string().min(1, 'Subject is required'),
  chapter: z.string().min(1, 'Chapter is required'),
  note:    z.string().max(500, 'Keep the note under 500 characters'),
});

export type CustomRequestFormData = z.infer<typeof customRequestSchema>;

import { z } from 'zod';

export const newDiscussionSchema = z.object({
  subject: z.string().min(1, 'Subject is required').max(50, 'Subject is too long'),
  title:   z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title is too long'),
  body:    z.string().min(10, 'Please write a bit more to explain your question').max(2000, 'Body is too long'),
});

export type NewDiscussionFormData = z.infer<typeof newDiscussionSchema>;

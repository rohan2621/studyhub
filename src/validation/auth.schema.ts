import { z } from 'zod';

export const loginSchema = z.object({
  email:    z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const signupSchema = z.object({
  name:      z.string().min(2, 'Name must be at least 2 characters'),
  email:     z.string().email('Enter a valid email address'),
  password:  z.string().min(8, 'Password must be at least 8 characters'),
  school_id: z.string().min(1, 'Please select your school'),
  grade:     z.string().min(1, 'Please enter your grade / class'),
  role:      z.literal('student'),
});

export type LoginFormData  = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;

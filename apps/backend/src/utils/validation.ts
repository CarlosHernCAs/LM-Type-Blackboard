import { z } from 'zod';

// User validation schemas
export const registerSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['student', 'teacher', 'admin', 'parent']),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  phone: z.string().optional(),
  date_of_birth: z.string().datetime().optional(),
  address: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

// Course validation schemas
export const createCourseSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  code: z.string().min(1),
  credits: z.number().int().positive().optional(),
  max_students: z.number().int().positive().optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
});

export const updateCourseSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  credits: z.number().int().positive().optional(),
  max_students: z.number().int().positive().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  thumbnail_url: z.string().url().optional(),
});

// Assignment validation schemas
export const createAssignmentSchema = z.object({
  course_id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(['homework', 'quiz', 'exam', 'project']),
  max_score: z.number().positive(),
  due_date: z.string().datetime().optional(),
});

export const updateAssignmentSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  type: z.enum(['homework', 'quiz', 'exam', 'project']).optional(),
  max_score: z.number().positive().optional(),
  due_date: z.string().datetime().optional(),
  is_published: z.boolean().optional(),
});

// Message validation schemas
export const createMessageSchema = z.object({
  recipientId: z.string().uuid(),
  subject: z.string().optional(),
  content: z.string().min(1),
});

// Calendar validation schemas
export const createCalendarEventSchema = z.object({
  courseId: z.string().uuid().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  eventType: z.enum(['class', 'exam', 'assignment', 'meeting', 'holiday']),
  startTime: z.string(),
  endTime: z.string(),
  location: z.string().optional(),
  isAllDay: z.boolean().optional(),
});

export const updateCalendarEventSchema = z.object({
  courseId: z.string().uuid().optional(),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  eventType: z.enum(['class', 'exam', 'assignment', 'meeting', 'holiday']).optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  location: z.string().optional(),
  isAllDay: z.boolean().optional(),
});

// Enrollment validation schemas
export const createEnrollmentSchema = z.object({
  courseId: z.string().uuid(),
});

// Utility function to validate request body
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

// Utility function to validate request body and return errors
export function validateSafe<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

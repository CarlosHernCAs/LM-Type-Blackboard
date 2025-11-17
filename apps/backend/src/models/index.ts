// User models
export enum UserRole {
  STUDENT = 'student',
  TEACHER = 'teacher',
  ADMIN = 'admin',
  PARENT = 'parent',
}

export interface User {
  id: string;
  username: string;
  email: string;
  password_hash?: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  phone?: string;
  date_of_birth?: Date;
  address?: string;
  profile_picture_url?: string;
  is_active: boolean;
  last_login?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserDTO {
  username: string;
  email: string;
  password: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  phone?: string;
  date_of_birth?: Date;
  address?: string;
}

export interface UpdateUserDTO {
  first_name?: string;
  last_name?: string;
  phone?: string;
  date_of_birth?: Date;
  address?: string;
  profile_picture_url?: string;
}

// Course models
export enum CourseStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export interface Course {
  id: string;
  teacher_id: string;
  title: string;
  description?: string;
  code: string;
  credits?: number;
  max_students?: number;
  status: CourseStatus;
  start_date?: Date;
  end_date?: Date;
  thumbnail_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateCourseDTO {
  title: string;
  description?: string;
  code: string;
  credits?: number;
  max_students?: number;
  start_date?: Date;
  end_date?: Date;
}

export interface UpdateCourseDTO {
  title?: string;
  description?: string;
  credits?: number;
  max_students?: number;
  status?: CourseStatus;
  start_date?: Date;
  end_date?: Date;
  thumbnail_url?: string;
}

// Assignment models
export enum AssignmentType {
  HOMEWORK = 'homework',
  QUIZ = 'quiz',
  EXAM = 'exam',
  PROJECT = 'project',
}

export interface Assignment {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  type: AssignmentType;
  max_score: number;
  due_date?: Date;
  is_published: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateAssignmentDTO {
  course_id: string;
  title: string;
  description?: string;
  type: AssignmentType;
  max_score: number;
  due_date?: Date;
}

export interface UpdateAssignmentDTO {
  title?: string;
  description?: string;
  type?: AssignmentType;
  max_score?: number;
  due_date?: Date;
  is_published?: boolean;
}

// Enrollment models
export enum EnrollmentStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  DROPPED = 'dropped',
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: Date;
  status: EnrollmentStatus;
  progress?: number;
  final_grade?: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateEnrollmentDTO {
  courseId: string;
}

// Message models
export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  subject?: string;
  content: string;
  is_read: boolean;
  read_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreateMessageDTO {
  recipientId: string;
  subject?: string;
  content: string;
}

// Forum models
export interface Forum {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  is_locked: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ForumPost {
  id: string;
  forum_id: string;
  user_id: string;
  parent_post_id?: string;
  title?: string;
  content: string;
  is_pinned: boolean;
  view_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateForumDTO {
  course_id: string;
  title: string;
  description?: string;
}

export interface CreateForumPostDTO {
  forum_id: string;
  parent_post_id?: string;
  title?: string;
  content: string;
}

// Calendar models
export enum CalendarEventType {
  CLASS = 'class',
  EXAM = 'exam',
  ASSIGNMENT = 'assignment',
  MEETING = 'meeting',
  HOLIDAY = 'holiday',
}

export interface CalendarEvent {
  id: string;
  course_id?: string;
  created_by: string;
  title: string;
  description?: string;
  event_type: CalendarEventType;
  start_time: Date;
  end_time: Date;
  location?: string;
  is_all_day: boolean;
  recurrence_rule?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateCalendarEventDTO {
  courseId?: string;
  title: string;
  description?: string;
  eventType: CalendarEventType;
  startTime: string;
  endTime: string;
  location?: string;
  isAllDay?: boolean;
}

// Notification models
export enum NotificationType {
  ANNOUNCEMENT = 'announcement',
  ASSIGNMENT = 'assignment',
  GRADE = 'grade',
  MESSAGE = 'message',
  FORUM = 'forum',
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  content: string;
  is_read: boolean;
  related_id?: string;
  created_at: Date;
}

// File models
export interface FileUpload {
  id: string;
  user_id: string;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  s3_key: string;
  s3_bucket: string;
  created_at: Date;
}

export interface CreateFileDTO {
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  s3_key: string;
  s3_bucket: string;
}

// Submission models
export interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  content?: string;
  file_url?: string;
  submitted_at: Date;
  score?: number;
  feedback?: string;
  graded_at?: Date;
  graded_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateSubmissionDTO {
  assignment_id: string;
  content?: string;
  file_url?: string;
}

// Grade models
export interface Grade {
  id: string;
  enrollment_id: string;
  assignment_id?: string;
  score: number;
  max_score: number;
  graded_by: string;
  feedback?: string;
  created_at: Date;
  updated_at: Date;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// JWT Payload
export interface JWTPayload {
  id: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// Query parameters
export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface CourseQuery extends PaginationQuery {
  status?: CourseStatus;
  teacher_id?: string;
  search?: string;
}

export interface AssignmentQuery extends PaginationQuery {
  course_id?: string;
  type?: AssignmentType;
  is_published?: boolean;
}

export interface CalendarQuery {
  start?: string;
  end?: string;
  courseId?: string;
  eventType?: CalendarEventType;
}

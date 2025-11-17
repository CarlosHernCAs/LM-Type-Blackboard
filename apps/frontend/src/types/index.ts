// User Types
export type UserRole = 'student' | 'teacher' | 'admin' | 'parent';

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatarUrl?: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Course Types
export type CourseStatus = 'draft' | 'published' | 'archived';

export interface Course {
  id: string;
  code: string;
  title: string;
  description: string;
  instructorId: string;
  instructor?: User;
  category: string;
  status: CourseStatus;
  thumbnailUrl?: string;
  startDate: string;
  endDate: string;
  maxStudents: number;
  credits: number;
  createdAt: string;
  updatedAt: string;
}

// Enrollment Types
export type EnrollmentStatus = 'active' | 'dropped' | 'completed' | 'pending';

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  status: EnrollmentStatus;
  enrollmentDate: string;
  completionDate?: string;
  progressPercentage: number;
  finalGrade?: number;
}

// Assignment Types
export type AssignmentType = 'homework' | 'quiz' | 'exam' | 'project' | 'discussion';

export interface Assignment {
  id: string;
  courseId: string;
  moduleId?: string;
  title: string;
  description: string;
  type: AssignmentType;
  maxPoints: number;
  dueDate: string;
  allowLate: boolean;
  latePenaltyPercent: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

// Submission Types
export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  content: string;
  attachments?: any[];
  submittedAt: string;
  isLate: boolean;
  grade?: number;
  feedback?: string;
  gradedBy?: string;
  gradedAt?: string;
  attemptNumber: number;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
  user: User;
}

-- EduVerse LMS - Database Schema
-- PostgreSQL 16+

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enum Types
CREATE TYPE user_role AS ENUM ('student', 'teacher', 'admin', 'parent');
CREATE TYPE enrollment_status AS ENUM ('active', 'dropped', 'completed', 'pending');
CREATE TYPE assignment_type AS ENUM ('homework', 'quiz', 'exam', 'project', 'discussion');
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late', 'excused');
CREATE TYPE course_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    avatar_url VARCHAR(500),
    phone VARCHAR(20),
    date_of_birth DATE,
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student Profiles
CREATE TABLE student_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    student_id VARCHAR(50) UNIQUE,
    grade_level VARCHAR(20),
    parent_id UUID REFERENCES users(id),
    address TEXT,
    emergency_contact VARCHAR(100),
    emergency_phone VARCHAR(20),
    medical_info TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Teacher Profiles
CREATE TABLE teacher_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    employee_id VARCHAR(50) UNIQUE,
    department VARCHAR(100),
    specialization VARCHAR(100),
    bio TEXT,
    education TEXT,
    years_experience INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Courses
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructor_id UUID REFERENCES users(id),
    category VARCHAR(100),
    status course_status DEFAULT 'draft',
    thumbnail_url VARCHAR(500),
    start_date DATE,
    end_date DATE,
    max_students INTEGER,
    credits DECIMAL(3,1),
    syllabus_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Course Modules/Sections
CREATE TABLE course_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lessons/Content
CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID REFERENCES course_modules(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    content_type VARCHAR(50), -- video, text, pdf, quiz, etc
    content_url VARCHAR(500),
    duration_minutes INTEGER,
    order_index INTEGER NOT NULL,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enrollments
CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    status enrollment_status DEFAULT 'pending',
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completion_date TIMESTAMP,
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    final_grade DECIMAL(5,2),
    UNIQUE(user_id, course_id)
);

-- Assignments
CREATE TABLE assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    module_id UUID REFERENCES course_modules(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type assignment_type DEFAULT 'homework',
    max_points DECIMAL(6,2) NOT NULL,
    due_date TIMESTAMP,
    allow_late BOOLEAN DEFAULT false,
    late_penalty_percent DECIMAL(5,2) DEFAULT 0,
    instructions TEXT,
    attachments JSONB, -- Array of file URLs
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Submissions
CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT,
    attachments JSONB, -- Array of file URLs
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_late BOOLEAN DEFAULT false,
    grade DECIMAL(6,2),
    feedback TEXT,
    graded_by UUID REFERENCES users(id),
    graded_at TIMESTAMP,
    attempt_number INTEGER DEFAULT 1,
    UNIQUE(assignment_id, student_id, attempt_number)
);

-- Grades
CREATE TABLE grades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    assignment_id UUID REFERENCES assignments(id),
    submission_id UUID REFERENCES submissions(id),
    score DECIMAL(6,2) NOT NULL,
    max_score DECIMAL(6,2) NOT NULL,
    weight DECIMAL(5,2) DEFAULT 1.00,
    graded_by UUID REFERENCES users(id),
    graded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    comments TEXT
);

-- Attendance
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    session_date DATE NOT NULL,
    status attendance_status NOT NULL,
    check_in_time TIMESTAMP,
    check_out_time TIMESTAMP,
    notes TEXT,
    recorded_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, course_id, session_date)
);

-- Discussion Forums
CREATE TABLE forums (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_locked BOOLEAN DEFAULT false,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Forum Posts
CREATE TABLE forum_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    forum_id UUID REFERENCES forums(id) ON DELETE CASCADE,
    parent_post_id UUID REFERENCES forum_posts(id),
    author_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    content TEXT NOT NULL,
    attachments JSONB,
    is_pinned BOOLEAN DEFAULT false,
    is_locked BOOLEAN DEFAULT false,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages (Direct Messages)
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(255),
    content TEXT NOT NULL,
    attachments JSONB,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    parent_message_id UUID REFERENCES messages(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50), -- assignment, grade, announcement, etc
    link VARCHAR(500),
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Announcements
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    author_id UUID REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Calendar Events
CREATE TABLE calendar_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES courses(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(50), -- class, exam, holiday, etc
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    location VARCHAR(255),
    is_recurring BOOLEAN DEFAULT false,
    recurrence_rule VARCHAR(255),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- File Storage Metadata
CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    file_size BIGINT,
    storage_path VARCHAR(500) NOT NULL,
    uploaded_by UUID REFERENCES users(id),
    course_id UUID REFERENCES courses(id),
    is_public BOOLEAN DEFAULT false,
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Gamification: Achievements
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_url VARCHAR(500),
    points INTEGER DEFAULT 0,
    category VARCHAR(50),
    requirement_type VARCHAR(50), -- course_complete, grade_threshold, etc
    requirement_value JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Achievements
CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, achievement_id)
);

-- Gamification: Points/Leaderboard
CREATE TABLE user_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id),
    points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, course_id)
);

-- Payment Transactions
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status payment_status DEFAULT 'pending',
    payment_method VARCHAR(50),
    transaction_id VARCHAR(255) UNIQUE,
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI Interactions Log
CREATE TABLE ai_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    interaction_type VARCHAR(50), -- tutoring, grading, content_generation
    prompt TEXT,
    response TEXT,
    model VARCHAR(50),
    tokens_used INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit Log
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_courses_instructor ON courses(instructor_id);
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_enrollments_user ON enrollments(user_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
CREATE INDEX idx_assignments_course ON assignments(course_id);
CREATE INDEX idx_submissions_assignment ON submissions(assignment_id);
CREATE INDEX idx_submissions_student ON submissions(student_id);
CREATE INDEX idx_grades_student ON grades(student_id);
CREATE INDEX idx_grades_course ON grades(course_id);
CREATE INDEX idx_attendance_student ON attendance(student_id);
CREATE INDEX idx_attendance_date ON attendance(session_date);
CREATE INDEX idx_messages_recipient ON messages(recipient_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_forum_posts_forum ON forum_posts(forum_id);
CREATE INDEX idx_forum_posts_author ON forum_posts(author_id);

-- Índices adicionales para optimización de queries comunes
CREATE INDEX idx_enrollments_user_course ON enrollments(user_id, course_id);
CREATE INDEX idx_enrollments_status ON enrollments(status);
CREATE INDEX idx_messages_recipient_unread ON messages(recipient_id, is_read);
CREATE INDEX idx_messages_sender_created ON messages(sender_id, created_at DESC);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX idx_assignments_course_published ON assignments(course_id, is_published);
CREATE INDEX idx_assignments_due_date ON assignments(due_date);
CREATE INDEX idx_forum_posts_parent ON forum_posts(parent_post_id);
CREATE INDEX idx_forum_posts_forum_created ON forum_posts(forum_id, created_at DESC);
CREATE INDEX idx_files_uploaded_by ON files(uploaded_by);
CREATE INDEX idx_files_course ON files(course_id);
CREATE INDEX idx_submissions_student_assignment ON submissions(student_id, assignment_id);
CREATE INDEX idx_submissions_graded ON submissions(graded_at);
CREATE INDEX idx_grades_student_course ON grades(student_id, course_id);
CREATE INDEX idx_attendance_course_date ON attendance(course_id, session_date);
CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_calendar_events_course ON calendar_events(course_id);
CREATE INDEX idx_calendar_events_start_time ON calendar_events(start_time);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample Data (Development Only)
-- Insert admin user (password: admin123)
INSERT INTO users (username, email, password_hash, first_name, last_name, role, is_verified)
VALUES ('admin', 'admin@eduverse.com', crypt('admin123', gen_salt('bf')), 'Admin', 'User', 'admin', true);

-- Insert sample teacher (password: teacher123)
INSERT INTO users (username, email, password_hash, first_name, last_name, role, is_verified)
VALUES ('teacher', 'teacher@eduverse.com', crypt('teacher123', gen_salt('bf')), 'John', 'Doe', 'teacher', true);

-- Insert sample student (password: student123)
INSERT INTO users (username, email, password_hash, first_name, last_name, role, is_verified)
VALUES ('student', 'student@eduverse.com', crypt('student123', gen_salt('bf')), 'Jane', 'Smith', 'student', true);

-- Enable UUID generation extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. MADRASHAS TABLE (For multi-tenancy)
CREATE TABLE madrashas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. TEACHERS TABLE (Forward declared for class reference)
CREATE TABLE teachers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    address TEXT,
    qualification TEXT,
    experience TEXT,
    class_id UUID, -- Updated later via foreign key
    monthly_salary NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    joining_date DATE NOT NULL,
    photo_url TEXT,
    madrasha_id UUID NOT NULL REFERENCES madrashas(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. CLASSES (JAMAAT) TABLE
CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    department VARCHAR(50) NOT NULL CHECK (department IN ('nurani', 'nazera', 'hifz', 'kitab')),
    teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
    madrasha_id UUID NOT NULL REFERENCES madrashas(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Update teachers table with class_id reference
ALTER TABLE teachers ADD CONSTRAINT fk_teacher_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL;

-- 4. STUDENTS TABLE
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id VARCHAR(50) NOT NULL, -- Auto-generated code like MTQ-0001
    name VARCHAR(255) NOT NULL,
    father_name VARCHAR(255) NOT NULL,
    mother_name VARCHAR(255) NOT NULL,
    guardian_phone VARCHAR(50) NOT NULL,
    address TEXT,
    date_of_birth DATE NOT NULL,
    admission_date DATE NOT NULL,
    department VARCHAR(50) NOT NULL CHECK (department IN ('nurani', 'nazera', 'hifz', 'kitab')),
    class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
    monthly_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    is_lillah BOOLEAN NOT NULL DEFAULT FALSE,
    is_hostel BOOLEAN NOT NULL DEFAULT FALSE,
    photo_url TEXT,
    madrasha_id UUID NOT NULL REFERENCES madrashas(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_student_id_per_madrasha UNIQUE (madrasha_id, student_id)
);

-- 5. ATTENDANCE TABLE
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(10) NOT NULL CHECK (status IN ('present', 'absent')),
    madrasha_id UUID NOT NULL REFERENCES madrashas(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_attendance_per_student_date UNIQUE (student_id, date)
);

-- 6. HIFZ PROGRESS TABLE
CREATE TABLE hifz_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    sabaq TEXT,         -- Daily new memorization (e.g., Para 30, Surah Naba 1-10)
    manzil TEXT,        -- Revision of recent lessons
    dawr TEXT,          -- Revision of older lessons
    notes TEXT,         -- Teacher remarks
    madrasha_id UUID NOT NULL REFERENCES madrashas(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. FEE COLLECTION TABLE
CREATE TABLE fee_collection (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INTEGER NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    paid_date DATE NOT NULL DEFAULT CURRENT_DATE,
    receipt_number VARCHAR(100) NOT NULL,
    madrasha_id UUID NOT NULL REFERENCES madrashas(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_fee_per_student_month_year UNIQUE (student_id, month, year)
);

-- 8. EXAMS TABLE
CREATE TABLE exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL, -- e.g. অর্ধবার্ষিক পরীক্ষা, বার্ষিক পরীক্ষা
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    exam_date DATE NOT NULL,
    total_marks NUMERIC(5, 2) NOT NULL DEFAULT 100.00,
    madrasha_id UUID NOT NULL REFERENCES madrashas(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. EXAM RESULTS TABLE
CREATE TABLE results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    marks_obtained NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    madrasha_id UUID NOT NULL REFERENCES madrashas(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_result_per_student_exam UNIQUE (exam_id, student_id)
);

-- 10. TEACHER SALARY PAYMENTS TABLE
CREATE TABLE teacher_salary (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INTEGER NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    paid_date DATE NOT NULL DEFAULT CURRENT_DATE,
    madrasha_id UUID NOT NULL REFERENCES madrashas(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_salary_per_teacher_month_year UNIQUE (teacher_id, month, year)
);

-- 11. COMMITTEE MEMBERS TABLE
CREATE TABLE committee_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL, -- e.g., সভাপতি, সাধারণ সম্পাদক
    phone VARCHAR(50) NOT NULL,
    address TEXT,
    photo_url TEXT,
    term_start DATE,
    term_end DATE,
    madrasha_id UUID NOT NULL REFERENCES madrashas(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. EXPENSES TABLE
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    category VARCHAR(100) NOT NULL, -- e.g., বিদ্যুৎ বিল, সংস্কার কাজ, খাদ্য খরচ
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    madrasha_id UUID NOT NULL REFERENCES madrashas(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. APP USER PROFILES (Links Supabase auth.users to our local role system)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'teacher')),
    teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
    madrasha_id UUID NOT NULL REFERENCES madrashas(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX idx_students_madrasha ON students(madrasha_id);
CREATE INDEX idx_students_class ON students(class_id);
CREATE INDEX idx_teachers_madrasha ON teachers(madrasha_id);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_attendance_student ON attendance(student_id);
CREATE INDEX idx_hifz_progress_student ON hifz_progress(student_id);
CREATE INDEX idx_fee_collection_student ON fee_collection(student_id);
CREATE INDEX idx_expenses_date ON expenses(expense_date);

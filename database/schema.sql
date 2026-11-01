-- Database Schema for BursaLink (PostgreSQL)

-- 1. Users table (Centralized Auth)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    role VARCHAR(20) CHECK (role IN ('student', 'admin', 'super_admin')) DEFAULT 'student',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Students table (Profile Data)
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    id_number VARCHAR(50) UNIQUE NOT NULL,
    school VARCHAR(255) NOT NULL,
    county VARCHAR(100) NOT NULL,
    income_level VARCHAR(20) CHECK (income_level IN ('low', 'medium', 'high')),
    orphan_status BOOLEAN DEFAULT FALSE,
    disability BOOLEAN DEFAULT FALSE,
    academic_performance INT CHECK (academic_performance >= 0 AND academic_performance <= 100),
    fee_burden INT CHECK (fee_burden >= 0 AND fee_burden <= 100),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Applications table
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    county VARCHAR(100) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('pending', 'approved', 'rejected', 'flagged')) DEFAULT 'pending',
    score INT DEFAULT 0,
    documents JSONB DEFAULT '[]', -- Array of {name, url, type}
    notes TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Payments table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES applications(id),
    school_account VARCHAR(255) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
    mpesa_receipt VARCHAR(50),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. AuditLogs table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action VARCHAR(100) NOT NULL,
    user_id UUID REFERENCES users(id),
    details JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indices for performance
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_score ON applications(score DESC);
CREATE INDEX idx_students_county ON students(county);
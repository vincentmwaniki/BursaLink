a-- Bursary Management System (BursaLink) Initial Schema
-- Migration: 20231027000000_init_bursalink.sql

-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Custom Types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('student', 'admin', 'super_admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE application_status AS ENUM ('pending', 'approved', 'rejected', 'flagged');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. Profiles Table (Extends Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone_number TEXT UNIQUE,
    role user_role DEFAULT 'student',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Students Table
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    id_number TEXT UNIQUE NOT NULL,
    school_name TEXT NOT NULL,
    guardian_name TEXT,
    income_level INTEGER CHECK (income_level BETWEEN 0 AND 100), -- Lower is poorer
    orphan_status BOOLEAN DEFAULT FALSE,
    disability_status BOOLEAN DEFAULT FALSE,
    academic_performance INTEGER CHECK (academic_performance BETWEEN 0 AND 100),
    fee_burden INTEGER NOT NULL,
    county TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Applications Table
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    documents JSONB DEFAULT '[]'::jsonb, -- Store document URLs
    status application_status DEFAULT 'pending',
    need_score INTEGER DEFAULT 0,
    admin_feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES public.applications(id) ON DELETE SET NULL,
    school_account TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    status payment_status DEFAULT 'pending',
    transaction_id TEXT UNIQUE,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action TEXT NOT NULL,
    user_id UUID REFERENCES public.profiles(id),
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES --

-- Profiles: Users can view their own, admins view all
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- Students: Students can view/update own, admins view all
CREATE POLICY "Students can view own data" ON public.students FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Students can update own data" ON public.students FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all students" ON public.students FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- Applications: Students can CRUD own, admins view/update all
CREATE POLICY "Students can view own applications" ON public.applications FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Students can create own applications" ON public.applications FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "Admins can view all applications" ON public.applications FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);
CREATE POLICY "Admins can update applications" ON public.applications FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- Payments: Only admins/super_admins can view/manage
CREATE POLICY "Admins manage payments" ON public.payments FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);
CREATE POLICY "Students view own payments" ON public.payments FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.applications WHERE id = application_id AND student_id = auth.uid())
);

-- Audit Logs: Only super_admins
CREATE POLICY "Super admins view logs" ON public.audit_logs FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
);

-- FUNCTIONS & TRIGGERS --

-- Need Score Algorithm Function
CREATE OR REPLACE FUNCTION calculate_need_score()
RETURNS TRIGGER AS $$
DECLARE
    score INTEGER := 0;
    student_record RECORD;
BEGIN
    SELECT * INTO student_record FROM public.students WHERE id = NEW.student_id;

    -- Income level (30 points max: lower income = higher score)
    -- Assuming income_level is 0-100 where 0 is poorest
    score := score + (30 * (100 - student_record.income_level) / 100);

    -- Orphan status (25 points)
    IF student_record.orphan_status THEN
        score := score + 25;
    END IF;

    -- Disability (15 points)
    IF student_record.disability_status THEN
        score := score + 15;
    END IF;

    -- Fee burden (20 points max)
    -- Assuming fee_burden is a relative percentage or mapped value
    score := score + LEAST(20, (student_record.fee_burden / 5000)); -- Simple example mapping

    -- Academic performance (10 points max)
    score := score + (10 * student_record.academic_performance / 100);

    NEW.need_score := score;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_calculate_score
BEFORE INSERT OR UPDATE OF student_id ON public.applications
FOR EACH ROW EXECUTE FUNCTION calculate_need_score();

-- Profile synchronization on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, phone_number, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
        NEW.phone,
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
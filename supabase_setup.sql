-- ==============================================================================
-- HAXLR8 3.0 - COMPLETE SUPABASE DATABASE SETUP & SCHEMA
-- Run this entire script in Supabase SQL Editor (SQL Editor -> New Query -> Run)
-- ==============================================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 2. TEAMS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    leader_id UUID NOT NULL,
    team_name TEXT NOT NULL,
    score NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. TEAM MEMBERS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone_number TEXT,
    location TEXT,
    college_name TEXT,
    reg_no TEXT,
    dept TEXT,
    year TEXT,
    id_card_front_url TEXT,
    id_card_back_url TEXT,
    is_leader BOOLEAN DEFAULT FALSE,
    id_card_verified BOOLEAN DEFAULT FALSE,
    id_card_verified_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. SUBMISSIONS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    project_title TEXT NOT NULL,
    sdg_goal TEXT,
    category TEXT,
    project_description TEXT,
    pdf_url TEXT,
    score NUMERIC DEFAULT 0,
    round TEXT DEFAULT 'Round 1',
    status TEXT DEFAULT 'Under Review',
    evaluator_name TEXT,
    evaluation_scores JSONB DEFAULT '{"problem": 0, "innovation": 0, "technical": 0, "impact": 0, "presentation": 0}'::jsonb,
    evaluation_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. ANNOUNCEMENTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.announcements (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    message TEXT,
    tag TEXT DEFAULT 'ANNOUNCEMENT',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 6. SITE SETTINGS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings
INSERT INTO public.site_settings (key, value)
VALUES ('registration_closed', 'false'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 7. ADMINS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Super Admin
INSERT INTO public.admins (email, role)
VALUES ('yashuhb18@gmail.com', 'super_admin')
ON CONFLICT (email) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 8. INITIAL ANNOUNCEMENTS SEED
-- ------------------------------------------------------------------------------
INSERT INTO public.announcements (title, content, message, tag)
VALUES 
(
    'Welcome to HAXLR8 3.0 Spaceship Command!',
    'All systems are active. Ensure your team details and idea paper abstract are submitted before November 02, 2026.',
    'All systems are active. Ensure your team details and idea paper abstract are submitted before November 02, 2026.',
    'MISSION BRIEFING'
)
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------------------------
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- TEAMS POLICIES
CREATE POLICY "Allow public read teams" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert teams" ON public.teams FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update teams" ON public.teams FOR UPDATE USING (true);
CREATE POLICY "Allow delete teams" ON public.teams FOR DELETE USING (true);

-- TEAM MEMBERS POLICIES
CREATE POLICY "Allow public read team_members" ON public.team_members FOR SELECT USING (true);
CREATE POLICY "Allow insert team_members" ON public.team_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update team_members" ON public.team_members FOR UPDATE USING (true);
CREATE POLICY "Allow delete team_members" ON public.team_members FOR DELETE USING (true);

-- SUBMISSIONS POLICIES
CREATE POLICY "Allow public read submissions" ON public.submissions FOR SELECT USING (true);
CREATE POLICY "Allow insert submissions" ON public.submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update submissions" ON public.submissions FOR UPDATE USING (true);
CREATE POLICY "Allow delete submissions" ON public.submissions FOR DELETE USING (true);

-- ANNOUNCEMENTS POLICIES
CREATE POLICY "Allow public read announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Allow admin insert announcements" ON public.announcements FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin update announcements" ON public.announcements FOR UPDATE USING (true);

-- SITE SETTINGS POLICIES
CREATE POLICY "Allow public read site_settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Allow admin update site_settings" ON public.site_settings FOR UPDATE USING (true);

-- ADMINS POLICIES
CREATE POLICY "Allow public read admins" ON public.admins FOR SELECT USING (true);

-- ------------------------------------------------------------------------------
-- 10. STORAGE BUCKET CONFIGURATION FOR ID CARDS
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('id-cards', 'id-cards', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for 'id-cards' bucket
CREATE POLICY "Public Access ID Cards" ON storage.objects
FOR SELECT USING (bucket_id = 'id-cards');

CREATE POLICY "Allow Uploads to ID Cards" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'id-cards');

CREATE POLICY "Allow Updates to ID Cards" ON storage.objects
FOR UPDATE USING (bucket_id = 'id-cards');

-- ------------------------------------------------------------------------------
-- 11. MOMENTS / HIGHLIGHTS GALLERY TABLE (OPTIONAL DEDICATED TABLE)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.moments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    subtitle TEXT,
    category TEXT DEFAULT 'ceremony',
    tag TEXT DEFAULT 'MOMENT',
    src TEXT NOT NULL,
    storage_path TEXT,
    description TEXT,
    rotate NUMERIC DEFAULT 0,
    bg TEXT DEFAULT '#ffffff',
    border TEXT DEFAULT '#fed7aa',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.moments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read moments" ON public.moments FOR SELECT USING (true);
CREATE POLICY "Allow insert moments" ON public.moments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update moments" ON public.moments FOR UPDATE USING (true);
CREATE POLICY "Allow delete moments" ON public.moments FOR DELETE USING (true);


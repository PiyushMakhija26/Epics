-- Security Questions table
CREATE TABLE IF NOT EXISTS public.security_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Security Answers table
CREATE TABLE IF NOT EXISTS public.user_security_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.security_questions(id) ON DELETE CASCADE,
  answer_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);

-- Admin Work Assignments table
CREATE TABLE IF NOT EXISTS public.admin_work_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.service_requests(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_to UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  assignment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'completed', 'rejected')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin Notifications table
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  related_id UUID,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add work_assigned_to column to service_requests if it doesn't exist
ALTER TABLE public.service_requests 
ADD COLUMN IF NOT EXISTS work_assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.service_requests 
ADD COLUMN IF NOT EXISTS assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Enable RLS on new tables
ALTER TABLE public.security_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_security_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_work_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for security_questions (public read access)
CREATE POLICY IF NOT EXISTS "security_questions_select_public" ON public.security_questions 
  FOR SELECT USING (true);

-- RLS Policies for user_security_answers
CREATE POLICY IF NOT EXISTS "security_answers_select_own" ON public.user_security_answers 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "security_answers_insert_own" ON public.user_security_answers 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "security_answers_update_own" ON public.user_security_answers 
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for admin_work_assignments
CREATE POLICY IF NOT EXISTS "work_assignments_select_admin" ON public.admin_work_assignments 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
    OR auth.uid() = assigned_to
  );

CREATE POLICY IF NOT EXISTS "work_assignments_insert_admin" ON public.admin_work_assignments 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

CREATE POLICY IF NOT EXISTS "work_assignments_update_admin" ON public.admin_work_assignments 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- RLS Policies for admin_notifications
CREATE POLICY IF NOT EXISTS "notifications_select_own" ON public.admin_notifications 
  FOR SELECT USING (auth.uid() = admin_id);

CREATE POLICY IF NOT EXISTS "notifications_insert_service" ON public.admin_notifications 
  FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "notifications_update_own" ON public.admin_notifications 
  FOR UPDATE USING (auth.uid() = admin_id);

-- Insert default security questions
INSERT INTO public.security_questions (question) VALUES
('What is your mother''s maiden name?'),
('What was the name of your first pet?'),
('In what city were you born?'),
('What is your favorite book?'),
('What was the name of your childhood best friend?'),
('What is your favorite movie?'),
('What was the make of your first car?'),
('What is the name of the street you grew up on?'),
('What is your favorite sports team?'),
('What is your favorite musician or artist?')
ON CONFLICT DO NOTHING;

-- Request Ratings table (for user ratings of completed work)
CREATE TABLE IF NOT EXISTS public.request_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.service_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating TEXT NOT NULL CHECK (rating IN ('excellent', 'good', 'open_again')),
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(request_id, user_id)
);

-- Password Reset Tokens table
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update Service Requests status CHECK constraint to include new statuses
-- NOTE: If the table already exists, you need to drop and recreate it or use ALTER TABLE
-- For now, we'll add a new status tracking table for more detailed tracking

-- Request Status History table (more detailed than request_updates)
CREATE TABLE IF NOT EXISTS public.request_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.service_requests(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  old_status TEXT,
  new_status TEXT NOT NULL CHECK (new_status IN ('raised', 'in_progress', 'completed', 'needs_clarification', 'closed')),
  reason TEXT,
  requires_user_feedback BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE public.request_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_status_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for request_ratings
CREATE POLICY "ratings_select_own_or_admin" ON public.request_ratings 
  FOR SELECT USING (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

CREATE POLICY "ratings_insert_own" ON public.request_ratings 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ratings_update_own" ON public.request_ratings 
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for password_reset_tokens
CREATE POLICY "reset_tokens_select_own" ON public.password_reset_tokens 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "reset_tokens_insert_own" ON public.password_reset_tokens 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for request_status_history
CREATE POLICY "status_history_select_own_or_admin" ON public.request_status_history 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.service_requests 
      WHERE id = request_id AND auth.uid() = user_id
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

CREATE POLICY "status_history_insert_admin" ON public.request_status_history 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

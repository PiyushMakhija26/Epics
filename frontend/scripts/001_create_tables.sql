-- Users table (profiles for authenticated users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  user_type TEXT NOT NULL CHECK (user_type IN ('user', 'admin')),
  department TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Departments table
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service requests table
CREATE TABLE IF NOT EXISTS public.service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  department_id UUID NOT NULL REFERENCES public.departments(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'raised' CHECK (status IN ('raised', 'in_progress', 'completed', 'closed')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Request updates/status history table
CREATE TABLE IF NOT EXISTS public.request_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.service_requests(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Request images table
CREATE TABLE IF NOT EXISTS public.request_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.service_requests(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Work allocation table (for admins assigning work)
CREATE TABLE IF NOT EXISTS public.work_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.service_requests(id) ON DELETE CASCADE,
  allocated_admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  allocated_by_admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_allocations ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_view_others" ON public.profiles FOR SELECT USING (true);

-- Create policies for departments (public read)
CREATE POLICY "departments_select_all" ON public.departments FOR SELECT USING (true);

-- Create policies for service_requests
CREATE POLICY "requests_select_own_or_assigned" ON public.service_requests 
  FOR SELECT USING (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_type = 'admin'
      AND department_id = (SELECT department_id FROM public.service_requests sr WHERE sr.id = service_requests.id)
    )
  );

CREATE POLICY "requests_insert_own" ON public.service_requests 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "requests_update_own_or_admin" ON public.service_requests 
  FOR UPDATE USING (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Create policies for request_updates
CREATE POLICY "updates_select_own_or_admin" ON public.request_updates 
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

CREATE POLICY "updates_insert_admin" ON public.request_updates 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Create policies for request_images
CREATE POLICY "images_select_own_or_admin" ON public.request_images 
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

CREATE POLICY "images_insert_own_request" ON public.request_images 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.service_requests 
      WHERE id = request_id AND auth.uid() = user_id
    )
  );

-- Create policies for work_allocations
CREATE POLICY "allocations_select_admin" ON public.work_allocations 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

CREATE POLICY "allocations_insert_admin" ON public.work_allocations 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

CREATE POLICY "allocations_update_admin" ON public.work_allocations 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

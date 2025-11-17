-- Seed departments
INSERT INTO public.departments (name, description) VALUES
  ('Electricity', 'Electrical services and power supply issues'),
  ('Water', 'Water supply and sanitation services'),
  ('Agriculture', 'Agricultural support and farming services'),
  ('Law', 'Legal and law enforcement services'),
  ('Medical', 'Healthcare and medical services'),
  ('Services', 'General public services and utilities')
ON CONFLICT (name) DO NOTHING;
